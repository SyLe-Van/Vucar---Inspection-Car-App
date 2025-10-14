#!/bin/bash
# Migration Runner Script for Production
# Usage: ./run-migration.sh <migration-name>

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MIGRATIONS_DIR="$(dirname "$0")/migrations"
LOG_DIR="$(dirname "$0")/logs"

# Create logs directory if not exists
mkdir -p "$LOG_DIR"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${BLUE}Available migrations:${NC}"
    ls -1 "$MIGRATIONS_DIR"/*.js 2>/dev/null | xargs -n 1 basename | sed 's/.js$//' || echo "No migrations found"
    echo ""
    echo -e "${YELLOW}Usage:${NC} $0 <migration-name> [mongodb-uri]"
    echo -e "${YELLOW}Example:${NC} $0 add-license-plate-field"
    echo ""
    echo "If mongodb-uri is not provided, will use MONGODB_URI from environment"
    exit 1
fi

MIGRATION_NAME=$1
MIGRATION_FILE="$MIGRATIONS_DIR/${MIGRATION_NAME}.js"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    log_error "Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Get MongoDB URI
if [ -n "$2" ]; then
    MONGODB_URI=$2
elif [ -n "$MONGODB_URI" ]; then
    log_info "Using MONGODB_URI from environment"
else
    log_error "MongoDB URI not provided!"
    echo ""
    echo "Please provide MongoDB URI as second argument or set MONGODB_URI environment variable:"
    echo "  $0 $MIGRATION_NAME \"mongodb+srv://user:pass@cluster.mongodb.net/dbname\""
    echo "Or:"
    echo "  export MONGODB_URI=\"mongodb+srv://user:pass@cluster.mongodb.net/dbname\""
    echo "  $0 $MIGRATION_NAME"
    exit 1
fi

# Confirm before running
echo ""
log_warn "⚠️  WARNING: You are about to run a database migration!"
echo ""
echo -e "${BLUE}Migration:${NC} $MIGRATION_NAME"
echo -e "${BLUE}Database:${NC} ${MONGODB_URI%%@*}@***" # Hide password
echo ""
read -p "Do you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    log_info "Migration cancelled"
    exit 0
fi

# Run migration
LOG_FILE="$LOG_DIR/${MIGRATION_NAME}_$(date +%Y%m%d_%H%M%S).log"

log_info "Running migration: $MIGRATION_NAME"
log_info "Log file: $LOG_FILE"
echo ""

# Run the migration and capture output
if node "$MIGRATION_FILE" "$MONGODB_URI" 2>&1 | tee "$LOG_FILE"; then
    echo ""
    log_info "✅ Migration completed successfully!"
    log_info "Log saved to: $LOG_FILE"
else
    echo ""
    log_error "❌ Migration failed!"
    log_error "Check log file: $LOG_FILE"
    exit 1
fi
