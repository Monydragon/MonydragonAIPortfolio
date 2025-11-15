# Complete Ubuntu 24 Server Setup Guide

This guide will help you set up your Ubuntu 24 server from scratch for the Monydragon AI Portfolio application.

## Prerequisites

- Fresh Ubuntu 24.04 LTS installation
- Root or sudo access
- Domain name pointing to your server IP (e.g., `monydragon.com`)

---

## Step 1: Initial Server Setup

### 1.1 Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 1.2 Create Application User (Optional but Recommended)

```bash
# Create a user for the application
sudo adduser administrator
sudo usermod -aG sudo administrator

# Switch to the new user
su - administrator
```

---

## Step 2: Install Node.js 20.x

```bash
# Install Node.js 20.x using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

---

## Step 3: Install Docker and Docker Compose

### 3.1 Install Docker (Method 1: Official Docker Script - RECOMMENDED)

This is the easiest and most reliable method for Ubuntu 24:

```bash
# Install Docker using the official convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
docker compose version

# Log out and back in for group changes to take effect, or run:
newgrp docker

# Test Docker (should work without sudo after newgrp)
docker run hello-world
```

### 3.2 Alternative: Manual Installation (If Method 1 Fails)

If the script method doesn't work, try manual installation:

```bash
# Remove old versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null

# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Create keyring directory
sudo mkdir -p /etc/apt/keyrings

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt update

# Install Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version

# Apply group changes
newgrp docker

# Test Docker
docker run hello-world
```

### 3.3 Troubleshooting Docker Installation

**If you get "Permission denied" errors:**
```bash
# Make sure you're in the docker group
groups

# If docker group is not listed, log out and back in, or:
newgrp docker

# Or use sudo temporarily
sudo docker --version
```

**If Docker service won't start:**
```bash
# Check Docker service status
sudo systemctl status docker

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Check for errors
sudo journalctl -u docker.service
```

**If repository errors occur:**
```bash
# Remove old repository entries
sudo rm -f /etc/apt/sources.list.d/docker.list
sudo rm -f /etc/apt/keyrings/docker.gpg

# Try Method 1 (official script) instead
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**If GPG key errors:**
```bash
# Update GPG keys
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 7EA0A9C3F273FCD8

# Or try without GPG verification (less secure, but works)
sudo apt install -y docker.io docker-compose
```

**Verify Docker Compose is installed:**
```bash
# Check if docker compose works (note: no hyphen in newer versions)
docker compose version

# If that doesn't work, try old syntax
docker-compose --version

# If neither works, install docker-compose separately
sudo apt install -y docker-compose
```

---

## Step 4: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

## Step 5: Setup MongoDB with Docker

### 5.1 Create Project Directory

```bash
# Create project directory
mkdir -p ~/monydragon-ai-portfolio
cd ~/monydragon-ai-portfolio
```

### 5.2 Create Docker Compose File

Create `docker-compose.yml`:

```yaml
services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: monydragon_portfolio
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

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local

networks:
  monydragon-network:
    driver: bridge
```

### 5.3 Fix Docker Permissions (If Needed)

**If you get "permission denied" errors when running docker commands:**

```bash
# Check if you're in the docker group
groups

# If "docker" is NOT in the list, add yourself to the docker group
sudo usermod -aG docker $USER

# Apply the group changes (choose ONE method):

# Method 1: Use newgrp (applies immediately in current session)
newgrp docker

# Method 2: Log out and log back in (applies to new sessions)
# Just type: exit
# Then SSH back in

# Method 3: Use sudo temporarily (quick fix, but requires sudo each time)
# Just add "sudo" before docker commands: sudo docker compose up -d

# Verify you can now run docker without sudo
docker ps
```

