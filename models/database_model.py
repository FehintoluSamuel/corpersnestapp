from database import Base
from sqlalchemy import Column, Integer, String,Enum, DateTime
from dependencies import Role, Status
from sqlalchemy.sql import func
    

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
