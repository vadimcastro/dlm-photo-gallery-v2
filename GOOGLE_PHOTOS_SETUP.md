# 📸 Google Photos Integration Setup

This guide walks you through setting up Google Photos API integration for the DLM Photo Gallery.

## 🔑 Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "DLM Photo Gallery"
4. Click "Create"

### 1.2 Enable Photos Library API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Photos Library API"
3. Click on it and click "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: "DLM Photo Gallery"
   - User support email: your email
   - Developer contact: your email
4. Create OAuth client:
   - Application type: "Web application"
   - Name: "DLM Photo Gallery Client"
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
5. Save the **Client ID** and **Client Secret**

## 🎯 Step 2: Get Album IDs

### 2.1 Create Albums in Google Photos
1. Go to [Google Photos](https://photos.google.com/)
2. Create albums with these exact names:
   - "Portraits"
   - "Landscape" 
   - "Architecture"
   - "Abstract"
   - "Wildlife"
3. Add photos to each album

### 2.2 Get Album IDs
You can get album IDs by:

**Method 1: Browser Network Tab**
1. Open Google Photos in Chrome
2. Open Developer Tools (F12) → Network tab
3. Click on an album
4. Look for API calls to `photoslibrary.googleapis.com`
5. Find the album ID in the URL or response

**Method 2: Using the API (Advanced)**
Use the Photos Library API Explorer to list albums and get their IDs.

## 🔐 Step 3: Get Refresh Token

### 3.1 Temporary Setup
1. Copy your original DLM v1 `.env` file values if you have them
2. Or follow the OAuth flow to get a new refresh token

### 3.2 OAuth Flow (if needed)
You can use the Google OAuth Playground or create a simple script to get the refresh token.

## ⚙️ Step 4: Configure Environment

### 4.1 Update `.env.development`
```env
# Google Photos API Configuration
GOOGLE_CLIENT_ID=your_client_id_from_step_1
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_1
GOOGLE_REFRESH_TOKEN=your_refresh_token_from_step_3

# Photo Album IDs (from step 2)
REACT_APP_PORTRAITS_ALBUM_ID=album_id_for_portraits
REACT_APP_LANDSCAPE_ALBUM_ID=album_id_for_landscape
REACT_APP_ARCHITECTURE_ALBUM_ID=album_id_for_architecture
REACT_APP_ABSTRACT_ALBUM_ID=album_id_for_abstract
REACT_APP_WILDLIFE_ALBUM_ID=album_id_for_wildlife
```

### 4.2 Copy from Original DLM
If you have the original DLM v1 working:

```bash
# Copy credentials from original DLM
cp /Users/vadimcastro/Desktop/PROJECTS/dlm-photo-gallery/.env /Users/vadimcastro/Desktop/PROJECTS/dlm-photo-gallery-v2/.env.google

# Then manually copy the Google-related values to .env.development
```

## 🚀 Step 5: Test the Integration

### 5.1 Start the Application
```bash
cd /Users/vadimcastro/Desktop/PROJECTS/dlm-photo-gallery-v2
make dev
```

### 5.2 Test API Endpoints
1. Check authentication status: `http://localhost:8000/api/v1/photos/auth/status`
2. Test photo albums: `http://localhost:8000/api/v1/photos/albums`
3. Test image proxy: `http://localhost:8000/api/v1/photos/image/{photo_id}?size=medium`

### 5.3 View the Gallery
1. Go to `http://localhost:3000/gallery`
2. Photos should load with category filtering
3. Click photos to view full-screen modal

## 🔧 Troubleshooting

### Common Issues

**"No refresh token configured"**
- Ensure `GOOGLE_REFRESH_TOKEN` is set in `.env.development`
- Check the token is still valid

**"Failed to refresh access token"** 
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check the refresh token hasn't expired

**"No photos loading"**
- Verify album IDs are correct
- Check albums have photos in Google Photos
- Ensure Photos Library API is enabled

**"Image not found"**
- Photos may have been moved/deleted from Google Photos
- Try clearing the cache: `POST /api/v1/photos/cache/clear`

### Debug API
```bash
# Check API documentation
open http://localhost:8000/docs

# View logs
docker compose logs api

# Clear cache
curl -X POST http://localhost:8000/api/v1/photos/cache/clear
```

## 📊 Features Restored

✅ **Google Photos Integration**: Full OAuth2 + API integration
✅ **Album Categorization**: Portraits, Landscape, Architecture, Abstract, Wildlife  
✅ **Image Proxy**: Optimized image serving with size parameters
✅ **Caching**: 30-minute photo cache + 24-hour image cache
✅ **Masonry Layout**: CSS columns-based photo grid
✅ **Full-Screen Modal**: Photo viewer with keyboard navigation
✅ **Category Filtering**: Filter photos by album category
✅ **Lazy Loading**: Performance optimization
✅ **Error Handling**: Retry logic and graceful failures

## 🎉 Success!

Once configured, you'll have the full DLM photo gallery functionality with:
- Modern Next.js/TypeScript frontend
- FastAPI backend with PostgreSQL
- Docker deployment like vadimcastro.me
- Production-ready infrastructure
- Google Photos integration preserved

Your photo gallery is now ready with both the original functionality AND modern deployment capabilities! 🚀