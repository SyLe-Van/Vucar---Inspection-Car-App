#!/bin/bash
# Script tạo environment variables bảo mật trên EC2

echo "🔐 Tạo environment variables bảo mật cho VuCar Production"

# Tạo file environment chỉ root đọc được
sudo tee /etc/vucar-production.env > /dev/null << 'EOF'
# VuCar Production Environment Variables
MONGODB_URL=mongodb+srv://sycung9001:-pQk2Ht-%2ARdH7LT@cluster0.uy3at.mongodb.net/vucar_production?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET=d76Bf+g8MmUAu0nKhs0Vsdky6UgqiHRHPNGvNLRMEiU=
JWT_SECRET=+RX0Q3XeTKBOxwjep7oGwBB6hDBJ/09c7KCdOzNHrzc=
ENCRYPTION_KEY=6/ZAijAC+wngN2ueR++LUKkqW72kzgG6g9GUvcOUark=
NEXTAUTH_URL=https://vucar.syledevops.live
NODE_ENV=production
PORT=3000
DOCKER_REGISTRY=docker.io
DOCKER_IMAGE_NAME=syle712/vucar-app
DOCKER_TAG=latest
EOF

# Bảo mật file - chỉ root đọc được
sudo chmod 600 /etc/vucar-production.env
sudo chown root:root /etc/vucar-production.env

echo "✅ Environment file đã được tạo tại /etc/vucar-production.env"
echo "🔒 File được bảo vệ với quyền 600 (chỉ root đọc được)"

# Tạo symbolic link để docker-compose có thể đọc
sudo ln -sf /etc/vucar-production.env /opt/vucar-production/.env
sudo chown ec2-user:ec2-user /opt/vucar-production/.env

echo "🔗 Đã tạo symbolic link tại /opt/vucar-production/.env"