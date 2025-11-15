# Files to Copy to Server

This document lists all files and folders that need to be copied from your local `.production` folder to the server.

## Required Files and Folders

### Core Application Files
- ✅ `.next/` - Built Next.js output (MUST be included)
- ✅ `app/` - Application routes and pages
- ✅ `components/` - React components
- ✅ `lib/` - Utilities, models, and helpers
- ✅ `hooks/` - React hooks
- ✅ `public/` - Static assets (images, fonts, etc.)

### Configuration Files
- ✅ `auth.ts` - NextAuth configuration
- ✅ `next.config.js` - Next.js configuration
- ✅ `tailwind.config.ts` - Tailwind CSS configuration
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `package.json` - Dependencies list
- ✅ `package-lock.json` - Dependency lock file
- ✅ `.eslintrc.json` - ESLint configuration
- ✅ `.gitignore` - Git ignore rules
- ✅ `.dockerignore` - Docker ignore rules

### Docker Configuration
- ✅ `docker-compose.yml` - Docker Compose configuration for MongoDB

### PM2 Configuration (Create on Server)
- ⚠️ `ecosystem.config.js` - PM2 process manager configuration
  - **Note**: This file should be created on the server (see `SERVER_SETUP_UBUNTU24.md`)
  - Or copy from the root project directory if it exists

### Environment Variables (Create on Server)
- ⚠️ `.env.local` - Environment variables
  - **IMPORTANT**: Do NOT copy `.env.local` from local machine
  - Create a new `.env.local` on the server with production values
  - See `SERVER_SETUP_UBUNTU24.md` Step 9 for required variables

## Files NOT to Copy

### Development Files
- ❌ `node_modules/` - Will be installed on server with `npm ci`
- ❌ `.git/` - Git repository (not needed in production)
- ❌ `scripts/` - Development scripts (not needed in production)
- ❌ `*.md` - Documentation files (not needed in production)

### Build Artifacts (if rebuilding on server)
- ⚠️ `.next/` - Only copy if you're not rebuilding on server
  - If you rebuild on server, you can skip this

### Environment Files
- ❌ `.env.local` - Create new one on server
- ❌ `.env.development` - Not needed
- ❌ `.env.test` - Not needed

## Copy Methods

### Method 1: SCP (Command Line)

From your local machine (Windows PowerShell or Git Bash):

```bash
# Navigate to your project root
cd D:\Projects\Github\Web\MonydragonAIPortfolio

# Copy .production folder contents to server
scp -r .production/* administrator@YOUR_SERVER_IP:~/monydragon-ai-portfolio/
```

### Method 2: WinSCP (GUI)

1. Connect to your server via WinSCP
2. Navigate to `/home/administrator/monydragon-ai-portfolio` on the server
3. Navigate to `.production` folder on your local machine
4. Select all files and folders (Ctrl+A)
5. Drag and drop to the server directory
6. Confirm overwrite if prompted

### Method 3: rsync (Linux/Mac)

```bash
rsync -avz --exclude 'node_modules' --exclude '.git' \
  .production/ administrator@YOUR_SERVER_IP:~/monydragon-ai-portfolio/
```

## After Copying

Once files are copied to the server:

1. **SSH into the server**
   ```bash
   ssh administrator@YOUR_SERVER_IP
   ```

2. **Navigate to project directory**
   ```bash
   cd ~/monydragon-ai-portfolio
   ```

3. **Create logs directory**
   ```bash
   mkdir -p logs
   ```

4. **Create ecosystem.config.js** (if not copied)
   ```bash
   nano ecosystem.config.js
   # Copy contents from SERVER_SETUP_UBUNTU24.md Step 7
   ```

5. **Create .env.local** (DO NOT copy from local)
   ```bash
   nano .env.local
   # Add production environment variables
   # See SERVER_SETUP_UBUNTU24.md Step 9
   ```

6. **Install dependencies**
   ```bash
   npm ci --omit=dev
   ```

7. **Rebuild if needed** (if you didn't copy .next folder)
   ```bash
   npm run build
   ```

8. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

## Verification

After copying and setup, verify:

1. **Files are present**
   ```bash
   ls -la ~/monydragon-ai-portfolio
   ```

2. **Dependencies installed**
   ```bash
   ls -la ~/monydragon-ai-portfolio/node_modules
   ```

3. **Environment file exists**
   ```bash
   cat ~/monydragon-ai-portfolio/.env.local
   ```

4. **PM2 config exists**
   ```bash
   cat ~/monydragon-ai-portfolio/ecosystem.config.js
   ```

## Quick Copy Checklist

- [ ] `.next/` folder copied
- [ ] `app/` folder copied
- [ ] `components/` folder copied
- [ ] `lib/` folder copied
- [ ] `hooks/` folder copied
- [ ] `public/` folder copied
- [ ] `auth.ts` copied
- [ ] `next.config.js` copied
- [ ] `tailwind.config.ts` copied
- [ ] `postcss.config.js` copied
- [ ] `tsconfig.json` copied
- [ ] `package.json` copied
- [ ] `package-lock.json` copied
- [ ] `docker-compose.yml` copied
- [ ] `.eslintrc.json` copied
- [ ] `.gitignore` copied
- [ ] `.dockerignore` copied
- [ ] `ecosystem.config.js` created on server
- [ ] `.env.local` created on server (with production values)
- [ ] `logs/` directory created on server
- [ ] Dependencies installed (`npm ci --omit=dev`)
- [ ] Application started with PM2

