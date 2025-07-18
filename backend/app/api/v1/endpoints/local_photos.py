# app/api/v1/endpoints/local_photos.py
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import logging

from app.dependencies.db import get_db
from app.models.photo import Photo
from app.models.album import Album

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/local/health")
async def local_photos_health(db: Session = Depends(get_db)):
    """Health check for local photos service"""
    try:
        # Check database connection and photo count
        photo_count = db.query(Photo).filter(Photo.storage_type == 'local').count()
        
        return {
            "status": "healthy",
            "service": "LocalPhotosService",
            "database": "connected",
            "photoCount": photo_count
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


@router.get("/local/search")
async def search_local_photos(
    q: str = Query(..., description="Search query"),
    limit: Optional[int] = Query(50, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    """Search photos by title, description, filename, or category"""
    try:
        query = db.query(Photo).filter(
            Photo.storage_type == 'local'
        ).filter(
            (Photo.title.ilike(f"%{q}%")) |
            (Photo.description.ilike(f"%{q}%")) |
            (Photo.filename.ilike(f"%{q}%")) |
            (Photo.category.ilike(f"%{q}%"))
        )
        
        photos = query.limit(limit).all()
        total_count = query.count()
        
        # Convert to API format
        photo_data = []
        for photo in photos:
            photo_data.append({
                "id": str(photo.id),
                "category": photo.category,
                "filename": photo.filename,
                "description": photo.description or photo.title or photo.filename,
                "baseUrl": f"/photos/{photo.category}/{photo.filename}",
                "width": photo.width or 800,
                "height": photo.height or 600,
                "color_profile": photo.color_profile or "neutral",
                "created_at": photo.created_at.isoformat() if photo.created_at else None
            })
        
        return {
            "photos": photo_data,
            "totalCount": total_count,
            "query": q,
            "source": "local_database"
        }
        
    except Exception as e:
        logger.error(f"Error searching photos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching photos: {str(e)}")


@router.get("/local")
async def get_local_photos(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: Optional[int] = Query(200, description="Maximum number of photos"),
    db: Session = Depends(get_db)
):
    """Get photos from local database"""
    try:
        query = db.query(Photo).filter(Photo.storage_type == 'local')
        
        if category:
            query = query.filter(Photo.category == category)
            
        photos = query.limit(limit).all()
        total_count = query.count()
        
        # Convert to API format
        photo_data = []
        for photo in photos:
            photo_data.append({
                "id": str(photo.id),
                "category": photo.category,
                "filename": photo.filename,
                "description": photo.description or photo.title or photo.filename,
                "baseUrl": f"/photos/{photo.category}/{photo.filename}",
                "width": photo.width or 800,
                "height": photo.height or 600,
                "color_profile": photo.color_profile or "neutral",
                "created_at": photo.created_at.isoformat() if photo.created_at else None
            })
        
        # Get unique categories
        categories = db.query(Photo.category).filter(Photo.storage_type == 'local').distinct().all()
        category_list = [cat[0] for cat in categories]
        
        return {
            "photos": photo_data,
            "totalCount": total_count,
            "categories": category_list,
            "source": "local_database"
        }
        
    except Exception as e:
        logger.error(f"Error fetching local photos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching photos: {str(e)}")


@router.get("/local/{photo_id}")
async def get_local_photo_by_id(
    photo_id: int,
    db: Session = Depends(get_db)
):
    """Get specific photo by ID"""
    try:
        photo = db.query(Photo).filter(
            Photo.id == photo_id,
            Photo.storage_type == 'local'
        ).first()
        
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
            
        return {
            "photo": {
                "id": str(photo.id),
                "category": photo.category,
                "filename": photo.filename,
                "description": photo.description or photo.title or photo.filename,
                "baseUrl": f"/photos/{photo.category}/{photo.filename}",
                "width": photo.width or 800,
                "height": photo.height or 600,
                "color_profile": photo.color_profile or "neutral",
                "created_at": photo.created_at.isoformat() if photo.created_at else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching photo {photo_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching photo: {str(e)}")


@router.post("/local/upload")
async def upload_photo(
    # TODO: Add photo upload functionality
    db: Session = Depends(get_db)
):
    """Upload a new photo (placeholder for future implementation)"""
    return {
        "message": "Photo upload endpoint - to be implemented",
        "status": "coming_soon"
    }