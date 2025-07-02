# app/api/v1/endpoints/photos.py
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import httpx
import asyncio
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Google Photos API configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET") 
GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")

# Album IDs from environment
ALBUM_IDS = {
    "portraits": os.getenv("REACT_APP_PORTRAITS_ALBUM_ID"),
    "landscape": os.getenv("REACT_APP_LANDSCAPE_ALBUM_ID"),
    "architecture": os.getenv("REACT_APP_ARCHITECTURE_ALBUM_ID"),
    "abstract": os.getenv("REACT_APP_ABSTRACT_ALBUM_ID"),
    "wildlife": os.getenv("REACT_APP_WILDLIFE_ALBUM_ID"),
}

# In-memory cache for photos (in production, use Redis)
photos_cache = {
    "data": None,
    "expires_at": None
}

class GooglePhotosService:
    def __init__(self):
        self.access_token = None
        self.token_expires_at = None
    
    async def get_access_token(self) -> str:
        """Get or refresh the access token"""
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        if not GOOGLE_REFRESH_TOKEN:
            raise HTTPException(status_code=500, detail="No refresh token configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "refresh_token": GOOGLE_REFRESH_TOKEN,
                    "grant_type": "refresh_token"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Token refresh failed: {response.text}")
                raise HTTPException(status_code=500, detail="Failed to refresh access token")
            
            token_data = response.json()
            self.access_token = token_data["access_token"]
            # Tokens typically expire in 1 hour
            self.token_expires_at = datetime.now() + timedelta(seconds=token_data.get("expires_in", 3600) - 60)
            
            return self.access_token
    
    async def get_album_photos(self, album_id: str) -> List[Dict]:
        """Get photos from a specific album"""
        if not album_id:
            return []
        
        access_token = await self.get_access_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://photoslibrary.googleapis.com/v1/mediaItems:search",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "albumId": album_id,
                    "pageSize": 100
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to get album {album_id}: {response.text}")
                return []
            
            data = response.json()
            return data.get("mediaItems", [])
    
    async def get_all_categorized_photos(self) -> List[Dict]:
        """Get photos from all configured albums with categories"""
        all_photos = []
        
        # Get photos from each category
        for category, album_id in ALBUM_IDS.items():
            if album_id:
                try:
                    photos = await self.get_album_photos(album_id)
                    for photo in photos:
                        all_photos.append({
                            "id": photo["id"],
                            "baseUrl": photo["baseUrl"],
                            "filename": photo["filename"],
                            "description": photo.get("description", ""),
                            "category": category,
                            "mediaMetadata": photo.get("mediaMetadata", {}),
                            "creationTime": photo.get("mediaMetadata", {}).get("creationTime")
                        })
                except Exception as e:
                    logger.error(f"Error getting photos for category {category}: {e}")
        
        return all_photos

# Initialize the service
google_photos_service = GooglePhotosService()

@router.get("/albums")
async def get_photo_albums():
    """Get all categorized photos from Google Photos albums"""
    try:
        # Check cache first
        if (photos_cache["data"] and 
            photos_cache["expires_at"] and 
            datetime.now() < photos_cache["expires_at"]):
            return photos_cache["data"]
        
        # Fetch fresh data
        photos = await google_photos_service.get_all_categorized_photos()
        
        # Cache for 30 minutes
        photos_cache["data"] = photos
        photos_cache["expires_at"] = datetime.now() + timedelta(minutes=30)
        
        logger.info(f"Retrieved {len(photos)} photos from Google Photos")
        return photos
        
    except Exception as e:
        logger.error(f"Error fetching photo albums: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch photos: {str(e)}")

@router.get("/image/{photo_id}")
async def get_photo_image(
    photo_id: str,
    size: str = Query("medium", regex="^(small|medium|large|full)$")
):
    """Proxy and resize photos from Google Photos"""
    try:
        # Get the photo's base URL (this would need to be cached or fetched)
        photos = photos_cache.get("data", [])
        photo = next((p for p in photos if p["id"] == photo_id), None)
        
        if not photo:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        base_url = photo["baseUrl"]
        
        # Add size parameters to Google Photos URL
        size_params = {
            "small": "=w400-h400",
            "medium": "=w800-h800", 
            "large": "=w1200-h1200",
            "full": "=w2048-h2048"
        }
        
        image_url = f"{base_url}{size_params.get(size, size_params['medium'])}"
        
        # Stream the image
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Image not found")
            
            return StreamingResponse(
                iter([response.content]),
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers={
                    "Cache-Control": "public, max-age=86400",  # Cache for 24 hours
                    "Content-Length": str(len(response.content))
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving image {photo_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve image")

@router.get("/auth/status")
async def get_auth_status():
    """Check Google Photos authentication status"""
    try:
        access_token = await google_photos_service.get_access_token()
        return {
            "authenticated": True,
            "token_expires_at": google_photos_service.token_expires_at.isoformat() if google_photos_service.token_expires_at else None
        }
    except Exception as e:
        return {
            "authenticated": False,
            "error": str(e)
        }

@router.post("/cache/clear")
async def clear_photos_cache():
    """Clear the photos cache (admin endpoint)"""
    photos_cache["data"] = None
    photos_cache["expires_at"] = None
    return {"message": "Cache cleared successfully"}