"""
CorperNest Seed Cleaner
========================
Run this before going live to wipe all demo data:
    python clear_seed.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.database_model import User, Listing, Post, Comment, PostLike

DEMO_EMAILS = [
    "incoming1@demo.com",
    "incoming2@demo.com",
    "incoming3@demo.com",
    "outgoing1@demo.com",
    "outgoing2@demo.com",
    "landlord1@demo.com",
    "admin@demo.com",
]

def clear():
    db = SessionLocal()
    try:
        print("🧹 Clearing demo seed data...")

        # Get demo user IDs
        demo_users = db.query(User).filter(User.email.in_(DEMO_EMAILS)).all()
        demo_user_ids = [u.id for u in demo_users]

        if not demo_user_ids:
            print("⚠️  No seed data found. Nothing to clear.")
            return

        # Delete in correct order (respect foreign keys)
        likes = db.query(PostLike).filter(PostLike.user_id.in_(demo_user_ids)).delete(synchronize_session=False)
        comments = db.query(Comment).filter(Comment.user_id.in_(demo_user_ids)).delete(synchronize_session=False)
        posts = db.query(Post).filter(Post.user_id.in_(demo_user_ids)).delete(synchronize_session=False)
        listings = db.query(Listing).filter(Listing.owner_id.in_(demo_user_ids)).delete(synchronize_session=False)
        users = db.query(User).filter(User.email.in_(DEMO_EMAILS)).delete(synchronize_session=False)

        db.commit()

        print(f"   ✓ {users} demo users deleted")
        print(f"   ✓ {listings} demo listings deleted")
        print(f"   ✓ {posts} demo posts deleted")
        print(f"   ✓ {comments} demo comments deleted")
        print(f"   ✓ {likes} demo likes deleted")
        print("\n✅ All demo data cleared. Database is clean for production.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Clear failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clear()