#!/bin/bash
# Auto-run migrations in CI/CD pipeline
# This script runs all pending migrations automatically

set -e

MONGODB_URI=${MONGODB_URI:-$1}

if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI not provided"
    echo "Usage: ./auto-migrate.sh <MONGODB_URI>"
    echo "Or set MONGODB_URI environment variable"
    exit 1
fi

echo "🔄 Auto Migration Script"
echo "======================="
echo ""

# Check Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Run migrations
MIGRATIONS_DIR="$(dirname "$0")/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# List of migrations to run (in order)
MIGRATIONS=(
    "add-license-plate-field"
)

echo "📋 Found ${#MIGRATIONS[@]} migration(s) to check"
echo ""

# Run each migration
for migration in "${MIGRATIONS[@]}"; do
    MIGRATION_FILE="$MIGRATIONS_DIR/${migration}.js"
    
    if [ ! -f "$MIGRATION_FILE" ]; then
        echo "⚠️  Warning: Migration file not found: $migration.js"
        continue
    fi
    
    echo "🔄 Running migration: $migration"
    echo "-----------------------------------"
    
    if node "$MIGRATION_FILE" "$MONGODB_URI"; then
        echo "✅ Migration '$migration' completed"
    else
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 0 ]; then
            echo "✅ Migration '$migration' already applied or succeeded"
        else
            echo "⚠️  Migration '$migration' failed with code $EXIT_CODE"
            echo "⚠️  Continuing with next migration..."
        fi
    fi
    echo ""
done

echo "✅ All migrations processed!"
