# Environment Setup Instructions

## Step 1: Start MongoDB with Docker (Recommended)

**Easiest way to get MongoDB running:**

```bash
npm run docker:up
```

This starts MongoDB in a Docker container. See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for details.

## Step 2: Create `.env.local` file

Create a file named `.env.local` in the root directory of your project with the following content:

```bash
# Database - Docker MongoDB (default)
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio

# Or for MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/monydragon_portfolio

# NextAuth - REQUIRED (use the generated secret below)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=JCk5HhQe8HxDiFjP41yocRKrF5dzCz/usJ0rz2KUf1A=

# App
NODE_ENV=development
PORT=3000

# Local LLM (Ollama) - Optional
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Step 3: Update MongoDB URI (if needed)

- **Docker MongoDB**: Use `mongodb://localhost:27017/monydragon_portfolio` (default)
- **MongoDB Atlas**: Replace with your connection string from Atlas
- **Local MongoDB**: Ensure MongoDB service is running

## Step 4: Restart Dev Server

After creating `.env.local`, restart your development server:
```bash
npm run dev
```

## Step 5: Create Admin User

Once MongoDB is connected, create an admin user:
```bash
npm run create-admin
```

Or set custom credentials:
```bash
ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-password npm run create-admin
```

## Troubleshooting

### If you still get the NextAuth error:

1. **Verify `.env.local` exists** in the project root
2. **Check NEXTAUTH_SECRET is set** (should be a long random string)
3. **Restart the dev server** after creating `.env.local`
4. **Check MongoDB connection** - ensure MongoDB is running and accessible
5. **Check terminal for errors** - look for MongoDB connection errors

### Common Issues:

- **MongoDB not running**: 
  - Docker: Run `npm run docker:up` to start MongoDB
  - Local: Start MongoDB service
  - Atlas: Verify connection string is correct
- **Wrong MongoDB URI**: Verify the connection string is correct
- **Port conflicts**: 
  - Port 27017: Change Docker port in `docker-compose.yml` if needed
  - Port 3000: Ensure port 3000 is available for Next.js
- **Docker not running**: Make sure Docker Desktop is installed and running
- **Missing NEXTAUTH_SECRET**: This is REQUIRED for NextAuth to work

