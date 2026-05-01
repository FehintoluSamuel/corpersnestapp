"""
routers/reports_router.py

Allows logged-in users to submit reports on listings or other users.
Admin resolution lives in admin_router.py.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from schemas.reports import SubmitReportRequest,ReportResponse
from database import get_db
from models.database_model import User, Listing, Report
from auth import get_current_user
from dependencies import ReportType, ReportStatus

router = APIRouter(prefix="/reports", tags=["Reports"])


# ─── Submit report ────────────────────────────────────────────────────────────

@router.post("/", response_model=ReportResponse, status_code=201)
async def submit_report(
    data:         SubmitReportRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """
    Submit a report on a listing or a user.
    - report_type=listing requires listing_id
    - report_type=user requires reported_user_id
    A user cannot report themselves.
    """
    # Validate the report has the right target
    if data.report_type == ReportType.listing:
        if not data.listing_id:
            raise HTTPException(
                status_code=400,
                detail="listing_id is required when reporting a listing."
            )
        listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found.")

    elif data.report_type == ReportType.user:
        if not data.reported_user_id:
            raise HTTPException(
                status_code=400,
                detail="reported_user_id is required when reporting a user."
            )
        if data.reported_user_id == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="You cannot report yourself."
            )
        target_user = db.query(User).filter(User.id == data.reported_user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found.")

    # Prevent duplicate open reports from the same user on the same target
    existing = db.query(Report).filter(
        Report.reporter_id      == current_user.id,
        Report.listing_id       == data.listing_id,
        Report.reported_user_id == data.reported_user_id,
        Report.status           == ReportStatus.open,
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an open report on this. Our team is reviewing it."
        )

    report = Report(
        reporter_id      = current_user.id,
        report_type      = data.report_type,
        reason           = data.reason,
        listing_id       = data.listing_id,
        reported_user_id = data.reported_user_id,
        status           = ReportStatus.open,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


# ─── My reports ───────────────────────────────────────────────────────────────

@router.get("/mine", response_model=List[ReportResponse], status_code=200)
async def get_my_reports(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Returns all reports submitted by the current user."""
    reports = (
        db.query(Report)
        .filter(Report.reporter_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return reports