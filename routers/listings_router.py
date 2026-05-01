"""
routers/listings_router.py

Listings endpoints with role-based permission checks:
- PCMs cannot create listings
- Pending landlords cannot create listings
- Only owners can edit/delete their listings
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from sqlalchemy.orm import joinedload


from database import get_db
from models.database_model import User, Listing
from schemas.listing import ListingCreateRequest, ListingUpdateRequest, ListingResponse
from auth import get_current_user
from dependencies import Role, Status

router = APIRouter(prefix="/listings", tags=["Listings"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def require_listing_permission(current_user: User) -> None:
    if current_user.status == Status.suspended:
        raise HTTPException(403, 'Your account has been suspended. Contact support.')
    if current_user.status == Status.pending_verification:
        raise HTTPException(403, 'Your account is pending verification.')
    # Only outgoing corpers, alumni, and landlords can post
    # incoming_corpers and pcms cannot post listings
    if current_user.role not in (Role.outgoing_corper, Role.alumni, Role.landlord, Role.admin):
        raise HTTPException(403, 'Only outgoing corpers and landlords can post listings.')

# ─── GET all listings ─────────────────────────────────────────────────────────

@router.get("/", response_model=List[ListingResponse], status_code=200)
async def get_all_listings(
    lga:       str   = None,
    price_max: float = None,
    bedrooms:  int   = None,
    db:        Session = Depends(get_db),
):
    """Get all active listings with optional filters. No auth required."""
    query = db.query(Listing).filter(Listing.status == 'active').options(joinedload(Listing.owner))

    if lga:
        query = query.filter(Listing.lga == lga)
    if price_max:
        query = query.filter(Listing.price_monthly <= price_max)
    if bedrooms:
        query = query.filter(Listing.bedrooms == bedrooms)

    return query.all()


# ─── GET one listing ──────────────────────────────────────────────────────────

@router.get("/{listing_id}", response_model=ListingResponse, status_code=200)
async def get_listing(listing_id: int, db: Session = Depends(get_db)):
    """Get a single listing by ID. No auth required."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return listing


# ─── POST create listing ──────────────────────────────────────────────────────

@router.post("/", response_model=ListingResponse, status_code=201)
async def create_listing(
    data:         ListingCreateRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """
    Create a new listing.
    Requires: incoming_corper, outgoing_corper, alumni, or verified landlord.
    Blocked: pcm, pending_verification, suspended.
    """
    require_listing_permission(current_user)

    new_listing = Listing(
        owner_id      = current_user.id,
        title         = data.title,
        address       = data.address,
        lga           = data.lga,
        price_monthly = data.price_monthly,
        bedrooms      = data.bedrooms,
        description   = data.description,
        listing_type  = data.listing_type,
        available_from = data.available_from,
        image_url     = data.image_url,
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing


# ─── PUT update listing ───────────────────────────────────────────────────────

@router.put("/{listing_id}", response_model=ListingResponse, status_code=200)
async def update_listing(
    listing_id:   int,
    data:         ListingUpdateRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Update a listing. Only the owner can do this."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")

    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings.")

    if data.title is not None:
        listing.title = data.title
    if data.address is not None:
        listing.address = data.address
    if data.lga is not None:
        listing.lga = data.lga
    if data.price_monthly is not None:
        listing.price_monthly = data.price_monthly
    if data.bedrooms is not None:
        listing.bedrooms = data.bedrooms
    if data.description is not None:
        listing.description = data.description
    if data.listing_type is not None:
        listing.listing_type = data.listing_type
    if data.available_from is not None:
        listing.available_from = data.available_from
    if data.status is not None:
        listing.status = data.status
    if data.image_url is not None:
        listing.image_url = data.image_url

    db.commit()
    db.refresh(listing)
    return listing


# ─── DELETE listing ───────────────────────────────────────────────────────────

@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id:   int,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    """Delete a listing. Only the owner can do this."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")

    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings.")

    db.delete(listing)
    db.commit()
    return None