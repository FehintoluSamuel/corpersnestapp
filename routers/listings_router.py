from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.database_model import User, Listing
from schemas.listing import ListingCreateRequest, ListingUpdateRequest, ListingResponse
from auth import get_current_user
from typing import List
from decimal import Decimal

router = APIRouter(prefix='/listings', tags=['Listings'])

# GET all listings with optional filters
@router.get('/', response_model=List[ListingResponse], status_code=200)
async def get_all_listings(
    lga: str = None,
    price_max: float = None,
    bedrooms: int = None,
    db: Session = Depends(get_db)
):
    """Get all active listings with optional filters"""
    query = db.query(Listing).filter(Listing.status == 'active')
    
    if lga:
        query = query.filter(Listing.lga == lga)
    if price_max:
        query = query.filter(Listing.price_monthly <= price_max)
    if bedrooms:
        query = query.filter(Listing.bedrooms == bedrooms)
    
    listings = query.all()
    return listings


# GET one listing by ID
@router.get('/{listing_id}', response_model=ListingResponse, status_code=200)
async def get_listing(listing_id: int, db: Session = Depends(get_db)):
    """Get a single listing by ID"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail='Listing not found')
    return listing


# POST create new listing
@router.post('/', response_model=ListingResponse, status_code=201)
async def create_listing(
    data: ListingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new listing (must be logged in)"""
    new_listing = Listing(
        owner_id=current_user.id,
        title=data.title,
        address=data.address,
        lga=data.lga,
        price_monthly=data.price_monthly,
        bedrooms=data.bedrooms,
        description=data.description,
        listing_type=data.listing_type,
        available_from=data.available_from
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing


# PUT update listing (must own it)
@router.put('/{listing_id}', response_model=ListingResponse, status_code=200)
async def update_listing(
    listing_id: int,
    data: ListingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a listing (only the owner can do this)"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail='Listing not found')
    
    # Check authorization — is this the owner?
    if getattr(listing, "owner_id") != current_user.id:
        raise HTTPException(status_code=403, detail='You can only edit your own listings')
    
    # Update only the fields that were provided
    if data.title:
        listing.title = data.title
    if data.address:
        listing.address = data.address
    if data.lga:
        listing.lga = data.lga
    if data.price_monthly:
        listing.price_monthly = data.price_monthly
    if data.bedrooms:
        listing.bedrooms = data.bedrooms
    if data.description:
        listing.description = data.description
    if data.listing_type:
        listing.listing_type = data.listing_type
    if data.available_from:
        listing.available_from = data.available_from
    if data.status:
        listing.status = data.status
    
    db.commit()
    db.refresh(listing)
    return listing


# DELETE listing (must own it)
@router.delete('/{listing_id}', status_code=204)
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a listing (only the owner can do this)"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail='Listing not found')
    
    if getattr(listing, "owner_id") != current_user.id:
        raise HTTPException(status_code=403, detail='You can only delete your own listings')
    
    db.delete(listing)
    db.commit()
    return None