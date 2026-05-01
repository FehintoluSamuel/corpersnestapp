"""routers/messages_router.py"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List
from datetime import datetime, timezone

from database import get_db
from models.database_model import User, Conversation, Message, Connection
from schemas.connections import UserSnippet
from schemas.messages import ConversationResponse, MessageResponse, SendMessageRequest
from auth import get_current_user
from dependencies import ConnectionStatus

router = APIRouter(prefix='/messages', tags=['Messages'])


def _assert_connected(db, user_a_id, user_b_id):
    conn = db.query(Connection).filter(
        or_(
            and_(Connection.requester_id == user_a_id, Connection.receiver_id == user_b_id),
            and_(Connection.requester_id == user_b_id, Connection.receiver_id == user_a_id),
        ),
        Connection.status == ConnectionStatus.accepted,
    ).first()
    if not conn:
        raise HTTPException(403, 'You must be connected to message this user')
    return conn


def _get_conversation(db, user_a_id, user_b_id):
    return db.query(Conversation).filter(
        or_(
            and_(Conversation.user_a_id == user_a_id, Conversation.user_b_id == user_b_id),
            and_(Conversation.user_a_id == user_b_id, Conversation.user_b_id == user_a_id),
        )
    ).first()


@router.get('/', response_model=List[ConversationResponse])
async def get_inbox(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """All conversations for the current user, sorted by last message."""
    convs = db.query(Conversation).filter(
        or_(
            Conversation.user_a_id == current_user.id,
            Conversation.user_b_id == current_user.id,
        )
    ).order_by(desc(Conversation.last_message_at)).all()

    result = []
    for c in convs:
        other = c.user_b if c.user_a_id == current_user.id else c.user_a
        last  = db.query(Message).filter(
            Message.conversation_id == c.id
        ).order_by(desc(Message.created_at)).first()
        unread = db.query(Message).filter(
            Message.conversation_id == c.id,
            Message.sender_id       != current_user.id,
            Message.is_read         == False,
        ).count()

        result.append(ConversationResponse(
            id              = c.id,
            user_a_id       = c.user_a_id,
            user_b_id       = c.user_b_id,
            last_message_at = c.last_message_at,
            created_at      = c.created_at,
            other_user      = UserSnippet.model_validate(other),
            last_message    = last.content if last else None,
            unread_count    = unread,
        ))
    return result


@router.get('/{other_user_id}', response_model=List[MessageResponse])
async def get_messages(
    other_user_id: int,
    current_user:  User    = Depends(get_current_user),
    db:            Session = Depends(get_db),
):
    """Fetch message history with a user. Marks messages as read."""
    _assert_connected(db, current_user.id, other_user_id)

    conv = _get_conversation(db, current_user.id, other_user_id)
    if not conv:
        return []

    # Mark received messages as read
    db.query(Message).filter(
        Message.conversation_id == conv.id,
        Message.sender_id       != current_user.id,
        Message.is_read         == False,
    ).update({'is_read': True})
    db.commit()

    return db.query(Message).filter(
        Message.conversation_id == conv.id
    ).order_by(Message.created_at).all()



@router.get('/unread-count')
async def get_unread_count(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Total unread messages across all conversations."""
    count = db.query(Message).join(Conversation).filter(
        or_(
            Conversation.user_a_id == current_user.id,
            Conversation.user_b_id == current_user.id,
        ),
        Message.sender_id != current_user.id,
        Message.is_read   == False,
    ).count()
    return {'count': count}



@router.post('/{other_user_id}', response_model=MessageResponse, status_code=201)
async def send_message(
    other_user_id: int,
    data:          SendMessageRequest,
    current_user:  User    = Depends(get_current_user),
    db:            Session = Depends(get_db),
):
    """REST fallback for sending a message (WebSocket is preferred)."""
    _assert_connected(db, current_user.id, other_user_id)

    conv = _get_conversation(db, current_user.id, other_user_id)
    if not conv:
        raise HTTPException(404, 'Conversation not found')

    msg = Message(
        conversation_id = conv.id,
        sender_id       = current_user.id,
        content         = data.content,
    )
    db.add(msg)
    conv.last_message_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)
    return msg 

