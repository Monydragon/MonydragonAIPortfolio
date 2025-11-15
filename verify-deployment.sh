#!/bin/bash

# Production Deployment Verification Script
# Run this script to verify your deployment is working correctly

echo "=========================================="
echo "Production Deployment Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project directory
cd /mony/administrator/monydragon-ai-portfolio || exit 1

echo "1. Checking required files..."
echo "----------------------------"

# Check critical files
files=("hooks/useSound.ts" "lib/sounds.ts" ".env.local" "ecosystem.config.js" "package.json")
all_files_exist=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file is MISSING"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo -e "${RED}ERROR: Some required files are missing!${NC}"
    exit 1
fi

echo ""
echo "2. Checking environment variables..."
echo "-----------------------------------"

if grep -q "NEXTAUTH_SECRET" .env.local && grep -q "MONGODB_URI" .env.local; then
    echo -e "${GREEN}✓${NC} Required environment variables found"
else
    echo -e "${RED}✗${NC} Missing required environment variables in .env.local"
    exit 1
fi

echo ""
echo "3. Checking Docker services..."
echo "-----------------------------"

if docker compose ps | grep -q "mongodb.*Up"; then
    echo -e "${GREEN}✓${NC} MongoDB is running"
else
    echo -e "${YELLOW}⚠${NC} MongoDB is not running. Starting..."
    docker compose up -d mongodb
    sleep 5
fi

if docker compose ps | grep -q "monydragon-ollama.*Up"; then
    echo -e "${GREEN}✓${NC} Ollama is running"
else
    echo -e "${YELLOW}⚠${NC} Ollama is not running (optional)"
fi

echo ""
echo "4. Checking PM2 application..."
echo "-----------------------------"

if pm2 list | grep -q "monydragon-portfolio.*online"; then
    echo -e "${GREEN}✓${NC} Application is running in PM2"
    pm2 list | grep monydragon-portfolio
else
    echo -e "${YELLOW}⚠${NC} Application is not running in PM2"
    echo "   Start it with: pm2 start ecosystem.config.js"
fi

echo ""
echo "5. Checking network ports..."
echo "---------------------------"

if sudo netstat -tulpn 2>/dev/null | grep -q ":3000.*LISTEN"; then
    echo -e "${GREEN}✓${NC} Port 3000 is listening"
else
    echo -e "${RED}✗${NC} Port 3000 is not listening"
fi

if sudo netstat -tulpn 2>/dev/null | grep -q ":443.*LISTEN"; then
    echo -e "${GREEN}✓${NC} Port 443 (HTTPS) is listening"
else
    echo -e "${YELLOW}⚠${NC} Port 443 is not listening (Nginx may not be configured)"
fi

echo ""
echo "6. Testing local application..."
echo "------------------------------"

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓${NC} Application responds on localhost:3000"
else
    echo -e "${RED}✗${NC} Application does not respond on localhost:3000"
fi

echo ""
echo "7. Checking Nginx configuration..."
echo "---------------------------------"

if command -v nginx > /dev/null; then
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✓${NC} Nginx configuration is valid"
    else
        echo -e "${RED}✗${NC} Nginx configuration has errors"
        sudo nginx -t
    fi
else
    echo -e "${YELLOW}⚠${NC} Nginx is not installed"
fi

echo ""
echo "8. Checking DNS resolution..."
echo "----------------------------"

DOMAIN_IP=$(nslookup monydragon.com 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
EXPECTED_IP="155.117.45.234"

if [ "$DOMAIN_IP" = "$EXPECTED_IP" ]; then
    echo -e "${GREEN}✓${NC} DNS is pointing to correct IP: $DOMAIN_IP"
else
    echo -e "${YELLOW}⚠${NC} DNS may not be updated yet. Current: $DOMAIN_IP, Expected: $EXPECTED_IP"
fi

echo ""
echo "=========================================="
echo "Verification Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If all checks passed, test https://monydragon.com in your browser"
echo "2. Test admin login at https://monydragon.com/MonyAdmin/login"
echo "3. Check logs with: pm2 logs monydragon-portfolio"
echo ""

