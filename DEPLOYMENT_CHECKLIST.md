# Production Deployment Verification Checklist

## Pre-Deployment Checks

### 1. Verify All Required Files Exist

Run these commands on your server:

```bash
cd /mony/administrator/monydragon-ai-portfolio

# Check critical files
ls -la hooks/useSound.ts
ls -la lib/sounds.ts
ls -la .env.local
ls -la ecosystem.config.js
ls -la package.json
```

### 2. Verify Environment Variables

```bash
cat .env.local
```

Should contain:
- MONGODB_URI
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- NEXTAUTH_TRUST_HOST
- NODE_ENV=production
- PORT=3000
- OLLAMA_BASE_URL (if using Ollama)
- OLLAMA_MODEL (if using Ollama)

### 3. Verify Services Are Running

```bash
# Check MongoDB
docker compose ps | grep mongodb

# Check Ollama (if using)
docker compose ps | grep ollama

# Check PM2
pm2 status
```

## Build Verification

### 4. Clean Build

```bash
cd /mony/administrator/monydragon-ai-portfolio

# Remove old build
rm -rf .next

# Install dependencies
npm install

# Build application
npm run build
```

Expected: Build should complete without errors.

## Service Verification

### 5. Start All Services

```bash
# Start MongoDB
docker compose up -d mongodb

# Start Ollama (if using)
docker compose up -d ollama

# Start Application
pm2 start ecosystem.config.js
```

### 6. Verify Services Status

```bash
# Check all services
docker compose ps
pm2 status

# Check logs
pm2 logs monydragon-portfolio --lines 20
docker compose logs mongodb --tail 20
```

## Network Verification

### 7. Test Local Access

```bash
# Test application on localhost
curl http://localhost:3000

# Should return HTML content
```

### 8. Test Port Accessibility

```bash
# Check if port 3000 is listening
sudo netstat -tulpn | grep 3000

# Check if port 443 is listening (for HTTPS)
sudo netstat -tulpn | grep 443
```

### 9. Test Nginx Configuration

```bash
# Test Nginx config
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## DNS Verification

### 10. Verify DNS Resolution

```bash
# From server
nslookup monydragon.com
nslookup www.monydragon.com

# Both should return: 155.117.45.234
```

### 11. Test Domain Access

```bash
# Test HTTPS
curl -I https://monydragon.com

# Should return 200 OK or 301/302 redirect
```

## Application Verification

### 12. Test Home Page

Open in browser:
- https://monydragon.com
- Should load the home page

### 13. Test Admin Login

Open in browser:
- https://monydragon.com/MonyAdmin/login
- Should load admin login page

### 14. Test API Endpoints

```bash
# Test blog API
curl https://monydragon.com/api/blog

# Test LLM status (if configured)
curl https://monydragon.com/api/llm/status
```

## Final Verification

### 15. Check Application Logs

```bash
# PM2 logs
pm2 logs monydragon-portfolio --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 16. Performance Check

```bash
# Check PM2 memory usage
pm2 monit

# Check Docker resource usage
docker stats
```

## Troubleshooting Commands

If something doesn't work:

```bash
# Restart all services
pm2 restart monydragon-portfolio
docker compose restart

# Check for errors
pm2 logs monydragon-portfolio --err
docker compose logs

# Verify environment
pm2 env monydragon-portfolio
```

