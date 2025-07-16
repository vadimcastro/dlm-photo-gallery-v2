# dlm-photo-gallery-v2 Development Environment

## 🚀 Quick Start

### Local Development
```bash
make auth-setup       # 🔑 First-time OAuth setup (streamlined)
make dev              # Start all services locally
```

### Production Deployment
```bash
make droplet-deploy           # Standard deployment
make droplet-quick-deploy     # ⚡ Fast deployment (uses cache)
make droplet-quick-rebuild    # 🚀 Quick rebuild (partial cache clear)
make droplet-clean-rebuild    # 🧹 Deep clean rebuild (full cache clear)
```

## 🏗️ Tech Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: FastAPI with Python, SQLAlchemy, Alembic
- **Database**: PostgreSQL with Redis caching
- **Infrastructure**: Docker Compose, Production Server

## 🌐 Production Environment
- **Frontend**: http://206.81.2.168:3000
- **API**: http://206.81.2.168:8000
- **Status**: 🚧 Setup Required
- **Branch**: master

## ⚡ Terminal Workflow

### Quick Navigation & Git
```bash
# Add project alias to your shell config:
# dlm() { cd /Users/vadimcastro/Desktop/PROJECTS/dlm-photo-gallery-v2; }

dlm                       # Navigate to project (vadimOS function)
gs                        # Git status
gcp "message"             # Add, commit, push in one command
glog                      # Show last commit
```

### Development Shortcuts
```bash
dlmb                      # 🚀 Navigate + syncos + VS Code + dev-ultra + browser (full dev mode!)
auth-setup                # 🔑 Complete OAuth setup (alias for make auth-setup)
dev                       # Start development environment (alias for make dev)
dev-ultra                 # ⚡ Ultra-fast development with pre-built base images
deploy                    # Deploy current local branch to production (alias)
quick-deploy              # ⚡ Fast deployment (alias for make droplet-quick-deploy)
logs                      # View container logs (alias for make droplet-logs)
```

## 🔧 Essential Commands

### Development
```bash
make auth-setup           # 🔑 Streamlined OAuth setup (recommended)
make dev                  # Start development environment
make dev-ultra            # ⚡ Ultra-fast development (breakthrough volume strategy)
make logs                 # View container logs
make clean                # Clean up environment
```

### Deployment
```bash
make droplet-deploy                       # Deploy current branch to production
make droplet-deploy branch=BRANCH         # Deploy specific branch to production
make droplet-quick-deploy                 # ⚡ Fast deployment (uses cache)
make droplet-quick-rebuild                # 🚀 Quick rebuild (partial cache clear)
make droplet-clean-rebuild                # 🧹 Deep clean rebuild (full cache clear)
```

### Database
```bash
make migrate                       # Run migrations
make migrate-create name=NAME      # Create new migration
```

### Maintenance & Cleanup
```bash
make droplet-deep-clean        # 🧹 Comprehensive cleanup (Docker + logs + system updates)
make droplet-disk-usage        # 💾 Check disk usage and Docker stats
make clean-branches            # 🗑️ Delete all non-master branches locally
make droplet-clean-branches    # 🗑️ Delete all non-master branches on droplet
make help                      # 📖 Show all available commands
```

## 📁 Project Structure
```
├── frontend/           # Next.js application
├── backend/            # FastAPI application
├── docker/             # Docker configurations
├── scripts/            # Deployment & setup scripts
└── CLAUDE.md           # 📖 Development documentation
```

## 🎯 Current Development Focus

### ✅ Completed Features (v2.3 - Latest)
- **🏗️ Standardized Photo Service Architecture**: Complete service abstraction with IPhotoService interface
- **📸 Diverse Photo System**: Lorem Flickr integration with unique timestamp-based cache busting
- **🔄 Google Photos Fallback**: Preserved as backup with automatic fallback logic
- **🎯 PhotoServiceFactory**: Intelligent service selection and management
- **🖼️ Advanced Image Proxy**: Multi-size support (small/medium/large) with aspect ratio preservation
- **🎨 Perfect Masonry Gallery**: Responsive 3-column layout with strategic aspect ratios
- **⚡ Ultra-Fast Development**: Mock data provides instant, reliable photo loading
- **🛠️ Service Management API**: Runtime service switching and status monitoring
- **📱 Mobile-First UI**: Clean "DLM" branding with elegant champagne theme
- **🔍 Smart Category Display**: Clean category filtering without page titles
- **🎭 Champagne Design Theme**: Professional champagne color palette with Libertinus Mono typography

