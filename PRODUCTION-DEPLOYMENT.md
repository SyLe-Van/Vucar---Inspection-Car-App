# VuCar Production Deployment Guide

## 🚀 Quick Setup Summary

This guide will take you from development to a fully deployed production application with auto-deployment on every commit.

### 🏗️ Architecture Overview

```
GitHub → Jenkins CI/CD → Docker Registry → Production Server (EC2)
   ↓           ↓              ↓               ↓
 Commit    Auto Build    Push Image     Auto Deploy
```

**Production Stack:**

- **Frontend/Backend**: Next.js application
- **Database**: MongoDB Atlas (Production Cluster)
- **Container**: Docker (syle712/vucar-app)
- **Reverse Proxy**: Nginx with SSL
- **CI/CD**: Jenkins with auto-trigger
- **Domain**: vucar.syledevops.live
- **SSL**: Let's Encrypt (auto-renewal)

---

## 📋 Prerequisites

- [ ] AWS EC2 instance (your current server)
- [ ] Domain pointed to EC2 IP: `vucar.syledevops.live`
- [ ] Jenkins running with Docker access
- [ ] MongoDB Atlas account
- [ ] Docker Hub account (syle712/vucar-app)

---

## 🚀 Production Deployment Steps

### 1. Setup MongoDB Atlas Production Cluster

```bash
./setup-mongodb-atlas.sh
```

**Key Configuration:**

- Cluster Name: `vucar-production`
- Tier: M10+ (production-ready)
- Region: `us-east-1` (or closest to your EC2)
- Database: `vucar_production`
- User: `vucar-prod-user`

### 2. Configure Production Environment

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required Variables:**

```env
MONGODB_URL=mongodb+srv://vucar-prod-user:PASSWORD@vucar-production.xxxxx.mongodb.net/vucar_production?retryWrites=true&w=majority
NEXTAUTH_URL=https://vucar.syledevops.live
NEXTAUTH_SECRET=your-super-secret-32-char-minimum
NODE_ENV=production
DOCKER_TAG=latest
```

### 3. Setup SSL Certificate

```bash
sudo ./setup-ssl.sh
```

This will:

- Install Certbot and Nginx
- Obtain SSL certificate for `vucar.syledevops.live`
- Configure Nginx with security headers
- Set up auto-renewal

### 4. Deploy to Production

```bash
# Manual deployment (first time)
./deploy-production.sh

# Or commit to trigger auto-deployment
git add .
git commit -m "Production deployment setup"
git push origin main
```

Jenkins will automatically:

1. Build and test the application
2. Create Docker image
3. Push to Docker registry
4. Deploy to production server
5. Run health checks

---

## 🔧 Configuration Files

### Docker Compose Production (`docker-compose.production.yml`)

- Production-optimized Next.js container
- Health checks and restart policies
- Network isolation
- Resource limits

### Nginx Configuration (`nginx.production.conf`)

- SSL/TLS termination
- Security headers (HSTS, CSP, etc.)
- Rate limiting
- Gzip compression
- Static file caching

### Deployment Script (`deploy-production.sh`)

- Backup current deployment
- Pull latest Docker image
- Rolling deployment
- Health checks
- Automatic rollback on failure

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```
GET https://vucar.syledevops.live/api/health
```

**Response (Healthy):**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "responseTime": "45ms",
  "environment": "production",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "name": "vucar_production",
    "collections": 3
  },
  "system": {
    "nodeVersion": "v18.19.0",
    "uptime": "3600s",
    "memoryUsage": {
      "rss": "156 MB",
      "heapUsed": "89 MB"
    }
  }
}
```

### Monitoring Commands

```bash
# Check application status
docker-compose ps

# View application logs
docker-compose logs -f vucar-app

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/vucar_error.log

