"""
models/database_model.py

SQLAlchemy ORM models.
Run create_all() after any schema change (delete the .db file first on SQLite).
"""

from database import Base
from sqlalchemy import (
    Column, Integer, String, Enum, DateTime,
    ForeignKey, Date, Numeric, Text, Boolean
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship,backref
from dependencies import (
    Role, Status, ListingType, ListingStatus,
    PostTag, ReportType, ReportStatus
)
from dependencies import ConnectionStatus

class User(Base):
    __tablename__ = "users"

    id                   = Column(Integer, primary_key=True, index=True)
    full_name            = Column(String(100), nullable=False)
    email                = Column(String(100), unique=True, index=True, nullable=False)
    password_hash        = Column(String(255), nullable=False)
    phone_no             = Column(String(20), unique=True, nullable=True)

    # ── NYSC identity ──────────────────────────────────────────────────────────
    callup_number        = Column(String(50), unique=True, nullable=True)
    nysc_state_code      = Column(String(50), unique=True, nullable=True)
    stream               = Column(Integer, nullable=True)        # 1 or 2
    state                = Column(String(100), nullable=True)    # "Abia" — derived
    batch_stream         = Column(String(50), nullable=True)     # legacy, kept for compat
    camp_start_date      = Column(Date, nullable=True)           # actual date from call-up letter

    # ── Role & status ──────────────────────────────────────────────────────────
    role                 = Column(Enum(Role), index=True, nullable=False, default=Role.pcm)
    status               = Column(Enum(Status), index=True, nullable=False, default=Status.active)

    # ── Profile ────────────────────────────────────────────────────────────────
    profile_picture_url  = Column(String(500), nullable=True)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──────────────────────────────────────────────────────────
    landlord_profile     = relationship("LandlordProfile", foreign_keys="LandlordProfile.user_id", back_populates="user", uselist=False)
    listings             = relationship("Listing", back_populates="owner")
    posts                = relationship("Post", back_populates="user")
    comments             = relationship("Comment", back_populates="user")
    reports_made         = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter")
    reports_received     = relationship("Report", foreign_keys="Report.reported_user_id", back_populates="reported_user")
    
    
    
    # ── Connectionss ──────────────────────────────────────────────────────────
    connections_sent     = relationship('Connection', foreign_keys='Connection.requester_id', back_populates='requester')
    connections_received = relationship('Connection', foreign_keys='Connection.receiver_id',  back_populates='receiver')
    
    
    
    
    
class LandlordProfile(Base):
    """
    Stores landlord-specific operational data separately from User identity.
    Created automatically when a user registers with role=landlord.
    """
    __tablename__ = "landlord_profiles"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # ── Property info ──────────────────────────────────────────────────────────
    lga               = Column(String(100), nullable=True)   # LGA their property is in

    # ── Verification ──────────────────────────────────────────────────────────
    verified_by       = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at       = Column(DateTime(timezone=True), nullable=True)
    verification_note = Column(Text, nullable=True)          # Admin notes

    created_at        = Column(DateTime(timezone=True), server_default=func.now())

    # ── Relationships ──────────────────────────────────────────────────────────
    user              = relationship("User", foreign_keys=[user_id], back_populates="landlord_profile")
    verified_by_user  = relationship("User", foreign_keys=[verified_by])


class Listing(Base):
    __tablename__ = "listings"

    id             = Column(Integer, primary_key=True, index=True)
    owner_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    title          = Column(String(500), nullable=False)
    address        = Column(String(700), nullable=False)
    lga            = Column(String(700), index=True, nullable=False)
    price_monthly  = Column(Numeric(10, 2), nullable=False)
    bedrooms       = Column(Integer, nullable=False)
    description    = Column(String(1000), nullable=True)
    listing_type   = Column(Enum(ListingType), index=True, nullable=False)
    status         = Column(Enum(ListingStatus), index=True, nullable=False, default=ListingStatus.active)
    available_from = Column(Date, nullable=False)
    image_url      = Column(String(500), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    owner          = relationship("User", back_populates="listings")
    reports        = relationship("Report", foreign_keys="Report.listing_id", back_populates="listing")


class Post(Base):
    __tablename__ = "posts"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    content     = Column(String(1000), nullable=False)
    tag         = Column(Enum(PostTag), nullable=False, index=True)
    image_url   = Column(String(500), nullable=True)
    likes_count = Column(Integer, default=0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user        = relationship("User", back_populates="posts")
    comments    = relationship("Comment", back_populates="post", cascade="all, delete-orphan")



class Comment(Base):
    __tablename__ = 'comments'

    id         = Column(Integer, primary_key=True, index=True)
    post_id    = Column(Integer, ForeignKey('posts.id'), nullable=False)
    user_id    = Column(Integer, ForeignKey('users.id'), nullable=False)
    parent_id  = Column(Integer, ForeignKey('comments.id'), nullable=True)  # None = top-level comment
    content    = Column(String(1000), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post    = relationship('Post', back_populates='comments')
    user    = relationship('User', back_populates='comments')
    replies = relationship(
        'Comment',
        backref=backref('parent', remote_side='Comment.id'),
        foreign_keys='Comment.parent_id',
        lazy='selectin',
    )


class PostLike(Base):
    __tablename__ = "postlikes"

    id      = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id               = Column(Integer, primary_key=True, index=True)
    reporter_id      = Column(Integer, ForeignKey("users.id"), nullable=False)

    # One of these will be set depending on what is being reported
    listing_id       = Column(Integer, ForeignKey("listings.id"), nullable=True)
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    report_type      = Column(Enum(ReportType), nullable=False, index=True)
    reason           = Column(Text, nullable=False)
    status           = Column(Enum(ReportStatus), nullable=False, default=ReportStatus.open, index=True)

    # Admin resolution
    resolved_by      = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at      = Column(DateTime(timezone=True), nullable=True)
    resolution_note  = Column(Text, nullable=True)

    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    reporter         = relationship("User", foreign_keys=[reporter_id], back_populates="reports_made")
    reported_user    = relationship("User", foreign_keys=[reported_user_id], back_populates="reports_received")
    listing          = relationship("Listing", foreign_keys=[listing_id], back_populates="reports") 
    

    # Databases for Connections and DMs

class Connection(Base):
    __tablename__ = 'connections'
    id           = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    receiver_id  = Column(Integer, ForeignKey('users.id'), nullable=False)
    status       = Column(Enum(ConnectionStatus), nullable=False, default=ConnectionStatus.pending, index=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    requester = relationship('User', foreign_keys=[requester_id])
    receiver  = relationship('User', foreign_keys=[receiver_id])


class Conversation(Base):
    __tablename__ = 'conversations'
    id              = Column(Integer, primary_key=True, index=True)
    user_a_id       = Column(Integer, ForeignKey('users.id'), nullable=False)
    user_b_id       = Column(Integer, ForeignKey('users.id'), nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    user_a   = relationship('User', foreign_keys=[user_a_id])
    user_b   = relationship('User', foreign_keys=[user_b_id])
    messages = relationship('Message', back_populates='conversation', cascade='all, delete-orphan')


class Message(Base):
    __tablename__ = 'messages'
    id              = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'), nullable=False)
    sender_id       = Column(Integer, ForeignKey('users.id'), nullable=False)
    content         = Column(Text, nullable=False)
    is_read         = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship('Conversation', back_populates='messages')
    sender       = relationship('User', foreign_keys=[sender_id])


