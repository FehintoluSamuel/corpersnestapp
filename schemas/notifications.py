"""schemas/notifications.py"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserSnippet(BaseModel):
    id:                  int
    full_name:           str
    profile_picture_url: Optional[str] = None
    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id:         int
    type:       str
    message:    str
    is_read:    bool = False
    post_id:    Optional[int] = None
    comment_id: Optional[int] = None
    listing_id: Optional[int] = None
    created_at: Optional[datetime] = None
    actor:      Optional[UserSnippet] = None
    class Config:
        from_attributes = True
