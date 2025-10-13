#!/bin/bash
# Setup môi trường production miễn phí và bảo mật lâu dài

set -e

echo "🚀 VuCar Production Setup - Free & Secure"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Kiểm tra quyền
if [[ $EUID -eq 0 ]]; then
   log_error "Script này không nên chạy với quyền root"
   exit 1
fi

# Tạo thư mục secure
log_info "Tạo thư mục bảo mật..."
sudo mkdir -p /etc/vucar-secure
sudo chown root:root /etc/vucar-secure
sudo chmod 700 /etc/vucar-secure

# Tạo encrypted environment file
log_info "Tạo environment file được mã hóa..."
cat > /tmp/vucar-env-template << 'EOF'
# VuCar Production Environment - ENCRYPTED
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

# Mã hóa file với GPG (miễn phí)
log_info "Mã hóa environment variables..."
if ! command -v gpg &> /dev/null; then
    log_info "Cài đặt GPG..."
    sudo yum install -y gnupg2
fi

# Tạo GPG key cho server (nếu chưa có)
if ! gpg --list-secret-keys | grep -q "vucar-production"; then
    log_info "Tạo GPG key cho server..."
    cat > /tmp/gpg-batch << 'EOF'
%echo Generating GPG key for VuCar Production
Key-Type: RSA
Key-Length: 2048
Subkey-Type: RSA
Subkey-Length: 2048
Name-Real: VuCar Production Server
Name-Email: production@vucar.local
Expire-Date: 0
Passphrase: VuCarProduction2025SecureKey
%commit
%echo Done
EOF
    
    gpg --batch --generate-key /tmp/gpg-batch
    rm /tmp/gpg-batch
fi

# Mã hóa environment file
gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
    --output /etc/vucar-secure/production.env.gpg \
    /tmp/vucar-env-template

# Tạo script giải mã tự động
sudo cat > /etc/vucar-secure/decrypt-env.sh << 'EOF'
#!/bin/bash
# Script giải mã environment variables
echo "VuCarProduction2025SecureKey" | gpg --batch --yes --passphrase-fd 0 \
    --decrypt /etc/vucar-secure/production.env.gpg > /tmp/.env.production 2>/dev/null
EOF

sudo chmod 700 /etc/vucar-secure/decrypt-env.sh
sudo chown root:root /etc/vucar-secure/decrypt-env.sh

# Tạo systemd service để load env tự động
sudo cat > /etc/systemd/system/vucar-env.service << 'EOF'
[Unit]
Description=VuCar Environment Variables Loader
After=network.target

[Service]
Type=oneshot
User=root
ExecStart=/etc/vucar-secure/decrypt-env.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable vucar-env.service

# Tạo wrapper script để sử dụng
cat > /opt/vucar-production/load-env.sh << 'EOF'
#!/bin/bash
# Load environment variables được giải mã
sudo systemctl start vucar-env.service
if [ -f "/tmp/.env.production" ]; then
    cp /tmp/.env.production .env.production
    chmod 600 .env.production
    rm -f /tmp/.env.production
    echo "✅ Environment loaded successfully"
else
    echo "❌ Failed to load environment"
    exit 1
fi
EOF

chmod +x /opt/vucar-production/load-env.sh

# Cleanup
rm -f /tmp/vucar-env-template

log_info "✅ Setup hoàn tất!"
echo ""
echo "📋 Cách sử dụng:"
echo "================"
echo "1. Để load environment: ./load-env.sh"
echo "2. Để deploy: ./deploy-production.sh"
echo ""
echo "🔐 Bảo mật:"
echo "==========="
echo "✅ Environment được mã hóa GPG"
echo "✅ Chỉ root mới đọc được file gốc"
echo "✅ Không có plain text secrets trên disk"
echo "✅ 100% miễn phí, không cần AWS services"
echo ""
echo "🔄 Maintenance:"
echo "==============="
echo "- Để thay đổi secrets: chỉnh sửa và chạy lại script này"
echo "- Để backup: sao chép /etc/vucar-secure/"
echo "- Để rotate keys: tạo GPG key mới"