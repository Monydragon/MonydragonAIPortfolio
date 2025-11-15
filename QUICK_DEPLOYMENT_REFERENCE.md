# Quick Deployment Reference

This is a condensed version of the setup guide for quick reference.

## One-Line Commands Summary

### Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y && sudo apt install -y curl wget git build-essential

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs

# Install Docker (Official Script - Recommended)
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER && newgrp docker
sudo systemctl start docker && sudo systemctl enable docker
docker run hello-world  # Test installation

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Project Setup
```bash
# Create project directory
mkdir -p ~/monydragon-ai-portfolio && cd ~/monydragon-ai-portfolio

# Create logs directory
mkdir -p logs

# Install dependencies (after copying files)
npm ci --omit=dev

# Start MongoDB
docker compose up -d

# Start application
pm2 start ecosystem.config.js && pm2 save && pm2 startup
```

### SSL Setup
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d monydragon.com -d www.monydragon.com
```

## Essential Commands

### PM2
```bash
pm2 status                    # Check status
pm2 logs monydragon-portfolio # View logs
pm2 restart monydragon-portfolio # Restart
pm2 stop monydragon-portfolio    # Stop
```

### Docker
```bash
docker ps                      # List containers
docker compose logs mongodb    # MongoDB logs
docker compose restart mongodb # Restart MongoDB
```

### Nginx
```bash
sudo nginx -t                  # Test config
sudo systemctl reload nginx    # Reload
```

## Environment Variables Template

Create `~/.env.local`:
```bash
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
MONGODB_DOCKER_CONTAINER=mongodb
NEXTAUTH_URL=https://monydragon.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3000
```

## File Structure on Server

```
~/monydragon-ai-portfolio/
├── .next/              # Built Next.js output
├── app/                # Application routes
├── components/         # React components
├── lib/                # Utilities and models
├── hooks/              # React hooks
├── public/             # Static assets
├── logs/               # PM2 logs
├── auth.ts
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
├── package-lock.json
├── docker-compose.yml
├── ecosystem.config.js
└── .env.local          # Production environment variables
```

## Troubleshooting Quick Fixes

### App not starting
```bash
pm2 logs monydragon-portfolio
sudo lsof -i :3000
```

### MongoDB not connecting
```bash
docker ps
docker compose logs mongodb
docker exec mongodb mongosh --eval "db.version()"
```

### Nginx 502 error
```bash
pm2 status
sudo tail -f /var/log/nginx/error.log
```

### Port already in use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

## Update Application

```bash
cd ~/monydragon-ai-portfolio
# Copy new files (via SCP/WinSCP)
npm ci --omit=dev
npm run build  # If needed
pm2 restart monydragon-portfolio
```

