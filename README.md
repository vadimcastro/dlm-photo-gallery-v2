# DLM Photo Gallery v2

Dan's personal photo gallery with Google Photos integration, built on modern infrastructure. Combines the original DLM gallery functionality with production-ready deployment automation.

## ✨ Features

- 📸 **Google Photos Integration**: OAuth2 API with album categorization
- 🎨 **Modern UI**: Masonry layout, category filtering, full-screen modal
- 🏗️ **Production Infrastructure**: Next.js 14, FastAPI, PostgreSQL, Docker
- 📱 **Mobile-First**: Responsive design with touch optimization
- 🚀 **Easy Deployment**: One-command deployment like vadimcastro.me
- 🔐 **Authentication**: JWT-based login system
- ⚡ **Performance**: Image caching, lazy loading, retry logic

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
make droplet-clean-rebuild    # 🧹 Deep clean rebuild
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

## 🔧 Essential Commands

### Development
```bash
make dev                      # Start development environment
make setup-local-auth         # Configure local authentication
make logs                     # View container logs
make clean                    # Clean up environment
```

### Deployment
```bash
make droplet-deploy           # Deploy current branch to production
make droplet-quick-deploy     # ⚡ Fast deployment
make droplet-clean-rebuild    # 🧹 Deep clean rebuild
```

### Database
```bash
make migrate                  # Run migrations
make migrate-create name=NAME # Create new migration
```

## 📋 Login Credentials

### Development
- **Email**: dan@example.com
- **Password**: gallery123

### Production
- Configure with: `make setup-prod-env`

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   # Ensure Docker is running
   docker --version
   ```

2. **Start Development Environment**
   ```bash
   make dev
   make setup-local-auth
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Production Setup**
   ```bash
   make setup-prod-env    # Configure production secrets
   make droplet-deploy    # Deploy to production
   ```

## 📁 Project Structure
```
├── frontend/           # Next.js application
├── backend/            # FastAPI application
├── docker/             # Docker configurations
├── scripts/            # Deployment & setup scripts
└── docs/               # Documentation
```

Created from [vadim-project-template](https://github.com/vadimcastro/vadim-project-template) - A battle-tested React/FastAPI/Docker stack.
