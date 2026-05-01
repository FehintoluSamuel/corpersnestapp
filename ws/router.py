"""websocket/router.py"""

import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from database import get_db
from models.database_model import User, Conversation, Message, Connection
from ws.manager import manager
from auth import decode_token          # expose this from your existing auth.py
from dependencies import ConnectionStatus

logger  = logging.getLogger(__name__)
router  = APIRouter(prefix="/websocket",tags=['WebSocket'])


def _get_user_from_token(token: str, db: Session) -> User | None:
    try:
        payload = decode_token(token)
        user_id = int(payload.get('sub'))
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def _get_conversation(db, user_a_id, user_b_id):
    return db.query(Conversation).filter(
        or_(
            and_(Conversation.user_a_id == user_a_id, Conversation.user_b_id == user_b_id),
            and_(Conversation.user_a_id == user_b_id, Conversation.user_b_id == user_a_id),
        )
    ).first()


def _are_connected(db, user_a_id, user_b_id) -> bool:
    return db.query(Connection).filter(
        or_(
            and_(Connection.requester_id == user_a_id, Connection.receiver_id == user_b_id),
            and_(Connection.requester_id == user_b_id, Connection.receiver_id == user_a_id),
        ),
        Connection.status == ConnectionStatus.accepted,
    ).first() is not None


@router.websocket('/ws')
async def websocket_endpoint(
    websocket: WebSocket,
    token:     str     = Query(...),
    db:        Session = Depends(get_db),
):
    """
    Single WebSocket endpoint per user.
    Client connects once on login; messages are routed by recipient_id.

    Incoming message format:
        { "type": "message", "recipient_id": 5, "content": "Hey!" }

    Outgoing message format (pushed to recipient):
        { "type": "message", "message": { ...MessageResponse } }

    Outgoing delivery receipt (pushed back to sender):
        { "type": "delivered", "message": { ...MessageResponse } }

    Outgoing read receipt:
        { "type": "read", "conversation_id": 3 }
    """
    user = _get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await manager.connect(user.id, websocket)

    try:
        while True:
            raw  = await websocket.receive_text()
            data = json.loads(raw)

            if data.get('type') == 'message':
                recipient_id = int(data['recipient_id'])
                content      = data.get('content', '').strip()

                if not content:
                    continue

                # Auth check
                if not _are_connected(db, user.id, recipient_id):
                    await websocket.send_text(json.dumps({
                        'type':  'error',
                        'detail': 'You must be connected to message this user',
                    }))
                    continue

                conv = _get_conversation(db, user.id, recipient_id)
                if not conv:
                    await websocket.send_text(json.dumps({
                        'type':   'error',
                        'detail': 'Conversation not found',
                    }))
                    continue

                # Persist
                msg = Message(
                    conversation_id = conv.id,
                    sender_id       = user.id,
                    content         = content,
                )
                db.add(msg)
                conv.last_message_at = datetime.now(timezone.utc)
                db.commit()
                db.refresh(msg)

                payload = {
                    'type': 'message',
                    'message': {
                        'id':              msg.id,
                        'conversation_id': msg.conversation_id,
                        'sender_id':       msg.sender_id,
                        'content':         msg.content,
                        'is_read':         msg.is_read,
                        'created_at':      msg.created_at.isoformat(),
                        'sender': {
                            'id':                  user.id,
                            'full_name':           user.full_name,
                            'role':                user.role,
                            'profile_picture_url': user.profile_picture_url,
                        },
                    },
                }

                # Push to recipient if online
                await manager.send_to_user(recipient_id, payload)

                # Delivery receipt back to sender
                await manager.send_to_user(user.id, {**payload, 'type': 'delivered'})

    except WebSocketDisconnect:
        manager.disconnect(user.id, websocket)
    except Exception as e:
        logger.error(f'WS error for user {user.id}: {e}')
        manager.disconnect(user.id, websocket)