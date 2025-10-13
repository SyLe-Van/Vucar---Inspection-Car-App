#!/bin/bash
# Environment Manager for VuCar Application
# Supports local development, local build testing, and production deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_DIR="$PROJECT_ROOT/environments"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to show usage
show_usage() {
    echo "🔧 VuCar Environment Manager"
    echo "============================"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  local              Setup local development environment"
    echo "  local-build        Setup local build testing environment"
    echo "  production-setup   Setup production environment (first time)"
    echo "  production-load    Load production environment for deployment"
    echo "  production-system  Setup system-level production environment"
    echo "  status             Show current environment status"
    echo "  clean              Clean all environment files"
    echo ""
    echo "Examples:"
    echo "  $0 local                    # Setup for local development"
    echo "  $0 local-build              # Setup for local production build testing"
    echo "  $0 production-setup         # First time production setup"
    echo "  $0 production-load          # Load production env for deployment"
    echo "  $0 production-system        # Setup system-level env (for servers)"
}

# Function to setup local development environment
setup_local() {
    print_info "Setting up local development environment..."
    
    # Copy local environment file
    cp "$ENV_DIR/local/.env" "$PROJECT_ROOT/.env"
    
    print_status "Local development environment ready!"
    print_info "MongoDB: mongodb://localhost:27017/vucar_development"
    print_info "App URL: http://localhost:3000"
    print_info "Run: npm run dev"
}

# Function to setup local build testing
setup_local_build() {
    print_info "Setting up local build testing environment..."
    
    # Copy local environment file for build
    cp "$ENV_DIR/local/.env.local" "$PROJECT_ROOT/.env"
    
    print_status "Local build testing environment ready!"
    print_info "MongoDB: Uses .env.local configuration"
    print_info "Run: npm run build && npm start"
}

# Function to setup production environment (first time)
setup_production() {
    print_info "Setting up production environment..."
    
    # Create secure directory if not exists
    mkdir -p ~/.vucar-secure
    chmod 700 ~/.vucar-secure
    
    # Check if production environment already exists
    if [ -f ~/.vucar-secure/production.env ]; then
        print_warning "Production environment already exists at ~/.vucar-secure/production.env"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Setup cancelled."
            return 0
        fi
    fi
    
    # Copy template and ask user to edit
    cp "$ENV_DIR/production/.env.template" ~/.vucar-secure/production.env
    chmod 600 ~/.vucar-secure/production.env
    
    print_warning "Please edit the production environment file with your actual values:"
    print_info "File location: ~/.vucar-secure/production.env"
    print_info "After editing, run: $0 production-load"
    
    # Optionally open editor
    read -p "Do you want to edit the file now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} ~/.vucar-secure/production.env
    fi
}

# Function to load production environment for deployment
load_production() {
    print_info "Loading production environment for deployment..."
    
    if [ ! -f ~/.vucar-secure/production.env ]; then
        print_error "Production environment file not found!"
        print_info "Run: $0 production-setup"
        exit 1
    fi
    
    # Copy production environment
    cp ~/.vucar-secure/production.env "$PROJECT_ROOT/environments/production/.env.production"
    
    print_status "Production environment loaded!"
    print_info "File: environments/production/.env.production"
    print_info "Ready for deployment with: docker-compose -f deployment/docker/docker-compose.production.yml up -d"
}

# Function to setup system-level production environment
setup_production_system() {
    print_info "Setting up system-level production environment..."
    
    if [ ! -f ~/.vucar-secure/production.env ]; then
        print_error "Production environment file not found!"
        print_info "Run: $0 production-setup"
        exit 1
    fi
    
    print_warning "This will setup system-level environment variables."
    print_warning "This requires sudo privileges."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled."
        return 0
    fi
    
    # Setup system environment
    sudo cp ~/.vucar-secure/production.env /etc/environment
    sudo chmod 644 /etc/environment
    
    print_status "System-level environment variables setup complete!"
    print_info "Variables are available system-wide after reboot or re-login"
    print_info "For immediate effect, run: source /etc/environment"
}

# Function to show environment status
show_status() {
    print_info "VuCar Environment Status"
    echo "========================"
    
    # Check local environment
    if [ -f "$PROJECT_ROOT/.env" ]; then
        print_status "Local environment: Active"
        echo "  File: .env"
        echo "  NODE_ENV: $(grep NODE_ENV $PROJECT_ROOT/.env | cut -d'=' -f2)"
        echo "  MONGODB_URL: $(grep MONGODB_URL $PROJECT_ROOT/.env | cut -d'=' -f2)"
    else
        print_warning "Local environment: Not active"
    fi
    
    echo ""
    
    # Check production environment
    if [ -f "$PROJECT_ROOT/environments/production/.env.production" ]; then
        print_status "Production environment: Loaded"
        echo "  File: environments/production/.env.production"
    else
        print_warning "Production environment: Not loaded"
    fi
    
    echo ""
    
    # Check secure production environment
    if [ -f ~/.vucar-secure/production.env ]; then
        print_status "Secure production environment: Available"
        echo "  File: ~/.vucar-secure/production.env"
    else
        print_warning "Secure production environment: Not setup"
    fi
    
    echo ""
    
    # Check system environment
    if [ -f /etc/environment ] && grep -q "MONGODB_URL" /etc/environment 2>/dev/null; then
        print_status "System environment: Active"
        echo "  File: /etc/environment"
    else
        print_warning "System environment: Not setup"
    fi
}

# Function to clean environment files
clean_env() {
    print_warning "This will remove all environment files from the project root."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Clean cancelled."
        return 0
    fi
    
    rm -f "$PROJECT_ROOT/.env"
    rm -f "$PROJECT_ROOT/environments/production/.env.production" 2>/dev/null || true
    rm -f "$PROJECT_ROOT/.env.local"
    rm -f "$PROJECT_ROOT/.env.development"
    
    print_status "Environment files cleaned!"
}

# Main script logic
case "${1:-}" in
    "local")
        setup_local
        ;;
    "local-build")
        setup_local_build
        ;;
    "production-setup")
        setup_production
        ;;
    "production-load")
        load_production
        ;;
    "production-system")
        setup_production_system
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_env
        ;;
    *)
        show_usage
        exit 1
        ;;
esac