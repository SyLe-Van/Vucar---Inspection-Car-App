# VuCar Environment Management

Hệ thống quản lý environment variables linh hoạt cho VuCar application, hỗ trợ local development và production deployment.

## 📁 Cấu trúc Environment

```
environments/
├── local/
│   ├── .env                # Local development
│   └── .env.build         # Local build testing
└── production/
    └── .env.template      # Production template
```

## 🚀 Sử dụng Environment Manager

### Cài đặt Local Development

```bash
# Setup môi trường phát triển local
./scripts/env-manager.sh local

# Chạy application
npm run dev
```

### Test Production Build Locally

```bash
# Setup môi trường test build production
./scripts/env-manager.sh local-build

# Build và test
npm run build
npm start
```

### Production Deployment

#### Lần đầu setup production:

```bash
# 1. Tạo production environment
./scripts/env-manager.sh production-setup

# 2. Chỉnh sửa file với giá trị thật
nano ~/.vucar-secure/production.env

# 3. Load environment cho deployment
./scripts/env-manager.sh production-load
```

#### Deploy với Docker Compose:

```bash
# Production deployment
docker-compose -f docker-compose.production.yml up -d
```

#### Deploy với System Environment (recommended):

```bash
# Setup system-level environment variables
./scripts/env-manager.sh production-system

# Deploy với system environment
docker-compose up -d
```

## 🔧 Environment Manager Commands

| Command             | Mô tả                                      |
| ------------------- | ------------------------------------------ |
| `local`             | Setup local development environment        |
| `local-build`       | Setup local build testing environment      |
| `production-setup`  | Tạo production environment (lần đầu)       |
| `production-load`   | Load production environment cho deployment |
| `production-system` | Setup system-level production environment  |
| `status`            | Hiển thị trạng thái environment hiện tại   |
| `clean`             | Xóa tất cả environment files               |

## 🔐 Bảo mật Environment Variables

### Local Development

- File environment lưu trong `environments/local/`
- Không chứa secrets thật
- An toàn để commit lên Git

### Production

- Secrets lưu trong `~/.vucar-secure/production.env` (permission 600)
- Hoặc system-level environment variables (`/etc/environment`)
- Không bao giờ commit production secrets

## 🐳 Docker Build Arguments

Dockerfile hỗ trợ build arguments linh hoạt:

```bash
# Local build
docker build -t vucar-app:local .

# Production build với custom arguments
docker build \
  --build-arg MONGODB_URL="mongodb+srv://..." \
  --build-arg NEXTAUTH_SECRET="production-secret" \
  --build-arg NODE_ENV="production" \
  -t vucar-app:production .
```

## 📊 Environment Status

Kiểm tra trạng thái environment:

```bash
./scripts/env-manager.sh status
```

## 🔄 Workflow Examples

### Developer Workflow

```bash
# 1. Clone repo
git clone <repo-url>
cd vucar-app

# 2. Setup local environment
./scripts/env-manager.sh local

# 3. Install dependencies
npm install

# 4. Start development
npm run dev
```

### Production Deployment Workflow

```bash
# 1. Setup production environment (one time)
./scripts/env-manager.sh production-setup

# 2. Edit production values
nano ~/.vucar-secure/production.env

# 3. Deploy with system environment
./scripts/env-manager.sh production-system

# 4. Deploy application
docker-compose up -d
```

### Testing Production Build Locally

```bash
# 1. Setup local build environment
./scripts/env-manager.sh local-build

# 2. Build and test
docker build -t vucar-test .
docker run -p 3000:3000 vucar-test
```

## ⚠️ Lưu ý quan trọng

1. **Không commit secrets**: Luôn kiểm tra `.gitignore` trước khi commit
2. **Backup production env**: Sao lưu `~/.vucar-secure/production.env`
3. **System environment**: Khuyến nghị sử dụng system-level env cho production
4. **Permission**: File production environment phải có permission 600
5. **MongoDB connection**: Đảm bảo MongoDB URL đúng cho từng môi trường
