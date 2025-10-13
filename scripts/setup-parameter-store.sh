#!/bin/bash
# Script tự động setup secrets trong AWS Parameter Store cho VuCar Production

set -e

echo "🚀 VuCar Production Secrets Setup"
echo "================================="

# Colors for output
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

# Kiểm tra AWS CLI
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI chưa được cài đặt. Chạy scripts/check-aws-permissions.sh trước"
    exit 1
fi

# Kiểm tra credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    log_error "AWS credentials chưa được cấu hình"
    exit 1
fi

log_info "Đang lưu production secrets vào AWS Parameter Store..."

# Production secrets
SECRETS=(
    "/vucar/production/mongodb-url|mongodb+srv://sycung9001:-pQk2Ht-%2ARdH7LT@cluster0.uy3at.mongodb.net/vucar_production?retryWrites=true&w=majority&appName=Cluster0"
    "/vucar/production/nextauth-secret|d76Bf+g8MmUAu0nKhs0Vsdky6UgqiHRHPNGvNLRMEiU="
    "/vucar/production/jwt-secret|+RX0Q3XeTKBOxwjep7oGwBB6hDBJ/09c7KCdOzNHrzc="
    "/vucar/production/encryption-key|6/ZAijAC+wngN2ueR++LUKkqW72kzgG6g9GUvcOUark="
    "/vucar/production/nextauth-url|https://vucar.syledevops.live"
    "/vucar/production/node-env|production"
    "/vucar/production/docker-registry|docker.io"
    "/vucar/production/docker-image|syle712/vucar-app"
)

# Lưu từng secret
for secret in "${SECRETS[@]}"; do
    IFS='|' read -r name value <<< "$secret"
    
    log_info "Lưu parameter: $name"
    
    # Kiểm tra nếu parameter đã tồn tại
    if aws ssm get-parameter --name "$name" > /dev/null 2>&1; then
        log_warn "Parameter $name đã tồn tại. Cập nhật..."
        aws ssm put-parameter \
            --name "$name" \
            --value "$value" \
            --type "SecureString" \
            --overwrite \
            --description "VuCar Production Environment Variable" > /dev/null
    else
        aws ssm put-parameter \
            --name "$name" \
            --value "$value" \
            --type "SecureString" \
            --description "VuCar Production Environment Variable" > /dev/null
    fi
done

log_info "✅ Tất cả secrets đã được lưu vào Parameter Store"

# Hiển thị danh sách parameters
echo ""
log_info "📋 Danh sách parameters đã tạo:"
aws ssm describe-parameters \
    --parameter-filters "Key=Name,Option=BeginsWith,Values=/vucar/production/" \
    --query 'Parameters[].Name' \
    --output table

# Test đọc một parameter
echo ""
log_info "🧪 Test đọc parameter (ẩn giá trị):"
MONGODB_URL=$(aws ssm get-parameter --name "/vucar/production/mongodb-url" --with-decryption --query 'Parameter.Value' --output text)
if [[ -n "$MONGODB_URL" ]]; then
    log_info "✅ Đọc parameter thành công"
    echo "MONGODB_URL: ${MONGODB_URL:0:30}..." # Chỉ hiện 30 ký tự đầu
else
    log_error "❌ Không thể đọc parameter"
    exit 1
fi

echo ""
log_info "🎉 Setup Parameter Store hoàn tất!"
log_info "💡 Bây giờ bạn có thể dùng script create-env-from-ssm.sh để tạo .env.production"