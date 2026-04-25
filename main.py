from fastapi import FastAPI
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from routers.auth_router import router as auth_router
from routers.listings_router import router as listings_router
from routers.feed_router import router as feed_router

Base.metadata.create_all(bind=engine)
app = FastAPI(title='CorpersNest Api', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)
API_V1_PREFIX = '/api/v1'

app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(listings_router, prefix=API_V1_PREFIX)
app.include_router(feed_router, prefix=API_V1_PREFIX)




@app.get("/")
async def get_root():
    return {"message": "Welcome to the NYSC Accommodation Management System API"}















