### 🎯 Current Status (July 2025)
- **Primary Data Source**: 📸 **Lorem Flickr Service** (Dynamic photos with timestamp-based uniqueness)
- **Image Quality**: ✅ **Category-Appropriate Content** - wildlife, portraits, landscapes, architecture, abstract
- **Performance**: ⚡ **Instant Loading** - reliable service with proper caching and aspect ratio handling
- **Fallback**: 🔄 **Google Photos Ready** - can enable with `USE_MOCK_DATA=false`
- **UI State**: 🎨 **Production Ready** - elegant champagne theme with perfect masonry layout
- **Design**: 🎭 **Champagne Theme** - sophisticated color palette with Libertinus Mono typography

### 🔄 Branch Management
```bash
# Quick git workflow
dlm-photo-gallery-v2                                    # Navigate to project
gs                                                 # Git status
gcp "commit message"                              # Add, commit, push in one command
glog                                              # Show last commit

# Deploy current local branch (auto-syncs with droplet)
deploy                                            # Deploy current local branch to droplet
make deploy                                       # Deploy current branch

# Deploy specific branch
make droplet-deploy branch=main                   # Deploy specific branch to droplet
```

## 🏗️ Photo Service Architecture (v2.2)

### Service Layer Design
```typescript
IPhotoService (Interface)
├── MockPhotosService (Primary)
│   ├── 40 curated Picsum photos
│   ├── 5 categories with correct matching
│   └── Instant loading (no external deps)
├── GooglePhotosService (Fallback)
│   ├── OAuth2 integration preserved
│   ├── Album-based categorization
│   └── Automatic token management
└── PhotoServiceFactory
    ├── Intelligent service selection
    ├── Automatic fallback logic
    └── Runtime service switching
```

### Photo Data Configuration
```bash
# Primary Mode (Default)
USE_MOCK_DATA=true          # Uses curated Picsum photos

# Google Photos Mode
USE_MOCK_DATA=false         # Attempts Google Photos, falls back to mock

# Service Management API
POST /api/v1/photos/albums
{"action": "getServiceStatus"}      # Check service health
{"action": "switchService"}         # Runtime service switching
{"action": "searchPhotos"}          # Search functionality
{"action": "getPhotosByCategory"}   # Category filtering
```

### Curated Photo Categories
- **Portraits**: Picsum IDs 91, 177, 203, 433, 494, 593, 659, 823
- **Landscape**: Picsum IDs 1, 10, 15, 26, 39, 58, 72, 98
- **Architecture**: Picsum IDs 2, 99, 164, 174, 246, 274, 318, 430
- **Abstract**: Picsum IDs 35, 102, 147, 197, 257, 347, 423, 515
- **Wildlife**: Picsum IDs 82, 169, 237, 326, 432, 548, 659, 718

## 🎨 Frontend Architecture

### 🎭 Champagne Design Theme
- **Primary Color**: `#EFD2A9` - Warm champagne for header/footer backgrounds
- **Light Background**: `#F8EDD6` - Subtle champagne tint for main content areas
- **Hover Accent**: `#75462F` - Rich brown for interactive elements and hover states
- **Text Color**: `#000000` - Pure black for optimal readability and contrast
- **Card Background**: `#FFFFFF` - Clean white for photo cards and content areas

### Typography System
- **Brand Font**: Libertinus Mono - Elegant monospace for headers, footer, and navigation
- **Body Font**: Inter - Clean, readable sans-serif for general content
- **Heading Font**: Playfair Display - Sophisticated serif for special headings
- **Font Loading**: Google Fonts CDN integration for reliable delivery

### Design System
- **Layout**: Mobile-first responsive design with breakpoints
- **Spacing**: Consistent padding and margins using Tailwind CSS
- **Icons**: Lucide React icons for clean, modern interface elements
- **Shadows**: Subtle drop shadows for depth and card elevation
- **Transitions**: Smooth hover effects and animations

### Gallery Features
- **Masonry Layout**: Responsive 3-column layout with strategic aspect ratios
- **Image Proxy**: Multi-size support (small: 300x200, medium: 600x400, large: 1200x800)
- **Category Filtering**: Real-time filtering with clean button controls
- **Modal Viewer**: Full-screen photo viewing with large image display
- **Smart Caching**: 24-hour browser cache with aspect ratio preservation
- **Photo Diversity**: Lorem Flickr integration with timestamp-based uniqueness

### Contact Information
- **Email**: danieminnock25@gmail.com
- **Admin**: Dan

## 🚀 Deployment Workflow

```bash
# 1. Development
git add . && git commit -m "feature: description"
git push origin feature-branch

# 2. Deploy
make droplet-deploy

# 3. Verify
curl http://206.81.2.168:3000  # Frontend health check
```

