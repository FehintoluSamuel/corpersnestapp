from database import Base
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Date, Numeric
from dependencies import Role, Status, ListingType, ListingStatus
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship 

#constructor for the database
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255),  nullable=False)
    phone_no = Column(String(20), unique=True, nullable=True)
    nysc_state_code = Column(String(50), unique=True, nullable=True)
    batch_stream = Column(String(50), nullable=True)
    role = Column(Enum(Role), index=True, nullable=False, default=Role.incoming_corper)
    status = Column(Enum(Status), index=True, nullable=False, default=Status.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    listings = relationship('Listing', back_populates='owner')
class Listing(Base):
    __tablename__='listings'
    id = Column(Integer, primary_key=True, index=True)
    owner_id= Column(Integer, ForeignKey('users.id'), nullable= False)
    title= Column(String(500), nullable=False)
    address= Column(String(700), nullable=False)
    lga= Column(String(700),index=True, nullable=False)
    price_monthly= Column(Numeric(10,2), nullable=False)
    bedrooms= Column(Integer, nullable=False)
    description= Column(String(1000), nullable=True) 
    listing_type= Column(Enum(ListingType), index=True, nullable=False)
    status= Column(Enum(ListingStatus), index=True, nullable=False, default=ListingStatus.active)
    available_from= Column(Date, nullable=False)
    created_at= Column(DateTime(timezone=True), server_default= func.now())
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    owner = relationship('User', back_populates='listings')

    

    

    

    

