"""routers/notifications_router.py"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.database_model import User, Notification
from schemas.notifications import NotificationResponse
from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse], status_code=200)
async def get_notifications(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Get all notifications for the current user, newest first."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .limit(50)
        .all()
    )


@router.get("/unread-count", status_code=200)
async def get_unread_count(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).count()
    return {"count": count}


@router.post("/read-all", status_code=200)
async def mark_all_read(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


@router.post("/{notification_id}/read", status_code=200)
async def mark_read(
    notification_id: int,
    current_user:    User    = Depends(get_current_user),
    db:              Session = Depends(get_db),
):
    notif = db.query(Notification).filter(
        Notification.id      == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Marked as read"}