### Troubleshooting
```bash
ssh droplet 'cd dlm-photo-gallery-v2 && docker compose -f docker/docker-compose.prod.yml logs -f'
make droplet-force-rebuild  # Force clean rebuild
```

## 📋 Authentication & Credentials

### Development Login
- **Email**: dan@example.com
- **Password**: gallery123

### Google Photos API ✅ **WORKING**
- **Status**: ✅ Fully functional with Next.js API routes
- **OAuth Client**: 832495994403-09dn...apps.googleusercontent.com
- **Quota**: 500 requests/day (increased from 250)
- **Token Generator**: `python3 get_oauth_token.py` (now uses `.env.development`)
- **Environment**: `.env.development` (secure, git-ignored)
- **Scopes**: `photoslibrary.readonly`
- **Setup**: Run `make auth-setup` for complete automated OAuth flow

### API Endpoints (v2.2)
- **Photos**: `GET /api/v1/photos/albums` - Returns all photos with categories
- **Images**: `GET /api/v1/photos/image/[photoId]?size=medium` - Proxied images with resizing
- **Service Management**: `POST /api/v1/photos/albums` - Service control and metadata
- **Search**: `POST /api/v1/photos/albums {"action": "searchPhotos", "query": "landscape"}`
- **Categories**: `POST /api/v1/photos/albums {"action": "getPhotosByCategory", "category": "portraits"}`
- **Status**: `POST /api/v1/photos/albums {"action": "getServiceStatus"}` - Health check

### Production
- Configure with: `make setup-prod-env`
- Copy working credentials from `frontend/.env.local`

## 🛠️ Setup History

This project combines original DLM photo gallery functionality with modern vadim-project-template infrastructure:

### **dlmb Alias Fix (July 8, 2025) ✅**
- **Fixed dlmb alias mounting problems**: Built missing `dlm-photo-*-base` images for ultra-fast startup
- **Corrected Docker image names**: Updated compose file to use actual built image names
- **Fixed OAuth validation**: Updated auth-setup.sh to recognize `.googleusercontent.com` domains
- **Aligned with vadimOS ultra-dev pattern**: Now works identically to `vcb` with pre-built base images
- **Result**: `dlmb` alias now fully functional with 3x faster container startup


**Original DLM v1 Features Preserved:**
- ✅ Google Photos API integration with OAuth2 flow
- ✅ Album-based photo categorization system
- ✅ Masonry grid layout with category filtering
- ✅ Full-screen photo modal with keyboard navigation
- ✅ Image caching and optimization system

**Modern Infrastructure Added:**
- ✅ Next.js 14 + TypeScript (upgraded from React/JS)
- ✅ FastAPI backend (upgraded from Node.js/Express)
- ✅ PostgreSQL + Redis stack
- ✅ Docker deployment automation
- ✅ Production-ready Makefile commands
- ✅ Advanced UI components (ProfileDropdown, AdminMenu)
- ✅ Mobile-first responsive design



































































































































## 🎯 vadimOS Development Values

**Core Principles:**
- **Efficiency First**: Every command should save time and reduce cognitive load
- **Universal Consistency**: Same commands work across all projects
- **Context Awareness**: Tools should understand the project environment
- **Fail Fast**: Clear error messages and quick recovery paths
- **Documentation as Code**: Keep docs in sync with reality

**Workflow Philosophy:**
- Minimize context switching between tools and projects
- Automate repetitive tasks (navigation, setup, deployment)
- Make complex operations simple and discoverable
- Ensure every project follows the same patterns
- Optimize for developer happiness and productivity

## 🔧 Core vadimOS Commands
**Project Navigation:** `dlm` (basic), `dlmc` (code), `dlmb` (browser+dev)  
**Development:** `gs`, `gcp "msg"`, `glog`, `dev`, `dev-ultra`, `deploy`  
**Photo Gallery:** `quick-deploy`, `logs`, `docs` (API docs)  
**Authentication:** `auth-setup`, `auth-setup-fast` (Google OAuth)  
**Utilities:** `kd`, `shortcuts`, `newtest`, `clean-dirs`  
**Base Images:** `build-base-all`, `clean-base`, `update-base`  
**Google OAuth:** Specialized auth workflow for Photos API integration

📖 **Complete Reference:** `/Users/vadimcastro/vadimOS.md`  
🔧 **Live Config:** `/Users/vadimcastro/.zshrc`  
🏗️ **Infrastructure:** `/Users/vadimcastro/Desktop/PROJECTS/vadimOS/`  
⚙️ **Claude Config:** `.claude/settings.local.json` (100+ permissions)
