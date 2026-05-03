"""schemas/connections.py"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserSnippet(BaseModel):
    id:                  int
    full_name:           str
    role:                str
    profile_picture_url: Optional[str] = None
    class Config:
        from_attributes = True


class ConnectionResponse(BaseModel):
    id:           int
    requester_id: int
    receiver_id:  int
    status:       str
    created_at:   Optional[datetime] = None
    requester:    Optional[UserSnippet] = None
    receiver:     Optional[UserSnippet] = None
    class Config:
        from_attributes = True


