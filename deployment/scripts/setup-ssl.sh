#!/bin/bash
# SSL Setup Script for VuCar Production

set -e

echo "🔒 VuCar SSL Setup"
echo "=================="

# Configuration
DOMAIN="vucar.syledevops.live"
EMAIL="admin@syledevops.live"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
CERTBOT_DIR="/etc/letsencrypt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

# Install Certbot and Nginx plugin
log_info "Installing Certbot and dependencies..."
apt update
apt install -y certbot python3-certbot-nginx nginx

# Ensure Nginx is running
log_info "Starting Nginx service..."
systemctl start nginx
systemctl enable nginx

# Create initial Nginx configuration (HTTP only for initial setup)
log_info "Creating initial Nginx configuration..."
cat > $NGINX_CONF_DIR/vucar-app << 'EOF'
server {
    listen 80;
    server_name vucar.syledevops.live;
    
    # Temporary redirect for Certbot verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Enable the site
ln -sf $NGINX_CONF_DIR/vucar-app $NGINX_ENABLED_DIR/
nginx -t && systemctl reload nginx

log_info "Testing domain accessibility..."
if ! curl -I http://$DOMAIN 2>/dev/null | grep -q "HTTP"; then
    log_warn "Domain $DOMAIN may not be properly configured in DNS"
    log_warn "Please ensure the domain points to this server's IP address"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Obtain SSL certificate
log_info "Obtaining SSL certificate for $DOMAIN..."
certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --domains $DOMAIN

# Check if certificate was obtained successfully
if [ ! -d "$CERTBOT_DIR/live/$DOMAIN" ]; then
    log_error "Failed to obtain SSL certificate"
    exit 1
fi

log_info "✅ SSL certificate obtained successfully!"

# Update Nginx configuration with SSL
log_info "Updating Nginx configuration with SSL..."
cat > $NGINX_CONF_DIR/vucar-app << 'EOF'
# VuCar Production - SSL Configuration
upstream vucar_app {
    server localhost:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name vucar.syledevops.live;
    
    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name vucar.syledevops.live;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/vucar.syledevops.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vucar.syledevops.live/privkey.pem;
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/vucar.syledevops.live/chain.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Main application
    location / {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        # Proxy settings
        proxy_pass http://vucar_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # API endpoints with stricter rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        
        proxy_pass http://vucar_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint (no rate limiting)
    location /api/health {
        proxy_pass http://vucar_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache health check responses briefly
        add_header Cache-Control "public, max-age=60";
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://vucar_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static files for 30 days
        add_header Cache-Control "public, max-age=2592000";
        expires 30d;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Custom error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
        internal;
    }
    
    # Logging
    access_log /var/log/nginx/vucar_access.log;
    error_log /var/log/nginx/vucar_error.log warn;
}
EOF

# Test Nginx configuration
log_info "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    log_info "✅ Nginx configuration is valid"
    systemctl reload nginx
else
    log_error "❌ Nginx configuration is invalid"
    exit 1
fi

# Set up automatic certificate renewal
log_info "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && /usr/bin/systemctl reload nginx") | crontab -

# Create custom error page
log_info "Creating custom error pages..."
mkdir -p /var/www/html
cat > /var/www/html/50x.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>VuCar - Service Temporarily Unavailable</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .logo { font-size: 2em; color: #007bff; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚗 VuCar</div>
        <h1>Service Temporarily Unavailable</h1>
        <p>We're currently performing maintenance or experiencing high traffic. Please try again in a few minutes.</p>
        <p>If the problem persists, please contact our support team.</p>
    </div>
</body>
</html>
EOF

# Display final status
log_info "🎉 SSL setup completed successfully!"
echo ""
echo "📊 SSL Configuration Summary:"
echo "============================="
echo "Domain: $DOMAIN"
echo "Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo "Nginx Config: $NGINX_CONF_DIR/vucar-app"
echo "Auto-renewal: Configured (daily check at 12:00)"
echo ""
echo "🔍 Certificate Information:"
openssl x509 -in /etc/letsencrypt/live/$DOMAIN/cert.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
echo ""
echo "✅ Your VuCar application is now secured with SSL!"
echo "🌐 Access your application at: https://$DOMAIN"

# Test HTTPS connection
log_info "Testing HTTPS connection..."
if curl -I https://$DOMAIN 2>/dev/null | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    log_info "✅ HTTPS connection test successful!"
else
    log_warn "⚠️  HTTPS connection test failed - please check your application is running"
fi