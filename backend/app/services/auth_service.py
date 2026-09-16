import jwt
from datetime import datetime, timedelta
from app.core.config import settings
from fastapi import HTTPException, Security
from fastapi.security import APIKeyCookie

cookie_sec = APIKeyCookie(name="session_token", auto_error=False)

class AuthService:
    @staticmethod
    def create_session_token(credentials_dict: dict, user_info: dict) -> str:
        payload = {
            "exp": datetime.utcnow() + timedelta(days=7),
            "iat": datetime.utcnow(),
            "creds": credentials_dict,
            "user": user_info
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

    @staticmethod
    def verify_session(token: str) -> dict:
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Session expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

def get_current_session(token: str = Security(cookie_sec)):
    return AuthService.verify_session(token)
