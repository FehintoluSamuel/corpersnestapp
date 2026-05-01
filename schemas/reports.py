from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from dependencies import ListingType, ListingStatus
from models.database_model import User, Listing, Report
from dependencies import ReportType, ReportStatus

# ─── Schemas ──────────────────────────────────────────────────────────────────

class SubmitReportRequest(BaseModel):
    report_type:      ReportType
    reason:           str
    listing_id:       Optional[int] = None   # set when reporting a listing
    reported_user_id: Optional[int] = None   # set when reporting a user


class ReportResponse(BaseModel):
    id:               int
    report_type:      str
    reason:           str
    status:           str
    listing_id:       Optional[int] = None
    reported_user_id: Optional[int] = None

    class Config:
        from_attributes = True
