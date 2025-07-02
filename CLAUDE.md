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

### ✅ Completed Features (v2.0)
- **Google Photos Integration**: Full OAuth2 API integration with album categorization
- **Photo Gallery UI**: Masonry layout, category filtering, full-screen modal viewer
- **Modern Infrastructure**: Next.js 14 + TypeScript, FastAPI backend, PostgreSQL + Redis
- **Production Deployment**: Docker automation, Makefile commands, DigitalOcean ready
- **Advanced UI Components**: ProfileDropdown, AdminMenu, mobile-responsive design
- **Image Optimization**: Proxy server with size parameters, caching, lazy loading
- **Authentication System**: JWT-based login integrated with gallery access

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

## 📋 Login Credentials

### Development
- **Email**: dan@example.com
- **Password**: gallery123

### Google Photos API
- **Setup Guide**: See `GOOGLE_PHOTOS_SETUP.md`
- **Required**: Google Client ID, Client Secret, Refresh Token
- **Album IDs**: Configure for Portraits, Landscape, Architecture, Abstract, Wildlife

### Production
- Configure with: `make setup-prod-env`
- Credentials generated during setup

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