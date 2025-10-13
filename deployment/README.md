# VuCar Deployment & Infrastructure

This directory contains all deployment and infrastructure configurations for the VuCar application.

## 📁 Directory Structure

```
deployment/
├── docker/                     # Docker configurations
│   ├── docker-compose.yml     # Main Docker Compose
│   ├── docker-compose.dev.yml # Development environment
│   ├── docker-compose.production.yml  # Production environment
│   └── .dockerignore          # Docker ignore file
├── nginx/                     # Nginx configurations
│   └── nginx.production.conf  # Production Nginx config
└── scripts/                   # Deployment scripts
    ├── deploy-production.sh   # Production deployment
    ├── setup-mongodb-atlas.sh # MongoDB Atlas setup
    └── setup-ssl.sh          # SSL certificate setup

infrastructure/
└── ci-cd/                     # CI/CD configurations
    └── Jenkinsfile           # Jenkins pipeline
```

## 🚀 Deployment Commands

### Local Development

```bash
# Start development environment
docker-compose -f deployment/docker/docker-compose.dev.yml up

# Environment setup
npm run env:local
npm run dev
```

### Production Deployment

```bash
# Deploy to production
./deployment/scripts/deploy-production.sh

# Or with Docker Compose
docker-compose -f deployment/docker/docker-compose.production.yml up -d
```

### Infrastructure Setup

```bash
# Setup MongoDB Atlas
./deployment/scripts/setup-mongodb-atlas.sh

# Setup SSL certificates
./deployment/scripts/setup-ssl.sh
```

## 🔧 Configuration Files

### Docker Compose Files

- `docker-compose.yml` - Main configuration
- `docker-compose.dev.yml` - Development with hot reload
- `docker-compose.production.yml` - Production optimized

### Nginx Configuration

- `nginx.production.conf` - Production reverse proxy setup

### CI/CD Pipeline

- `Jenkinsfile` - Jenkins pipeline for automated deployment

## 📋 Deployment Checklist

### Before Deployment

- [ ] Update environment variables in `.env.production`
- [ ] Verify MongoDB Atlas connection
- [ ] Check SSL certificates
- [ ] Test application build
- [ ] Verify Docker images

### Production Deployment

- [ ] Run production deployment script
- [ ] Verify application health
- [ ] Check database connectivity
- [ ] Monitor application logs
- [ ] Test all endpoints

## 🔐 Security Notes

- Never commit `.env.production` to version control
- Use secure secrets management in production
- Regularly rotate API keys and secrets
- Monitor access logs and security events

## 📞 Support

For deployment issues:

- Check logs: `docker-compose logs`
- Health check: `curl http://localhost:3000/api/health`
- Contact: DevOps team