# SSL certificate status
sudo certbot certificates
```

---

## 🔄 Auto-Deployment Workflow

### Current Setup

1. **Code Push** → GitHub main branch
2. **Auto-Trigger** → Jenkins webhook activates
3. **CI/CD Pipeline** → Build, test, and create Docker image
4. **Deploy** → Automatic deployment to production
5. **Health Check** → Verify application is running
6. **Notification** → Slack notification (optional)

### Jenkins Pipeline Stages

```
🔍 Initialize → 📦 Checkout → 🔍 Install Dependencies →
🔍 Code Quality → 🏗️ Build → 🐳 Docker Build →
📤 Push Image → 🚀 Deploy Production → ✅ Complete
```

---

## 🔧 Troubleshooting

### Common Issues

**1. SSL Certificate Issues**

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

**2. Application Not Starting**

```bash
# Check Docker container status
docker-compose ps

# View application logs
docker-compose logs vucar-app

# Restart application
docker-compose restart vucar-app
```

**3. Database Connection Issues**

```bash
# Test MongoDB connection
node test-db-connection.js

# Check network access in Atlas
# Verify IP address is whitelisted
curl -s http://checkip.amazonaws.com/
```

**4. Nginx Issues**

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

**5. Jenkins Pipeline Failures**

- Check Jenkins logs for specific error
- Verify Docker credentials are configured
- Ensure SSH keys are set up for production server
- Check environment variables in Jenkins

### Rollback Procedure

If deployment fails, the script automatically rolls back:

```bash
# Manual rollback to previous version
cd /opt/vucar-production
docker-compose down

# Restore from latest backup
LATEST_BACKUP=$(ls -t /opt/backups/vucar | head -n1)
rm -rf current
cp -r /opt/backups/vucar/$LATEST_BACKUP current
cd current
docker-compose up -d
```

---

## 📈 Performance Optimization

### Recommended Settings

**Nginx:**

- Gzip compression enabled
- Static file caching (30 days)
- Connection keep-alive
- Rate limiting configured

**MongoDB Atlas:**

- Connection pooling (configured in Next.js)
- Recommended indexes:
  ```javascript
  // Run create-indexes.js
  db.cars.createIndex({ createdAt: -1 });
  db.cars.createIndex({ status: 1 });
  db.inspections.createIndex({ carId: 1 });
  db.criteria.createIndex({ category: 1 });
  ```

**Docker:**

- Multi-stage builds for smaller images
- Memory limits configured
- Health checks enabled

---

## 🔐 Security Checklist

- [x] SSL/TLS encryption (Let's Encrypt)
- [x] Security headers (HSTS, CSP, X-Frame-Options)
- [x] Rate limiting on API endpoints
- [x] Database user with limited permissions
- [x] Network access restrictions (IP whitelist)
- [x] Environment variables for secrets
- [x] Regular security updates
- [x] Backup and disaster recovery plan

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Daily:**

- Monitor application health endpoint
- Check error logs

**Weekly:**

- Review MongoDB Atlas metrics
- Check SSL certificate status
- Monitor disk usage

**Monthly:**

- Update dependencies
- Review security logs
- Test backup restoration
- Rotate passwords/secrets

### Contact Information

- **Infrastructure**: Your DevOps Team
- **MongoDB Atlas**: [Atlas Support](https://support.mongodb.com/)
- **Let's Encrypt**: [Community Support](https://community.letsencrypt.org/)

---

## 📊 Cost Estimation

### Monthly Costs (Approximate)

- **MongoDB Atlas M10**: $57/month
- **SSL Certificate**: Free (Let's Encrypt)
- **Domain**: ~$10/year
- **EC2 Instance**: Existing (no additional cost)
- **Docker Hub**: Free (public repositories)

**Total Additional Cost**: ~$60/month

---

🎉 **Congratulations!** Your VuCar application is now production-ready with:

- Automatic deployments on every commit
- SSL encryption and security headers
- Production MongoDB Atlas cluster
- Health monitoring and automatic rollback
- Professional-grade infrastructure

**Production URL**: https://vucar.syledevops.live
