"""
routers/admin_router.py

Admin-only endpoints for:
- Landlord verification queue (approve / reject)
- User management (suspend / reinstate / promote to admin)
- Reports queue (view / resolve)

All endpoints require role=admin. Any non-admin request returns 403.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.database_model import User, LandlordProfile, Report
from schemas.auth import UserResponse
from auth import get_current_user
from dependencies import Role, Status, ReportStatus

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── Dependency ───────────────────────────────────────────────────────────────

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that blocks any non-admin from accessing admin routes."""
    if current_user.role != Role.admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )
    return current_user


# ─── Schemas (admin-specific, kept local) ────────────────────────────────────

class VerifyLandlordRequest(BaseModel):
    approve: bool
    note:    Optional[str] = None   # optional note for rejection reason


class SuspendUserRequest(BaseModel):
    reason: Optional[str] = None


class ResolveReportRequest(BaseModel):
    resolution_note: Optional[str] = None


class LandlordQueueItem(BaseModel):
    user_id:    int
    full_name:  str
    email:      str
    phone_no:   Optional[str] = None
    lga:        Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    id:               int
    reporter_id:      int
    reported_user_id: Optional[int] = None
    listing_id:       Optional[int] = None
    report_type:      str
    reason:           str
    status:           str
    resolution_note:  Optional[str] = None
    created_at:       Optional[str] = None

    class Config:
        from_attributes = True


# ─── Dashboard summary ────────────────────────────────────────────────────────

@router.get("/dashboard", status_code=200)
async def get_dashboard(
    db:    Session = Depends(get_db),
    admin: User    = Depends(require_admin),
):
    """Returns counts for the admin dashboard at a glance."""
    pending_landlords = (
        db.query(User)
        .filter(
            User.role   == Role.landlord,
            User.status == Status.pending_verification,
        )
        .count()
    )

    open_reports = (
        db.query(Report)
        .filter(Report.status == ReportStatus.open)
        .count()
    )

    total_users = db.query(User).filter(User.role != Role.admin).count()

    return {
        "pending_landlord_verifications": pending_landlords,
        "open_reports":                   open_reports,
        "total_users":                    total_users,
    }


# ─── Landlord verification queue ─────────────────────────────────────────────

@router.get("/landlords/pending", status_code=200)
async def get_pending_landlords(
    db:    Session = Depends(get_db),
    admin: User    = Depends(require_admin),
):
    """Returns all landlords awaiting verification."""
    pending = (
        db.query(User)
        .filter(
            User.role   == Role.landlord,
            User.status == Status.pending_verification,
        )
        .order_by(User.created_at)
        .all()
    )

    return [
        {
            "user_id":   u.id,
            "full_name": u.full_name,
            "email":     u.email,
            "phone_no":  u.phone_no,
            "lga":       u.landlord_profile.lga if u.landlord_profile else None,
            "joined":    u.created_at.isoformat() if u.created_at else None,
        }
        for u in pending
    ]


@router.post("/landlords/{user_id}/verify", response_model=UserResponse, status_code=200)
async def verify_landlord(
    user_id: int,
    data:    VerifyLandlordRequest,
    db:      Session = Depends(get_db),
    admin:   User    = Depends(require_admin),
):
    """
    Approve or reject a landlord registration.
    - Approve: sets status to active, records who verified and when.
    - Reject:  sets status to suspended, records rejection note.
    """
    user = db.query(User).filter(
        User.id   == user_id,
        User.role == Role.landlord,
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Landlord not found.")

    if user.status == Status.active:
        raise HTTPException(status_code=400, detail="Landlord is already verified.")

    profile = user.landlord_profile
    if not profile:
        profile = LandlordProfile(user_id=user.id)
        db.add(profile)

    if data.approve:
        user.status              = Status.active
        profile.verified_by      = admin.id
        profile.verified_at      = datetime.now(timezone.utc)
        profile.verification_note = data.note
    else:
        user.status               = Status.suspended
        profile.verification_note = data.note or "Registration rejected by admin."

    db.commit()
    db.refresh(user)
    return user


# ─── User management ──────────────────────────────────────────────────────────

@router.get("/users", status_code=200)
async def list_users(
    role:   Optional[str] = None,
    status: Optional[str] = None,
    db:     Session = Depends(get_db),
    admin:  User    = Depends(require_admin),
):
    """List all users with optional role/status filters."""
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)

    users = query.order_by(desc(User.created_at)).all()

    return [
        {
            "id":         u.id,
            "full_name":  u.full_name,
            "email":      u.email,
            "role":       u.role,
            "status":     u.status,
            "state":      u.state,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/users/{user_id}/suspend", response_model=UserResponse, status_code=200)
async def suspend_user(
    user_id: int,
    data:    SuspendUserRequest,
    db:      Session = Depends(get_db),
    admin:   User    = Depends(require_admin),
):
    """Suspend a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.role == Role.admin:
        raise HTTPException(status_code=403, detail="Cannot suspend another admin.")

    user.status = Status.suspended
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/reinstate", response_model=UserResponse, status_code=200)
async def reinstate_user(
    user_id: int,
    db:      Session = Depends(get_db),
    admin:   User    = Depends(require_admin),
):
    """Reinstate a suspended user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.status = Status.active
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/make-admin", response_model=UserResponse, status_code=200)
async def make_admin(
    user_id: int,
    db:      Session = Depends(get_db),
    admin:   User    = Depends(require_admin),
):
    """Promote a user to admin. Use with caution."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.role == Role.admin:
        raise HTTPException(status_code=400, detail="User is already an admin.")

    user.role   = Role.admin
    user.status = Status.active
    db.commit()
    db.refresh(user)
    return user


# ─── Reports queue ────────────────────────────────────────────────────────────

@router.get("/reports", status_code=200)
async def get_reports(
    status: Optional[str] = None,
    db:     Session = Depends(get_db),
    admin:  User    = Depends(require_admin),
):
    """List all reports, optionally filtered by status."""
    query = db.query(Report).order_by(desc(Report.created_at))

    if status:
        query = query.filter(Report.status == status)

    reports = query.all()

    return [
        {
            "id":               r.id,
            "reporter_id":      r.reporter_id,
            "reporter_name":    r.reporter.full_name if r.reporter else None,
            "reported_user_id": r.reported_user_id,
            "reported_user":    r.reported_user.full_name if r.reported_user else None,
            "listing_id":       r.listing_id,
            "report_type":      r.report_type,
            "reason":           r.reason,
            "status":           r.status,
            "created_at":       r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


@router.post("/reports/{report_id}/resolve", status_code=200)
async def resolve_report(
    report_id: int,
    data:      ResolveReportRequest,
    db:        Session = Depends(get_db),
    admin:     User    = Depends(require_admin),
):
    """Mark a report as resolved."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    report.status          = ReportStatus.resolved
    report.resolved_by     = admin.id
    report.resolved_at     = datetime.now(timezone.utc)
    report.resolution_note = data.resolution_note

    db.commit()

    return {"message": "Report resolved.", "report_id": report_id}