from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from dependencies import PostTag
from schemas.connections import UserSnippet


class MessageResponse(BaseModel):
    id:              int
    conversation_id: int
    sender_id:       int
    content:         str
    is_read:         bool = False
    created_at:      Optional[datetime] = None
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
    content: str