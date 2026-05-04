"""
schemas/feed.py
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from dependencies import PostTag


# ─── User snippet embedded in responses ───────────────────────────────────────

class CommentUserSnippet(BaseModel):
    id:                  int
    full_name:           str
    role:                str
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Comment ──────────────────────────────────────────────────────────────────

class CommentCreateRequest(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id:         int
    post_id:    int
    parent_id:  Optional[int] = None
    content:    str
    created_at: Optional[datetime] = None
    user:       Optional[CommentUserSnippet] = None
    replies:    List['CommentResponse'] = []   # nested one level deep

    class Config:
        from_attributes = True

# Required for self-referencing model
CommentResponse.model_rebuild()


# ─── Post ─────────────────────────────────────────────────────────────────────

class PostUserSnippet(BaseModel):
    id:                  int
    full_name:           str
    role:                str
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True


class PostCreateRequest(BaseModel):
    content:   str
    tag:       PostTag
    image_url: Optional[str] = None




class PostResponse(BaseModel):
    id:              int
    content:         str
    tag:             str
    image_url:       Optional[str]  = None
    likes_count:     int            = 0
    comments_count:  int            = 0
    liked_by_me:     bool           = False
    bookmarked_by_me: bool          = False   
    created_at:      Optional[datetime] = None
    user:            Optional[PostUserSnippet] = None

    class Config:
        from_attributes = True


class PostWithCommentsResponse(BaseModel):
    id:             int
    content:        str
    tag:            str
    image_url:      Optional[str]  = None
    likes_count:    int            = 0
    comments_count: int            = 0
    liked_by_me:     bool           = False
    bookmarked_by_me: bool          = False   
    created_at:     Optional[datetime] = None
    user:           Optional[PostUserSnippet] = None
    comments:       List[CommentResponse] = []  # top-level only; replies nested inside each

    class Config:
        from_attributes = True