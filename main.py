from fastapi import FastAPI
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from routers.auth_router import router as auth_router

Base.metadata.create_all(bind=engine)
app = FastAPI(title='CorpersNest Api', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)

@app.get("/")
async def get_root():
    return {"message": "Welcome to the NYSC Accommodation Management System API"}

app.include_router(auth_router)














































