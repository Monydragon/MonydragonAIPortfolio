# Production Build Guide

## Overview

The production build process creates an optimized, deployable version of your application in the `.production` folder. This folder contains only the files needed to run the application in production.

## Usage

### Build for Production

Run the production build script:

```bash
npm run build:production
```

This command will:
1. ✅ Run `npm run build` to create an optimized Next.js build
2. ✅ Clean the `.production` folder (if it exists)
3. ✅ Copy all necessary files to `.production`
4. ✅ Exclude unnecessary files (node_modules, .next cache, documentation, etc.)

### What Gets Copied

**Included:**
- ✅ Built application (`.next` folder - but this is rebuilt on server)
- ✅ Source code (`app/`, `components/`, `lib/`, `hooks/`)
- ✅ Configuration files (`next.config.js`, `tailwind.config.ts`, `tsconfig.json`, etc.)
- ✅ `package.json` and `package-lock.json`
- ✅ `public/` folder (static assets)
- ✅ `ecosystem.config.js` (PM2 configuration)
- ✅ `docker-compose.yml` (if using Docker)
- ✅ `auth.ts` (NextAuth configuration)

**Excluded:**
- ❌ `node_modules/` (will be installed on server)
- ❌ `.next/` (will be rebuilt on server)
- ❌ `.git/` (version control)
- ❌ `.env.local`, `.env.development` (environment files)
- ❌ `scripts/` folder (development scripts)
- ❌ Documentation files (`*.md`)
- ❌ Development files

## Deployment Steps

### 1. Build Locally

```bash
npm run build:production
```

### 2. Transfer to Server

Use WinSCP or SCP to copy the `.production` folder to your server:

```bash
# Example using SCP
scp -r .production administrator@your-server-ip:/mony/administrator/monydragon-ai-portfolio-production
```

### 3. On Server: Install Dependencies

```bash
cd /mony/administrator/monydragon-ai-portfolio-production
npm install --production
```

### 4. On Server: Set Up Environment

Create `.env.local` file with your production environment variables:

```bash
nano .env.local
```

Add:
```
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://monydragon.com
```

### 5. On Server: Build Next.js

```bash
npm run build
```

### 6. On Server: Start Application

Using PM2:

```bash
pm2 start ecosystem.config.js
# or
pm2 start npm --name "monydragon-portfolio" -- start
```

Or directly:

```bash
npm start
```

## File Structure

After running `npm run build:production`, your `.production` folder will look like:

```
.production/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility libraries
├── hooks/                  # React hooks
├── public/                 # Static assets
├── auth.ts                 # NextAuth configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
├── package-lock.json       # Lock file
├── ecosystem.config.js     # PM2 configuration
└── docker-compose.yml      # Docker configuration (if used)
```

## Notes

- The `.production` folder is automatically excluded from Git (added to `.gitignore`)
- You should **never** commit the `.production` folder to version control
- Always test the production build locally before deploying
- Make sure to set up proper environment variables on the server
- The `.next` folder will be rebuilt on the server during `npm run build`

## Troubleshooting

### Build Fails

If the build fails, check:
1. All TypeScript errors are fixed
2. All dependencies are installed (`npm install`)
3. Environment variables are set correctly

### Missing Files

If files are missing in `.production`:
1. Check the `EXCLUDE_PATTERNS` in `scripts/build-production.ts`
2. Add files to `INCLUDE_PATTERNS` if needed
3. Rebuild: `npm run build:production`

### Server Issues

If the application doesn't start on the server:
1. Check Node.js version matches local development
2. Verify all environment variables are set
3. Check MongoDB connection
4. Review PM2 logs: `pm2 logs monydragon-portfolio`


