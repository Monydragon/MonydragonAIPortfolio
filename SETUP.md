# Setup Guide

This guide will help you set up the MongoDB database, authentication, and local LLM integration for the portfolio website.

## Prerequisites

- Node.js 18+ (20.9.0+ recommended)
- MongoDB (local or cloud instance)
- Ollama (for local LLM features - optional)

## 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string
# Generate a secret: openssl rand -base64 32

# App
NODE_ENV=development
PORT=3000

# Local LLM (Ollama) - Optional
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Admin User Creation (optional, for script)
ADMIN_EMAIL=admin@monydragon.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin User
```

## 2. MongoDB Setup

### Option A: Docker (Recommended for Development)

1. **Start MongoDB with Docker**:
   ```bash
   npm run docker:up
   ```

2. **Verify it's running**:
   ```bash
   npm run docker:status
   ```

3. **Update `MONGODB_URI` in `.env.local`**:
   ```
   MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
   ```

   See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker instructions.

### Option B: Local MongoDB Installation

1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Update `MONGODB_URI` in `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
   ```

### Option C: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Get your connection string and update `MONGODB_URI` in `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/monydragon_portfolio
   ```

## 3. Create Admin User

### Option 1: Using the Script (Recommended)

1. Install tsx globally (if not already installed):
   ```bash
   npm install -g tsx
   ```

2. Run the admin creation script:
   ```bash
   npx tsx scripts/create-admin-user.ts
   ```

   Or set environment variables:
   ```bash
   ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-password npx tsx scripts/create-admin-user.ts
   ```

### Option 2: Manual Creation

You can also create an admin user through MongoDB directly or by creating a simple script.

## 4. Local LLM Setup (Ollama) - Optional

The blog system includes AI-powered content generation using Ollama, a local LLM runner.

### Install Ollama

1. Download and install from [https://ollama.ai](https://ollama.ai)

2. Start Ollama service:
   ```bash
   ollama serve
   ```

3. Pull a model (recommended: llama3.2 for good balance of quality and speed):
   ```bash
   ollama pull llama3.2
   ```

   Other recommended models:
   - `llama3.2` - Fast and efficient (recommended)
   - `llama3` - Better quality, slower
   - `mistral` - Alternative option
   - `codellama` - Good for technical content

4. Verify installation:
   ```bash
   ollama list
   ```

5. Test the API:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Configure in .env.local

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Using AI Features

Once Ollama is running, you can use AI features in the blog editor:
- **Generate**: Create a new blog post from a topic
- **Improve**: Enhance existing content
- **Excerpt**: Auto-generate post excerpts
- **Tags**: Auto-generate relevant tags

The AI features will show as unavailable if Ollama is not running, but the blog system will work without it.

## 5. Start Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## 6. Access Admin Dashboard

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. Access the admin dashboard at `/admin`

## Database Models

The system includes the following MongoDB models:

- **User**: Admin and user accounts
- **BlogPost**: Blog posts with markdown content
- **Project**: Portfolio projects
- **Experience**: Work experience entries
- **SiteContent**: Editable site content (about section, etc.)

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check `MONGODB_URI` is correct
- For Atlas, ensure your IP is whitelisted

### NextAuth Issues

- Ensure `NEXTAUTH_SECRET` is set
- Ensure `NEXTAUTH_URL` matches your domain
- Clear browser cookies if having session issues

### Ollama Issues

- Ensure Ollama service is running: `ollama serve`
- Check if model is downloaded: `ollama list`
- Verify API is accessible: `curl http://localhost:11434/api/tags`
- Check firewall settings if using remote Ollama instance

### Admin Login Issues

- Ensure admin user exists (run the creation script)
- Check password is correct
- Verify user role is set to "admin" in database

## Next Steps

- Create your first blog post
- Add projects to the portfolio
- Update work experience
- Customize site content

For more information, see the main README.md file.

