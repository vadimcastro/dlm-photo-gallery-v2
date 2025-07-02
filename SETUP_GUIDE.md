# 🚀 Complete New Project Setup Guide

## Prerequisites

### Required Software
- **Docker Desktop**: Download from [docker.com](https://docker.com)
- **Git**: Already installed on macOS
- **Terminal**: Built-in Terminal or iTerm2

### Verify Installation
```bash
docker --version          # Should show Docker version
git --version            # Should show Git version
docker ps                # Should connect to Docker daemon
```

## Quick Start (5 Minutes)

### 1. Create New Project
```bash
# Navigate to template (or use alias)
projects                  # If you have the alias
# OR
cd ~/Desktop/PROJECTS/vadim-project-template

# Create new project interactively
newpro                    # Auto-navigates to new project
# OR
./init-project.sh         # Manual execution
```

### 2. Project Configuration
The interactive script will ask for:

**Project Details:**
- Project name (lowercase, hyphens ok): `my-awesome-app`
- Display name: `My Awesome App`
- Description: `A web application for awesome things`

**Admin User:**
- Email: `admin@myapp.com`
- Username: `admin`
- Display name: `Admin User`

**Infrastructure:**
- Production IP: `123.456.789.0` (your server IP)
- Domain (optional): `myapp.com`
- SSH alias: `myserver` (defaults to `droplet`)

### 3. Start Development Environment
```bash
# You should now be in your new project directory
pwd                       # Verify location: .../my-awesome-app

# Start all services (database, API, frontend)
make dev

# Wait for services to start (30-60 seconds)
# Look for "✅ All services started successfully"
```

### 4. Setup Authentication
```bash
# In a new terminal tab (keep `make dev` running)
cd ~/Desktop/PROJECTS/my-awesome-app    # Or use project alias

# Configure local authentication
make setup-local-auth

# You should see: ✅ Local authentication working!
```

### 5. Access Your Application
**Frontend:** http://localhost:3000
**API:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

**Login Credentials:**
- Email: (what you configured)
- Password: (what you configured, default: `meow`)

## Detailed Setup Options

### Environment Configuration

**Development (.env.development):**
- Automatically configured during project creation
- Uses simple passwords and local URLs
- Debug mode enabled

**Production (.env.production.local):**
```bash
# Generate production environment
make setup-prod-env

# This creates secure passwords and production config
```

### Database Management

**Migrations:**
```bash
# Create new migration
make migrate-create name=add_user_table

# Run migrations
make migrate

# View migration status
docker compose exec api alembic current
```

**Database Access:**
```bash
# Connect to PostgreSQL
docker compose exec db psql -U postgres -d my-awesome-app

# View tables
\dt

# Exit
\q
```

### Development Workflow

**Daily Development:**
```bash
# Start development
make dev

# View logs
make logs

# Stop services
make down

# Clean restart
make clean && make dev
```

**Code Changes:**
- Frontend: Hot reload enabled (changes appear instantly)
- Backend: Hot reload enabled (API updates automatically)
- Database: Migrations required for schema changes

## Production Deployment

### 1. Server Setup
**Prerequisites:**
- Ubuntu server (DigitalOcean, AWS, etc.)
- SSH key access configured
- Docker installed on server

**SSH Configuration (~/.ssh/config):**
```
Host myserver
    HostName 123.456.789.0
    User root
    IdentityFile ~/.ssh/id_rsa
```

### 2. Deploy to Production
```bash
# Test SSH connection
ssh myserver

# Generate production environment
make setup-prod-env

# Deploy current branch
make droplet-deploy

# Quick deploy (uses cache)
make droplet-quick-deploy
```

### 3. Production Management
```bash
# Check status
make droplet-status

# View logs
make droplet-logs

# Force rebuild
make droplet-force-rebuild

# Clean rebuild (removes all cache)
make droplet-clean-rebuild
```

## Metrics Dashboard

### Access Dashboard
**URL:** http://localhost:3000/dashboard
**Production:** http://your-server-ip:3000/dashboard

**Metrics Available:**
- **System Monitoring**: CPU, memory, disk usage
- **Docker Status**: Container health and resources
- **Application Health**: API performance and uptime
- **Network Stats**: Traffic and connection monitoring
- **Git Info**: Current branch and deployment details

### Mobile-Responsive Design
- **Desktop**: All metrics visible in grid layout
- **Mobile**: Expandable cards with "Show More" functionality
- **Auto-refresh**: Updates every 1-5 minutes

## Troubleshooting

### Common Issues

**Docker Not Starting:**
```bash
# Check Docker daemon
docker ps

# Restart Docker Desktop
# Applications → Docker → Restart

# Clean Docker system
make clean
docker system prune -f
```

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 [PID]

# Or use different ports in docker-compose.yml
```

**Database Connection Issues:**
```bash
# Check database status
docker compose ps

# Restart database
docker compose restart db

# Check database logs
docker compose logs db
```

**Authentication Not Working:**
```bash
# Recreate admin user
make setup-local-auth

# Check API logs
docker compose logs api

# Verify environment variables
docker compose exec api printenv | grep ADMIN
```

### Getting Help

**View All Commands:**
```bash
make help                 # See all available commands
```

**Check Service Status:**
```bash
docker compose ps         # See running services
docker compose logs       # View all logs
docker compose logs api   # View specific service logs
```

**Reset Everything:**
```bash
make down                 # Stop all services
make clean-all            # Remove volumes and data
make dev                  # Start fresh
make setup-local-auth     # Reconfigure auth
```

## Next Steps

### Customize Your Application
1. **Frontend**: Edit files in `frontend/src/`
2. **Backend**: Edit files in `backend/app/`
3. **Database**: Create models in `backend/app/models/`
4. **API**: Add endpoints in `backend/app/api/v1/endpoints/`

### Add Features
1. **New Pages**: Add to `frontend/src/app/`
2. **Components**: Create in `frontend/src/components/`
3. **Database Tables**: Use `make migrate-create name=new_table`
4. **API Endpoints**: Follow existing patterns in `endpoints/`

### Deploy Features
1. **Development**: Changes appear instantly with hot reload
2. **Production**: Use `make droplet-deploy` to push changes
3. **Monitoring**: Check metrics dashboard for performance

## Success Checklist

- [ ] Project created with `newpro`
- [ ] Development environment running (`make dev`)
- [ ] Authentication configured (`make setup-local-auth`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] API accessible at http://localhost:8000
- [ ] Login working with configured credentials
- [ ] Metrics dashboard showing data
- [ ] Production environment configured (optional)
- [ ] Deployment working (optional)

**🎉 Your project is ready for development!**

## Advanced Configuration

### Custom Domain Setup
1. **DNS**: Point domain to your server IP
2. **SSL**: Use Let's Encrypt (configured in nginx)
3. **HTTPS**: Use `docker-compose.https.yml`

### Performance Optimization
1. **Caching**: Redis configured and ready
2. **Database**: Indexes added automatically
3. **API**: Caching enabled for metrics endpoints
4. **Frontend**: Production builds optimized

### Monitoring Setup
1. **Metrics**: Comprehensive dashboard included
2. **Health Checks**: All services monitored
3. **Logging**: Centralized logs via Docker
4. **Alerts**: Can integrate with monitoring services

Your new project includes everything from your successful vadimcastro.me infrastructure!