from database import Base
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Date, Numeric
from dependencies import Role, Status, ListingType, ListingStatus, PostTag
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone_no = Column(String(20), unique=True, nullable=True)
    nysc_state_code = Column(String(50), unique=True, nullable=True)
    batch_stream = Column(String(50), nullable=True)
    role = Column(Enum(Role), index=True, nullable=False, default=Role.incoming_corper)
    status = Column(Enum(Status), index=True, nullable=False, default=Status.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    listings = relationship('Listing', back_populates='owner')
    posts = relationship('Post', back_populates='user')
    comments = relationship('Comment', back_populates='user')

class Listing(Base):
    __tablename__ = 'listings'
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(500), nullable=False)
    address = Column(String(700), nullable=False)
    lga = Column(String(700), index=True, nullable=False)
    price_monthly = Column(Numeric(10, 2), nullable=False)
    bedrooms = Column(Integer, nullable=False)
    description = Column(String(1000), nullable=True)
    listing_type = Column(Enum(ListingType), index=True, nullable=False)
    status = Column(Enum(ListingStatus), index=True, nullable=False, default=ListingStatus.active)
    available_from = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship('User', back_populates='listings')

class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(String(1000), nullable=False)
    tag = Column(Enum(PostTag), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship('User', back_populates='posts')
    comments = relationship('Comment', back_populates='post', cascade='all, delete-orphan')

class Comment(Base):
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(String(1000), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    post = relationship('Post', back_populates='comments')
    user = relationship('User', back_populates='comments')

class PostLike(Base):
    __tablename__ = 'postlikes'
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

 

 
 

 

 

 

 

 

 
 

 

 

 

 

 

 
 

 

 

 

 

 

 
