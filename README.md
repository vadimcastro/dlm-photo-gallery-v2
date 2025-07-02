# Vadim's Project Template

A battle-tested project template based on the successful vadimcastro.me infrastructure. This template provides a complete React/FastAPI/Postgres/Docker stack with proven deployment automation.

## 🎯 Features

- **Proven Tech Stack**: React + Next.js 14, FastAPI, PostgreSQL, Redis, Docker
- **Production Ready**: Based on live vadimcastro.me infrastructure 
- **Complete Automation**: Comprehensive Makefile with deployment commands
- **Docker Everything**: Multi-environment Docker setup (dev/prod/HTTPS)
- **Security Built-in**: Environment-specific configurations, secret management
- **Mobile-First**: Responsive design patterns from successful project
- **Real-time Metrics**: Comprehensive dashboard with system monitoring
- **Production Monitoring**: CPU, memory, disk, network, and Docker metrics

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git configured
- SSH access to production server (for deployment)

### Create New Project
```bash
cd ~/Desktop/PROJECTS/vadim-project-template
./init-project.sh
```

The script will guide you through:
- Project naming and configuration
- Admin user setup
- Production server details
- Infrastructure configuration

### Start Development
```bash
cd ../your-new-project
make dev              # Start all services
make setup-local-auth # Configure authentication
```

Visit http://localhost:3000 to see your project!

## 🏗️ Template Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Language**: TypeScript
- **Icons**: Lucide React
- **Fonts**: Poppins (headings), Inter (body)

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **Database**: SQLAlchemy ORM with Alembic migrations
- **Cache**: Redis for session and performance
- **Auth**: JWT-based authentication
- **API**: RESTful with OpenAPI documentation

### Infrastructure
- **Development**: Docker Compose with hot reload
- **Production**: Multi-stage Docker builds
- **Database**: PostgreSQL 15 with health checks
- **Caching**: Redis 6 with persistence
- **Proxy**: Nginx with SSL support (HTTPS mode)

### Metrics & Monitoring
- **Real-time Dashboard**: System and application metrics
- **System Monitoring**: CPU, memory, disk usage with health checks
- **Docker Monitoring**: Container status and resource usage
- **Network Metrics**: Traffic analysis and connection monitoring
- **Application Health**: Performance tracking and uptime monitoring
- **Mobile-responsive**: Expandable metric cards for mobile devices

## 📁 Project Structure

```
your-project/
├── frontend/                 # Next.js application
│   ├── src/app/             # App Router pages
│   ├── src/components/      # Reusable components
│   │   └── dashboard/       # Metrics and monitoring components
│   ├── src/lib/             # Utilities and hooks
│   │   ├── api/             # API hooks and utilities
│   │   └── auth/            # Authentication context
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies
│   ├── tailwind.config.js   # Styling configuration
│   └── tsconfig.json        # TypeScript config
├── backend/                 # FastAPI application
│   ├── app/                 # Application code
│   │   ├── api/             # API routes
│   │   │   └── v1/endpoints/# API endpoints including metrics
│   │   ├── core/            # Configuration
│   │   ├── crud/            # Database operations including metrics
│   │   ├── db/              # Database setup
│   │   ├── models/          # SQLAlchemy models
│   │   └── schemas/         # Pydantic schemas
│   ├── scripts/             # Utility scripts
│   ├── alembic/             # Database migrations
│   ├── requirements-minimal.txt
│   └── alembic.ini
├── docker/                  # Docker configurations
│   ├── docker-compose.yml   # Base services
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   ├── docker-compose.https.yml
│   ├── Dockerfile           # Backend container
│   ├── frontend/
│   │   ├── Dockerfile       # Frontend production
│   │   └── Dockerfile.dev   # Frontend development
│   └── nginx/
│       └── nginx.conf       # HTTPS proxy config
├── scripts/                 # Setup and deployment
│   ├── setup-production-env.sh
│   └── setup-local-auth.sh
├── Makefile                 # Automation commands
├── .env.development         # Dev environment
└── README.md                # Project documentation
```

