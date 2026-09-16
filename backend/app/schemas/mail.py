from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Email(BaseModel):
    id: str
    threadId: Optional[str] = None
    sender: str
    senderEmail: str
    recipient: str
    subject: str
    preview: str
    body: str
    htmlBody: Optional[str] = None
    date: str
    timestamp: int
    isRead: bool
    folder: str

class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str

class PaginatedEmails(BaseModel):
    emails: List[Email]
    nextPageToken: Optional[str] = None
