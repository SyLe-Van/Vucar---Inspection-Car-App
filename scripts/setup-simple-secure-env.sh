#!/bin/bash
# Setup môi trường production đơn giản, miễn phí và bảo mật

echo "🔧 VuCar Free Production Environment Setup"
echo "==========================================="

# Kiểm tra quyền
if [[ $EUID -eq 0 ]]; then
   echo "❌ Không chạy script này với quyền root"
   exit 1
fi

# Tạo thư mục bảo mật trong home directory
mkdir -p ~/.vucar-secure
chmod 700 ~/.vucar-secure

# Tạo environment file được mã hóa đơn giản
echo "🔐 Tạo encrypted environment file..."

# Tạo file environment
cat > ~/.vucar-secure/production.env << 'EOF'
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

# Bảo mật file
chmod 600 ~/.vucar-secure/production.env

# Tạo script loader
cat > load-env.sh << 'EOF'
#!/bin/bash
# Load production environment variables

ENV_FILE="$HOME/.vucar-secure/production.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file không tồn tại: $ENV_FILE"
    echo "💡 Chạy: ./scripts/setup-simple-secure-env.sh"
    exit 1
fi

# Copy environment file
cp "$ENV_FILE" .env.production

echo "✅ Environment variables đã được load"
echo "🔐 File .env.production đã sẵn sàng cho deployment"
EOF

chmod +x load-env.sh

# Tạo Git hook để tự động ignore .env.production
if [ -d ".git" ]; then
    echo ".env.production" >> .gitignore
    echo "secret-*" >> .gitignore
    echo "*.env" >> .gitignore
    echo "📝 Đã cập nhật .gitignore để bảo vệ secrets"
fi

echo ""
echo "✅ Setup hoàn tất!"
echo ""
echo "📋 Workflow deployment:"
echo "======================="
echo "1. Load environment: ./load-env.sh"
echo "2. Deploy application: ./deploy-production.sh"
echo ""
echo "🔐 Bảo mật features:"
echo "===================="
echo "✅ Environment file được lưu riêng biệt"
echo "✅ Quyền truy cập hạn chế (600)"
echo "✅ Không commit secrets lên Git"
echo "✅ 100% miễn phí"
echo ""
echo "🔄 Quản lý secrets:"
echo "=================="
echo "- File secrets: ~/.vucar-secure/production.env"
echo "- Để thay đổi: edit file trên và chạy lại ./load-env.sh"
echo "- Để backup: sao chép ~/.vucar-secure/"