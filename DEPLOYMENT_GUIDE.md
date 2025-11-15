# Production Deployment Guide

## Quick Setup Instructions

### 1. Build and Deploy Application

```bash
# On your local machine
npm run build:production

# Transfer .production folder to server using WinSCP
# Upload to: ~/monydragon-ai-portfolio-production
```

### 2. On Production Server

```bash
# Navigate to production directory
cd ~/monydragon-ai-portfolio-production

# Install dependencies (production only)
npm install --production

# Create .env.local file
nano .env.local
```

**Add to .env.local:**
```
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://monydragon.com
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Build Next.js Application

```bash
npm run build
```

### 4. Create Admin User

```bash
# Set admin credentials (optional, defaults shown)
export ADMIN_EMAIL=your-email@example.com
export ADMIN_PASSWORD=your-secure-password
export ADMIN_NAME="Your Name"

# Create admin user
npm run create-admin
```

**Or use defaults:**
```bash
npm run create-admin
# Default: monydragon@gmail.com / Dr460n1991!
```

### 5. Start Application with PM2

```bash
# Start with PM2
pm2 start npm --name "monydragon-portfolio" -- start

# Or if you have ecosystem.config.js:
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions it provides
```

### 6. Verify Application is Running

```bash
# Check PM2 status
pm2 list

# Check logs
pm2 logs monydragon-portfolio

# Test locally
curl http://localhost:3000
```

## Database Migration

### Using the Admin Dashboard (Recommended)

1. Log in to admin dashboard: `https://monydragon.com/MonyAdmin`
2. Go to **Database Manager**
3. Click **Download Backup** to create a backup
4. To restore, click **Restore Database** and upload your `.tar.gz` file

### Using Command Line

**Export from local:**
```bash
# On local machine
npm run db:export
# Or manually:
docker exec monydragon-mongodb mongodump --db=monydragon_portfolio --out=/tmp/mongodb-dump
docker cp monydragon-mongodb:/tmp/mongodb-dump ./mongodb-dump
tar -czf mongodb-dump.tar.gz mongodb-dump
```

**Import to production:**
```bash
# On production server
cd ~/monydragon-ai-portfolio-production
tar -xzf mongodb-dump.tar.gz
npm run db:import
```

## Nginx Configuration

Your nginx config should be at `/etc/nginx/sites-available/monydragon.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name monydragon.com www.monydragon.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**After SSL setup (via certbot), it will automatically update to HTTPS.**

## SSL Setup

```bash
# Install certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d monydragon.com -d www.monydragon.com

# Auto-renewal is set up automatically
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs monydragon-portfolio

# Check if port 3000 is in use
netstat -tlnp | grep :3000

# Restart application
pm2 restart monydragon-portfolio
```

### Database connection issues

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs mongodb

# Test MongoDB connection
mongosh mongodb://localhost:27017/monydragon_portfolio
```

### Nginx issues

```bash
# Test nginx configuration
sudo nginx -t

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload nginx
sudo systemctl reload nginx
```

## Updating the Application

```bash
# 1. Build new production build locally
npm run build:production

# 2. Transfer .production folder to server

# 3. On server, stop application
pm2 stop monydragon-portfolio

# 4. Backup current version (optional)
cp -r ~/monydragon-ai-portfolio-production ~/monydragon-ai-portfolio-backup-$(date +%Y%m%d)

# 5. Replace files
cd ~/monydragon-ai-portfolio-production
# Remove old files (keep .env.local and node_modules)
rm -rf app components lib hooks auth.ts next.config.js tailwind.config.ts tsconfig.json
# Copy new files from .production folder

# 6. Install new dependencies
npm install --production

# 7. Rebuild
npm run build

# 8. Restart application
pm2 restart monydragon-portfolio
```

## Important Files to Keep

- `.env.local` - Environment variables
- `node_modules/` - Dependencies (reinstall after updates)
- MongoDB data (in Docker volumes)

## Security Checklist

- [ ] Strong `NEXTAUTH_SECRET` generated
- [ ] Strong admin password set
- [ ] SSL certificate installed
- [ ] Firewall configured (ports 80, 443 open)
- [ ] MongoDB not exposed to public (only localhost)
- [ ] Regular backups scheduled
- [ ] PM2 auto-restart configured

## Backup Strategy

1. **Database Backups**: Use the Database Manager in admin dashboard
2. **File Backups**: Backup the entire `.production` folder
3. **Automated Backups**: Set up cron job for regular backups

```bash
# Example cron job (daily at 2 AM)
0 2 * * * cd ~/monydragon-ai-portfolio-production && npm run db:export
```

