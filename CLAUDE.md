# dlm-photo-gallery-v2 Development Environment

## 🚀 Quick Start

### Local Development
```bash
make dev              # Start all services locally
make setup-local-auth # First-time auth setup
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
# alias dlm-photo-gallery-v2="cd ~/Desktop/PROJECTS/dlm-photo-gallery-v2"

dlm-photo-gallery-v2          # Navigate to project
gs                        # Git status
gcp "message"             # Add, commit, push in one command
glog                      # Show last commit
```

### Development Shortcuts
```bash
dev                       # Start development environment (alias for make dev)
deploy                    # Deploy current local branch to production (alias)
quick-deploy              # ⚡ Fast deployment (alias for make droplet-quick-deploy)
logs                      # View container logs (alias for make droplet-logs)
```

## 🔧 Essential Commands

### Development
```bash
make dev                  # Start development environment
make setup-local-auth     # Configure local authentication
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

### ✅ Completed Features (v2.1)
- **Google Photos Integration**: ✅ **WORKING** - OAuth2 API integration with album categorization
- **Next.js API Routes**: Direct Google Photos API integration without FastAPI dependency
- **Authentication Resolution**: Fixed deleted OAuth client, fresh token generation system
- **Photo Gallery UI**: Masonry layout, category filtering, full-screen modal viewer (ready for redesign)
- **Modern Infrastructure**: Next.js 14 + TypeScript, optimized Makefile commands
- **Production Deployment**: Docker automation, DigitalOcean ready
- **Advanced UI Components**: ProfileDropdown, AdminMenu, mobile-responsive design
- **Image Optimization**: Proxy server with size parameters, caching, lazy loading
- **Development Tools**: OAuth token generator, comprehensive debugging, mock data fallback

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

## 🎨 Frontend Architecture

### Design System
- **Typography**: Poppins (headings), Inter (body)
- **Mobile-first**: `px-2 md:px-4`, `text-xs md:text-sm`
- **Icons**: Lucide React icons
- **Spacing**: Consistent responsive margins

### Contact Information
- **Email**: dan@example.com
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
- **Setup**: Copy `.env.example` → `.env.development`, run token generator

### API Endpoints
- **Albums**: `GET /api/v1/photos/albums` - Returns categorized photos
- **Images**: `GET /api/v1/photos/image/[photoId]?size=medium` - Proxied images
- **Debug**: `GET /api/debug` - Environment variable check

### Production
- Configure with: `make setup-prod-env`
- Copy working credentials from `frontend/.env.local`

## 🛠️ Setup History

This project combines original DLM photo gallery functionality with modern vadim-project-template infrastructure:

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

For advanced configuration and shell optimization, see the original vadimcastro.me CLAUDE.md and vadimOS.md documentation.

## 🔍 Google Photos API Resolution (v2.1)

### Problem Solved
- **Root Cause**: Original OAuth client was deleted from Google Cloud Console
- **Error**: `"deleted_client"` - prevented both dlm1 and dlm2 from working
- **Solution**: Created new OAuth client with proper Photos Library API access

### Implementation Details
- **Architecture**: Next.js API routes instead of FastAPI proxy
- **Authentication**: OAuth2 with refresh token caching
- **Token Management**: Automatic refresh with 55-minute buffer
- **Error Handling**: Comprehensive logging and mock data fallback
- **Quota Management**: 500 requests/day, graceful degradation

### Files Created/Modified
```
frontend/src/app/api/v1/photos/
├── albums/route.ts           # Main photos API
└── image/[photoId]/route.ts  # Image proxy API
frontend/src/app/api/
├── auth/url/route.ts         # OAuth initiation
├── auth/callback/route.ts    # OAuth completion
└── debug/route.ts            # Environment debugging
get_oauth_token.py            # Token generation script
frontend/.env.local           # Working credentials
```

### Next Steps
- **Immediate**: UI/UX redesign to match modern dlm1 styling
- **Short-term**: Production deployment with working credentials
- **Long-term**: Album management, performance optimization

## 🎨 UI Development Roadmap

### Current State
- ✅ **Functionality**: All features working (auth, API, filtering, modal)
- ✅ **Data**: Real Google Photos loading (quota permitting)
- ⚠️  **Styling**: Basic Tailwind CSS, needs modern design

### Redesign Goals
- **Match dlm1**: Replicate modern, beautiful UI from working version
- **Enhanced**: Improved mobile responsiveness and interactions
- **Performance**: Optimized image loading and caching

### Development Branch  
- **Branch**: `feature/redesign-clean` ✅ **CLEAN HISTORY**
- **Focus**: UI/UX improvements without breaking working Google integration
- **Approach**: Component-by-component enhancement

## 🔒 Security & Git History

### ✅ **SECURITY RESOLVED** (v2.1.2)
- **Issue**: OAuth credentials in git history and tracked files
- **Solution**: Clean git history + proper `.gitignore` configuration
- **Status**: All secrets removed from git tracking
- **Ready**: Safe to push to GitHub with proper credential management

### Git Security Configuration:
- `.gitignore`: Ignores all `.env*` files except `.env.example`
- `.env.development`: Git-ignored, contains working credentials
- `get_oauth_token.py`: Updated to use environment variables
- **Workflow**: Copy `.env.example` → `.env.development` for new setups

### Useful Aliases Added:
```bash
# Development workflow
down                      # Stop all services  
clean                     # Clean environment
help                      # Show all make commands
kd path=/path/to/delete   # Safe force delete with validation
quick-deploy              # Alias for droplet-quick-deploy
deploy-clean              # Alias for droplet-clean-rebuild

# Git shortcuts (via Claude settings)
gs                        # Git status
gcp "message"             # Add, commit, push
glog                      # Show last commit
```