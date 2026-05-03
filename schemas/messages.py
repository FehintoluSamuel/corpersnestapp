from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from dependencies import PostTag
from schemas.connections import UserSnippet


class MessageResponse(BaseModel):
    id:              int
    conversation_id: int
    sender_id:       int
    content:         str
    image_url:       Optional[str] = None
    is_read:         bool
    created_at:      datetime
    sender:          Optional[UserSnippet] = None

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id:              int
    user_a_id:       int
    user_b_id:       int
    last_message_at: Optional[datetime] = None
    created_at:      Optional[datetime] = None
    other_user:      Optional[UserSnippet] = None   # injected at query time
    last_message:    Optional[str] = None            # injected at query time
    unread_count:    int = 0
    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    content:   str = ""
    image_url: Optional[str] = None

    @field_validator("content")
    @classmethod
    def validate_content(cls, v, info):
        # Allow empty content if image_url is provided
        return v

