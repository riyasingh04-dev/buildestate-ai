from contextlib import asynccontextmanager
print("DEBUG: app/main.py is starting...")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routes
from app.routes import auth, property, lead, admin, ai, purchase, ml

# DB
from app.db.database import engine, Base
from app.db import base  # ensures all models are imported before create_all

# Scheduler
from app.services.scheduler import start_scheduler, stop_scheduler

#Lifespan (replaces deprecated @app.on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    #Startup
    Base.metadata.create_all(bind=engine)   # create/alter tables
    start_scheduler()                        # kick off background sync
    yield
    #Shutdown
    stop_scheduler()


#App Initialization
app = FastAPI(
    title="BuildEstate AI",
    description="AI-powered real estate platform with vector-first search",
    version="2.0.0",
    lifespan=lifespan,
)

#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers 
app.include_router(auth.router,     prefix="/auth",       tags=["Auth"])
app.include_router(property.router, prefix="/properties", tags=["Properties"])
app.include_router(lead.router,     prefix="/leads",      tags=["Leads"])
app.include_router(admin.router,    prefix="/admin",      tags=["Admin"])
app.include_router(ai.router,       prefix="/ai",         tags=["AI"])
app.include_router(purchase.router, prefix="/purchases",  tags=["Purchases"])
app.include_router(ml.router,       prefix="/ml",         tags=["ML"])

# Multimodal search endpoint
from app.routes import search as search_router
app.include_router(search_router.router, prefix="/search", tags=["Search"])


@app.get("/")
def home():
    return {"message": "BuildEstate AI Backend Running  — Vector-first search active"}


from app.routes import property
app.include_router(property.router)