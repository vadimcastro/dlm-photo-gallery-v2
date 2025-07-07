#!/bin/bash
# scripts/build-base-images.sh
# Build optimized base images for dlm-photo-gallery-v2

echo "🏗️ Building dlm-photo base images for ultra-fast startup..."

# Build frontend base image with photo gallery specific dependencies
echo "📦 Building dlm-photo-frontend-base..."
docker build -t dlm-photo-frontend-base:latest -f docker/base/Dockerfile.frontend.base .

# Build backend base image with photo gallery specific dependencies  
echo "📦 Building dlm-photo-backend-base..."
docker build -t dlm-photo-backend-base:latest -f docker/base/Dockerfile.backend.base .

echo "✅ dlm-photo-gallery-v2 base images built successfully!"
echo "💡 Use 'make dev-ultra' for lightning-fast startup"

# Show image sizes
echo "📊 Image sizes:"
docker images | grep "dlm-photo-.*-base"