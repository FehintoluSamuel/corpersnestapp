"""
routers/feed_router.py
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from database import get_db
from models.database_model import User, Post, Comment, PostLike
from schemas.feed import (
    PostCreateRequest,
    CommentCreateRequest,
    PostResponse,
    CommentResponse,
    PostWithCommentsResponse,
)
from auth import get_current_user, get_current_user_optional
from utils.notifications import notify_post_like, notify_post_comment, notify_comment_reply
 

router = APIRouter(prefix='/feed', tags=['Community Feed'])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _enrich_post(post: Post, db: Session, current_user: Optional[User] = None) -> Post:
    """Attaches computed fields to a post object."""
    post.__dict__['likes_count']    = db.query(PostLike).filter(PostLike.post_id == post.id).count()
    post.__dict__['comments_count'] = db.query(Comment).filter(
        Comment.post_id == post.id, Comment.parent_id.is_(None)
    ).count()
    post.__dict__['liked_by_me'] = (
        db.query(PostLike).filter(
            PostLike.post_id == post.id,
            PostLike.user_id == current_user.id
        ).first() is not None
        if current_user else False
    )
    return post


# ─── GET all posts ────────────────────────────────────────────────────────────

@router.get('/', response_model=List[PostResponse], status_code=200)
async def get_feed(
    db:           Session       = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    posts = db.query(Post).order_by(desc(Post.created_at)).all()
    return [_enrich_post(p, db, current_user) for p in posts]


# ─── GET one post with nested comments + replies ──────────────────────────────

@router.get('/{post_id}', response_model=PostWithCommentsResponse, status_code=200)
async def get_post(
    post_id: int,
    db:      Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')

    # Only return top-level comments — replies are nested inside each via relationship
    top_level = (
        db.query(Comment)
        .filter(Comment.post_id == post_id, Comment.parent_id.is_(None))
        .order_by(Comment.created_at)
        .all()
    )
    post.__dict__['comments']       = top_level
    post.__dict__['comments_count'] = len(top_level)
    post.__dict__['likes_count']    = db.query(PostLike).filter(PostLike.post_id == post_id).count()
    post.__dict__['liked_by_me']    = (
        db.query(PostLike).filter(
            PostLike.post_id == post_id,
            PostLike.user_id == current_user.id
        ).first() is not None
        if current_user else False
    )
    return post


# ─── POST create post ─────────────────────────────────────────────────────────

@router.post('/', response_model=PostResponse, status_code=201)
async def create_post(
    data:         PostCreateRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    post = Post(
        user_id   = current_user.id,
        content   = data.content,
        tag       = data.tag,
        image_url = data.image_url,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _enrich_post(post, db, current_user)


# ─── POST add top-level comment ───────────────────────────────────────────────

@router.post('/{post_id}/comments', response_model=CommentResponse, status_code=201)
async def create_comment(
    post_id:      int,
    data:         CommentCreateRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')

    comment = Comment(post_id=post_id, user_id=current_user.id, content=data.content)
    db.add(comment)
    
    db.commit()
    notify_post_comment(db, post.user_id, current_user, post_id, comment.id)
    db.commit()
    db.refresh(comment)
    return comment


# ─── POST reply to a comment ──────────────────────────────────────────────────

@router.post('/{post_id}/comments/{comment_id}/replies', response_model=CommentResponse, status_code=201)
async def create_reply(
    post_id:    int,
    comment_id: int,
    data:       CommentCreateRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')

    parent = db.query(Comment).filter(
        Comment.id      == comment_id,
        Comment.post_id == post_id,
    ).first()
    if not parent:
        raise HTTPException(status_code=404, detail='Comment not found')

    # Only one level of nesting — replies cannot be replied to
    if parent.parent_id is not None:
        raise HTTPException(status_code=400, detail='Cannot reply to a reply')

    reply = Comment(
        post_id   = post_id,
        user_id   = current_user.id,
        parent_id = comment_id,
        content   = data.content,
    )
    db.add(reply)
    db.commit() 
    notify_comment_reply(db, parent.user_id, current_user, post_id, reply.id)
    db.commit()
    db.refresh(reply)
    return reply


# ─── POST toggle like ─────────────────────────────────────────────────────────

@router.post('/{post_id}/like', response_model=PostResponse, status_code=200)
async def toggle_like(
    post_id:      int,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')

    existing = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id,
    ).first()

    if existing:
        db.delete(existing)
        liked = False
    else:
        db.add(PostLike(post_id=post_id, user_id=current_user.id))
        liked = True
        
    db.commit()
    notify_post_like(db, post.user_id, current_user, post_id)
    db.commit()
    db.refresh(post)
    post.__dict__['likes_count']  = db.query(PostLike).filter(PostLike.post_id == post_id).count()
    post.__dict__['liked_by_me']  = liked
    return post


# ─── DELETE post ──────────────────────────────────────────────────────────────

@router.delete('/{post_id}', status_code=204)
async def delete_post(
    post_id:      int,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id,Post.deleted_at == None).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='You can only delete your own posts')

    db.delete(post)
    db.commit()
    return None