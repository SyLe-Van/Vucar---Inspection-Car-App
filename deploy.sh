#!/bin/bash

# VuCar App Deployment Script
# This script can be used by Jenkins or run manually for deployments

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="vucar-app"
DEFAULT_ENVIRONMENT="production"
DEFAULT_REGISTRY="localhost"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] COMMAND

Commands:
    deploy          Deploy the application
    build           Build Docker image only
    push            Push Docker image to registry
    stop            Stop running containers
    logs            Show container logs
    health          Check application health
    cleanup         Clean up old images and containers

Options:
    -e, --environment   Environment (production|staging|development) [default: production]
    -t, --tag           Docker image tag [default: latest]
    -r, --registry      Docker registry [default: localhost]
    -f, --force         Force rebuild/redeploy
    -h, --help          Show this help message

Examples:
    $0 deploy --environment staging --tag v1.2.3
    $0 build --tag latest
    $0 logs --environment production
EOF
}

# Parse command line arguments
ENVIRONMENT="$DEFAULT_ENVIRONMENT"
TAG="latest"
REGISTRY="$DEFAULT_REGISTRY"
FORCE=false
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        deploy|build|push|stop|logs|health|cleanup)
            COMMAND="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

if [[ -z "$COMMAND" ]]; then
    log_error "No command specified"
    show_usage
    exit 1
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(production|staging|development)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    exit 1
fi

# Set variables
IMAGE_NAME="$REGISTRY/$PROJECT_NAME"
FULL_IMAGE_TAG="$IMAGE_NAME:$TAG"
CONTAINER_NAME="$PROJECT_NAME-$ENVIRONMENT"
ENV_FILE=".env.$ENVIRONMENT"

log_info "Configuration:"
log_info "  Environment: $ENVIRONMENT"
log_info "  Image: $FULL_IMAGE_TAG"
log_info "  Container: $CONTAINER_NAME"

# Functions for each command
build_image() {
    log_info "Building Docker image: $FULL_IMAGE_TAG"
    
    if [[ "$FORCE" == "true" ]]; then
        docker build --no-cache -t "$FULL_IMAGE_TAG" .
    else
        docker build -t "$FULL_IMAGE_TAG" .
    fi
    
    # Tag as latest for this environment
    docker tag "$FULL_IMAGE_TAG" "$IMAGE_NAME:$ENVIRONMENT-latest"
    
    log_success "Image built successfully"
}

push_image() {
    log_info "Pushing image to registry: $FULL_IMAGE_TAG"
    
    if [[ "$REGISTRY" != "localhost" ]]; then
        docker push "$FULL_IMAGE_TAG"
        docker push "$IMAGE_NAME:$ENVIRONMENT-latest"
        log_success "Image pushed successfully"
    else
        log_warning "Skipping push for localhost registry"
    fi
}

stop_containers() {
    log_info "Stopping existing containers..."
    
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"
        log_success "Stopped container: $CONTAINER_NAME"
    else
        log_info "No running container found: $CONTAINER_NAME"
    fi
}

deploy_app() {
    log_info "Deploying application..."
    
    # Check if environment file exists
    if [[ -f "$ENV_FILE" ]]; then
        log_info "Using environment file: $ENV_FILE"
    else
        log_warning "Environment file not found: $ENV_FILE"
        log_info "Using default environment variables"
    fi
    
    # Stop existing containers
    stop_containers
    
    # Deploy using Docker Compose
    if [[ -f "docker-compose.yml" ]]; then
        log_info "Deploying with Docker Compose..."
        
        export ENVIRONMENT="$ENVIRONMENT"
        export DOCKER_REGISTRY="$REGISTRY"
        export DOCKER_IMAGE_NAME="$PROJECT_NAME"
        export DOCKER_TAG="$TAG"
        export APP_PORT=$([ "$ENVIRONMENT" = "production" ] && echo "80" || echo "8080")
        
        if [[ -f "$ENV_FILE" ]]; then
            docker-compose --env-file "$ENV_FILE" up -d
        else
            docker-compose up -d
        fi
    else
        # Fallback to docker run
        log_info "Deploying with docker run..."
        
        local port=$([ "$ENVIRONMENT" = "production" ] && echo "80:3000" || echo "8080:3000")
        
        docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            -p "$port" \
            -e NODE_ENV="$ENVIRONMENT" \
            -e PORT=3000 \
            -e HOSTNAME="0.0.0.0" \
            "$FULL_IMAGE_TAG"
    fi
    
    log_success "Deployment completed"
    
    # Wait a moment and check health
    log_info "Waiting for application to start..."
    sleep 10
    check_health
}

check_health() {
    log_info "Checking application health..."
    
    local port=$([ "$ENVIRONMENT" = "production" ] && echo "80" || echo "8080")
    local url="http://localhost:$port/api/health"
    
    for i in {1..10}; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log_success "✅ Application is healthy"
            return 0
        else
            log_info "⏳ Waiting for application... ($i/10)"
            sleep 5
        fi
    done
    
    log_error "❌ Health check failed"
    return 1
}

show_logs() {
    log_info "Showing logs for: $CONTAINER_NAME"
    
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        docker logs -f "$CONTAINER_NAME"
    else
        log_error "Container not running: $CONTAINER_NAME"
        exit 1
    fi
}

cleanup() {
    log_info "Cleaning up old images and containers..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old images (keep last 3 tags)
    if docker images "$IMAGE_NAME" --format "table {{.Tag}}" | tail -n +2 | wc -l | grep -q '^[3-9]'; then
        docker images "$IMAGE_NAME" --format "table {{.Tag}}" | tail -n +2 | tail -n +4 | \
        xargs -I {} docker rmi "$IMAGE_NAME:{}" 2>/dev/null || true
    fi
    
    log_success "Cleanup completed"
}

# Execute command
case "$COMMAND" in
    build)
        build_image
        ;;
    push)
        push_image
        ;;
    deploy)
        build_image
        if [[ "$REGISTRY" != "localhost" ]]; then
            push_image
        fi
        deploy_app
        ;;
    stop)
        stop_containers
        ;;
    logs)
        show_logs
        ;;
    health)
        check_health
        ;;
    cleanup)
        cleanup
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        exit 1
        ;;
esac