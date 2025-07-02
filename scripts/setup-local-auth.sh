#!/bin/bash

# setup-local-auth.sh
# Sets up local development authentication

set -e

echo "🔧 Setting up local development authentication..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if development environment is running
if ! docker ps | grep -q docker-api-1; then
    echo "⚠️  Development environment not running. Starting it now..."
    make dev > /dev/null 2>&1 &
    echo "⏳ Waiting for services to start..."
    sleep 30
fi

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo "✅ API is ready!"
        break
    fi
    attempt=$((attempt + 1))
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ API failed to start within 60 seconds"
    exit 1
fi

# Test authentication
echo "🔐 Testing local authentication..."

# Test login
response=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=dan@example.com&password=gallery123")

if echo "$response" | grep -q "access_token"; then
    echo "✅ Local authentication working!"
    
    # Extract token for testing
    token=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    # Test metrics endpoints
    echo "📊 Testing metrics endpoints..."
    
    visitors=$(curl -s -H "Authorization: Bearer $token" "http://localhost:8000/api/v1/metrics/visitors")
    if echo "$visitors" | grep -q "total"; then
        echo "✅ Visitors metrics working"
    else
        echo "⚠️  Visitors metrics issue: $visitors"
    fi
    
    sessions=$(curl -s -H "Authorization: Bearer $token" "http://localhost:8000/api/v1/metrics/sessions")
    if echo "$sessions" | grep -q "active"; then
        echo "✅ Sessions metrics working"
    else
        echo "⚠️  Sessions metrics issue: $sessions"
    fi
    
    projects=$(curl -s -H "Authorization: Bearer $token" "http://localhost:8000/api/v1/metrics/projects")
    if echo "$projects" | grep -q "total"; then
        echo "✅ Projects metrics working"
    else
        echo "⚠️  Projects metrics issue: $projects"
    fi
    
    echo ""
    echo "🎉 Local development authentication setup complete!"
    echo ""
    echo "📋 Login Credentials:"
    echo "   Email: dan@example.com"
    echo "   Password: gallery123"
    echo ""
    echo "🌐 Access Points:"
    echo "   Frontend: http://localhost:3000"
    echo "   API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    
else
    echo "❌ Authentication failed: $response"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Check if containers are running: docker ps"
    echo "2. Check API logs: make api-logs"
    echo "3. Restart environment: make down && make dev"
    exit 1
fi