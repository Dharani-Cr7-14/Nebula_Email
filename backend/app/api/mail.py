from fastapi import APIRouter, Depends, HTTPException
from typing import List
import time
from googleapiclient.errors import HttpError
from app.services.auth_service import get_current_session
from app.services.gmail_service import GmailService
from app.schemas.mail import Email, SendEmailRequest, PaginatedEmails

router = APIRouter()

# Simple in-memory cache: { "token_folder_query_pageToken": (data, timestamp) }
_cache = {}
CACHE_TTL = 30 # 30 seconds

def get_cached_messages(service: GmailService, folder: str, query: str = '', page_token: str = None):
    cache_key = f"{service.creds.token}_{folder}_{query}_{page_token}"
    now = time.time()
    
    if cache_key in _cache:
        cached_data, timestamp = _cache[cache_key]
        if now - timestamp < CACHE_TTL:
            return cached_data
            
    try:
        data = service.get_messages(folder=folder, query=query, page_token=page_token)
        _cache[cache_key] = (data, now)
        return data
    except HttpError as e:
        if e.resp.status == 403 and "rateLimitExceeded" in str(e):
            raise HTTPException(status_code=429, detail="Gmail API rate limit exceeded.")
        raise HTTPException(status_code=500, detail=str(e))

def get_gmail_service(session: dict = Depends(get_current_session)) -> GmailService:
    creds = session.get("creds")
    if not creds:
        raise HTTPException(status_code=401, detail="No credentials found")
    try:
        return GmailService(creds)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inbox", response_model=PaginatedEmails)
def get_inbox(pageToken: str = None, service: GmailService = Depends(get_gmail_service)):
    return get_cached_messages(service, 'inbox', page_token=pageToken)

@router.get("/sent", response_model=PaginatedEmails)
def get_sent(pageToken: str = None, service: GmailService = Depends(get_gmail_service)):
    return get_cached_messages(service, 'sent', page_token=pageToken)

@router.get("/search", response_model=PaginatedEmails)
def search_messages(q: str, pageToken: str = None, service: GmailService = Depends(get_gmail_service)):
    return get_cached_messages(service, 'all', query=q, page_token=pageToken)

@router.get("/messages/{message_id}", response_model=Email)
def get_message(message_id: str, service: GmailService = Depends(get_gmail_service)):
    try:
        return service.get_message(message_id)
    except HttpError as e:
        if e.resp.status == 403 and "rateLimitExceeded" in str(e):
            raise HTTPException(status_code=429, detail="Gmail API rate limit exceeded.")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send")
def send_email(req: SendEmailRequest, service: GmailService = Depends(get_gmail_service)):
    result = service.send_message(to=req.to, subject=req.subject, body=req.body)
    return {"status": "sent", "id": result.get("id")}

def _clear_user_cache(token: str):
    keys_to_remove = [k for k in _cache.keys() if k.startswith(f"{token}_")]
    for k in keys_to_remove:
        del _cache[k]

@router.post("/messages/{message_id}/read")
def mark_as_read(message_id: str, service: GmailService = Depends(get_gmail_service)):
    try:
        service.modify_message(message_id, remove_labels=['UNREAD'])
        _clear_user_cache(service.creds.token)
        return {"status": "success", "isRead": True}
    except HttpError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/messages/{message_id}/unread")
def mark_as_unread(message_id: str, service: GmailService = Depends(get_gmail_service)):
    try:
        service.modify_message(message_id, add_labels=['UNREAD'])
        _clear_user_cache(service.creds.token)
        return {"status": "success", "isRead": False}
    except HttpError as e:
        raise HTTPException(status_code=500, detail=str(e))
