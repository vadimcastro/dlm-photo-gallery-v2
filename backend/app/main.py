# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import logging
import sys
import os
from app.api.v1.router import api_router
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.db.utils import test_db_connection
from app.middleware.security import setup_security
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Determine environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
logger.info(f"Environment: {ENVIRONMENT}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    logger.info("App startup - initializing cache...")
    FastAPICache.init(InMemoryBackend(), prefix="vadimcastro-cache")
    logger.info("Cache initialized successfully")
    
    yield
    
    # Cleanup
    logger.info("App shutdown")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for personal website and cloud storage",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Add CORS directly to debug
from fastapi.middleware.cors import CORSMiddleware
print("Adding CORS middleware directly...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://206.81.2.168:3000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://vadimcastro.pro",
        "https://www.vadimcastro.pro"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)
print("CORS middleware added directly")

# Add error handling middleware to ensure CORS headers on errors
@app.middleware("http")
async def add_cors_headers_on_error(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error in {request.url}: {str(e)}")
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
            headers={
                "Access-Control-Allow-Origin": "http://206.81.2.168:3000",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
            }
        )

# Check middleware stack
print(f"Total middleware count: {len(app.user_middleware)}")
for i, middleware in enumerate(app.user_middleware):
    print(f"Middleware {i}: {middleware}")

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting up application in {ENVIRONMENT} environment...")
    logger.info("Startup event completed - database initialization skipped for deployment")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down application...")


@app.get("/test-cors")
async def test_cors(request: Request):
    logger.info("Test CORS endpoint called")
    logger.debug(f"Request origin: {request.headers.get('origin')}")
    return {
        "message": "CORS test successful",
        "origin": request.headers.get("origin"),
        "environment": ENVIRONMENT
    }

@app.get("/health")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "database": "skipped",
        "cache": "disabled", 
        "environment": ENVIRONMENT,
        "client_host": request.client.host if request.client else None
    }

@app.post("/admin/init-db")
async def initialize_database():
    """Initialize database with admin user - call this manually if automatic init fails"""
    try:
        db = SessionLocal()
        try:
            init_db(db)
            return {"status": "success", "message": "Database initialized successfully"}
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Manual database initialization failed: {str(e)}")
        return {"status": "error", "message": f"Database initialization failed: {str(e)}"}

# FastAPI CORSMiddleware handles OPTIONS requests automatically