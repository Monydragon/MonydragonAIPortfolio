#!/bin/bash

# MongoDB Export Script
# Exports data from local MongoDB to a dump directory

set -e

DB_NAME="monydragon_portfolio"
DUMP_DIR="./mongodb-dump"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="mongodb-dump-${TIMESTAMP}.tar.gz"

echo "🗄️  MongoDB Export Script"
echo "=========================="
echo ""

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
    echo "❌ Error: mongodump is not installed."
    echo "   Install MongoDB Database Tools:"
    echo "   - Windows: Download from https://www.mongodb.com/try/download/database-tools"
    echo "   - macOS: brew install mongodb-database-tools"
    echo "   - Linux: sudo apt-get install mongodb-database-tools"
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

echo "📦 Database: $DB_NAME"
echo "🔗 Connection: $MONGODB_URI"
echo "📁 Output: $DUMP_DIR"
echo ""

# Remove old dump if exists
if [ -d "$DUMP_DIR" ]; then
    echo "🧹 Cleaning old dump directory..."
    rm -rf "$DUMP_DIR"
fi

# Create dump directory
mkdir -p "$DUMP_DIR"

echo "⏳ Exporting database..."
echo ""

# Export database
mongodump --uri="$MONGODB_URI/$DB_NAME" --out="$DUMP_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Export completed successfully!"
    echo ""
    echo "📊 Export summary:"
    du -sh "$DUMP_DIR"
    echo ""
    
    # Create compressed archive
    echo "📦 Creating compressed archive..."
    tar -czf "$ARCHIVE_NAME" "$DUMP_DIR"
    
    if [ $? -eq 0 ]; then
        echo "✅ Archive created: $ARCHIVE_NAME"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Transfer $ARCHIVE_NAME to your production server"
        echo "   2. On production server, extract: tar -xzf $ARCHIVE_NAME"
        echo "   3. Run the import script: ./scripts/import-mongodb.sh"
    else
        echo "⚠️  Archive creation failed, but dump is available in $DUMP_DIR"
    fi
else
    echo ""
    echo "❌ Export failed!"
    exit 1
fi

