"""
CorperNest Demo Seed Script
============================
Run this ONCE before your demo:
    python seed.py

To wipe all seed data before going live:
    python clear_seed.py

Demo login credentials (all accounts):
    Password: Demo@1234

Accounts:
    incoming1@demo.com  — Chukwuemeka Obi       (Incoming Corper)
    incoming2@demo.com  — Adaeze Nwosu          (Incoming Corper)
    incoming3@demo.com  — Tunde Fashola         (Incoming Corper)
    outgoing1@demo.com  — Ngozi Eze             (Outgoing Corper)
    outgoing2@demo.com  — Emeka Okafor          (Outgoing Corper)
    landlord1@demo.com  — Chief Bartholomew Agu (Landlord)
    admin@demo.com      — Admin CorperNest       (Admin)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models.database_model import User, Listing, Post, Comment, PostLike
from dependencies import Role, Status, ListingType, ListingStatus, PostTag
from auth import hash_password
from datetime import date, datetime
from decimal import Decimal

# ─── Config ───────────────────────────────────────────────
DEMO_PASSWORD = "Demo@1234"
DEMO_TAG = "[DEMO]"

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Starting CorperNest seed...")

        # ─── Check if already seeded ──────────────────────
        existing = db.query(User).filter(User.email == "incoming1@demo.com").first()
        if existing:
            print("Seed data already exists. Run clear_seed.py first if you want to reseed.")
            return

        hashed = hash_password(DEMO_PASSWORD)

        # ─── 1. CREATE USERS ──────────────────────────────
        print("Creating users...")

        incoming1 = User(
            full_name="Chukwuemeka Obi",
            email="incoming1@demo.com",
            password_hash=hashed,
            phone_no="08031234567",
            nysc_state_code="AB/24A/1234",
            batch_stream="Batch A Stream 1",
            role=Role.incoming_corper,
            status=Status.active,
        )
        incoming2 = User(
            full_name="Adaeze Nwosu",
            email="incoming2@demo.com",
            password_hash=hashed,
            phone_no="08031234568",
            nysc_state_code="AB/24A/1235",
            batch_stream="Batch A Stream 1",
            role=Role.incoming_corper,
            status=Status.active,
        )
        incoming3 = User(
            full_name="Tunde Fashola",
            email="incoming3@demo.com",
            password_hash=hashed,
            phone_no="08031234569",
            nysc_state_code="AB/24A/1236",
            batch_stream="Batch A Stream 2",
            role=Role.incoming_corper,
            status=Status.active,
        )
        outgoing1 = User(
            full_name="Ngozi Eze",
            email="outgoing1@demo.com",
            password_hash=hashed,
            phone_no="08031234570",
            nysc_state_code="AB/23B/0891",
            batch_stream="Batch B Stream 1",
            role=Role.outgoing_corper,
            status=Status.active,
        )
        outgoing2 = User(
            full_name="Emeka Okafor",
            email="outgoing2@demo.com",
            password_hash=hashed,
            phone_no="08031234571",
            nysc_state_code="AB/23B/0892",
            batch_stream="Batch B Stream 2",
            role=Role.outgoing_corper,
            status=Status.active,
        )
        landlord1 = User(
            full_name="Chief Bartholomew Agu",
            email="landlord1@demo.com",
            password_hash=hashed,
            phone_no="08031234572",
            role=Role.landlord,
            status=Status.active,
        )
        admin = User(
            full_name="Admin CorperNest",
            email="admin@demo.com",
            password_hash=hashed,
            role=Role.admin,
            status=Status.active,
        )

        users = [incoming1, incoming2, incoming3, outgoing1, outgoing2, landlord1, admin]
        for u in users:
            db.add(u)
        db.commit()
        for u in users:
            db.refresh(u)

        print(f"   {len(users)} users created")

        # ─── 2. CREATE LISTINGS ───────────────────────────
        print("Creating listings...")

        listings_data = [
            {
                "owner": outgoing1,
                "title": "Clean self-contain near ABSU Uturu — handover ready",
                "address": "No. 14 Ikenna Close, Uturu",
                "lga": "Isuikwuato",
                "price_monthly": 18000,
                "bedrooms": 1,
                "description": (
                    "Neat self-contain with good water supply and prepaid meter. "
                    "Very close to Abia State University main gate. Corper-friendly "
                    "landlord. I am passing out next month and would love to hand "
                    "this over to a fellow corper. Kitchen and bathroom inside."
                ),
                "listing_type": ListingType.corper_room,
                "status": ListingStatus.active,
                "available_from": date(2024, 8, 1),
                "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
            },
            {
                "owner": outgoing1,
                "title": "Shared apartment — 2 corpers needed, Umuahia North",
                "address": "7B Aba Road, Umuahia",
                "lga": "Umuahia North",
                "price_monthly": 12000,
                "bedrooms": 1,
                "description": (
                    "Spacious room in a shared 3-bedroom flat. Two corpers currently "
                    "living here, both passing out. Need two incoming corpers to take "
                    "over. Shared kitchen and bathrooms. Constant light from 6pm-6am. "
                    "10 minutes to Umuahia LG secretariat."
                ),
                "listing_type": ListingType.corper_room,
                "status": ListingStatus.active,
                "available_from": date(2024, 8, 15),
                "image_url": "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80",
            },
            {
                "owner": outgoing2,
                "title": "Mini flat with AC — Aba South, very secure",
                "address": "Plot 22 Faulks Road, Aba",
                "lga": "Aba South",
                "price_monthly": 25000,
                "bedrooms": 1,
                "description": (
                    "Well-furnished mini flat with air conditioner, standing fan, "
                    "reading table and wardrobe. Gated estate with security. "
                    "10 minutes from Aba LG. I am passing out and willing to "
                    "hand over the furniture too at a small negotiable cost."
                ),
                "listing_type": ListingType.corper_room,
                "status": ListingStatus.active,
                "available_from": date(2024, 9, 1),
                "image_url": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
            },
            {
                "owner": outgoing2,
                "title": "Room in corper house — Ohafia LGA",
                "address": "Corper Quarters, Behind LG Secretariat, Ohafia",
                "lga": "Ohafia",
                "price_monthly": 10000,
                "bedrooms": 1,
                "description": (
                    "Standard corper room in the unofficial corper house in Ohafia. "
                    "5 other corpers live here. Very safe, lively environment. "
                    "Borehole water, shared kitchen. Closest room to the main road. "
                    "Negotiable for the right person."
                ),
                "listing_type": ListingType.corper_room,
                "status": ListingStatus.active,
                "available_from": date(2024, 8, 20),
                "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
            },
            {
                "owner": landlord1,
                "title": "Modern 2-bedroom flat — Umuahia South",
                "address": "No. 5 Azikiwe Street, Umuahia South",
                "lga": "Umuahia South",
                "price_monthly": 35000,
                "bedrooms": 2,
                "description": (
                    "Brand new 2-bedroom flat in a quiet estate. Tiles throughout, "
                    "POP ceiling, prepaid meter, borehole. Suitable for corpers "
                    "who want comfort. Landlord lives off-site. Corpers given "
                    "special consideration. One year rent preferred."
                ),
                "listing_type": ListingType.landlord_property,
                "status": ListingStatus.active,
                "available_from": date(2024, 7, 1),
                "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
            },
            {
                "owner": landlord1,
                "title": "Self-contain — Osisioma Ngwa, near NNPC depot",
                "address": "No. 3 Trans-Amadi Layout, Osisioma",
                "lga": "Osisioma",
                "price_monthly": 20000,
                "bedrooms": 1,
                "description": (
                    "Newly renovated self-contain. Tiles, ceiling fan, good "
                    "ventilation. Very accessible location near the NNPC depot "
                    "junction. Corpers given 3-month rent option. "
                    "Light and water available. Call for inspection anytime."
                ),
                "listing_type": ListingType.landlord_property,
                "status": ListingStatus.active,
                "available_from": date(2024, 7, 15),
                "image_url": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
            },
            {
                "owner": landlord1,
                "title": "3-bedroom duplex — Aba North, fully furnished",
                "address": "15 Ikot Ekpene Road, Aba North",
                "lga": "Aba North",
                "price_monthly": 80000,
                "bedrooms": 3,
                "description": (
                    "Luxury duplex suitable for a group of corpers splitting rent. "
                    "Fully furnished — sofas, beds, fridge, TV. 24-hour security, "
                    "generator backup, swimming pool access. "
                    "Perfect for 3 corpers at about 27k each monthly."
                ),
                "listing_type": ListingType.landlord_property,
                "status": ListingStatus.active,
                "available_from": date(2024, 7, 1),
                "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            },
            {
                "owner": outgoing1,
                "title": "Room already taken — Bende LGA (for reference)",
                "address": "No. 9 Market Road, Bende",
                "lga": "Bende",
                "price_monthly": 8000,
                "bedrooms": 1,
                "description": "This room has already been taken by another corper.",
                "listing_type": ListingType.corper_room,
                "status": ListingStatus.taken,
                "available_from": date(2024, 6, 1),
                "image_url": None,
            },
        ]

        listing_objects = []
        for l in listings_data:
            listing = Listing(
                owner_id=l["owner"].id,
                title=l["title"],
                address=l["address"],
                lga=l["lga"],
                price_monthly=Decimal(str(l["price_monthly"])),
                bedrooms=l["bedrooms"],
                description=l["description"],
                listing_type=l["listing_type"],
                status=l["status"],
                available_from=l["available_from"],
                image_url=l.get("image_url"),
            )
            db.add(listing)
            listing_objects.append(listing)

        db.commit()
        for l in listing_objects:
            db.refresh(l)

        print(f"   {len(listing_objects)} listings created")

        # ─── 3. CREATE FEED POSTS ─────────────────────────
        print("Creating feed posts...")

        posts_data = [
            {
                "user": incoming1,
                "content": (
                    "Just arrived Umuahia and I'm completely stranded. My PPA is at "
                    "the Ministry of Education and I have no idea where to start "
                    "looking for accommodation. Anyone in Umuahia North who can help "
                    "or point me to a safe area? I have a budget of 15k monthly."
                ),
                "tag": PostTag.question,
                "likes_count": 8,
                "image_url": None,
            },
            {
                "user": outgoing1,
                "content": (
                    "Pro tip for incoming corpers: always inspect the prepaid meter "
                    "before you pay any rent. Some landlords swap yours for a depleted "
                    "one after you move in. Ask to see the current unit balance. "
                    "Also confirm if water runs from the tap before signing anything. "
                    "These two checks saved me from two bad apartments."
                ),
                "tag": PostTag.tip,
                "likes_count": 34,
                "image_url": None,
            },
            {
                "user": outgoing2,
                "content": (
                    "My self-contain in Umuahia is available from August 1st. "
                    "15k monthly, 6 minutes walk to the Umuahia North secretariat. "
                    "Prepaid meter, borehole water, very quiet compound. "
                    "I am passing out July 31st. First come first served — "
                    "check the listing I posted or call my number on my profile."
                ),
                "tag": PostTag.room_available,
                "likes_count": 19,
                "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
            },
            {
                "user": incoming2,
                "content": (
                    "I found a place in Aba South already — 2 bedroom flat on Faulks Road. "
                    "Looking for one more corper to share with. Split would be 17,500 each "
                    "monthly. PPA must be within Aba. DM me through the listing contact "
                    "if interested. Female preferred but open to discuss."
                ),
                "tag": PostTag.roommate_needed,
                "likes_count": 12,
                "image_url": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
            },
            {
                "user": outgoing1,
                "content": (
                    "WARNING: There is a man called 'Agent Kingsley' operating around "
                    "the Umuahia motor park area. He collects 5k 'inspection fee' upfront "
                    "and shows you fake apartments. Once you pay he disappears. "
                    "His number is saved on my phone as DO NOT PICK. "
                    "Please spread this so incoming corpers don't fall victim."
                ),
                "tag": PostTag.scam_warning,
                "likes_count": 67,
                "image_url": None,
            },
            {
                "user": incoming3,
                "content": (
                    "Quick question — is it safe to stay in Ohafia as a corper? "
                    "My PPA is there and I have heard mixed things. "
                    "Anyone currently serving there or who has served there? "
                    "How is the security, transport and general vibe?"
                ),
                "tag": PostTag.question,
                "likes_count": 5,
                "image_url": None,
            },
            {
                "user": outgoing2,
                "content": (
                    "Ohafia is actually one of the best LGAs to serve in Abia. "
                    "Very peaceful, the locals respect corpers a lot. "
                    "Transport to Umuahia is about 800 naira, runs frequently. "
                    "Make sure you join the corpers WhatsApp group for your LGA — "
                    "ask at orientation, someone will add you."
                ),
                "tag": PostTag.tip,
                "likes_count": 28,
                "image_url": None,
            },
            {
                "user": incoming1,
                "content": (
                    "Shoutout to CorperNest — found my apartment in less than 24 hours "
                    "of being deployed. Contacted an outgoing corper directly and we "
                    "did a smooth handover. This platform is exactly what we needed. "
                    "God bless whoever built this."
                ),
                "tag": PostTag.general,
                "likes_count": 45,
                "image_url": None,
            },
            {
                "user": landlord1,
                "content": (
                    "To all corps members looking for accommodation in Umuahia and Aba — "
                    "I have verified properties available at fair prices. "
                    "My listings are on CorperNest. I have been hosting corpers "
                    "for 6 years and I understand your schedule and budget. "
                    "Feel free to reach out through my listings."
                ),
                "tag": PostTag.room_available,
                "likes_count": 15,
                "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
            },
            {
                "user": incoming2,
                "content": (
                    "Does anyone know if NYSC allowance is paid on the 15th or end "
                    "of month in Abia State? My account has not been credited yet "
                    "and it has been 3 weeks since deployment. "
                    "Is this normal or do I need to visit the NYSC secretariat?"
                ),
                "tag": PostTag.question,
                "likes_count": 22,
                "image_url": None,
            },
        ]

        post_objects = []
        for p in posts_data:
            post = Post(
                user_id=p["user"].id,
                content=p["content"],
                tag=p["tag"],
                likes_count=p["likes_count"],
                image_url=p.get("image_url"),
            )
            db.add(post)
            post_objects.append(post)

        db.commit()
        for p in post_objects:
            db.refresh(p)

        print(f"   {len(post_objects)} posts created")

        # ─── 4. CREATE COMMENTS ───────────────────────────
        print("Creating comments...")

        comments_data = [
            (post_objects[0], outgoing1, "I just posted my room in Umuahia North — check my listing. 15k monthly, very close to the secretariat."),
            (post_objects[0], outgoing2, "Join the Abia corpers WhatsApp group, someone there will help you find a place fast."),
            (post_objects[0], incoming3, "I was in the same situation. Check the listings here, I found mine in one day."),
            (post_objects[1], incoming1, "This is so important. My cousin lost 30k because of this exact trick. Thank you!"),
            (post_objects[1], incoming2, "Also check if the apartment has been used before — some landlords repaint and re-rent condemned rooms."),
            (post_objects[1], incoming3, "Saving this post. About to start apartment hunting."),
            (post_objects[2], incoming1, "Is this still available? I am interested."),
            (post_objects[2], incoming3, "How do I reach you? I checked your profile."),
            (post_objects[3], incoming3, "I am interested! My PPA is at Aba South LGA office. Let me know."),
            (post_objects[3], incoming1, "Is this still open? I am also in Aba South area."),
            (post_objects[4], incoming1, "Thank you for this! Please can you share his number so we can block?"),
            (post_objects[4], incoming2, "I almost fell for this same trick. He approached me at the park too."),
            (post_objects[4], incoming3, "This should be pinned. Too important."),
            (post_objects[4], outgoing2, "Shared in the Abia corpers group. Everyone needs to see this."),
            (post_objects[6], incoming3, "Thank you! This is very reassuring. Was really worried about safety there."),
            (post_objects[6], incoming1, "What about internet? Is there good network coverage in Ohafia?"),
            (post_objects[6], outgoing1, "MTN and Airtel work fine in the main town. Outskirts can be patchy."),
            (post_objects[7], outgoing1, "Happy it helped! This is exactly why we built it."),
            (post_objects[7], outgoing2, "Glad you found a place. Enjoy your service year!"),
            (post_objects[7], incoming2, "Same experience here. Found mine in 2 hours!"),
            (post_objects[9], outgoing1, "It varies. Usually around the 15th but Abia can delay to end of month. Visit the secretariat if it exceeds 4 weeks."),
            (post_objects[9], outgoing2, "Call the NYSC Abia helpline too — 08012345678. They respond quickly."),
        ]

        comment_objects = []
        for post, user, content in comments_data:
            comment = Comment(
                post_id=post.id,
                user_id=user.id,
                content=content,
            )
            db.add(comment)
            comment_objects.append(comment)

        db.commit()

        for post in post_objects:
            post.comments_count = db.query(Comment).filter(
                Comment.post_id == post.id
            ).count()
        db.commit()

        print(f"   {len(comment_objects)} comments created")

        # ─── 5. CREATE LIKES ──────────────────────────────
        print("Creating likes...")

        likes_data = [
            (post_objects[1], incoming1),
            (post_objects[1], incoming2),
            (post_objects[1], incoming3),
            (post_objects[4], incoming1),
            (post_objects[4], incoming2),
            (post_objects[4], incoming3),
            (post_objects[4], outgoing2),
            (post_objects[7], outgoing1),
            (post_objects[7], outgoing2),
            (post_objects[7], incoming2),
            (post_objects[7], incoming3),
            (post_objects[6], incoming1),
            (post_objects[6], incoming2),
            (post_objects[6], incoming3),
        ]

        for post, user in likes_data:
            existing = db.query(PostLike).filter(
                PostLike.post_id == post.id,
                PostLike.user_id == user.id
            ).first()
            if not existing:
                like = PostLike(post_id=post.id, user_id=user.id)
                db.add(like)

        db.commit()
        print(f"   {len(likes_data)} likes created")

        print("\nSeed complete! CorperNest is ready for demo.")
        print("\nDemo credentials (password: Demo@1234):")
        print("   incoming1@demo.com  — Chukwuemeka Obi       (Incoming Corper)")
        print("   incoming2@demo.com  — Adaeze Nwosu          (Incoming Corper)")
        print("   incoming3@demo.com  — Tunde Fashola         (Incoming Corper)")
        print("   outgoing1@demo.com  — Ngozi Eze             (Outgoing Corper)")
        print("   outgoing2@demo.com  — Emeka Okafor          (Outgoing Corper)")
        print("   landlord1@demo.com  — Chief Bartholomew Agu (Landlord)")
        print("   admin@demo.com      — Admin CorperNest       (Admin)")

    except Exception as e:
        db.rollback()
        print(f"\nSeed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()