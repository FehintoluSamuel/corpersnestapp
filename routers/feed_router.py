from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models.database_models import User, Post, Comment, PostLike
from schemas.feed import (
    PostCreateRequest, 
    CommentCreateRequest, 
    PostResponse, 
    CommentResponse,
    PostWithCommentsResponse
)
from auth import get_current_user
from typing import List

router = APIRouter(prefix='/feed', tags=['Community Feed'])

# GET all posts
@router.get('/', response_model=List[PostResponse], status_code=200)
async def get_feed(db: Session = Depends(get_db)):
    """Get all posts ordered by newest first"""
    posts = db.query(Post).order_by(desc(Post.created_at)).all()
    return posts

# POST create new post
@router.post('/', response_model=PostResponse, status_code=201)
async def create_post(
    data: PostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post (must be logged in)"""
    new_post = Post(
        user_id=current_user.id,
        content=data.content,
        tag=data.tag,
        image_url=data.image_url
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

# GET one post with all comments
@router.get('/{post_id}', response_model=PostWithCommentsResponse, status_code=200)
async def get_post_with_comments(post_id: int, db: Session = Depends(get_db)):
    """Get a single post with all its comments"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at).all()
    return PostWithCommentsResponse(post=post, comments=comments)

# POST create comment
@router.post('/{post_id}/comments', response_model=CommentResponse, status_code=201)
async def create_comment(
    post_id: int,
    data: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a post (must be logged in)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    
    new_comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=data.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

# POST like/unlike a post
@router.post('/{post_id}/like', response_model=PostResponse, status_code=200)
async def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a post (toggle)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    
    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike — delete the like and decrement count
        db.delete(existing_like)
        post.likes_count -= 1
    else:
        # Like — create the like and increment count
        new_like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count += 1
    
    db.commit()
    db.refresh(post)
    return post

# DELETE own post
@router.delete('/{post_id}', status_code=204)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete own post (only the author can delete)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='You can only delete your own posts')
    
    db.delete(post)
    db.commit()
    return None