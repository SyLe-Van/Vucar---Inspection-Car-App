#!/bin/bash
# Script tạo .env.production từ AWS Parameter Store

echo "🔐 Đang lấy environment variables từ AWS Parameter Store..."

# Kiểm tra AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI chưa được cài đặt"
    exit 1
fi

# Tạo file .env.production
cat > .env.production << EOF
# Database Configuration
MONGODB_URL=$(aws ssm get-parameter --name "/vucar/production/mongodb-url" --with-decryption --query 'Parameter.Value' --output text)

# Application Configuration
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://vucar.syledevops.live

# Authentication
NEXTAUTH_SECRET=$(aws ssm get-parameter --name "/vucar/production/nextauth-secret" --with-decryption --query 'Parameter.Value' --output text)
JWT_SECRET=$(aws ssm get-parameter --name "/vucar/production/jwt-secret" --with-decryption --query 'Parameter.Value' --output text)

# Security
ENCRYPTION_KEY=$(aws ssm get-parameter --name "/vucar/production/encryption-key" --with-decryption --query 'Parameter.Value' --output text)

# Docker Configuration
DOCKER_REGISTRY=docker.io
DOCKER_IMAGE_NAME=syle712/vucar-app
DOCKER_TAG=latest
EOF

echo "✅ File .env.production đã được tạo từ AWS Parameter Store"