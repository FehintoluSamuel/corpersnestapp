"""routers/connections_router.py"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List

from database import get_db
from models.database_model import User, Connection, Conversation
from schemas.connections import ConnectionResponse
from auth import get_current_user
from dependencies import ConnectionStatus
from utils.notifications import notify_connection_request, notify_connection_accepted
 
 

router = APIRouter(prefix='/connections', tags=['Connections'])


def _get_connection(db, user_a_id, user_b_id):
    return db.query(Connection).filter(
        or_(
            and_(Connection.requester_id == user_a_id, Connection.receiver_id == user_b_id),
            and_(Connection.requester_id == user_b_id, Connection.receiver_id == user_a_id),
        )
    ).first()


def _get_or_create_conversation(db, user_a_id, user_b_id):
    conv = db.query(Conversation).filter(
        or_(
            and_(Conversation.user_a_id == user_a_id, Conversation.user_b_id == user_b_id),
            and_(Conversation.user_a_id == user_b_id, Conversation.user_b_id == user_a_id),
        )
    ).first()
    if not conv:
        conv = Conversation(user_a_id=user_a_id, user_b_id=user_b_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv


@router.post('/request/{receiver_id}', response_model=ConnectionResponse, status_code=201)
async def send_request(
    receiver_id:  int,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    if receiver_id == current_user.id:
        raise HTTPException(400, 'Cannot connect with yourself')

    receiver = db.query(User).filter(User.id == receiver_id).first()
    if not receiver:
        raise HTTPException(404, 'User not found')

    existing = _get_connection(db, current_user.id, receiver_id)
    if existing:
        raise HTTPException(400, f'Connection already {existing.status}')

    conn = Connection(requester_id=current_user.id, receiver_id=receiver_id)
    db.add(conn)
    db.commit() 
    notify_connection_request(db, receiver_id, current_user)
    db.commit()
    db.refresh(conn)
    return conn


@router.post('/{connection_id}/accept', response_model=ConnectionResponse)
async def accept_request(
    connection_id: int,
    current_user:  User    = Depends(get_current_user),
    db:            Session = Depends(get_db),
):
    conn = db.query(Connection).filter(Connection.id == connection_id).first()
    if not conn:
        raise HTTPException(404, 'Connection not found')
    if conn.receiver_id != current_user.id:
        raise HTTPException(403, 'Not your request to accept')
    if conn.status != ConnectionStatus.pending:
        raise HTTPException(400, f'Connection is already {conn.status}')

    conn.status = ConnectionStatus.accepted
    db.commit() 
    notify_connection_accepted(db, conn.requester_id, current_user)
    db.commit()
    # Create conversation so they can message immediately
    _get_or_create_conversation(db, conn.requester_id, conn.receiver_id)
    db.refresh(conn)
    return conn


@router.post('/{connection_id}/reject', response_model=ConnectionResponse)
async def reject_request(
    connection_id: int,
    current_user:  User    = Depends(get_current_user),
    db:            Session = Depends(get_db),
):
    conn = db.query(Connection).filter(Connection.id == connection_id).first()
    if not conn or conn.receiver_id != current_user.id:
        raise HTTPException(404, 'Connection not found')

    conn.status = ConnectionStatus.rejected
    db.commit()
    db.refresh(conn)
    return conn


@router.delete('/{connection_id}', status_code=204)
async def remove_connection(
    connection_id: int,
    current_user:  User    = Depends(get_current_user),
    db:            Session = Depends(get_db),
):
    conn = db.query(Connection).filter(Connection.id == connection_id).first()
    if not conn:
        raise HTTPException(404, 'Connection not found')
    if conn.requester_id != current_user.id and conn.receiver_id != current_user.id:
        raise HTTPException(403, 'Not your connection')

    db.delete(conn)
    db.commit()
    return None


@router.get('/pending', response_model=List[ConnectionResponse])
async def get_pending(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    return db.query(Connection).filter(
        Connection.receiver_id == current_user.id,
        Connection.status      == ConnectionStatus.pending,
    ).all()


@router.get('/', response_model=List[ConnectionResponse])
async def get_connections(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    return db.query(Connection).filter(
        or_(
            Connection.requester_id == current_user.id,
            Connection.receiver_id  == current_user.id,
        ),
        Connection.status == ConnectionStatus.accepted,
    ).all()


@router.get('/status/{other_user_id}')
async def get_status(
    other_user_id: int,
    current_user:  User    = Depends(get_current_user),
    db:            Session = Depends(get_db),
):
    """Returns connection status between current user and another user."""
    conn = _get_connection(db, current_user.id, other_user_id)
    if not conn:
        return {'status': 'none', 'connection_id': None, 'is_requester': False}
    return {
        'status':        conn.status,
        'connection_id': conn.id,
        'is_requester':  conn.requester_id == current_user.id,
    } 

@router.get('/count/{user_id}')
async def get_connection_count(user_id: int, db: Session = Depends(get_db)):
    """Public — returns how many accepted connections a user has."""
    count = db.query(Connection).filter(
        or_(
            Connection.requester_id == user_id,
            Connection.receiver_id  == user_id,
        ),
        Connection.status == ConnectionStatus.accepted,
    ).count()
    return {'count': count} 



@router.get('/sent', response_model=List[ConnectionResponse])
async def get_sent_requests(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Requests the current user has sent that are still pending."""
    return db.query(Connection).filter(
        Connection.requester_id == current_user.id,
        Connection.status       == ConnectionStatus.pending,
    ).all()