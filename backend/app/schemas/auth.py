from pydantic import BaseModel
from typing import Optional

class AuthURLResponse(BaseModel):
    url: str

class UserResponse(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    is_authenticated: bool
