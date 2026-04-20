from fastapi import FastAPI

# Import routes
from app.routes import auth, property, lead, admin, ai

# (Optional: DB setup)
from app.db.database import engine, Base
from app.db import base

# Create tables (temporary for now)
Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

# Initialize app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(property.router, prefix="/properties", tags=["Properties"])
app.include_router(lead.router, prefix="/leads", tags=["Leads"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])

@app.get("/")
def home():
    return {"message": "BuildEstate AI Backend Running 🚀"}