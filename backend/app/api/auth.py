from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, Request
from fastapi.responses import RedirectResponse
import jwt
from datetime import datetime, timedelta
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.core.config import settings
from app.services.auth_service import AuthService, get_current_session
from app.schemas.auth import AuthURLResponse, UserResponse

router = APIRouter()

def get_flow():
    client_config = {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
        }
    }
    return Flow.from_client_config(
        client_config,
        scopes=settings.GMAIL_SCOPES
    )

@router.get("/login", response_model=AuthURLResponse)
def login(response: Response):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
        
    flow = get_flow()
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='select_account consent'
    )
    
    # Store PKCE verifier securely using a signed JWT cookie
    payload = {
        "state": state,
        "code_verifier": flow.code_verifier,
        "exp": datetime.utcnow() + timedelta(minutes=10)
    }
    oauth_state_token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    
    response.set_cookie(
        key="oauth_state",
        value=oauth_state_token,
        httponly=True,
        secure=False, # Use true in production with HTTPS
        samesite="lax",
        max_age=600, # 10 minutes
        path="/"
    )
    
    return AuthURLResponse(url=authorization_url)

@router.get("/google/callback")
def callback(code: str, state: str, response: Response, oauth_state: str = Cookie(None)):
    if not oauth_state:
        raise HTTPException(status_code=400, detail="Missing OAuth state cookie")
    
    try:
        payload = jwt.decode(oauth_state, settings.JWT_SECRET, algorithms=["HS256"])
        if payload["state"] != state:
            raise HTTPException(status_code=400, detail="Invalid state parameter")
        code_verifier = payload["code_verifier"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="OAuth state expired")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    try:
        flow = get_flow()
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        # Pass the code_verifier we securely preserved
        flow.fetch_token(code=code, code_verifier=code_verifier)
        
        credentials = flow.credentials
        
        # Get user profile
        service = build('oauth2', 'v2', credentials=credentials)
        user_info = service.userinfo().get().execute()
        
        creds_dict = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        token = AuthService.create_session_token(creds_dict, user_info)
        
        # Redirect back to frontend
        redirect = RedirectResponse(url=settings.FRONTEND_URL)
        
        # Set HttpOnly cookie directly on the redirect response
        redirect.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=False, # Use true in production with HTTPS
            samesite="lax",
            max_age=7 * 24 * 3600, # 7 days
            path="/"
        )
        
        return redirect
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_me(session: dict = Depends(get_current_session)):
    user = session.get("user", {})
    return UserResponse(
        email=user.get("email", ""),
        name=user.get("name", ""),
        picture=user.get("picture"),
        is_authenticated=True
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("session_token", path="/")
    return {"status": "ok"}
