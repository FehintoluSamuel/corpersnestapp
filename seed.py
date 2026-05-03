"""
seed.py — CorpersNest demo seed
Run with server running: python seed.py
Admin: python set_admin.py after seeding
All passwords: Test1234!
"""
import requests, random, time
from datetime import date, timedelta

BASE = "http://127.0.0.1:8000/api/v1"

# ── Name pool ─────────────────────────────────────────────────────────────────
FIRST = [
    "Adaeze","Chukwuemeka","Ngozi","Babatunde","Fatima","Ifeanyi","Amaka",
    "Segun","Chidinma","Emeka","Blessing","Kunle","Uchenna","Tunde","Obiageli",
    "Damilola","Chiamaka","Kayode","Nneka","Oluwaseun","Chioma","Femi","Adaora",
    "Biodun","Nkechi","Rotimi","Ijeoma","Olumide","Ebele","Gbenga","Chinwe",
    "Toyin","Chizaram","Wale","Sola","Uche","Taiwo","Kemi","Jide","Bola",
    "Obinna","Yemi","Chinyere","Dele","Ugochi","Leke","Ejike","Nnamdi","Zainab",
    "Aisha","Musa","Ibrahim","Halima","Yakubu","Rashida","Abdullahi","Hauwa",
    "Chidi","Ogechi","Ikenna","Adaeze","Okonkwo","Obiora","Nwando","Kelechi",
    "Somtochukwu","Amarachi","Chukwudi","Oluwafemi","Adewale","Temitope",
    "Olabisi","Gbemisola","Afolake","Opeyemi","Ayomide","Tolulope","Morenike",
]
LAST = [
    "Okafor","Adeyemi","Nwosu","Babatunde","Abubakar","Okonkwo","Eze","Adeleke",
    "Chukwu","Oladele","Nwachukwu","Afolabi","Obiora","Olawale","Onyekachi",
    "Adegoke","Nwankwo","Fashola","Obi","Lawal","Anyanwu","Olufemi","Onyeka",
    "Adesanya","Nwofor","Ogundimu","Ugwu","Akintola","Balogun","Salami",
    "Musa","Ibrahim","Yusuf","Abdullahi","Mohammed","Garba","Aliyu","Suleiman",
    "Dike","Nnaji","Okoro","Onwudiwe","Nwoye","Ekwueme","Agu","Mbah","Ogbu",
]

LGAS = [
    "Umuahia North","Umuahia South","Aba North","Aba South",
    "Osisioma","Ohafia","Ikwuano","Bende","Isuikwuato","Ukwa East",
]

# ── Cloudinary room images ────────────────────────────────────────────────────
ROOM_IMAGES = [
    "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
]

# ── Avatar images ─────────────────────────────────────────────────────────────
AVATAR_MALE = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
    "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&q=80",
]
AVATAR_FEMALE = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
]

LISTING_TITLES = [
    "Clean self-contain near NYSC secretariat",
    "Furnished room — all bills included",
    "Spacious 1-bedroom flat available",
    "Lodge room 5 mins from LGI",
    "Quiet self-contain, 24hr light",
    "Room with kitchen — corpers only",
    "Newly renovated flat near market",
    "Affordable lodge room in GRA",
    "Ensuite room for handover",
    "Self-contain with parking space",
    "Mini flat — water and light always",
    "Shared apartment — need 1 corper",
]

LISTING_ADDRS = [
    "No 5 Azikiwe Road","14 Aba Road","Plot 7 GRA","3 Umugwa Street",
    "Behind NYSC Secretariat","Off Ikot Ekpene Road","12 Ogurube Layout",
    "Beside First Bank","45 Owerri Road","22 Okpara Avenue",
    "7 Ikenna Close","Plot 3 Trans-Amadi Layout",
]

