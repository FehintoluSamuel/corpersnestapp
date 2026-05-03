"""
utils/notifications.py

Call these helpers from feed_router.py and connections_router.py
to create notifications when actions happen.
"""

from sqlalchemy.orm import Session
from models.database_model import Notification
from dependencies import NotificationType


def notify(db: Session, user_id: int, actor_id: int, type: NotificationType,
           message: str, post_id=None, comment_id=None, listing_id=None):
    """Create a notification. Silently skips if user == actor (no self-notify)."""
    if user_id == actor_id:
        return
    notif = Notification(
        user_id    = user_id,
        actor_id   = actor_id,
        type       = type,
        message    = message,
        post_id    = post_id,
        comment_id = comment_id,
        listing_id = listing_id,
    )
    db.add(notif)
    # Note: caller must commit


# ── Convenience wrappers ──────────────────────────────────────────────────────

def notify_post_like(db, post_owner_id, actor, post_id):
    notify(db, post_owner_id, actor.id, NotificationType.post_like,
           f"{actor.full_name} liked your post", post_id=post_id)

def notify_post_comment(db, post_owner_id, actor, post_id, comment_id):
    notify(db, post_owner_id, actor.id, NotificationType.post_comment,
           f"{actor.full_name} commented on your post", post_id=post_id, comment_id=comment_id)

def notify_comment_reply(db, parent_comment_owner_id, actor, post_id, comment_id):
    notify(db, parent_comment_owner_id, actor.id, NotificationType.comment_reply,
           f"{actor.full_name} replied to your comment", post_id=post_id, comment_id=comment_id)

def notify_connection_request(db, receiver_id, actor):
    notify(db, receiver_id, actor.id, NotificationType.connection_req,
           f"{actor.full_name} sent you a connection request")

def notify_connection_accepted(db, requester_id, actor):
    notify(db, requester_id, actor.id, NotificationType.connection_acc,
           f"{actor.full_name} accepted your connection request")