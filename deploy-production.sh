#!/bin/bash
# Production Deployment Script for VuCar App

set -e  # Exit on any error

echo "🚀 VuCar Production Deployment"
echo "=============================="

# Configuration
APP_NAME="vucar-app"
DEPLOY_DIR="/opt/vucar-production"
BACKUP_DIR="/opt/backups/vucar"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
NGINX_CONF="nginx.production.conf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Pre-deployment checks
log_info "Running pre-deployment checks..."

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi

# Check environment variables
if [ ! -f ".env.production" ]; then
    log_error ".env.production file not found"
    log_info "Please create .env.production based on .env.production.example"
    exit 1
fi

# Create directories
log_info "Creating deployment directories..."
sudo mkdir -p $DEPLOY_DIR $BACKUP_DIR
sudo chown $USER:$USER $DEPLOY_DIR $BACKUP_DIR

# Backup current deployment (if exists)
if [ -d "$DEPLOY_DIR/current" ]; then
    log_info "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r $DEPLOY_DIR/current $BACKUP_DIR/$BACKUP_NAME
    log_info "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Deploy new version
log_info "Deploying new version..."

# Copy files
mkdir -p $DEPLOY_DIR/current
cp $DOCKER_COMPOSE_FILE $DEPLOY_DIR/current/docker-compose.yml
cp $NGINX_CONF $DEPLOY_DIR/current/nginx.conf
cp .env.production $DEPLOY_DIR/current/.env

# Set environment variables for docker-compose
cd $DEPLOY_DIR/current
source .env

# Pull latest Docker image
log_info "Pulling Docker image: ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
docker pull ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}

# Stop current containers
log_info "Stopping current containers..."
docker-compose down || log_warn "No existing containers to stop"

# Start new containers
log_info "Starting new containers..."
docker-compose up -d

# Wait for application to start
log_info "Waiting for application to start..."
sleep 30

# Health check
log_info "Performing health check..."
MAX_ATTEMPTS=12
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        log_info "✅ Health check passed"
        break
    else
        log_warn "Health check attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS failed, retrying..."
        sleep 10
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log_error "❌ Health check failed after $MAX_ATTEMPTS attempts"
    log_error "Rolling back to previous version..."
    
    # Rollback logic
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n1)
        log_info "Rolling back to: $LATEST_BACKUP"
        
        docker-compose down
        rm -rf $DEPLOY_DIR/current
        cp -r $BACKUP_DIR/$LATEST_BACKUP $DEPLOY_DIR/current
        cd $DEPLOY_DIR/current
        docker-compose up -d
        
        log_warn "⚠️  Rollback completed"
    else
        log_error "No backup available for rollback"
    fi
    
    exit 1
fi

# Cleanup old Docker images
log_info "Cleaning up old Docker images..."
docker image prune -f

# Display deployment info
log_info "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "======================"
echo "App Name: $APP_NAME"
echo "Deploy Dir: $DEPLOY_DIR/current"
echo "Docker Image: ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}"
echo "Health URL: http://localhost:3000/api/health"
echo "Production URL: https://vucar.syledevops.live"
echo ""
echo "📈 Container Status:"
docker-compose ps

echo ""
log_info "✅ Production deployment completed successfully!"