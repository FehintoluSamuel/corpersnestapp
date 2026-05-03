"""routers/bookmarks_router.py"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.database_model import User, Bookmark, Post, Listing
from schemas.bookmarks import BookmarkResponse
from auth import get_current_user

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


class BookmarkRequest(BaseModel):
    post_id:    Optional[int] = None
    listing_id: Optional[int] = None


@router.get("/", response_model=List[BookmarkResponse], status_code=200)
async def get_bookmarks(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    return (
        db.query(Bookmark)
        .filter(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )


@router.post("/toggle", status_code=200)
async def toggle_bookmark(
    data:         BookmarkRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Toggle bookmark on a post or listing. Returns { bookmarked: bool }"""
    if not data.post_id and not data.listing_id:
        raise HTTPException(400, "Provide post_id or listing_id")

    existing = db.query(Bookmark).filter(
        Bookmark.user_id    == current_user.id,
        Bookmark.post_id    == data.post_id,
        Bookmark.listing_id == data.listing_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False}

    bookmark = Bookmark(
        user_id    = current_user.id,
        post_id    = data.post_id,
        listing_id = data.listing_id,
    )
    db.add(bookmark)
    db.commit()
    return {"bookmarked": True}


@router.get("/status", status_code=200)
async def get_bookmark_status(
    post_id:    Optional[int] = None,
    listing_id: Optional[int] = None,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    exists = db.query(Bookmark).filter(
        Bookmark.user_id    == current_user.id,
        Bookmark.post_id    == post_id,
        Bookmark.listing_id == listing_id,
    ).first()
    return {"bookmarked": bool(exists)}