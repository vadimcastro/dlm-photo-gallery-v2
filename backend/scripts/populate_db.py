#!/usr/bin/env python3
"""
Populate database with photos from the backend/photos directory
"""
import os
import sys
import logging
from pathlib import Path
from sqlalchemy.orm import Session
from PIL import Image

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.photo import Photo
from app.models.album import Album

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Photo directory path
PHOTOS_DIR = Path(__file__).parent.parent / "photos"

def get_image_dimensions(file_path: Path) -> tuple[int, int]:
    """Get image dimensions using PIL"""
    try:
        with Image.open(file_path) as img:
            return img.size  # Returns (width, height)
    except Exception as e:
        logger.warning(f"Could not get dimensions for {file_path}: {e}")
        return (800, 600)  # Default dimensions

def populate_photos(db: Session) -> None:
    """Populate photos table with images from photos directory"""
    logger.info("Starting photo population...")
    
    # Check if photos already exist
    existing_count = db.query(Photo).count()
    if existing_count > 0:
        logger.info(f"Database already has {existing_count} photos. Skipping population.")
        return
    
    # Create albums for each category
    categories = ["abstract", "architecture", "landscape", "portraits", "wildlife"]
    albums = {}
    
    for category in categories:
        album = Album(
            name=f"{category.title()} Collection",
            category=category,
            description=f"Collection of {category} photographs by Dan"
        )
        db.add(album)
        db.flush()  # Get the ID
        albums[category] = album
        logger.info(f"Created album: {album.name}")
    
    # Process photos from each category directory
    photo_count = 0
    
    for category in categories:
        category_dir = PHOTOS_DIR / category
        if not category_dir.exists():
            logger.warning(f"Category directory not found: {category_dir}")
            continue
            
        logger.info(f"Processing {category} photos...")
        
        for photo_file in category_dir.iterdir():
            if photo_file.is_file() and photo_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.cr2']:
                try:
                    # Get image dimensions
                    width, height = get_image_dimensions(photo_file)
                    
                    # Create photo record
                    photo = Photo(
                        album_id=albums[category].id,
                        filename=photo_file.name,
                        title=photo_file.stem.replace('_', ' ').replace('-', ' ').title(),
                        description=f"{category.title()} photograph by Dan",
                        category=category,
                        storage_type="local",
                        file_path=f"photos/{category}/{photo_file.name}",
                        width=width,
                        height=height,
                        file_size=photo_file.stat().st_size if photo_file.exists() else None,
                        mime_type="image/jpeg" if photo_file.suffix.lower() in ['.jpg', '.jpeg'] else "image/png"
                    )
                    
                    db.add(photo)
                    photo_count += 1
                    
                    if photo_count % 10 == 0:
                        logger.info(f"Processed {photo_count} photos...")
                        
                except Exception as e:
                    logger.error(f"Error processing {photo_file}: {e}")
                    continue
    
    # Update album photo counts
    for category, album in albums.items():
        album.photo_count = db.query(Photo).filter(Photo.album_id == album.id).count()
    
    # Commit all changes
    db.commit()
    logger.info(f"Successfully populated database with {photo_count} photos across {len(albums)} albums")
    
    # Log summary
    for category, album in albums.items():
        count = db.query(Photo).filter(Photo.album_id == album.id).count()
        logger.info(f"  {category}: {count} photos")

def main():
    """Main function"""
    logger.info("DLM Photo Gallery - Database Population Script")
    logger.info("=" * 50)
    
    # Check if photos directory exists
    if not PHOTOS_DIR.exists():
        logger.error(f"Photos directory not found: {PHOTOS_DIR}")
        logger.error("Please ensure photos are present in backend/photos/")
        sys.exit(1)
    
    # Create database session
    db = SessionLocal()
    try:
        populate_photos(db)
        logger.info("Database population completed successfully!")
    except Exception as e:
        logger.error(f"Error during population: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()