POSTS = {
    "question": [
        "Anyone knows a good self-contain around Umuahia North? Budget 15k/month",
        "Is anyone else having allowee issues this month?",
        "How do I get LGI sign-off faster in Aba South?",
        "Which LGA is safest for female corpers in Abia?",
        "Just arrived camp! Anyone else in Abia state?",
        "What is the fastest way to get PPA letter signed?",
        "Is Ohafia safe for corp members? Heard mixed things.",
        "Does NYSC Abia pay allowee on 15th or end of month?",
    ],
    "tip": [
        "Always inspect the prepaid meter before paying rent. Some landlords swap it.",
        "Confirm water runs from the tap before signing any agreement.",
        "Join your LGA corpers WhatsApp group immediately on arrival — ask at camp.",
        "MTN and Airtel work fine in Umuahia main town. Outskirts can be patchy.",
        "Ohafia is one of the best LGAs — very peaceful, locals respect corpers.",
        "Take photos of the apartment condition before moving in. Very important.",
        "Always verify a landlord's identity before paying any deposit.",
        "Keep copies of all NYSC documents — original and scanned backup.",
    ],
    "room_available": [
        "My self-contain in Umuahia is available from next month. 15k, prepaid meter.",
        "Passing out soon — need a corper to take over my room in GRA. 18k monthly.",
        "Room available Osisioma — 2 mins from LGI. Direct handover. DM me.",
        "Ensuite self-contain Aba South. 20k/month. Leaving July 31st.",
        "Quiet compound Umuahia North. Kitchen and bathroom inside. 12k monthly.",
    ],
    "roommate_needed": [
        "Found a 2-bedroom in Aba South. Need one female corper to share. 17.5k each.",
        "Looking for a male corper to share 2-bedroom flat in GRA. 15k each monthly.",
        "Anyone wants to share a flat in Umuahia North? Already found a place.",
        "Need one more corper for 3-bedroom apartment. Split 3 ways = 10k each.",
    ],
    "scam_warning": [
        "WARNING: Agent Kingsley near Umuahia motor park collects 5k inspection fee then disappears.",
        "Scam alert: Someone collecting money for fake rooms near camp. Do not pay.",
        "Fake landlord operating around Aba South showing non-existent apartments.",
        "Be careful of agents asking for 2 years rent upfront. Report to NYSC.",
    ],
    "general": [
        "Shoutout to CorpersNest — found my apartment in less than 24 hours!",
        "Batch B Stream 1 corpers connect here! How is everyone settling in?",
        "Best place to eat around Umuahia secretariat? Need recommendations.",
        "PPA has been stressful. How are others coping with their employers?",
        "This platform is exactly what we needed. God bless whoever built this.",
        "Finally got my allowee! First one hits different after waiting so long.",
    ],
}

COMMENTS = [
    "Thanks for sharing! Very helpful.",
    "Can you DM me the address?",
    "Which area specifically?",
    "I almost fell for the same thing.",
    "Same issue here — still waiting.",
    "How much is the agency fee?",
    "Is it still available?",
    "I know someone who can help.",
    "This is so important. Thank you!",
    "Saved this post. Very useful tip.",
    "Arriving next week — is it still free?",
    "MTN is actually fine in my area.",
    "Check the listings page — found mine there.",
    "Join the Abia corpers WhatsApp group.",
    "Shared this in our LGA group. Everyone needs to see.",
]

MESSAGES = [
    "Hi! I saw your listing on CorpersNest. Is it still available?",
    "What is the closest bus stop to the apartment?",
    "Can we schedule a time to see the room?",
    "How much is the agency fee if any?",
    "Do you have 24/7 water supply?",
    "Arriving next week — will it still be free?",
    "Thanks for connecting! Great to meet a fellow corper.",
    "Is the compound secure? Any gate or security?",
    "Does the prepaid meter have units on it currently?",
    "I am very interested. When can I move in?",
]

# ── NYSC data ─────────────────────────────────────────────────────────────────
# Batches designed so derive_role() returns the right role for today (May 2026)
INCOMING_PARAMS  = {"state_code": "AB/26A/", "camp_start": "2026-03-10", "stream": 1}  # camp not ended yet
OUTGOING_PARAMS  = {"state_code": "AB/25B/", "camp_start": "2025-09-08", "stream": 1}  # service ongoing
ALUMNI_PARAMS    = {"state_code": "AB/24A/", "camp_start": "2024-03-11", "stream": 1}  # service ended

used_names  = set()
used_phones = set()
used_callups = set()
used_state_codes = set()

def rname():
    for _ in range(200):
        n = f"{random.choice(FIRST)} {random.choice(LAST)}"
        if n not in used_names:
            used_names.add(n)
            return n
    return f"Corper{random.randint(1000,9999)} Test"

def remail(name, idx):
    return f"{name.lower().replace(' ', '.').replace('/', '')}.{idx}@testcorper.ng"

