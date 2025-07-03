#!/bin/bash

# setup-local-auth.sh
# Sets up local development authentication

set -e

echo "🔧 setup-local-auth"
echo "📋 Checking services"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker not running"
    exit 1
fi

# Check if development environment is running
if ! docker ps | grep -q docker-api-1; then
    make dev > /dev/null 2>&1 &
    sleep 30
fi
echo "📋 Testing authentication"

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        break
    fi
    attempt=$((attempt + 1))
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ API failed to start"
    exit 1
fi

# Test login
response=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=vadim@vadimcastro.pro&password=meow")

if echo "$response" | grep -q "access_token"; then
    echo "📋 Testing endpoints"
    
    # Extract token for testing
    token=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    visitors=$(curl -s -H "Authorization: Bearer $token" "http://localhost:8000/api/v1/metrics/visitors")
    sessions=$(curl -s -H "Authorization: Bearer $token" "http://localhost:8000/api/v1/metrics/sessions")
    projects=$(curl -s -H "Authorization: Bearer $token" "http://localhost:8000/api/v1/metrics/projects")
    
    if ! echo "$visitors" | grep -q "total" || ! echo "$sessions" | grep -q "active" || ! echo "$projects" | grep -q "total"; then
        echo "❌ Endpoint test failed"
        exit 1
    fi
    
    echo "✅ Success"
    echo "📋 Login: vadim@vadimcastro.pro / meow"
    echo "🌐 http://localhost:3000 | 🔧 http://localhost:8000/docs"
else
    echo "❌ Authentication failed: $response"
    exit 1
fi