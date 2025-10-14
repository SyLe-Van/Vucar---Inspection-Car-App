# VuCar - Professional Car Inspection Management System

A comprehensive car inspection management platform built with Next.js, TypeScript, and MongoDB Atlas. Features enterprise-grade architecture with automated CI/CD pipeline deployment to AWS EC2.

🌐 **Production:** https://vucar.syledevops.live  
� **Docker Hub:** [syle712/vucar-app](https://hub.docker.com/r/syle712/vucar-app)  
�🚀 **CI/CD:** Jenkins Pipeline with automated deployment

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Development](#-development)
- [Docker Deployment](#-docker-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Production Deployment](#-production-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Features

### Core Functionality

- **Car Management:** Create, update, and track vehicle information
- **Inspection Criteria:** Define and manage inspection parameters
- **Inspection System:** Conduct comprehensive vehicle inspections
- **Real-time Updates:** Redux state management for seamless UX

### Technical Features

- **TypeScript:** Full type safety across the application
- **Responsive Design:** Material-UI components with SCSS modules
- **API Versioning:** v1 and v2 API endpoints
- **Database Indexing:** Optimized MongoDB queries
- **Health Checks:** API endpoint monitoring
- **Containerization:** Multi-stage Docker builds
- **CI/CD Automation:** Jenkins pipeline with branch-specific workflows
- **Production Ready:** SSL, Nginx reverse proxy, AWS EC2 hosting

---

## 🛠 Technology Stack

### Frontend

- **Next.js 14.2.5** - React framework with SSR/SSG
- **TypeScript 5.x** - Static type checking
- **Material-UI (@mui/material)** - UI component library
- **Redux Toolkit** - State management
- **SCSS Modules** - Component-scoped styling

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud database
- **Mongoose 8.0.3** - MongoDB ODM

### DevOps & Infrastructure

- **Docker** - Containerization (multi-arch: ARM64/AMD64)
- **Docker Hub** - Container registry
- **Jenkins** - CI/CD automation
- **Nginx** - Reverse proxy server
- **Let's Encrypt** - SSL/TLS certificates
- **AWS EC2** - Production hosting (Amazon Linux 2)
- **DNS** - Custom domain (vucar.syledevops.live)

### Testing

- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing
- **React Testing Library** - Component testing

---

## 📁 Project Structure

```
VucarApp/
├── config/                      # Configuration files
│   └── app.ts                  # Environment validation & MongoDB config
├── deployment/                  # Production deployment files
│   ├── docker/                 # Docker Compose configurations
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   └── docker-compose.production.yml
│   ├── nginx/                  # Nginx configuration
│   │   └── nginx.production.conf
│   └── scripts/                # Deployment automation scripts
│       ├── deploy-production.sh
│       ├── setup-mongodb-atlas.sh
│       └── setup-ssl.sh
├── docs/                        # Documentation
│   └── api/                    # API documentation
├── scripts/                     # Utility scripts
│   ├── check-aws-permissions.sh
│   ├── create-env-from-ssm.sh
│   ├── env-manager.sh
│   └── setup-free-secure-env.sh
├── src/
│   ├── components/             # React components
│   │   ├── features/          # Feature-specific components
│   │   │   ├── car/          # Car management
│   │   │   ├── criteria/     # Inspection criteria
│   │   │   └── inspection/   # Inspection system
│   │   ├── layout/           # Layout components (Sidebar, etc.)
│   │   └── ui/               # Reusable UI components
│   ├── lib/                   # Core libraries
│   │   ├── constants/        # Application constants
│   │   ├── database/         # MongoDB models & connection
│   │   │   ├── db.js        # Database connection
│   │   │   ├── Car.js       # Car model
│   │   │   ├── Criteria.js  # Criteria model
│   │   │   └── Inspection.js # Inspection model
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── validations/     # Input validation schemas
│   ├── pages/                # Next.js pages (file-based routing)
│   │   ├── _app.js          # App wrapper
│   │   ├── index.js         # Homepage
│   │   ├── cars.js          # Cars listing page
│   │   ├── criteria.js      # Criteria page
│   │   ├── car/
│   │   │   └── [slug].js    # Dynamic car detail page
│   │   └── api/             # API routes
│   │       ├── health.js    # Health check endpoint
│   │       ├── v1/          # API version 1
│   │       │   ├── car.js
│   │       │   ├── criteria.js
│   │       │   └── inspection.js
│   │       └── v2/          # API version 2 (future)
│   ├── store/                # Redux state management
│   │   ├── index.js         # Store configuration
│   │   ├── carSlice.js      # Car state slice
│   │   └── ExpandSlice.js   # UI state slice
│   ├── styles/              # Global styles
│   │   ├── globals.scss     # Global CSS
│   │   └── base.scss        # Base styles
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Shared types
├── tests/                   # Test files
│   ├── e2e/                # End-to-end tests (Playwright)
│   ├── integration/        # Integration tests
│   └── unit/               # Unit tests (Jest)
├── Dockerfile              # Multi-stage production Dockerfile
├── docker-compose.yml      # Local development Docker Compose
├── Jenkinsfile             # CI/CD pipeline definition
├── next.config.mjs         # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── jest.config.js          # Jest configuration
├── playwright.config.ts    # Playwright configuration
└── package.json            # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **MongoDB Atlas** account (or local MongoDB)
- **Docker** (optional, for containerized development)
- **Git**

### Local Development Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd VucarApp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables:**

   ```bash
   # Create environment file
   cp .env.example .env.local

   # Edit .env.local with your values
   nano .env.local
   ```

4. **Set up MongoDB indexes:**

   ```bash
   node create-indexes.js
   ```

5. **Run development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env.local` file (for development) or `.env.production` (for production):

```bash
# MongoDB Connection
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Application Environment
NODE_ENV=development  # or 'production'

# Optional: Custom Port
PORT=3000
```

### Environment Files

The project uses different environment files for different contexts:

- **`.env.local`** - Local development (not tracked in Git)
- **`.env.production`** - Production deployment (not tracked in Git)
- **`.env.build`** - Build-time variables for Docker (not tracked in Git)
- **`.env.example`** - Template file (not tracked in Git, for reference only)

**Note:** All `.env.*` files are gitignored except `.env.example`. Environment variables are managed through AWS Parameter Store or direct file creation on the server.

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Copy the connection string and replace `<username>`, `<password>`, and `<database>`

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build        # Build production bundle
npm run start        # Start production server

# Testing
npm run test         # Run Jest unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright E2E tests

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database
node create-indexes.js       # Create MongoDB indexes
node test-db-connection.js   # Test database connection
```

### Development Workflow

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally:**

   ```bash
   npm run dev
   npm run test
   ```

3. **Commit changes:**

   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push to remote:**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Merge to `dev` branch:**

   ```bash
   git checkout dev
   git merge feature/your-feature-name
   git push origin dev
   ```

6. **Jenkins automatically builds and deploys to staging**

---

## 🐳 Docker Deployment

### Local Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Building Production Docker Image

```bash
# Build for AMD64 (production server architecture)
docker build --platform linux/amd64 -t syle712/vucar-app:latest .

# Build for ARM64 (Mac M1/M2)
docker build --platform linux/arm64 -t syle712/vucar-app:latest .

# Multi-architecture build
docker buildx build --platform linux/amd64,linux/arm64 -t syle712/vucar-app:latest . --push
```

### Pushing to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag vucar-app:latest syle712/vucar-app:latest

# Push to registry
docker push syle712/vucar-app:latest
```

### Running Production Container

```bash
# Pull image from Docker Hub
docker pull syle712/vucar-app:latest

# Run container
docker run -d \
  --name vucar-app \
  -p 3000:3000 \
  -e MONGODB_URL="your_mongodb_connection_string" \
  -e NODE_ENV=production \
  syle712/vucar-app:latest

# Check logs
docker logs -f vucar-app

# Stop container
docker stop vucar-app
docker rm vucar-app
```

---

## 🔄 CI/CD Pipeline

### Jenkins Pipeline Overview

The project uses a Jenkins declarative pipeline with branch-specific behavior:

#### Branch Strategy

- **`dev` branch:** Automatic build and deploy to staging environment
- **`main` branch:** Manual approval required before production deployment

#### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Checkout                                                 │
│    - Clone repository                                       │
│    - Checkout appropriate branch                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Setup Environment                                        │
│    - Calculate NODE_ENV (dev → development, main → production)│
│    - Create .env file for build process                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Install Dependencies                                     │
│    - npm ci (clean install)                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Run Tests                                                │
│    - npm run test                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Build Application                                        │
│    - npm run build                                          │
│    - Create production-optimized Next.js bundle             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Build & Push Docker Image                                │
│    - Build for linux/amd64 platform                         │
│    - Tag: syle712/vucar-app:latest                          │
│    - Push to Docker Hub                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Approval Gate (main branch only)                         │
│    - Manual approval required for production                │
│    - dev branch: Skip this stage                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Deploy                                                   │
│    - SSH to production server (3.0.19.202)                  │
│    - Pull latest Docker image                               │
│    - Stop old container                                     │
│    - Start new container                                    │
└─────────────────────────────────────────────────────────────┘
```

### Jenkinsfile Configuration

The `Jenkinsfile` contains:

- Environment-aware build process
- Docker multi-platform support
- SSH-based deployment to EC2
- Conditional approval gates
- Automatic cleanup and rollback on failure

### Triggering Deployments

1. **Development Deployment (Automatic):**

   ```bash
   git checkout dev
   # Make changes
   git add .
   git commit -m "feat: new feature"
   git push origin dev
   # Jenkins automatically builds and deploys
   ```

2. **Production Deployment (Manual Approval):**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   # Jenkins builds and waits for manual approval
   # Approve in Jenkins UI to deploy to production
   ```

---

## 🌐 Production Deployment

### Infrastructure

- **Server:** AWS EC2 (Amazon Linux 2)
- **IP Address:** 3.0.19.202
- **Domain:** vucar.syledevops.live
- **SSL:** Let's Encrypt (Certbot)
- **Reverse Proxy:** Nginx
- **Container Runtime:** Docker

### Initial Server Setup

1. **Connect to EC2 server:**

   ```bash
   ssh ec2-user@3.0.19.202
   ```

2. **Install Docker:**

   ```bash
   sudo yum update -y
   sudo yum install docker -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ec2-user
   ```

3. **Install Nginx:**

   ```bash
   sudo amazon-linux-extras install nginx1 -y
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

4. **Configure DNS:**
   - Create A record: `vucar.syledevops.live` → `3.0.19.202`

5. **Setup Nginx reverse proxy:**

   ```bash
   sudo cp deployment/nginx/nginx.production.conf /etc/nginx/conf.d/vucar.conf
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Install SSL certificate:**
   ```bash
   sudo yum install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d vucar.syledevops.live
   ```

### Manual Production Deployment

If you need to deploy manually without Jenkins:

```bash
# SSH to server
ssh ec2-user@3.0.19.202

# Pull latest image
docker pull syle712/vucar-app:latest

# Stop and remove old container
docker stop vucar-app || true
docker rm vucar-app || true

# Create .env.production file
cat > .env.production << EOF
MONGODB_URL=your_mongodb_connection_string
NODE_ENV=production
EOF

# Run new container
docker run -d \
  --name vucar-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  syle712/vucar-app:latest

# Verify deployment
docker logs -f vucar-app
curl http://localhost:3000/api/health
```

### Health Checks

```bash
# API health check
curl http://vucar.syledevops.live/api/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z","database":"connected"}

# Container status
docker ps | grep vucar-app

# View logs
docker logs --tail 100 -f vucar-app
```

---

## 📚 API Documentation

### Base URL

- **Production:** `https://vucar.syledevops.live/api`
- **Development:** `http://localhost:3000/api`

### API Versioning

The API supports versioning through URL paths:

- **v1:** `/api/v1/` - Current stable version
- **v2:** `/api/v2/` - Future version (planned)

### Endpoints

#### Health Check

```http
GET /api/health
```

Returns application health status and database connectivity.

#### Cars API (v1)

```http
# Get all cars
GET /api/v1/car

# Get car by ID
GET /api/v1/car?id={carId}

# Create new car
POST /api/v1/car
Content-Type: application/json
{
  "licensePlate": "ABC-123",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2023,
  "color": "White"
}

# Update car
PUT /api/v1/car
Content-Type: application/json
{
  "id": "car_id",
  "licensePlate": "ABC-123",
  "brand": "Toyota"
}

# Delete car
DELETE /api/v1/car?id={carId}
```

#### Criteria API (v1)

```http
# Get all criteria
GET /api/v1/criteria

# Create criterion
POST /api/v1/criteria
Content-Type: application/json
{
  "name": "Brake System",
  "description": "Check brake pads and fluid",
  "category": "Safety"
}
```

#### Inspection API (v1)

```http
# Get all inspections
GET /api/v1/inspection

# Create inspection
POST /api/v1/inspection
Content-Type: application/json
{
  "carId": "car_id",
  "criteriaId": "criteria_id",
  "status": "pass",
  "notes": "All systems operational"
}
```

---

## 🧪 Testing

### Unit Testing (Jest)

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### E2E Testing (Playwright)

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/app.spec.ts
```

### Testing Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── app.spec.ts        # Application flow tests
├── integration/           # Integration tests
│   └── api/              # API integration tests
└── unit/                 # Unit tests
    ├── components/       # Component tests
    ├── lib/             # Library tests
    └── utils/           # Utility function tests
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Symptom:** `MongooseError: Could not connect to MongoDB`

**Solutions:**

- Verify `MONGODB_URL` in your `.env` file
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for development)
- Ensure database user has correct permissions
- Test connection: `node test-db-connection.js`

#### 2. Docker Build Fails

**Symptom:** Build errors during Docker image creation

**Solutions:**

```bash
# Clear Docker cache
docker builder prune

# Build with no cache
docker build --no-cache -t vucar-app .

# Check platform compatibility
docker build --platform linux/amd64 -t vucar-app .
```

#### 3. Port Already in Use

**Symptom:** `EADDRINUSE: address already in use :::3000`

**Solutions:**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### 4. Nginx Port 80 Conflict

**Symptom:** `bind() to 0.0.0.0:80 failed (98: Address already in use)`

**Solutions:**

```bash
# Check what's using port 80
sudo netstat -tulpn | grep :80

# Stop old Nginx instance
sudo systemctl stop nginx

# Kill specific process
sudo kill -9 <PID>

# Restart Nginx
sudo systemctl start nginx
```

#### 5. Container Exits Immediately

**Symptom:** Docker container stops right after starting

**Solutions:**

```bash
# Check logs
docker logs vucar-app

# Run container in foreground for debugging
docker run -it --rm vucar-app

# Verify environment variables
docker exec vucar-app env
```

#### 6. TypeScript Build Errors

**Symptom:** Type errors during build

**Solutions:**

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild TypeScript cache
rm -rf tsconfig.tsbuildinfo

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 7. Jenkins Build Fails

**Symptom:** Pipeline fails at specific stage

**Solutions:**

- Check Jenkins console output for specific error
- Verify Jenkins has Docker permissions
- Ensure Docker Hub credentials are configured in Jenkins
- Check SSH connectivity to production server
- Verify MongoDB connection string is accessible to Jenkins

### Debugging Tools

```bash
# Check application health
curl http://localhost:3000/api/health

# View Docker logs
docker logs -f vucar-app

# Check MongoDB connection
node test-db-connection.js

# Verify environment variables
node -e "console.log(process.env)"

# Test Nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates
```

### Getting Help

- **Documentation:** Check `docs/` directory
- **Issues:** Open an issue on the repository
- **Logs:** Always include relevant logs when reporting issues

---

## 📄 License

This project is private and proprietary.

---

## 👥 Contributors

- Development Team
- DevOps Team

---

## 📝 Changelog

### Latest Updates

- ✅ Simplified environment configuration (removed unused auth variables)
- ✅ Configured CI/CD pipeline with Jenkins
- ✅ Set up production deployment on AWS EC2
- ✅ Configured DNS and reverse proxy with Nginx
- ✅ Multi-architecture Docker support (ARM64/AMD64)
- ✅ Docker Hub integration for image registry

### Upcoming

- 🔄 Complete SSL certificate setup
- 🔄 API v2 implementation
- 🔄 Enhanced monitoring and logging
- 🔄 Automated database backups
- 🔄 Performance optimization

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
