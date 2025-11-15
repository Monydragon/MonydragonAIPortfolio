# MongoDB Migration Guide

This guide will help you migrate data from your local MongoDB to your production MongoDB server.

## Prerequisites

1. **MongoDB Database Tools** installed on both local and production machines:
   - **Windows**: Download from [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools)
   - **macOS**: `brew install mongodb-database-tools`
   - **Linux (Ubuntu/Debian)**: `sudo apt-get install mongodb-database-tools`
   - **Linux (CentOS/RHEL)**: `sudo yum install mongodb-database-tools`

2. **Access to both databases**:
   - Local MongoDB running and accessible
   - Production MongoDB running and accessible

## Method 1: Using the Migration Scripts (Recommended)

### Step 1: Export from Local MongoDB

On your **local machine**:

```bash
# Make script executable
chmod +x scripts/export-mongodb.sh

# Run export
./scripts/export-mongodb.sh
```

This will:
- Export your local `monydragon_portfolio` database
- Create a dump directory: `./mongodb-dump`
- Create a compressed archive: `mongodb-dump-YYYYMMDD_HHMMSS.tar.gz`

### Step 2: Transfer to Production Server

Transfer the archive to your production server using one of these methods:

**Option A: Using SCP (from local machine)**
```bash
scp mongodb-dump-*.tar.gz administrator@your-server-ip:~/monydragon-ai-portfolio/
```

**Option B: Using WinSCP**
- Connect to your server
- Navigate to `~/monydragon-ai-portfolio/`
- Upload the `mongodb-dump-*.tar.gz` file

**Option C: Using Cloud Storage**
- Upload to Google Drive, Dropbox, etc.
- Download on production server

### Step 3: Import to Production MongoDB

On your **production server**:

```bash
cd ~/monydragon-ai-portfolio

# Extract the archive
tar -xzf mongodb-dump-*.tar.gz

# Make import script executable
chmod +x scripts/import-mongodb.sh

# Run import
./scripts/import-mongodb.sh
```

This will:
- Import all collections to production database
- Drop existing collections before importing (⚠️ **WARNING**: This replaces existing data)
- Preserve all data types and structure

## Method 2: Direct MongoDB Commands

### Export from Local

```bash
# Export database
mongodump --uri="mongodb://localhost:27017/monydragon_portfolio" --out=./mongodb-dump

# Create compressed archive
tar -czf mongodb-dump.tar.gz mongodb-dump
```

### Import to Production

```bash
# Extract archive
tar -xzf mongodb-dump.tar.gz

# Import database
mongorestore --uri="mongodb://localhost:27017" --db="monydragon_portfolio" --drop mongodb-dump/monydragon_portfolio
```

## Method 3: Using MongoDB Compass (GUI)

1. **Export from Local**:
   - Open MongoDB Compass
   - Connect to local MongoDB
   - Select `monydragon_portfolio` database
   - Use Export feature for each collection

2. **Import to Production**:
   - Connect to production MongoDB in Compass
   - Import each collection

## Important Notes

### ⚠️ Warnings

- **Backup First**: Always backup your production database before importing
- **Data Replacement**: The import script uses `--drop` flag, which will **delete existing collections** before importing
- **Indexes**: Indexes will be recreated automatically by Mongoose when the app starts

### What Gets Migrated

- ✅ All collections (users, blogposts, projects, experiences, content, llmconfigs)
- ✅ All documents and their data
- ✅ Data types and structure

### What Doesn't Get Migrated

- ❌ Indexes (recreated automatically by Mongoose)
- ❌ Database users/roles (if using authentication)

### After Migration

1. **Verify Data**:
   ```bash
   # Connect to MongoDB
   mongosh mongodb://localhost:27017/monydragon_portfolio
   
   # Check collections
   show collections
   
   # Count documents
   db.users.countDocuments()
   db.blogposts.countDocuments()
   # etc.
   ```

2. **Restart Your Application**:
   ```bash
   pm2 restart monydragon-portfolio
   ```

3. **Test the Application**:
   - Visit your site
   - Log in with admin credentials
   - Verify data is showing correctly

## Troubleshooting

### Error: "mongodump: command not found"
- Install MongoDB Database Tools (see Prerequisites)

### Error: "Authentication failed"
- Check your MongoDB connection string in `.env.local`
- If using authentication, include credentials in URI: `mongodb://username:password@host:port/database`

### Error: "Connection refused"
- Ensure MongoDB is running on both machines
- Check firewall settings
- Verify connection strings

### Error: "Database already exists"
- The import script uses `--drop` to replace existing data
- If you want to merge data instead, remove `--drop` flag (not recommended)

### Large Database Migration

For large databases:
- Use compression (already included in scripts)
- Consider migrating during low-traffic periods
- Monitor disk space on both machines

## Backup Production Database First

Before importing, create a backup of production:

```bash
# On production server
mongodump --uri="mongodb://localhost:27017/monydragon_portfolio" --out=./mongodb-backup-$(date +%Y%m%d)
```

## Selective Migration

To migrate only specific collections:

```bash
# Export specific collection
mongodump --uri="mongodb://localhost:27017/monydragon_portfolio" --collection=blogposts --out=./mongodb-dump

# Import specific collection
mongorestore --uri="mongodb://localhost:27017" --db="monydragon_portfolio" --collection=blogposts mongodb-dump/monydragon_portfolio/blogposts.bson
```

