# app/middleware/security.py (updated version)
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime
import redis
from app.core.config import settings

# Initialize Redis for rate limiting
redis_client = redis.from_url(settings.REDIS_URL)

limiter = Limiter(key_func=get_remote_address)

def setup_security(app: FastAPI):
    print("Setting up CORS middleware...")
    # CORS configuration - temporary wildcard for debugging
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600
    )
    print("CORS middleware added successfully")

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)