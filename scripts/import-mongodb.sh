#!/bin/bash

# MongoDB Import Script
# Imports data from dump directory to production MongoDB

set -e

DB_NAME="monydragon_portfolio"
DUMP_DIR="./mongodb-dump"

echo "🗄️  MongoDB Import Script"
echo "=========================="
echo ""

# Check if mongorestore is installed
if ! command -v mongorestore &> /dev/null; then
    echo "❌ Error: mongorestore is not installed."
    echo "   Install MongoDB Database Tools:"
    echo "   - Ubuntu/Debian: sudo apt-get install mongodb-database-tools"
    echo "   - CentOS/RHEL: sudo yum install mongodb-database-tools"
    echo "   - Or download from: https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Check if dump directory exists
if [ ! -d "$DUMP_DIR" ]; then
    echo "❌ Error: Dump directory '$DUMP_DIR' not found!"
    echo ""
    echo "   If you have a compressed archive, extract it first:"
    echo "   tar -xzf mongodb-dump-*.tar.gz"
    exit 1
fi

# Get MongoDB URI from .env.local or use default
if [ -f .env.local ]; then
    MONGODB_URI=$(grep MONGODB_URI .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    if [ -z "$MONGODB_URI" ]; then
        MONGODB_URI="mongodb://localhost:27017"
    fi
else
    MONGODB_URI="mongodb://localhost:27017"
fi

# Remove database name from URI if present (we'll use --db flag instead)
MONGODB_URI=$(echo "$MONGODB_URI" | sed 's|/.*$||')

echo "📦 Database: $DB_NAME"
echo "🔗 Connection: $MONGODB_URI"
echo "📁 Source: $DUMP_DIR"
echo ""
echo "⚠️  WARNING: This will replace existing data in the database!"
echo "   Press Ctrl+C to cancel, or"
read -p "   Press Enter to continue... "
echo ""

# Find the actual dump directory (mongodump creates a subdirectory with DB name)
DUMP_PATH="$DUMP_DIR/$DB_NAME"
if [ ! -d "$DUMP_PATH" ]; then
    # Try alternative structure
    DUMP_PATH="$DUMP_DIR"
fi

echo "⏳ Importing database..."
echo ""

# Check if MongoDB is running in Docker
MONGODB_CONTAINER=""

# 1) Prefer explicit container name from env, e.g. MONGODB_DOCKER_CONTAINER=monydragon-mongodb
if [ -n "$MONGODB_DOCKER_CONTAINER" ]; then
    MONGODB_CONTAINER="$MONGODB_DOCKER_CONTAINER"
else
    # 2) Auto‑detect common MongoDB container names
    if command -v docker &> /dev/null; then
        if docker ps --format '{{.Names}}' | grep -q "^monydragon-mongodb$"; then
            MONGODB_CONTAINER="monydragon-mongodb"
        elif docker ps --format '{{.Names}}' | grep -q "^mongodb$"; then
            MONGODB_CONTAINER="mongodb"
        elif docker ps --format '{{.Names}}' | grep -q "^mongo$"; then
            MONGODB_CONTAINER="mongo"
        else
            # Fallback: any container with 'mongo' in the name
            MONGODB_CONTAINER=$(docker ps --format '{{.Names}}' | grep -i "mongo" | head -1)
        fi
    fi
fi

if [ -n "$MONGODB_CONTAINER" ]; then
    echo "🐳 Detected MongoDB in Docker container: $MONGODB_CONTAINER"
    echo "   Copying dump to container and restoring inside..."
    echo ""
    
    # Copy dump to container
    docker cp "$DUMP_DIR" "$MONGODB_CONTAINER:/tmp/mongodb-dump" > /dev/null 2>&1
    
    # Run mongorestore inside the container (no auth needed for localhost)
    docker exec "$MONGODB_CONTAINER" mongorestore --host localhost --port 27017 --db="$DB_NAME" --drop --noIndexRestore "/tmp/mongodb-dump/$DB_NAME"
    
    RESTORE_EXIT_CODE=$?
    
    # Clean up
    docker exec "$MONGODB_CONTAINER" rm -rf /tmp/mongodb-dump > /dev/null 2>&1
else
    # Extract host from URI, but replace docker service names with localhost
    MONGODB_HOST=$(echo "$MONGODB_URI" | sed 's|mongodb://||' | cut -d ':' -f1)
    # If host is a docker service name (mongodb, monydragon-mongodb, etc.), use localhost
    if [ "$MONGODB_HOST" = "mongodb" ] || [ "$MONGODB_HOST" = "mongodb" ]; then
        MONGODB_HOST="localhost"
    fi
    
    MONGODB_PORT=$(echo "$MONGODB_URI" | sed 's|mongodb://||' | cut -d ':' -f2 | cut -d '/' -f1)
    if [ -z "$MONGODB_PORT" ]; then
        MONGODB_PORT="27017"
    fi
    
    echo "Using host: $MONGODB_HOST, port: $MONGODB_PORT"
    echo ""
    
    mongorestore --host="$MONGODB_HOST" --port="$MONGODB_PORT" --db="$DB_NAME" --drop --noIndexRestore "$DUMP_PATH"
    RESTORE_EXIT_CODE=$?
fi

if [ $RESTORE_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Import completed successfully!"
    echo ""
    echo "📊 Import summary:"
    echo "   Database: $DB_NAME"
    echo "   Collections imported from: $DUMP_PATH"
    echo ""
    echo "🎉 Migration complete! Your data is now in production."
else
    echo ""
    echo "❌ Import failed!"
    exit 1
fi

