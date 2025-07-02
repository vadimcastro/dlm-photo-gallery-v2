from fastapi import APIRouter
from app.api.v1 import auth
from app.api.v1.endpoints import metrics, photos

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include metrics routes  
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])

# Include photo gallery routes
api_router.include_router(photos.router, prefix="/photos", tags=["photos"])