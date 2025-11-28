# Complete Server Setup Guide

This is the comprehensive guide for setting up the Monydragon AI Portfolio application on a fresh server or updating an existing installation. It covers all Docker containers, processes, and configuration steps.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Fresh Server Installation](#fresh-server-installation)
3. [Existing Server Update](#existing-server-update)
4. [Docker Containers Setup](#docker-containers-setup)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Application Setup](#application-setup)
8. [Admin User Management](#admin-user-management)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / Windows Server 2019+ / macOS 12+
- **RAM**: Minimum 4GB (8GB+ recommended for production)
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended

### Required Software

- **Node.js**: 20.9.0+ (LTS recommended)
- **npm**: 10.0.0+ (comes with Node.js)
- **Docker**: 24.0+ and Docker Compose 2.20+
- **Git**: Latest version
- **PM2**: For process management (production)

### Install Prerequisites (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version  # Should be 20.9.0+
npm --version   # Should be 10.0.0+

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install PM2 (for production)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Log out and back in for Docker group to take effect
```

### Install Prerequisites (Windows)

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
3. Install Git from [git-scm.com](https://git-scm.com/)
4. Install PM2: `npm install -g pm2`

---

## Fresh Server Installation

### Step 1: Clone Repository

```bash
# Navigate to your desired directory
cd /opt  # or /home/username or C:\Projects on Windows

# Clone the repository
git clone <your-repository-url> monydragon-ai-portfolio
cd monydragon-ai-portfolio
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

### Step 3: Set Up Environment Variables

Create `.env.local` file:

```bash
cp env.example .env.local
nano .env.local  # or use your preferred editor
```

See [Environment Configuration](#environment-configuration) section for complete variable list.

### Step 4: Set Up Docker Containers

See [Docker Containers Setup](#docker-containers-setup) section.

### Step 5: Initialize Database

```bash
# Seed roles
npm run seed-roles

# Seed service types (for mentorship platform)
npm run seed-services

# Create admin user
npm run create-admin-custom
```

### Step 6: Build and Start Application

```bash
# Development
npm run dev

# Production
npm run build
npm run start

# Or with PM2
pm2 start ecosystem.config.js
```

---

## Existing Server Update

### Step 1: Backup Current Installation

```bash
# Backup database
npm run db:export

# Backup .env.local
cp .env.local .env.local.backup

# Backup application (if needed)
tar -czf backup-$(date +%Y%m%d).tar.gz .
```

### Step 2: Pull Latest Changes

```bash
# Navigate to project directory
cd /path/to/monydragon-ai-portfolio

# Pull latest code
git pull origin main  # or your branch name

# Install/update dependencies
npm install
```

### Step 3: Update Environment Variables

```bash
# Check if new variables are needed
# Compare env.example with your .env.local
nano .env.local
```

### Step 4: Update Docker Containers

```bash
# Stop containers
docker-compose down

# Pull latest images
docker-compose pull

# Start containers
docker-compose up -d
```

### Step 5: Run Migrations

```bash
# Migrate roles (if needed)
npm run migrate-roles

# Migrate static data (if needed)
npm run migrate-data
```

### Step 6: Rebuild and Restart

```bash
# Rebuild application
npm run build

# Restart with PM2
pm2 restart ecosystem.config.js

# Or restart manually
npm run start
```

---

## Docker Containers Setup

### Container Overview

The application uses the following Docker containers:

1. **MongoDB** - Database server
2. **Poste.io** (Optional) - Email/SMTP server
3. **Ollama** (Optional) - Local LLM for AI features

### MongoDB Container

#### Configuration File: `docker-compose.yml`

```yaml
services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "${MONGODB_PORT:-27017}:27017"
    environment:
      MONGO_INITDB_DATABASE: monydragon_portfolio
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME:-}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-}
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - monydragon-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
```

#### Setup Process

```bash
# 1. Create Docker network (if not exists)
docker network create monydragon-network

# 2. Start MongoDB container
npm run docker:up
# Or manually:
docker-compose up -d mongodb

# 3. Verify container is running
npm run docker:status
# Or manually:
docker-compose ps

# 4. Check logs
npm run docker:logs
# Or manually:
docker-compose logs -f mongodb

# 5. Test connection
docker exec -it mongodb mongosh --eval "db.adminCommand('ping')"
```

#### MongoDB Management Commands

```bash
# Start MongoDB
npm run docker:up
docker-compose up -d mongodb

# Stop MongoDB
npm run docker:down
docker-compose down

# Restart MongoDB
npm run docker:restart
docker-compose restart mongodb

# View logs
npm run docker:logs
docker-compose logs -f mongodb

# Check status
npm run docker:status
docker-compose ps

# Access MongoDB shell
docker exec -it mongodb mongosh monydragon_portfolio

# Backup database
npm run db:export
# Creates: database-backups/mongodb-dump-YYYY-MM-DD.tar.gz

# Restore database
npm run db:import
# Restores from: database-backups/mongodb-dump-YYYY-MM-DD.tar.gz

# Clean (⚠️ DELETES ALL DATA)
npm run docker:clean
docker-compose down -v
```

#### Production MongoDB Setup

For production, enable authentication:

1. **Set credentials in `.env.local`**:
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password-here
```

2. **Update `docker-compose.yml`**:
```yaml
command: ["--auth"]
```

3. **Update `MONGODB_URI` in `.env.local`**:
```env
MONGODB_URI=mongodb://admin:your-secure-password-here@localhost:27017/monydragon_portfolio?authSource=admin
```

4. **Restart container**:
```bash
docker-compose down
docker-compose up -d
```

### Poste.io Container (Email/SMTP Server)

#### Configuration File: `docker-compose.smtp.yml`

```yaml
services:
  poste:
    image: analogic/poste.io:latest
    container_name: poste-smtp
    restart: unless-stopped
    hostname: mail.monydragon.com
    ports:
      - "25:25"      # SMTP
      - "80:80"      # HTTP
      - "110:110"    # POP3
      - "143:143"    # IMAP
      - "443:443"    # HTTPS
      - "465:465"    # SMTPS
      - "587:587"    # Submission (SMTP with STARTTLS)
      - "993:993"    # IMAPS
      - "995:995"    # POP3S
    environment:
      TZ: "America/Oklahoma_City"
      LETSENCRYPT_EMAIL: "admin@monydragon.com"
    volumes:
      - poste_data:/data
    networks:
      - monydragon-network
```

#### Setup Process

```bash
# 1. Ensure network exists
docker network create monydragon-network

# 2. Start Poste.io
docker-compose -f docker-compose.smtp.yml up -d

# 3. Verify it's running
docker-compose -f docker-compose.smtp.yml ps

# 4. Access web UI
# Open browser to: http://your-server-ip or https://mail.yourdomain.com
# Default login: admin@monydragon.com / changeme
# ⚠️ CHANGE DEFAULT PASSWORD IMMEDIATELY!
```

#### Poste.io Management Commands

```bash
# Start Poste.io
docker-compose -f docker-compose.smtp.yml up -d

# Stop Poste.io
docker-compose -f docker-compose.smtp.yml down

# View logs
docker-compose -f docker-compose.smtp.yml logs -f poste

# Restart
docker-compose -f docker-compose.smtp.yml restart poste

# Check status
docker-compose -f docker-compose.smtp.yml ps
```

#### Poste.io Configuration

1. **Access Web UI**: `http://your-server-ip` or `https://mail.yourdomain.com`
2. **Initial Setup**:
   - Change admin password
   - Configure domain
   - Set up DNS records (MX, SPF, DKIM, DMARC)
3. **Create Email Account**:
   - Go to "Mailboxes" → "Add Mailbox"
   - Create account for your application (e.g., `noreply@yourdomain.com`)
4. **Update `.env.local`**:
```env
SMTP_HOST=your-server-ip
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@yourdomain.com
```

### Ollama Container (Local LLM - Optional)

#### Create `docker-compose.ollama.yml`

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - monydragon-network
    # For GPU support (NVIDIA), uncomment:
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

volumes:
  ollama_data:
    driver: local

networks:
  monydragon-network:
    external: true
```

#### Setup Process

```bash
# 1. Ensure network exists
docker network create monydragon-network

# 2. Start Ollama
docker-compose -f docker-compose.ollama.yml up -d

# 3. Wait for Ollama to start (30-60 seconds)
docker-compose -f docker-compose.ollama.yml logs -f ollama

# 4. Pull a model (e.g., llama3.2)
# Using the helper script (recommended):
npm run docker:ollama:pull llama3.2

# Or manually:
docker exec -it ollama ollama pull llama3.2

# 5. Verify it's working
curl http://localhost:11434/api/tags
```

#### Ollama Management Commands

```bash
# Start Ollama
docker-compose -f docker-compose.ollama.yml up -d

# Stop Ollama
docker-compose -f docker-compose.ollama.yml down

# View logs
docker-compose -f docker-compose.ollama.yml logs -f ollama

# Pull a model (using helper script - recommended)
npm run docker:ollama:pull llama3.2
npm run docker:ollama:pull mistral
npm run docker:ollama:pull codellama

# Or manually:
docker exec -it ollama ollama pull llama3.2
docker exec -it ollama ollama pull mistral
docker exec -it ollama ollama pull codellama

# List available models
npm run docker:ollama:list
# Or manually:
docker exec -it ollama ollama list

# Test model
docker exec -it ollama ollama run llama3.2 "Hello, how are you?"

# Update Ollama
docker-compose -f docker-compose.ollama.yml pull
docker-compose -f docker-compose.ollama.yml up -d
```

#### Update `.env.local` for Ollama

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### All Containers Together

#### Combined `docker-compose.full.yml` (Optional)

You can combine all containers into one file:

```yaml
services:
  mongodb:
    # ... MongoDB config from above

  poste:
    # ... Poste.io config from above

  ollama:
    # ... Ollama config from above

volumes:
  mongodb_data:
  mongodb_config:
  poste_data:
  ollama_data:

networks:
  monydragon-network:
    driver: bridge
```

Then use:
```bash
docker-compose -f docker-compose.full.yml up -d
```

---

## Environment Configuration

### Complete `.env.local` Template

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
# For production with auth:
# MONGODB_URI=mongodb://username:password@localhost:27017/monydragon_portfolio?authSource=admin
MONGODB_PORT=27017
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password

# ============================================
# NEXTAUTH CONFIGURATION
# ============================================
NEXTAUTH_URL=http://localhost:3000
# Production: https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_TRUST_HOST=true

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=development
# Production: NODE_ENV=production
PORT=3000

# ============================================
# GOOGLE OAUTH (Optional)
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================
# EMAIL/SMTP CONFIGURATION
# ============================================
# Option 1: Using Poste.io (self-hosted)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false

# Option 2: Using external SMTP (Gmail, SendGrid, etc.)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM=your-email@gmail.com
# SMTP_SECURE=false

# ============================================
# OLLAMA/LLM CONFIGURATION (Optional)
# ============================================
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
# Other models: mistral, codellama, phi, etc.

# ============================================
# ADMIN USER CREATION
# ============================================
ADMIN_EMAIL=Monydragon@gmail.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=Mony
ADMIN_MIDDLE_NAME=
ADMIN_LAST_NAME=Dragon
ADMIN_USERNAME=monydragon
ADMIN_PHONE=+1234567890
ADMIN_LOCATION=City, Country
ADMIN_TIMEZONE=America/New_York
ADMIN_BIO=Your bio text here
ADMIN_AVATAR=https://example.com/avatar.jpg
ADMIN_EXPERIENCE_LEVEL=expert

# ============================================
# APP BUILDER CONFIGURATION
# ============================================
APP_BUILDER_FREE_CREDITS=100
APP_BUILDER_REFERRAL_CREDITS=100
```

### Generate NEXTAUTH_SECRET

```bash
# Linux/macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## Database Setup

### Initial Setup

```bash
# 1. Start MongoDB
npm run docker:up

# 2. Wait for MongoDB to be ready (30 seconds)
sleep 30

# 3. Seed default roles
npm run seed-roles

# 4. Seed service types (for mentorship)
npm run seed-services

# 5. Verify setup
docker exec -it mongodb mongosh monydragon_portfolio --eval "db.roles.countDocuments()"
```

### Database Backup

```bash
# Manual backup
npm run db:export

# Backup creates: database-backups/mongodb-dump-YYYY-MM-DD.tar.gz

# Automated backup (add to crontab)
# Run daily at 2 AM
0 2 * * * cd /path/to/project && npm run db:export
```

### Database Restore

```bash
# Restore from backup
npm run db:import

# Or manually:
docker exec -it mongodb mongorestore --archive < database-backups/mongodb-dump-YYYY-MM-DD.tar.gz
```

### Database Migration

```bash
# Migrate roles (from legacy to new system)
npm run migrate-roles

# Migrate static data
npm run migrate-data
```

---

## Application Setup

### Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application runs on http://localhost:3000
```

### Production Build

```bash
# Build application
npm run build

# Start production server
npm run start

# Or use PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Set PM2 to start on boot
```

### PM2 Configuration

The `ecosystem.config.js` file is already configured. To use it:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs monydragon-portfolio

# Restart
pm2 restart monydragon-portfolio

# Stop
pm2 stop monydragon-portfolio

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

---

## Admin User Management

### Create Admin User

```bash
# Using environment variables from .env.local
npm run create-admin-custom

# Or using defaults
npm run create-admin
```

### Reset Admin Password

```bash
# Reset password for admin user (uses ADMIN_EMAIL and ADMIN_PASSWORD from .env.local)
npm run reset-admin-password

# Or reset any user by email
npx tsx scripts/reset-user-password.ts --email user@example.com --password NewPassword123!

# Or reset by username
npx tsx scripts/reset-user-password.ts --username myuser --password NewPassword123!
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Create Admin | `npm run create-admin` | Create admin with defaults |
| Create Admin Custom | `npm run create-admin-custom` | Create admin with .env.local values |
| Reset Admin Password | `npm run reset-admin-password` | Reset admin password |
| Reset User Password | `npm run reset-user-password` | Reset any user's password |
| Seed Roles | `npm run seed-roles` | Create default roles |
| Seed Services | `npm run seed-services` | Create service types |
| Migrate Roles | `npm run migrate-roles` | Migrate from legacy roles |

See [ADMIN_ENV_VARIABLES.md](./ADMIN_ENV_VARIABLES.md) for all admin environment variables.

---

## Production Deployment

### Nginx Configuration

Create `/etc/nginx/sites-available/monydragon`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/monydragon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### Firewall Configuration

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if needed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### Production Checklist

- [ ] All environment variables set in `.env.local`
- [ ] `NODE_ENV=production` set
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] MongoDB authentication enabled (production)
- [ ] SSL certificate installed
- [ ] Nginx configured and running
- [ ] PM2 configured and running
- [ ] All Docker containers running
- [ ] Database backed up
- [ ] Admin user created
- [ ] Roles seeded
- [ ] Firewall configured
- [ ] Monitoring set up (optional)

---

## Troubleshooting

### MongoDB Issues

```bash
# Container won't start
docker-compose logs mongodb

# Connection refused
# Check if port 27017 is in use
sudo netstat -tulpn | grep 27017

# Reset MongoDB (⚠️ DELETES DATA)
npm run docker:clean
npm run docker:up
```

### Application Issues

```bash
# Check PM2 logs
pm2 logs monydragon-portfolio

# Check application logs
tail -f logs/app.log

# Restart application
pm2 restart monydragon-portfolio

# Rebuild application
npm run build
pm2 restart monydragon-portfolio
```

### Docker Network Issues

```bash
# Recreate network
docker network rm monydragon-network
docker network create monydragon-network

# Restart all containers
docker-compose down
docker-compose up -d
```

### Port Conflicts

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Check what's using port 27017
sudo lsof -i :27017

# Kill process on port
sudo kill -9 <PID>
```

### Permission Issues

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in

# Fix file permissions
sudo chown -R $USER:$USER /path/to/project
```

---

## Quick Reference Commands

### Docker Commands

```bash
# Start MongoDB
npm run docker:up

# Stop MongoDB
npm run docker:down

# View logs
npm run docker:logs

# Check status
npm run docker:status

# Restart
npm run docker:restart

# Clean (⚠️ DELETES DATA)
npm run docker:clean
```

### Application Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm run start

# With PM2
pm2 start ecosystem.config.js
pm2 restart monydragon-portfolio
pm2 stop monydragon-portfolio
pm2 logs monydragon-portfolio
```

### Database Commands

```bash
# Seed roles
npm run seed-roles

# Seed services
npm run seed-services

# Backup
npm run db:export

# Restore
npm run db:import
```

### Admin Commands

```bash
# Create admin
npm run create-admin-custom

# Reset password
npm run reset-admin-password
npm run reset-user-password -- --email user@example.com --password NewPass123!
```

---

## Additional Resources

- [ADMIN_ENV_VARIABLES.md](./ADMIN_ENV_VARIABLES.md) - Admin user environment variables
- [ROLE_MANAGEMENT_GUIDE.md](./ROLE_MANAGEMENT_GUIDE.md) - Role and permission system
- [USER_MANAGEMENT_SYSTEM.md](./USER_MANAGEMENT_SYSTEM.md) - User management features
- [MENTORSHIP_PLATFORM.md](./MENTORSHIP_PLATFORM.md) - Mentorship platform setup
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Detailed Docker setup
- [SMTP_SETUP.md](./SMTP_SETUP.md) - Email/SMTP configuration

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review relevant documentation files
3. Check application logs: `pm2 logs monydragon-portfolio`
4. Check Docker logs: `docker-compose logs`

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

