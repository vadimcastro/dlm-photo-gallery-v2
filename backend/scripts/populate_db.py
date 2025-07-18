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
import numpy as np

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

def analyze_color_profile(file_path: Path) -> str:
    """Analyze the color profile of an image"""
    try:
        with Image.open(file_path) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize to speed up analysis (max 200x200)
            img.thumbnail((200, 200), Image.Resampling.LANCZOS)
            
            # Convert to numpy array
            pixels = np.array(img)
            
            # Calculate average RGB values
            avg_r = np.mean(pixels[:, :, 0])
            avg_g = np.mean(pixels[:, :, 1])
            avg_b = np.mean(pixels[:, :, 2])
            
            # Calculate color temperature and saturation
            temperature = (avg_r + avg_g) / 2 - avg_b  # Warm vs Cool
            saturation = np.std(pixels)  # How vibrant the colors are
            
            # Classify color profile
            if temperature > 15:
                return "warm"
            elif temperature < -15:
                return "cool"
            elif saturation > 45:
                return "vibrant"
            elif saturation < 25:
                return "muted"
            else:
                return "neutral"
                
    except Exception as e:
        logger.warning(f"Could not analyze color profile for {file_path}: {e}")
        # Fallback: infer from category
        category = file_path.parent.name.lower()
        if category == "landscape":
            return "cool"
        elif category == "portraits":
            return "warm"
        elif category == "abstract":
            return "vibrant"
        elif category == "wildlife":
            return "muted"
        else:
            return "neutral"

def update_color_profiles(db: Session, photos_without_color: list) -> None:
    """Update existing photos with color profile analysis"""
    logger.info("Updating color profiles for existing photos...")
    
    for photo in photos_without_color:
        try:
            # Construct the full path
            full_path = PHOTOS_DIR / photo.category / photo.filename
            
            if full_path.exists():
                color_profile = analyze_color_profile(full_path)
                photo.color_profile = color_profile
                logger.info(f"  Updated {photo.filename}: {color_profile}")
            else:
                logger.warning(f"  Photo file not found: {full_path}")
                photo.color_profile = "neutral"  # Default fallback
                
        except Exception as e:
            logger.error(f"  Error updating color profile for {photo.filename}: {e}")
            photo.color_profile = "neutral"  # Default fallback
    
    db.commit()
    logger.info(f"Color profile updates completed for {len(photos_without_color)} photos")

def populate_photos(db: Session) -> None:
    """Populate photos table with images from photos directory"""
    logger.info("Starting photo population...")
    
    # Get existing photos to avoid duplicates
    existing_photos = db.query(Photo).all()
    existing_filenames = {photo.filename for photo in existing_photos}
    
    if existing_photos:
        logger.info(f"Database already has {len(existing_photos)} photos. Checking for new photos...")
        
        # Check if any existing photos need color_profile updates
        photos_without_color = db.query(Photo).filter(Photo.color_profile.is_(None)).all()
        if photos_without_color:
            logger.info(f"Found {len(photos_without_color)} photos without color profiles. Updating...")
            update_color_profiles(db, photos_without_color)
    else:
        logger.info("No existing photos found. Starting fresh population...")
    
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
                # Skip if photo already exists
                if photo_file.name in existing_filenames:
                    logger.debug(f"  Skipping existing photo: {photo_file.name}")
                    continue
                    
                try:
                    # Get image dimensions
                    width, height = get_image_dimensions(photo_file)
                    
                    # Analyze color profile
                    color_profile = analyze_color_profile(photo_file)
                    logger.info(f"  NEW: {photo_file.name}: {width}x{height}, {color_profile}")
                    
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
                        mime_type="image/jpeg" if photo_file.suffix.lower() in ['.jpg', '.jpeg'] else "image/png",
                        color_profile=color_profile
                    )
                    
                    db.add(photo)
                    photo_count += 1
                    
                    if photo_count % 10 == 0:
                        logger.info(f"Processed {photo_count} new photos...")
                        
                except Exception as e:
                    logger.error(f"Error processing {photo_file}: {e}")
                    continue
    
    # Update album photo counts
    for category, album in albums.items():
        album.photo_count = db.query(Photo).filter(Photo.album_id == album.id).count()
    
    # Commit all changes
    db.commit()
    
    # Final summary
    total_photos = db.query(Photo).count()
    if photo_count > 0:
        logger.info(f"Successfully added {photo_count} new photos to the database")
    else:
        logger.info("No new photos were added (all photos already exist)")
    
    logger.info(f"Database now contains {total_photos} photos across {len(albums)} albums")
    
    # Log summary by category
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