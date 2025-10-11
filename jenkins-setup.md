# Jenkins Pipeline Configuration for VuCar App

## Prerequisites

### 1. Jenkins Plugins Required

Install these plugins in Jenkins:

- Pipeline
- NodeJS Plugin
- Docker Pipeline Plugin
- SSH Agent Plugin
- Slack Notification Plugin
- GitHub Integration Plugin
- Blue Ocean (optional, for better UI)

### 2. Jenkins Global Configuration

#### NodeJS Installation

1. Go to `Manage Jenkins` → `Global Tool Configuration`
2. Add NodeJS installation named `Node-18`
3. Version: 18.x (latest LTS)

#### Docker Configuration

Ensure Docker is installed on Jenkins agent/master and Jenkins user has Docker permissions:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 3. Credentials Setup

Create these credentials in Jenkins (`Manage Jenkins` → `Manage Credentials`):

#### Docker Registry Credentials

- **ID**: `docker-registry-credentials`
- **Type**: Username with password
- **Username**: Your Docker registry username
- **Password**: Your Docker registry password/token

#### SSH Deployment Key

- **ID**: `ssh-deployment-key`
- **Type**: SSH Username with private key
- **Username**: Your server username (e.g., `ubuntu`, `ec2-user`)
- **Private Key**: Your deployment server SSH private key

#### Slack Webhook

- **ID**: `slack-webhook`
- **Type**: Secret text
- **Secret**: Your Slack webhook URL

### 4. Environment Variables to Configure

Update these variables in the Jenkinsfile environment section:

```groovy
environment {
    // Replace with your actual values
    DOCKER_REGISTRY = 'your-registry.com'  // e.g., 'docker.io', 'gcr.io/project'
    PRODUCTION_SERVER = 'your-production-server.com'
    STAGING_SERVER = 'your-staging-server.com'
    SLACK_CHANNEL = '#deployments'  // Your Slack channel
}
```

## Pipeline Features

### 🔄 Automated Triggers

- **SCM Polling**: Checks for changes every 5 minutes
- **Webhook**: Immediate builds on git push (configure in your Git provider)

### 🧪 Quality Assurance

- **Linting**: ESLint code quality checks
- **Security Audit**: npm audit for vulnerability scanning
- **Dependency Check**: Outdated package detection
- **Container Scanning**: Trivy security scan for Docker images

### 🚀 Deployment Strategy

- **Staging**: Auto-deploy from `develop` branch
- **Production**: Manual approval required for `main` branch deployments
- **Health Checks**: Automated application health verification

### 📦 Docker Integration

- **Multi-stage builds**: Optimized Docker images using your existing Dockerfile
- **Image tagging**: Build number and environment-specific tags
- **Registry push**: Automated image publishing

### 📊 Monitoring & Notifications

- **Slack Integration**: Build status notifications
- **Build History**: Keeps last 10 builds
- **Timeout Protection**: 30-minute build timeout

## Git Branch Strategy

The pipeline supports GitFlow branching:

- **`main`** → Production deployments (manual approval)
- **`develop`** → Staging deployments (automatic)
- **Feature branches** → Build and test only

## Deployment Modes

### Option 1: Docker Container (Current)

Simple container deployment with docker run commands.

### Option 2: Docker Compose (Recommended)

Create `docker-compose.yml` for more complex deployments:

```yaml
version: "3.8"
services:
  vucar-app:
    image: ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Option 3: Kubernetes (Advanced)

For Kubernetes deployments, replace the deployment function with kubectl commands.

## Security Best Practices

### 1. Secret Management

- Never hardcode credentials in Jenkinsfile
- Use Jenkins credentials store
- Rotate credentials regularly

### 2. Image Security

- Regular base image updates
- Vulnerability scanning with Trivy
- Non-root user in containers

### 3. Network Security

- Use private Docker registries
- Secure SSH connections
- HTTPS only for webhooks

## Monitoring & Troubleshooting

### Health Check Endpoint

Ensure your Next.js app has `/api/health` endpoint:

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

### Log Monitoring

Monitor application logs:

```bash
# On deployment server
docker logs vucar-app-production -f
```

## Customization

### Adding Tests

Uncomment and modify the test stage when you add tests:

```groovy
sh '''
    npm run test
    npm run test:coverage
'''
```

### Environment Variables

Add environment-specific variables in the deployment function:

```groovy
-e DATABASE_URL=\$DATABASE_URL \\
-e API_KEY=\$API_KEY \\
```

### Multiple Environments

Add more environments by extending the when conditions and adding new stages.
