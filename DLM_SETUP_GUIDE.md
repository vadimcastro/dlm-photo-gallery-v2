# 📸 DLM Photo Gallery Setup Guide

## Project Overview

**DLM Photo Gallery v2** is Dan's enhanced photo gallery application built with the vadim-project-template infrastructure. It provides a professional, production-ready photo management system with real-time monitoring and mobile-responsive design.

**Tech Stack:**
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL + Redis
- **Infrastructure**: Docker + Production monitoring
- **Deployment**: Automated with comprehensive Makefile

## Quick Start (10 Minutes)

### Prerequisites
- Docker Desktop installed and running
- Terminal access
- Basic familiarity with command line

### 1. Navigate to Project
```bash
# Using shell navigation
cd ~/Desktop/PROJECTS/dlm-photo-gallery-v2

# Or create an alias for quick access
echo 'dlmv2() { cd ~/Desktop/PROJECTS/dlm-photo-gallery-v2; }' >> ~/.zshrc
source ~/.zshrc
dlmv2                     # Now you can use this shortcut
```

### 2. Start Development Environment
```bash
# Start all services (database, API, frontend, monitoring)
make dev

# Wait for services to initialize (30-60 seconds)
# Look for: "✅ All services started successfully"
```

### 3. Setup Authentication
```bash
# In a new terminal window/tab (keep make dev running)
cd ~/Desktop/PROJECTS/dlm-photo-gallery-v2

# Configure authentication for Dan
make setup-local-auth

# Should see: ✅ Local authentication working!
```

### 4. Access the Photo Gallery
**Main Application:** http://localhost:3000
**Admin Dashboard:** http://localhost:3000/dashboard  
**API Documentation:** http://localhost:8000/docs

**Login Credentials:**
- **Email**: dan@example.com
- **Password**: gallery123

## DLM-Specific Features

### Photo Gallery Functionality
The enhanced DLM v2 includes all infrastructure for:

**Current Features (Ready to Develop):**
- User authentication and admin access
- Real-time system monitoring
- Production-ready deployment
- Mobile-responsive interface
- Database and Redis caching
- Comprehensive logging

**Photo Features to Add:**
- Photo upload and storage
- Gallery views (grid, masonry, slideshow)
- Image optimization and thumbnails
- Photo metadata and EXIF data
- Search and tagging system
- Album organization
- Bulk upload capabilities

### Dashboard Monitoring
**Real-time Metrics Available:**
- System performance (CPU, memory, disk)
- Docker container status
- Application health monitoring
- Network traffic analysis
- Deployment information

**Mobile-Responsive Dashboard:**
- Desktop: Full metrics grid
- Mobile: Expandable cards with "Show More"
- Auto-refresh every 1-5 minutes

## Development Workflow

### Daily Development
```bash
# Start development
dlmv2                     # Navigate to project
make dev                  # Start all services

# View logs while developing
make logs                 # See all service logs

# Stop when done
make down                 # Stop all services
```

### Adding Photo Features

**1. Database Models:**
```bash
# Create photo-related migrations
make migrate-create name=create_photos_table
make migrate-create name=create_albums_table

# Run migrations
make migrate
```

**2. Frontend Development:**
- Edit files in `frontend/src/`
- Hot reload enabled (changes appear instantly)
- Add photo components in `frontend/src/components/`

**3. Backend API:**
- Add photo endpoints in `backend/app/api/v1/endpoints/`
- Create photo models in `backend/app/models/`
- Implement photo CRUD in `backend/app/crud/`

### File Upload Implementation
```bash
# Example photo upload endpoint structure:
# POST /api/v1/photos/upload
# GET /api/v1/photos/
# GET /api/v1/photos/{id}
# DELETE /api/v1/photos/{id}
# POST /api/v1/albums/
# GET /api/v1/albums/{id}/photos
```

## Production Deployment

### Server Requirements
- Ubuntu server (DigitalOcean recommended)
- 2GB+ RAM (for photo processing)
- SSH access configured
- Docker installed

### Deploy to Production
```bash
# Setup production environment
make setup-prod-env

# Configure production server in Makefile
# Edit: PRODUCTION_IP=206.81.2.168 (your server IP)

# Deploy to production
make droplet-deploy

# Quick deploy for updates
make droplet-quick-deploy
```

### Production Management
```bash
# Check photo gallery status
make droplet-status

# View application logs
make droplet-logs

# Monitor system performance
# Visit: http://your-server-ip:3000/dashboard

# Server maintenance
make droplet-deep-clean   # Cleanup disk space
make droplet-disk-usage   # Check storage usage
```

## Photo Storage Strategy

### Local Development
- Store photos in `frontend/public/uploads/`
- Use relative paths in database
- Automatic thumbnail generation

### Production Options
1. **Server Storage**: Direct file storage on droplet
2. **Cloud Storage**: AWS S3 or Cloudflare R2
3. **CDN Integration**: For faster image delivery

