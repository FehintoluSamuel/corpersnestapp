from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from dependencies import ListingType, ListingStatus


#listing field validation for owner response
class OwnerResponse(BaseModel):
    id: int
    full_name: str
    phone_no: Optional[str] = None 

#listing field validation for client POST request
class ListingCreateRequest(BaseModel):
    title : str
    address : str
    lga : str
    price_monthly : float
    bedrooms : int
    description : Optional[str]= None
    listing_type : ListingType
    available_from : date
    
#listing field validation for client PATCH request
class ListingUpdateRequest(BaseModel):
    title : Optional[str]= None
    address : Optional[str]= None
    lga : Optional[str]= None
    price_monthly : Optional[float]= None
    bedrooms : Optional[int]= None
    description : Optional[str]= None
    listing_type : Optional[ListingType]= None
    available_from : Optional[date]= None
    status : Optional[ListingStatus]= None
    
    

#listing field validation for Listing response
class ListingResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    address: str
    lga: str
    price_monthly: float
    bedrooms: int
    description: Optional[str] = None
    listing_type: ListingType
    available_from: date
    status: ListingStatus
    created_at: datetime
    owner: OwnerResponse

    class Config:
        from_attributes = True






























