def rphone():
    for _ in range(200):
        p = f"080{random.randint(10000000, 99999999)}"
        if p not in used_phones:
            used_phones.add(p)
            return p

def rcallup(idx):
    c = f"NYSC/FUA/2025/{100000 + idx}"
    used_callups.add(c)
    return c

def rstate_code(prefix, idx):
    c = f"{prefix}{1000 + idx}"
    used_state_codes.add(c)
    return c

def ravatar(name):
    female_names = {"Adaeze","Ngozi","Fatima","Amaka","Chidinma","Blessing","Obiageli",
                    "Chiamaka","Nneka","Chioma","Adaora","Nkechi","Ijeoma","Ebele",
                    "Chinwe","Toyin","Chizaram","Kemi","Bola","Chinyere","Ugochi",
                    "Zainab","Aisha","Halima","Rashida","Hauwa","Ogechi","Nwando",
                    "Amarachi","Temitope","Olabisi","Gbemisola","Afolake","Opeyemi",
                    "Ayomide","Tolulope","Morenike"}
    first = name.split()[0]
    pool = AVATAR_FEMALE if first in female_names else AVATAR_MALE
    return random.choice(pool)

def req(method, path, body=None, token=None):
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    try:
        r = getattr(requests, method)(f"{BASE}{path}", json=body, headers=h, timeout=10)
        if not r.ok:
            print(f"  FAIL {method.upper()} {path} → {r.status_code}: {r.text[:200]}")
            return None
        return r.json()
    except Exception as e:
        print(f"  ERROR {method.upper()} {path} → {e}")
        return None

def register_and_login(name, idx, role, extra=None):
    email = remail(name, idx)
    payload = {
        "full_name": name,
        "email": email,
        "password": "Test1234!",
        "phone_no": rphone(),
        "role": role,
    }
    if extra:
        payload.update(extra)

    reg = req("post", "/auth/registration", payload)
    if not reg:
        return None, None, None, None

    login = req("post", "/auth/login", {"email": email, "password": "Test1234!"})
    if not login or not login.get("token"):
        return None, None, None, None

    token = login["token"]
    me = req("get", "/auth/me", token=token)
    uid = me["id"] if me else None
    return uid, token, email, name

def update_profile(token, state_code, stream, camp_start):
    req("patch", "/auth/me/profile", {
        "nysc_state_code": state_code,
        "stream": stream,
        "camp_start_date": camp_start,
    }, token)
    # Re-login to get fresh token with updated role
    return token

def set_avatar(token, avatar_url):
    req("patch", "/auth/me/avatar", {"profile_picture_url": avatar_url}, token)

