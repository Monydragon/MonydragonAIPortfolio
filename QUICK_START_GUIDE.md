# Quick Start Guide

This is a condensed version of the complete setup guide. Use this for rapid deployment.

## Fresh Install (5 Minutes)

```bash
# 1. Clone and install
git clone <repo-url> monydragon-ai-portfolio
cd monydragon-ai-portfolio
npm install

# 2. Create .env.local
cp env.example .env.local
# Edit .env.local with your values

# 3. Start MongoDB
npm run docker:up

# 4. Initialize database
npm run seed-roles
npm run seed-services
npm run create-admin-custom

# 5. Start application
npm run dev  # Development
# OR
npm run build && npm run start  # Production
```

## Existing Server Update (2 Minutes)

```bash
# 1. Pull latest code
git pull origin main
npm install

# 2. Update containers
docker-compose down
docker-compose pull
docker-compose up -d

# 3. Run migrations (if needed)
npm run migrate-roles

# 4. Rebuild and restart
npm run build
pm2 restart ecosystem.config.js
```

## Docker Containers Quick Reference

### MongoDB
```bash
npm run docker:up          # Start
npm run docker:down         # Stop
npm run docker:logs        # View logs
npm run docker:status      # Check status
```

### Poste.io (Email)
```bash
npm run docker:poste:up    # Start
npm run docker:poste:down  # Stop
npm run docker:poste:logs  # View logs
```

### Ollama (AI/LLM)
```bash
npm run docker:ollama:up   # Start
npm run docker:ollama:down # Stop
npm run docker:ollama:logs # View logs
docker exec -it ollama ollama pull llama3.2  # Pull model
```

### All Containers
```bash
npm run docker:full:up     # Start all
npm run docker:full:down   # Stop all
```

## Essential Commands

```bash
# Admin user
npm run create-admin-custom
npm run reset-admin-password

# Database
npm run seed-roles
npm run db:export
npm run db:import

# Application
npm run dev        # Development
npm run build      # Production build
npm run start      # Production start
pm2 start ecosystem.config.js  # With PM2
```

## Required Environment Variables

Minimum `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourPassword123!
```

See [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md) for full details.