### Recommended Storage Structure
```
uploads/
├── photos/
│   ├── originals/     # Full-resolution photos
│   ├── thumbnails/    # Small previews
│   └── medium/        # Medium-sized versions
├── albums/
│   └── covers/        # Album cover images
└── temp/              # Temporary upload processing
```

## Photo Gallery Features Roadmap

### Phase 1: Basic Gallery (Week 1-2)
- [ ] Photo upload (single file)
- [ ] Basic gallery grid view
- [ ] Photo display modal
- [ ] Simple photo metadata
- [ ] Delete photos

### Phase 2: Enhanced Features (Week 3-4)
- [ ] Bulk photo upload
- [ ] Photo albums/collections
- [ ] Image optimization (WebP conversion)
- [ ] Thumbnail generation
- [ ] Search functionality

### Phase 3: Advanced Features (Month 2)
- [ ] Photo tagging system
- [ ] EXIF data display
- [ ] GPS location mapping
- [ ] Slideshow mode
- [ ] Photo sharing links
- [ ] Download albums as ZIP

### Phase 4: Professional Features (Month 3)
- [ ] User access controls
- [ ] Photo editing (basic crop/rotate)
- [ ] Backup and sync
- [ ] Analytics and usage stats
- [ ] Mobile app (optional)

## Development Tips

### Frontend Development
```bash
# Add photo-specific components
mkdir frontend/src/components/photos
mkdir frontend/src/components/albums

# Suggested components:
# - PhotoUploader.tsx
# - PhotoGrid.tsx
# - PhotoModal.tsx
# - AlbumView.tsx
# - PhotoMetadata.tsx
```

### Backend Development
```bash
# Photo-related backend structure
mkdir backend/app/models/photo
mkdir backend/app/schemas/photo
mkdir backend/app/crud/photo

# Add to requirements-minimal.txt:
# Pillow==10.0.1  # Image processing
# python-multipart==0.0.6  # File uploads (already included)
```

### Database Design
```sql
-- Photos table
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    taken_at TIMESTAMP,
    upload_date TIMESTAMP DEFAULT NOW(),
    description TEXT,
    tags TEXT[],
    album_id INTEGER REFERENCES albums(id)
);

-- Albums table
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_photo_id INTEGER REFERENCES photos(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Monitoring & Performance

### Photo Gallery Metrics
The dashboard includes monitoring for:
- **Storage Usage**: Track photo storage consumption
- **Upload Performance**: Monitor upload speeds and failures
- **Gallery Views**: Track photo access patterns
- **System Load**: Ensure server handles photo processing

### Performance Optimization
```bash
# Image processing can be CPU intensive
# Monitor with: http://localhost:3000/dashboard

# Optimize for production:
# 1. Use WebP format for web delivery
# 2. Generate multiple sizes (thumbnail, medium, full)
# 3. Implement lazy loading
# 4. Use CDN for static assets
```

## Security Considerations

### Photo Access Control
- Authentication required for upload
- Photo access controls (public/private)
- Secure file upload validation
- EXIF data sanitization

### File Upload Security
```python
# Backend validation example:
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
```

## Troubleshooting

### Common Photo Gallery Issues

**Upload Failures:**
```bash
# Check API logs
docker compose logs api

# Verify file permissions
docker compose exec api ls -la /app/uploads

# Check disk space
make droplet-disk-usage
```

**Performance Issues:**
```bash
# Monitor system resources
# Visit: http://localhost:3000/dashboard

# Check database performance
docker compose exec db psql -U postgres -d dlm-photo-gallery-v2
\l  # List databases
```

**Image Processing Problems:**
```bash
# Install image processing dependencies
docker compose exec api pip install Pillow

# Test image operations
docker compose exec api python -c "from PIL import Image; print('Image processing OK')"
```

## Success Checklist

- [ ] DLM v2 project running (`make dev`)
- [ ] Authentication working (dan@example.com / gallery123)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Dashboard showing metrics at /dashboard
- [ ] API documentation at http://localhost:8000/docs
- [ ] Database connected and migrations running
- [ ] Photo upload endpoint planned
- [ ] File storage strategy decided
- [ ] Production deployment configured

## Getting Help

**View Available Commands:**
```bash
make help                 # See all DLM commands
```

**Check System Status:**
```bash
docker compose ps         # Verify all services running
make logs                 # View application logs
```

**Reset Development Environment:**
```bash
make down                 # Stop services
make clean-all            # Clean volumes
make dev                  # Fresh start
make setup-local-auth     # Reconfigure authentication
```

## Contact & Support

**For Dan:**
- Project configured for your photo gallery needs
- Production-ready infrastructure included
- Monitoring dashboard for performance tracking
- Scalable architecture for future growth

**Next Steps:**
1. Explore the running application at http://localhost:3000
2. Check the monitoring dashboard
3. Start developing photo upload features
4. Deploy to production when ready

**🎉 DLM Photo Gallery v2 is ready for photo management development!**

This setup gives Dan a professional, scalable photo gallery platform with the same infrastructure that powers vadimcastro.me successfully.