"""set_admin.py — run once to elevate a user to admin"""
from database import SessionLocal
from models.database_model import User
from dependencies import Role, Status

email = input("Enter email to make admin: ").strip()
db = SessionLocal()

user = db.query(User).filter(User.email == email).first()
if not user:
    print(f"No user found with email: {email}")
else:
    user.role   = Role.admin
    user.status = Status.active
    db.commit()
    print(f"Done. {user.full_name} is now admin.")

db.close()