## 🔧 Development Commands

### Core Workflow
```bash
make dev                      # Start development environment
make dev-debug               # Start with debug logging
make setup-local-auth        # Configure local authentication
make logs                    # View container logs
make down                    # Stop containers
make clean                   # Clean up environment
```

### Database Management
```bash
make migrate                 # Run migrations
make migrate-create name=X   # Create new migration
```

### Code Quality
```bash
make format                  # Format code (Prettier + Black)
```

## 🚀 Production Deployment

### Initial Setup
```bash
make setup-prod-env          # Configure production secrets
```

### Deployment Options
```bash
make droplet-deploy          # Standard deployment
make droplet-quick-deploy    # ⚡ Fast (uses cache)
make droplet-quick-rebuild   # 🚀 Partial cache clear
make droplet-clean-rebuild   # 🧹 Full clean rebuild
make droplet-force-rebuild   # 💪 Force rebuild
```

### Monitoring & Maintenance
```bash
make droplet-status          # Check production status
make droplet-logs            # View API logs
make droplet-debug           # Debug production issues
make droplet-deep-clean      # Comprehensive maintenance
make droplet-disk-usage      # Check disk usage
```

### Branch Management
```bash
make droplet-deploy branch=feature-name    # Deploy specific branch
make clean-branches                        # Clean local branches
make droplet-clean-branches               # Clean production branches
```

## 🔐 Security & Configuration

### Environment Files
- **Development**: `.env.development` (included in template)
- **Production**: `.env.production.local` (generated by setup script)

### Secret Management
- All production secrets auto-generated during setup
- Database passwords, JWT keys, admin credentials
- Secrets stored locally and git-ignored

### Authentication
- JWT-based authentication system
- Admin user auto-created during setup
- Development: Simple credentials
- Production: Strong generated passwords

## 🌐 Infrastructure Modes

### Development Mode
- Hot reload for frontend and backend
- Debug logging enabled
- Direct container access
- Simple authentication

### Production Mode  
- Optimized builds
- Health checks and restart policies
- Environment-specific configuration
- Strong security defaults

### HTTPS Mode
- Nginx reverse proxy
- SSL certificate integration
- Domain-based routing
- Production security headers

## 📊 What Makes This Template Successful

Based on the proven vadimcastro.me infrastructure:

- **Battle-Tested**: Live production use with real traffic
- **Mobile-First**: Responsive design that actually works
- **Performance**: Optimized Docker builds and caching
- **Security**: Production-grade secret management
- **Automation**: One-command deployments
- **Reliability**: Health checks and automatic restarts
- **Maintainability**: Clear structure and documentation

## 🔄 Workflow Integration

### Git Integration
- Automatic branch detection and deployment
- Git metadata injection into builds
- Branch-specific deployment commands

### Docker Optimization
- Multi-stage builds for production
- Layer caching for fast rebuilds
- Health checks for all services
- Volume management for data persistence

### Development Experience
- Hot reload for instant feedback
- Comprehensive logging
- Easy database migrations
- One-command environment setup

## 🆘 Troubleshooting

### Common Issues

**Docker not starting:**
```bash
docker --version        # Check Docker installation
make clean             # Clean up containers
make dev               # Restart environment
```

**Database connection issues:**
```bash
make down              # Stop all containers
make clean-all         # Remove volumes
make dev               # Start fresh
```

**Authentication problems:**
```bash
make setup-local-auth  # Reconfigure auth
make logs              # Check API logs
```

**Production deployment issues:**
```bash
make droplet-debug     # Check production status
make droplet-logs      # View detailed logs
make droplet-clean-rebuild  # Clean rebuild
```

## 🤝 Contributing

This template is based on patterns from vadimcastro.me. To improve:

1. Test changes against a real project
2. Update documentation
3. Maintain backward compatibility
4. Follow the established patterns

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

**Created by Vadim Castro** - Based on successful vadimcastro.me infrastructure patterns.