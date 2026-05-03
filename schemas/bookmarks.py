from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────────
"""schemas/bookmarks.py"""
from schemas.feed     import PostResponse
from schemas.listing  import ListingResponse


class BookmarkResponse(BaseModel):
    id:         int
    post_id:    Optional[int] = None
    listing_id: Optional[int] = None
    created_at: Optional[datetime] = None
    post:       Optional[PostResponse]    = None
    listing:    Optional[ListingResponse] = None
    class Config:
        from_attributes = True