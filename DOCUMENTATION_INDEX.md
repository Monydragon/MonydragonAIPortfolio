# Documentation Index

Complete guide to all documentation files in this project.

## 🚀 Getting Started

- **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** - Fast setup guide (5 minutes)
- **[COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md)** - Comprehensive installation guide
  - Fresh server installation
  - Existing server updates
  - All Docker containers setup
  - Complete environment configuration
  - Production deployment

## 📦 Docker & Infrastructure

- **[COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md#docker-containers-setup)** - Complete Docker setup
  - MongoDB container
  - Poste.io (Email/SMTP) container
  - Ollama (LLM) container
  - All containers together
- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - MongoDB Docker setup
- **[DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)** - Docker troubleshooting
- **[DOCKER_TROUBLESHOOTING_UBUNTU24.md](./DOCKER_TROUBLESHOOTING_UBUNTU24.md)** - Ubuntu 24 specific issues

## 🔐 Authentication & Users

- **[ADMIN_ENV_VARIABLES.md](./ADMIN_ENV_VARIABLES.md)** - Admin user environment variables
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin setup guide
- **[LOGIN_SETUP.md](./LOGIN_SETUP.md)** - Login and authentication setup
- **[USER_MANAGEMENT_SYSTEM.md](./USER_MANAGEMENT_SYSTEM.md)** - User management features
- **[ROLE_MANAGEMENT_GUIDE.md](./ROLE_MANAGEMENT_GUIDE.md)** - Role and permission system

## 📧 Email & SMTP

- **[SMTP_SETUP.md](./SMTP_SETUP.md)** - SMTP configuration guide
- **[QUICK_START_SMTP.md](./QUICK_START_SMTP.md)** - Quick SMTP setup
- **[SETUP_SMTP_POWERSHELL.md](./SETUP_SMTP_POWERSHELL.md)** - Windows PowerShell SMTP setup

## 🚀 Deployment

- **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - Production deployment
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Deployment verification checklist
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Deployment summary
- **[QUICK_DEPLOYMENT_REFERENCE.md](./QUICK_DEPLOYMENT_REFERENCE.md)** - Quick deployment reference
- **[SERVER_SETUP_UBUNTU24.md](./SERVER_SETUP_UBUNTU24.md)** - Ubuntu 24 server setup
- **[PRODUCTION_BUILD.md](./PRODUCTION_BUILD.md)** - Production build process

## 🛠️ Setup & Configuration

- **[SETUP.md](./SETUP.md)** - Basic setup guide
- **[SETUP_FROM_SCRATCH.md](./SETUP_FROM_SCRATCH.md)** - Setup from scratch
- **[SETUP_ENV.md](./SETUP_ENV.md)** - Environment variables setup
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration

## 📚 Features & Systems

- **[MENTORSHIP_PLATFORM.md](./MENTORSHIP_PLATFORM.md)** - Mentorship platform documentation
- **[docs/apps/app-builder/APP_BUILDER_IMPLEMENTATION.md](./docs/apps/app-builder/APP_BUILDER_IMPLEMENTATION.md)** - App Builder implementation
- **[docs/apps/app-builder/README.md](./docs/apps/app-builder/README.md)** - App Builder documentation

## 🔧 Troubleshooting

- **[DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)** - Docker issues
- **[DOCKER_TROUBLESHOOTING_UBUNTU24.md](./DOCKER_TROUBLESHOOTING_UBUNTU24.md)** - Ubuntu 24 Docker issues
- **[PORT_TROUBLESHOOTING.md](./PORT_TROUBLESHOOTING.md)** - Port conflicts
- **[NEXTAUTH_DEBUG.md](./NEXTAUTH_DEBUG.md)** - NextAuth debugging
- **[BUILD_FIXES.md](./BUILD_FIXES.md)** - Build issues
- **[SERVER_FIXES.md](./SERVER_FIXES.md)** - Server issues

## 📝 Scripts Reference

All scripts are documented in [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md#admin-user-management):

- `npm run create-admin` - Create admin user
- `npm run create-admin-custom` - Create admin with .env.local values
- `npm run reset-admin-password` - Reset admin password
- `npm run reset-user-password` - Reset any user's password
- `npm run seed-roles` - Seed default roles
- `npm run seed-services` - Seed service types
- `npm run migrate-roles` - Migrate from legacy roles
- `npm run db:export` - Backup database
- `npm run db:import` - Restore database
- `npm run docker:up` - Start MongoDB
- `npm run docker:poste:up` - Start Poste.io
- `npm run docker:ollama:up` - Start Ollama
- `npm run docker:full:up` - Start all containers

## 🗂️ File Structure

```
├── COMPLETE_SERVER_SETUP_GUIDE.md  # ⭐ Main setup guide
├── QUICK_START_GUIDE.md             # Quick reference
├── ADMIN_ENV_VARIABLES.md           # Admin environment variables
├── ROLE_MANAGEMENT_GUIDE.md         # Roles and permissions
├── USER_MANAGEMENT_SYSTEM.md        # User management
├── MENTORSHIP_PLATFORM.md           # Mentorship features
├── docker-compose.yml               # MongoDB container
├── docker-compose.smtp.yml          # Poste.io container
├── docker-compose.ollama.yml        # Ollama container
├── docker-compose.full.yml          # All containers
└── scripts/                         # Utility scripts
    ├── create-admin-custom.ts
    ├── reset-user-password.ts
    ├── seed-roles.ts
    └── ...
```

## 🎯 Common Tasks

### Fresh Install
1. Read [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md#fresh-server-installation)
2. Follow [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) for speed

### Update Existing Server
1. Read [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md#existing-server-update)
2. Follow backup steps first

### Docker Setup
1. Read [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md#docker-containers-setup)
2. See individual container sections

### Admin User Management
1. Read [ADMIN_ENV_VARIABLES.md](./ADMIN_ENV_VARIABLES.md)
2. Use scripts: `npm run create-admin-custom`

### Production Deployment
1. Read [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md#production-deployment)
2. Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Main Documentation**: [COMPLETE_SERVER_SETUP_GUIDE.md](./COMPLETE_SERVER_SETUP_GUIDE.md)
**Quick Reference**: [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)

