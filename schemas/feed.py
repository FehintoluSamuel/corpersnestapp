from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from dependencies import PostTag, Role

class UserResponse(BaseModel):
    id: int
    full_name: str
    role: Role

    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

class PostCreateRequest(BaseModel):
    content: str
    tag: PostTag
    image_url: Optional[str] = None

class CommentCreateRequest(BaseModel):
    content: str

class PostResponse(BaseModel):
    id: int
    content: str
    tag: PostTag
    image_url: Optional[str] = None
    likes_count: int
    comments_count: int = 0
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True
        
class PostWithCommentsResponse(BaseModel):
    id: int
    content: str
    tag: PostTag
    image_url: Optional[str] = None
    likes_count: int
    created_at: datetime
    user: UserResponse
    comments: List[CommentResponse]  # ← flat, not nested under "post"

    class Config:
        from_attributes = True