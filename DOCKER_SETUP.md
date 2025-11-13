# Docker MongoDB Setup Guide

This guide will help you set up MongoDB using Docker for easy development.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### Step 1: Start MongoDB Container

```bash
npm run docker:up
```

This will:
- Download the MongoDB 7.0 image (first time only)
- Start MongoDB in a Docker container
- Expose it on port 27017
- Create persistent volumes for data storage

### Step 2: Verify MongoDB is Running

```bash
npm run docker:status
```

You should see `monydragon-mongodb` with status "Up".

### Step 3: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# MongoDB Docker Connection (no authentication for development)
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# App
NODE_ENV=development
PORT=3000

# Local LLM (Ollama) - Optional
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Step 4: Start Your Application

```bash
npm run dev
```

### Step 5: Create Admin User

```bash
npm run create-admin
```

## Docker Commands

All Docker commands are available as npm scripts:

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start MongoDB container |
| `npm run docker:down` | Stop MongoDB container |
| `npm run docker:logs` | View MongoDB logs (live) |
| `npm run docker:restart` | Restart MongoDB container |
| `npm run docker:status` | Check container status |
| `npm run docker:clean` | Stop and remove all data (⚠️ deletes database) |

## Manual Docker Commands

If you prefer using Docker directly:

```bash
# Start MongoDB
docker-compose up -d

# Stop MongoDB
docker-compose down

# View logs
docker-compose logs -f mongodb

# Stop and remove all data
docker-compose down -v

# Check status
docker-compose ps
```

## Data Persistence

MongoDB data is stored in Docker volumes:
- `mongodb_data` - Database files
- `mongodb_config` - Configuration files

Data persists between container restarts. To completely reset:
```bash
npm run docker:clean
```

## Troubleshooting

### Docker Desktop Not Running

If you get "error during connect" or "unable to get image":
1. **Start Docker Desktop** application
2. Wait for it to fully start (check system tray icon)
3. Verify: `docker ps` should work (not show an error)
4. Try again: `npm run docker:up`

See [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md) for detailed troubleshooting.

### Port 27017 Already in Use

If you have MongoDB installed locally, you may need to:
1. Stop the local MongoDB service, OR
2. Change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "27018:27017"  # Use port 27018 instead
   ```
   Then update `.env.local`:
   ```bash
   MONGODB_URI=mongodb://localhost:27018/monydragon_portfolio
   ```

### Container Won't Start

Check logs:
```bash
npm run docker:logs
```

### Reset Everything

To completely reset MongoDB (deletes all data):
```bash
npm run docker:clean
npm run docker:up
npm run create-admin
```

### Verify Connection

Test MongoDB connection:
```bash
docker exec -it monydragon-mongodb mongosh monydragon_portfolio
```

## Production Setup

For production, you should:
1. Use MongoDB Atlas (cloud) instead of Docker
2. Enable authentication
3. Use environment-specific connection strings
4. Set up proper backup strategies

## Benefits of Docker Setup

✅ **Easy Setup**: One command to start MongoDB  
✅ **Isolated**: Doesn't interfere with system MongoDB  
✅ **Consistent**: Same environment across all machines  
✅ **Easy Cleanup**: Remove everything with one command  
✅ **Portable**: Works on Windows, Mac, and Linux  
✅ **Data Persistence**: Data survives container restarts  

## Next Steps

1. Start MongoDB: `npm run docker:up`
2. Create `.env.local` with the MongoDB URI
3. Create admin user: `npm run create-admin`
4. Start development: `npm run dev`
5. Access admin: `http://localhost:3000/MonyAdmin/login`