**Quick Fix (if you're in a hurry):**
```bash
# Just use sudo for now
sudo docker compose up -d
sudo docker ps
```

### 5.4 Start MongoDB

```bash
# Start MongoDB container
docker compose up -d
# If you get permission errors, use: sudo docker compose up -d

# Verify it's running
docker ps
# If you get permission errors, use: sudo docker ps

# Check logs
docker compose logs mongodb
# If you get permission errors, use: sudo docker compose logs mongodb

# Verify MongoDB is accessible
docker exec mongodb mongosh --eval "db.version()"
# If you get permission errors, use: sudo docker exec mongodb mongosh --eval "db.version()"
```

---

## Step 6: Copy Application Files

### 6.1 Files to Copy from `.production` Folder

Copy **ALL** contents from your local `.production` folder to the server:

**Required Files and Folders:**
- `.next/` (built Next.js output)
- `app/` (application routes)
- `components/` (React components)
- `lib/` (utilities and models)
- `hooks/` (React hooks)
- `public/` (static assets)
- `auth.ts` (NextAuth configuration)
- `next.config.js` (Next.js configuration)
- `tailwind.config.ts` (Tailwind CSS configuration)
- `postcss.config.js` (PostCSS configuration)
- `tsconfig.json` (TypeScript configuration)
- `package.json` (dependencies)
- `package-lock.json` (lock file)
- `docker-compose.yml` (Docker configuration)
- `.eslintrc.json` (ESLint configuration)
- `.gitignore` (Git ignore rules)
- `.dockerignore` (Docker ignore rules)

**Optional but Recommended:**
- `ecosystem.config.js` (PM2 configuration - see Step 7)

### 6.2 Copy Methods

**Option A: Using SCP (from your local machine)**

```bash
# From your local machine (Windows PowerShell or Git Bash)
scp -r .production/* administrator@YOUR_SERVER_IP:~/monydragon-ai-portfolio/
```

**Option B: Using WinSCP**
1. Connect to your server via WinSCP
2. Navigate to `~/monydragon-ai-portfolio` on the server
3. Copy all files from local `.production` folder to the server

**Option C: Using Git (if you have a repository)**
```bash
# On server
cd ~/monydragon-ai-portfolio
git clone YOUR_REPO_URL .
git checkout main  # or your production branch
npm run build:production  # if you have the build script
```

---

## Step 7: Create PM2 Configuration

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [
    {
      name: "monydragon-portfolio",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/home/administrator/monydragon-ai-portfolio",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/administrator/monydragon-ai-portfolio/logs/pm2-error.log",
      out_file: "/home/administrator/monydragon-ai-portfolio/logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
```

Create logs directory:

```bash
mkdir -p ~/monydragon-ai-portfolio/logs
```

---

## Step 8: Install Dependencies and Build

```bash
cd ~/monydragon-ai-portfolio

# Install production dependencies
npm ci --omit=dev

# If you need to rebuild (if .next folder wasn't copied)
# npm run build
```

---

## Step 9: Configure Environment Variables

Create `.env.local` file:

```bash
nano ~/monydragon-ai-portfolio/.env.local
```

Add the following (adjust values as needed):

```bash
# Database - MongoDB Docker
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
MONGODB_DOCKER_CONTAINER=mongodb

# NextAuth - REQUIRED
NEXTAUTH_URL=https://monydragon.com
NEXTAUTH_SECRET=YOUR_SECRET_HERE
# Generate a secret: openssl rand -base64 32

# App
NODE_ENV=production
PORT=3000

# Optional: Local LLM (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Save and exit (Ctrl+X, then Y, then Enter).

---

## Step 10: Start Application with PM2

```bash
cd ~/monydragon-ai-portfolio

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions it outputs (usually run a sudo command)

# Check status
pm2 status
pm2 logs monydragon-portfolio
```

---

## Step 11: Configure Nginx (Reverse Proxy)

### 11.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 11.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/monydragon.com
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name monydragon.com www.monydragon.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # For now, proxy to Next.js (remove after SSL setup)
    location / {
        proxy_pass http://127.0.0.1:3000;
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

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/monydragon.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 12: Setup SSL with Let's Encrypt

### 12.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 12.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d monydragon.com -d www.monydragon.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 12.3 Auto-renewal

Certbot sets up auto-renewal automatically. Test it:

```bash
sudo certbot renew --dry-run
```

---

## Step 13: Create Admin User

### 13.1 Option A: Using the Web Interface

1. Navigate to `https://monydragon.com/MonyAdmin/createMonyAdmin`
2. Fill in the form to create the first admin user

### 13.2 Option B: Using Script (if you have it)

```bash
cd ~/monydragon-ai-portfolio
npm run create-admin
```

---

## Step 14: Verify Everything Works

### 14.1 Check Services

```bash
# Check PM2
pm2 status

# Check Docker
docker ps

# Check Nginx
sudo systemctl status nginx

# Check MongoDB
docker exec mongodb mongosh --eval "db.version()"
```

### 14.2 Test Application

1. Visit `https://monydragon.com` - should show your portfolio
2. Visit `https://monydragon.com/MonyAdmin/login` - should show login page
3. Test admin login with the user you created

---

## Step 15: Firewall Configuration

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Useful Commands

### PM2 Commands

```bash
pm2 status                    # Check app status
pm2 logs monydragon-portfolio # View logs
pm2 restart monydragon-portfolio # Restart app
pm2 stop monydragon-portfolio    # Stop app
pm2 delete monydragon-portfolio  # Remove from PM2
```

### Docker Commands

```bash
docker ps                      # List running containers
docker compose logs mongodb    # View MongoDB logs
docker compose restart mongodb # Restart MongoDB
docker compose down            # Stop MongoDB
docker compose up -d           # Start MongoDB
```

### Application Commands

```bash
cd ~/monydragon-ai-portfolio
npm run build                  # Rebuild application
pm2 restart monydragon-portfolio # Restart after changes
```

### Nginx Commands

```bash
sudo nginx -t                  # Test configuration
sudo systemctl reload nginx    # Reload configuration
sudo systemctl restart nginx   # Restart Nginx
```

---

## Troubleshooting

### Nginx 502 Bad Gateway (Most Common Issue)

**Step-by-step troubleshooting:**

```bash
# 1. Check if PM2 is running your app
pm2 status

# If app is not running or shows "errored", check logs:
pm2 logs monydragon-portfolio --lines 50

# 2. Check if app is listening on port 3000
sudo lsof -i :3000
# OR
sudo netstat -tulpn | grep 3000

# 3. Test if app responds locally
curl http://localhost:3000

# 4. Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# 5. Verify Nginx configuration
sudo nginx -t

# 6. Check if Nginx is running
sudo systemctl status nginx
```

**Common fixes:**

**Fix 1: App not running in PM2**
```bash
cd ~/monydragon-ai-portfolio

# Check if .env.local exists
ls -la .env.local

# Check PM2 logs for errors
pm2 logs monydragon-portfolio --lines 100

# Restart the app
pm2 restart monydragon-portfolio

# If it keeps crashing, delete and restart
pm2 delete monydragon-portfolio
pm2 start ecosystem.config.js
pm2 save
```

**Fix 2: App not listening on port 3000**
```bash
# Check if something else is using port 3000
sudo lsof -i :3000

# Kill any process using port 3000 (if needed)
sudo kill -9 <PID>

# Restart PM2 app
pm2 restart monydragon-portfolio
```

**Fix 3: Nginx can't connect to app**
```bash
# Verify Nginx config has correct proxy_pass
sudo cat /etc/nginx/sites-available/monydragon.com | grep proxy_pass
# Should show: proxy_pass http://127.0.0.1:3000; or proxy_pass http://localhost:3000;

# If wrong, edit the config:
sudo nano /etc/nginx/sites-available/monydragon.com
# Make sure location / has: proxy_pass http://127.0.0.1:3000;

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

**Fix 4: Missing .env.local or wrong environment variables**
```bash
cd ~/monydragon-ai-portfolio

# Check if .env.local exists
ls -la .env.local

# If missing, create it (see Step 9)
nano .env.local

# After creating/editing .env.local, restart PM2
pm2 restart monydragon-portfolio
```

**Fix 5: Dependencies not installed**
```bash
cd ~/monydragon-ai-portfolio

# Install dependencies
npm ci --omit=dev

# Rebuild if needed
npm run build

# Restart PM2
pm2 restart monydragon-portfolio
```

### Application Not Starting

1. Check PM2 logs: `pm2 logs monydragon-portfolio --lines 100`
2. Check if port 3000 is in use: `sudo lsof -i :3000`
3. Verify `.env.local` exists and has correct values: `cat .env.local`
4. Check MongoDB is running: `docker ps`
5. Check if dependencies are installed: `ls -la node_modules`

### MongoDB Connection Issues

1. Verify MongoDB container is running: `docker ps`
2. Check MongoDB logs: `docker compose logs mongodb`
3. Test connection: `docker exec mongodb mongosh --eval "db.version()"`
4. Verify `MONGODB_URI` in `.env.local` is correct: `cat .env.local | grep MONGODB_URI`

### SSL Certificate Issues

1. Check certificate status: `sudo certbot certificates`
2. Test renewal: `sudo certbot renew --dry-run`
3. Check Nginx SSL config: `sudo nginx -t`

---

## Backup and Maintenance

### Backup MongoDB

```bash
# Create backup
docker exec mongodb mongodump --out=/tmp/backup-$(date +%Y%m%d)

# Copy backup from container
docker cp mongodb:/tmp/backup-$(date +%Y%m%d) ~/backups/
```

### Update Application

1. Copy new files to server
2. Install dependencies: `npm ci --omit=dev`
3. Rebuild if needed: `npm run build`
4. Restart: `pm2 restart monydragon-portfolio`

---

## Summary Checklist

- [ ] Ubuntu 24 updated
- [ ] Node.js 20.x installed
- [ ] Docker and Docker Compose installed
- [ ] PM2 installed
- [ ] MongoDB running in Docker
- [ ] Application files copied to server
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] PM2 configuration created
- [ ] Application running with PM2
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Admin user created
- [ ] Application accessible via domain

---

**Your application should now be live at `https://monydragon.com`!** 🎉

