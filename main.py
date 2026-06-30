from fastapi import FastAPI
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from routers.auth_router import router as auth_router
from routers.listings_router import router as listings_router
from routers.feed_router import router as feed_router
from routers.admin_router import router as admin_router
from models.database_model import (       # noqa: F401  — import all models so
    User, LandlordProfile, Listing,       # create_all sees them
    Post, Comment, PostLike, Report
)
from limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from routers.notifications_router import router as notifications_router
from routers.bookmarks_router     import router as bookmarks_router
 


from routers.connections_router import router as connections_router
from routers.messages_router    import router as messages_router
from ws.router           import router as ws_router
import os
"""
main.py

Wire-up reference — shows how to register the new routers and start the scheduler.
Merge this into your existing main.py, don't replace it wholesale.
"""
# ── Scheduler ─────────────────────────────────────────────────────────────────
from scheduler import start_scheduler

# ── DB ────────────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)
app = FastAPI(title='CorpersNest Api', version='1.0.0')



ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





API_V1_PREFIX = '/api/v1'
# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(listings_router, prefix=API_V1_PREFIX)
app.include_router(feed_router, prefix=API_V1_PREFIX)
app.include_router(admin_router, prefix=API_V1_PREFIX)
app.include_router(connections_router, prefix=API_V1_PREFIX)
app.include_router(messages_router, prefix=API_V1_PREFIX)
app.include_router(ws_router, prefix=API_V1_PREFIX)
app.include_router(notifications_router, prefix=API_V1_PREFIX)
app.include_router(bookmarks_router, prefix=API_V1_PREFIX)





# ── Rate Limiter ────────────────────────────────────────────────────────────────────────

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)



# ── Start scheduler ───────────────────────────────────────────────────────────
start_scheduler()

@app.get("/")
async def get_root():
    return {"message": "Welcome to the NYSC Accommodation Management System API"}

















