def seed():
    users = []  # (uid, token, role, email, name)
    idx = 0

    print("=" * 55)
    print("CorpersNest Seed — 100 users")
    print("=" * 55)

    # ── PCMs (20) ─────────────────────────────────────────────
    print("\n[1/6] Creating PCMs...")
    count = 0
    for _ in range(20):
        name = rname()
        uid, tok, email, nm = register_and_login(
            name, idx, "pcm",
            {"callup_number": rcallup(idx)}
        )
        if uid:
            set_avatar(tok, ravatar(name))
            users.append((uid, tok, "pcm", email, name))
            count += 1
        idx += 1
    print(f"   {count} PCMs created")

    # ── Incoming corpers (20) ──────────────────────────────────
    print("[2/6] Creating incoming corpers...")
    count = 0
    for i in range(20):
        name = rname()
        uid, tok, email, nm = register_and_login(
            name, idx, "pcm",
            {"callup_number": rcallup(idx)}
        )
        if uid:
            sc = rstate_code(INCOMING_PARAMS["state_code"], idx)
            update_profile(tok, sc, INCOMING_PARAMS["stream"], INCOMING_PARAMS["camp_start"])
            set_avatar(tok, ravatar(name))
            # Re-login for fresh role token
            login2 = req("post", "/auth/login", {"email": email, "password": "Test1234!"})
            if login2 and login2.get("token"):
                tok = login2["token"]
            users.append((uid, tok, "incoming_corper", email, name))
            count += 1
        idx += 1
        time.sleep(0.05)
    print(f"   {count} incoming corpers created")

    # ── Outgoing corpers (25) ──────────────────────────────────
    print("[3/6] Creating outgoing corpers...")
    count = 0
    for i in range(25):
        name = rname()
        uid, tok, email, nm = register_and_login(
            name, idx, "pcm",
            {"callup_number": rcallup(idx)}
        )
        if uid:
            sc = rstate_code(OUTGOING_PARAMS["state_code"], idx)
            update_profile(tok, sc, OUTGOING_PARAMS["stream"], OUTGOING_PARAMS["camp_start"])
            set_avatar(tok, ravatar(name))
            login2 = req("post", "/auth/login", {"email": email, "password": "Test1234!"})
            if login2 and login2.get("token"):
                tok = login2["token"]
            users.append((uid, tok, "outgoing_corper", email, name))
            count += 1
        idx += 1
        time.sleep(0.05)
    print(f"   {count} outgoing corpers created")

    # ── Alumni (15) ───────────────────────────────────────────
    print("[4/6] Creating alumni...")
    count = 0
    for i in range(15):
        name = rname()
        uid, tok, email, nm = register_and_login(
            name, idx, "pcm",
            {"callup_number": rcallup(idx)}
        )
        if uid:
            sc = rstate_code(ALUMNI_PARAMS["state_code"], idx)
            update_profile(tok, sc, ALUMNI_PARAMS["stream"], ALUMNI_PARAMS["camp_start"])
            set_avatar(tok, ravatar(name))
            login2 = req("post", "/auth/login", {"email": email, "password": "Test1234!"})
            if login2 and login2.get("token"):
                tok = login2["token"]
            users.append((uid, tok, "alumni", email, name))
            count += 1
        idx += 1
        time.sleep(0.05)
    print(f"   {count} alumni created")

    # ── Landlords (15) ────────────────────────────────────────
    print("[5/6] Creating landlords...")
    count = 0
    landlord_users = []
    for i in range(15):
        name = rname()
        uid, tok, email, nm = register_and_login(
            name, idx, "landlord",
            {"lga": random.choice(LGAS)}
        )
        if uid:
            set_avatar(tok, ravatar(name))
            users.append((uid, tok, "landlord", email, name))
            landlord_users.append((uid, tok, email, name))
            count += 1
        idx += 1
    print(f"   {count} landlords created (pending verification)")

    # ── Admin ─────────────────────────────────────────────────
    print("[6/6] Creating admin account...")
    admin_email = "admin@corpersnest.ng"
    admin_pass  = "Admin1234!"
    req("post", "/auth/registration", {
        "full_name": "CorpersNest Admin",
        "email": admin_email,
        "password": admin_pass,
        "role": "pcm",
    })
    admin_login = req("post", "/auth/login", {"email": admin_email, "password": admin_pass})
    admin_tok   = admin_login.get("token") if admin_login else None
    print(f"   Admin: {admin_email} / {admin_pass}")
    print(f"   Run 'python set_admin.py' and enter: {admin_email}")

    total = len(users)
    print(f"\n   Total users with tokens: {total}")

    # ── Approve landlords via admin ────────────────────────────
    if admin_tok:
        print("\nApproving landlords...")
        pending = req("get", "/admin/landlords/pending", token=admin_tok) or []
        approved = 0
        for u in pending:
            r = req("post", f"/admin/landlords/{u['user_id']}/verify",
                    {"approve": True, "note": "Seed approval"}, admin_tok)
            if r:
                approved += 1
        # Re-login landlords after approval
        refreshed = []
        for uid, tok, role, email, name in users:
            if role == "landlord":
                l = req("post", "/auth/login", {"email": email, "password": "Test1234!"})
                if l and l.get("token"):
                    tok = l["token"]
            refreshed.append((uid, tok, role, email, name))
        users[:] = refreshed
        print(f"   Approved {approved} landlords")

    # ── Listings (40) ─────────────────────────────────────────
    print("\nCreating listings...")
    listing_count = 0
    posters = [u for u in users if u[2] in ("outgoing_corper", "landlord", "alumni")]
    random.shuffle(posters)

    for uid, tok, role, email, name in posters[:40]:
        ltype = "corper_room" if role != "landlord" else random.choice(["corper_room", "landlord_property"])
        avail = (date.today() + timedelta(days=random.randint(7, 60))).isoformat()
        r = req("post", "/listings/", {
            "title":        random.choice(LISTING_TITLES),
            "address":      random.choice(LISTING_ADDRS),
            "lga":          random.choice(LGAS),
            "price_monthly": random.choice([8000, 10000, 12000, 15000, 18000, 20000, 25000]),
            "bedrooms":     random.choice([1, 1, 1, 2, 2, 3]),
            "description":  "Well maintained room. Water and electricity available. Corper-friendly.",
            "listing_type": ltype,
            "available_from": avail,
            "image_url":    random.choice(ROOM_IMAGES),
        }, tok)
        if r and r.get("id"):
            listing_count += 1
    print(f"   {listing_count} listings created")

    # ── Feed posts (60) ───────────────────────────────────────
    print("Creating feed posts...")
    post_ids = []
    tags = list(POSTS.keys())
    shuffled_users = list(users)
    random.shuffle(shuffled_users)

    # 10 posts per tag
    for tag in tags: 
        content_pool = POSTS[tag]
        for i in range(10):
            uid, tok, role, email, name = random.choice(shuffled_users)
            content = content_pool[i % len(content_pool)]
            r = req("post", "/feed/", {"content": content, "tag": tag}, tok)
            if r and r.get("id"):
                post_ids.append(r["id"])
    print(f"   {len(post_ids)} posts created")

    # ── Comments ──────────────────────────────────────────────
    print("Creating comments...")
    comment_count = 0
    for pid in post_ids:
        commenters = random.sample(users, min(random.randint(2, 6), len(users)))
        for uid, tok, role, email, name in commenters:
            r = req("post", f"/feed/{pid}/comments",
                    {"content": random.choice(COMMENTS)}, tok)
            if r:
                comment_count += 1
        time.sleep(0.02)
    print(f"   {comment_count} comments created")

    # ── Likes ─────────────────────────────────────────────────
    print("Creating likes...")
    like_count = 0
    for pid in post_ids:
        likers = random.sample(users, min(random.randint(3, 12), len(users)))
        for uid, tok, role, email, name in likers:
            r = req("post", f"/feed/{pid}/like", {}, tok)
            if r:
                like_count += 1
        time.sleep(0.01)
    print(f"   {like_count} likes created")

    # ── Connections + messages ────────────────────────────────
    print("Creating connections and messages...")
    conn_sent = conn_accepted = msg_count = 0

    # Build unique pairs
    pairs = []
    used_pairs = set()
    shuffled = list(users)
    random.shuffle(shuffled)

    for i in range(len(shuffled)):
        for j in range(i + 1, len(shuffled)):
            a, b = shuffled[i][0], shuffled[j][0]
            if a and b and (a, b) not in used_pairs:
                pairs.append((shuffled[i], shuffled[j]))
                used_pairs.add((a, b))
            if len(pairs) >= 60:
                break
        if len(pairs) >= 60:
            break

    for (uid_a, tok_a, _, __, ___), (uid_b, tok_b, ____, _____, ______) in pairs:
        if not uid_a or not uid_b:
            continue

        # Send connection request
        r = req("post", f"/connections/request/{uid_b}", {}, tok_a)
        if not r or not r.get("id"):
            continue
        conn_sent += 1
        conn_id = r["id"]

        # 75% acceptance rate
        if random.random() < 0.75:
            acc = req("post", f"/connections/{conn_id}/accept", {}, tok_b)
            if not acc:
                continue
            conn_accepted += 1

            # Exchange 2-5 messages
            for _ in range(random.randint(2, 5)):
                r1 = req("post", f"/messages/{uid_b}",
                         {"content": random.choice(MESSAGES)}, tok_a)
                if r1:
                    msg_count += 1
                time.sleep(0.02)

                r2 = req("post", f"/messages/{uid_a}",
                         {"content": random.choice(MESSAGES)}, tok_b)
                if r2:
                    msg_count += 1
                time.sleep(0.02)

    print(f"   Requests: {conn_sent} | Accepted: {conn_accepted} | Messages: {msg_count}")

    # ── Summary ───────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("SEED COMPLETE")
    print("=" * 55)
    print(f"  Users:       {total}")
    print(f"  Listings:    {listing_count}")
    print(f"  Posts:       {len(post_ids)}")
    print(f"  Comments:    {comment_count}")
    print(f"  Likes:       {like_count}")
    print(f"  Connections: {conn_accepted} accepted")
    print(f"  Messages:    {msg_count}")
    print("\n  All passwords: Test1234!")
    print(f"  Admin email:   {admin_email}")
    print(f"  Admin pass:    {admin_pass}")
    print("\n  Next step: python set_admin.py")
    print("=" * 55)


if __name__ == "__main__":
    seed()