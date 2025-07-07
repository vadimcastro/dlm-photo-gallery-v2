#!/bin/bash

# 🔑 DLM Photo Gallery - Streamlined Auth Setup
# Automates the complete OAuth flow for development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.development"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"
OAUTH_SCRIPT="$PROJECT_ROOT/get_oauth_token.py"

echo -e "${BLUE}🔑 DLM Photo Gallery - Auth Setup${NC}"
echo -e "${BLUE}=================================${NC}"

# Step 1: Check if .env.development exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "\n${YELLOW}📄 Creating .env.development from template...${NC}"
    
    if [ ! -f "$ENV_EXAMPLE" ]; then
        echo -e "${RED}❌ Error: .env.example not found!${NC}"
        exit 1
    fi
    
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo -e "${GREEN}✅ Created .env.development${NC}"
    
    echo -e "\n${YELLOW}⚠️  Please edit .env.development with your Google OAuth credentials:${NC}"
    echo -e "   - GOOGLE_CLIENT_ID"
    echo -e "   - GOOGLE_CLIENT_SECRET"
    echo -e "\n${BLUE}Press Enter when ready to continue...${NC}"
    read -r
fi

# Step 2: Validate environment variables
echo -e "\n${BLUE}🔍 Validating environment configuration...${NC}"

# Source the environment file to check variables
if ! grep -q "GOOGLE_CLIENT_ID=.*googleapis.com" "$ENV_FILE"; then
    echo -e "${RED}❌ Error: GOOGLE_CLIENT_ID not properly configured in .env.development${NC}"
    echo -e "${YELLOW}Please edit $ENV_FILE and add your Google OAuth credentials${NC}"
    exit 1
fi

if ! grep -q "GOOGLE_CLIENT_SECRET=GOCSPX-" "$ENV_FILE"; then
    echo -e "${RED}❌ Error: GOOGLE_CLIENT_SECRET not properly configured in .env.development${NC}"
    echo -e "${YELLOW}Please edit $ENV_FILE and add your Google OAuth credentials${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration looks good${NC}"

# Step 3: Check if refresh token is already set
if grep -q "GOOGLE_REFRESH_TOKEN=1//" "$ENV_FILE"; then
    echo -e "\n${GREEN}✅ Refresh token already configured!${NC}"
    echo -e "${BLUE}Would you like to regenerate it? (y/N): ${NC}"
    read -r regenerate
    
    if [[ ! "$regenerate" =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🎉 Auth setup complete! Your credentials are ready.${NC}"
        exit 0
    fi
fi

# Step 4: Run OAuth token generation
echo -e "\n${PURPLE}🚀 Starting OAuth token generation...${NC}"
echo -e "${YELLOW}This will:${NC}"
echo -e "   1. Start a local server on port 5000"
echo -e "   2. Open your browser for Google OAuth"
echo -e "   3. Automatically update your .env.development file"
echo -e "\n${BLUE}Press Enter to continue...${NC}"
read -r

# Check if Python script exists
if [ ! -f "$OAUTH_SCRIPT" ]; then
    echo -e "${RED}❌ Error: OAuth script not found at $OAUTH_SCRIPT${NC}"
    exit 1
fi

# Run the OAuth script and capture output
echo -e "\n${BLUE}Running OAuth token generator...${NC}"
cd "$PROJECT_ROOT"

# Temporarily capture the output to extract the refresh token
OAUTH_OUTPUT=$(python3 "$OAUTH_SCRIPT" 2>&1) || {
    echo -e "${RED}❌ OAuth generation failed${NC}"
    echo "$OAUTH_OUTPUT"
    exit 1
}

echo "$OAUTH_OUTPUT"

# Extract refresh token from output
REFRESH_TOKEN=$(echo "$OAUTH_OUTPUT" | grep "GOOGLE_REFRESH_TOKEN=" | sed 's/GOOGLE_REFRESH_TOKEN=//')

if [ -n "$REFRESH_TOKEN" ]; then
    echo -e "\n${BLUE}🔄 Updating .env.development with new refresh token...${NC}"
    
    # Update the refresh token in the .env file
    if grep -q "GOOGLE_REFRESH_TOKEN=" "$ENV_FILE"; then
        # Replace existing token
        sed -i.bak "s/GOOGLE_REFRESH_TOKEN=.*/GOOGLE_REFRESH_TOKEN=$REFRESH_TOKEN/" "$ENV_FILE"
    else
        # Add new token
        echo "GOOGLE_REFRESH_TOKEN=$REFRESH_TOKEN" >> "$ENV_FILE"
    fi
    
    rm -f "$ENV_FILE.bak" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Refresh token updated successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Could not automatically extract refresh token.${NC}"
    echo -e "${BLUE}Please manually copy the token from above to your .env.development file.${NC}"
fi

echo -e "\n${GREEN}🎉 Auth setup complete!${NC}"
echo -e "${BLUE}Your Google Photos API is now configured and ready to use.${NC}"
echo -e "\n${PURPLE}Next steps:${NC}"
echo -e "   ${GREEN}make dev${NC}     # Start development environment"
echo -e "   ${GREEN}open http://localhost:3000${NC}  # View your photo gallery"