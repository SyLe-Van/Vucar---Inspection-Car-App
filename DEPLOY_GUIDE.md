# 🚀 Hướng Dẫn Triển Khai VuCar App

## 📋 Yêu Cầu Trước Khi Bắt Đầu

### 1. Cài Đặt Jenkins

```bash
# Cài đặt Java (yêu cầu cho Jenkins)
sudo apt update
sudo apt install openjdk-11-jdk

# Cài đặt Jenkins
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins

# Khởi động Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### 2. Cài Đặt Docker

```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user jenkins vào group docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Cài Đặt Node.js

```bash
# Cài đặt Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## 🔧 Cấu Hình Jenkins

### Bước 1: Truy Cập Jenkins

1. Mở trình duyệt và truy cập: `http://your-server:8080`
2. Lấy mật khẩu khởi tạo:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Bước 2: Cài Đặt Plugins

Vào `Manage Jenkins` → `Manage Plugins` và cài đặt:

- Pipeline
- NodeJS Plugin
- Docker Pipeline Plugin
- SSH Agent Plugin
- Slack Notification Plugin
- GitHub Integration Plugin
- Blue Ocean (tùy chọn)

### Bước 3: Cấu Hình Global Tools

Vào `Manage Jenkins` → `Global Tool Configuration`:

#### NodeJS

- Tên: `Node-18`
- Phiên bản: 18.x LTS
- ✅ Tự động cài đặt

#### Docker

- Tên: `docker`
- ✅ Tự động cài đặt từ docker.com

### Bước 4: Tạo Credentials

Vào `Manage Jenkins` → `Manage Credentials` → `Global`:

#### Docker Registry

- **ID**: `docker-registry-credentials`
- **Loại**: Username with password
- **Username**: Tên đăng nhập Docker Hub
- **Password**: Mật khẩu hoặc token

#### SSH Key cho Server

- **ID**: `ssh-deployment-key`
- **Loại**: SSH Username with private key
- **Username**: `ubuntu` (hoặc user của server)
- **Private Key**: Paste SSH private key

#### Slack Webhook (tùy chọn)

- **ID**: `slack-webhook`
- **Loại**: Secret text
- **Secret**: Slack webhook URL

## 🏗️ Tạo Pipeline Job

### Bước 1: Tạo Job Mới

1. Vào Jenkins Dashboard → `New Item`
2. Nhập tên: `VuCar-App-Pipeline`
3. Chọn `Pipeline` → `OK`

### Bước 2: Cấu Hình Pipeline

#### General

- ✅ GitHub project: `https://github.com/SyLe-Van/Vucar---Inspection-Car-App`
- ✅ Discard old builds: Giữ 10 builds gần nhất

#### Build Triggers

- ✅ Poll SCM: `H/5 * * * *` (kiểm tra mỗi 5 phút)

#### Pipeline

- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/SyLe-Van/Vucar---Inspection-Car-App.git`
- **Credentials**: Thêm GitHub credentials nếu repo private
- **Branch**: `*/main`
- **Script Path**: `Jenkinsfile`

## 🖥️ Chuẩn Bị Server Triển Khai

### Bước 1: Cài Đặt Docker trên Server

```bash
# SSH vào server production
ssh ubuntu@your-production-server

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài đặt Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Bước 2: Tạo Thư Mục Ứng Dụng

```bash
# Tạo thư mục cho ứng dụng
sudo mkdir -p /opt/vucar-app
sudo chown $USER:$USER /opt/vucar-app
cd /opt/vucar-app
```

## 🚀 Triển Khai Thực Tế

### Phương Án 1: Triển Khai Thủ Công (Test)

#### Bước 1: Clone Code

```bash
git clone https://github.com/SyLe-Van/Vucar---Inspection-Car-App.git
cd Vucar---Inspection-Car-App
```

#### Bước 2: Tạo File Environment

```bash
# Tạo file .env.local
cat > .env.local << EOF
NODE_ENV=production
PORT=3000
# Thêm các biến môi trường khác nếu cần
EOF
```

#### Bước 3: Build và Chạy Docker

```bash
# Build Docker image
docker build -t vucar-app:latest .

# Chạy container
docker run -d \
  --name vucar-app-production \
  -p 80:3000 \
  --env-file .env.local \
  --restart unless-stopped \
  vucar-app:latest

# Kiểm tra container
docker logs vucar-app-production
```

### Phương Án 2: Triển Khai với Docker Compose (Khuyến nghị)

#### Bước 1: Tạo docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  vucar-app:
    image: vucar-app:latest
    container_name: vucar-app-production
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Thêm database nếu cần
  # mongodb:
  #   image: mongo:5
  #   container_name: vucar-mongodb
  #   ports:
  #     - "27017:27017"
  #   environment:
  #     - MONGO_INITDB_ROOT_USERNAME=admin
  #     - MONGO_INITDB_ROOT_PASSWORD=password
  #   volumes:
  #     - mongodb_data:/data/db
  #   restart: unless-stopped

# volumes:
#   mongodb_data:
EOF
```

#### Bước 2: Chạy với Docker Compose

```bash
# Chạy ứng dụng
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f vucar-app

# Kiểm tra trạng thái
docker-compose ps
```

## 🔧 Cấu Hình Nginx (Reverse Proxy)

### Bước 1: Cài Đặt Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Bước 2: Cấu Hình Virtual Host

```bash
sudo nano /etc/nginx/sites-available/vucar-app
```

Nội dung file:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Bước 3: Kích Hoạt Site

```bash
sudo ln -s /etc/nginx/sites-available/vucar-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Cấu Hình SSL (HTTPS)

### Sử Dụng Let's Encrypt

```bash
# Cài đặt Certbot
sudo apt install snapd
sudo snap install --classic certbot

# Tạo SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Tự động gia hạn
sudo crontab -e
# Thêm dòng sau:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔄 Triển Khai Tự Động với Jenkins

### Bước 1: Cập Nhật Jenkinsfile

Chỉnh sửa biến môi trường trong `Jenkinsfile`:

```groovy
environment {
    DOCKER_REGISTRY = 'docker.io'  // hoặc registry của bạn
    DOCKER_IMAGE_NAME = 'your-username/vucar-app'
    PRODUCTION_SERVER = 'your-production-server.com'
    STAGING_SERVER = 'your-staging-server.com'
    SLACK_CHANNEL = '#deployments'
}
```

### Bước 2: Thiết Lập Webhook

1. Vào GitHub repo → `Settings` → `Webhooks`
2. Thêm webhook: `http://your-jenkins-server:8080/github-webhook/`
3. Content type: `application/json`
4. Events: `Just the push event`

### Bước 3: Test Pipeline

1. Push code lên GitHub
2. Vào Jenkins → `VuCar-App-Pipeline`
3. Kiểm tra build status và logs

## 📊 Monitoring và Maintenance

### Kiểm Tra Health Check

```bash
# Kiểm tra ứng dụng có hoạt động không
curl http://your-domain.com/api/health

# Kết quả mong đợi
{
  "status": "healthy",
  "timestamp": "2025-10-11T...",
  "version": "1.0.0"
}
```

### Xem Logs

```bash
# Docker logs
docker logs vucar-app-production -f

# Docker Compose logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Database (nếu có)

```bash
# MongoDB backup example
docker exec vucar-mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)
```

## 🆘 Troubleshooting

### Lỗi thường gặp:

#### 1. Container không start

```bash
# Kiểm tra logs
docker logs vucar-app-production

# Kiểm tra port
sudo netstat -tulpn | grep :3000

# Restart container
docker restart vucar-app-production
```

#### 2. Jenkins build fail

```bash
# Kiểm tra Jenkins logs
sudo journalctl -u jenkins -f

# Kiểm tra workspace
ls -la /var/lib/jenkins/workspace/VuCar-App-Pipeline/
```

#### 3. Nginx 502 Bad Gateway

```bash
# Kiểm tra ứng dụng có chạy không
curl http://localhost:3000

# Kiểm tra Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 📚 Các Lệnh Hữu Ích

### Docker

```bash
# Xem tất cả containers
docker ps -a

# Xóa container
docker rm -f vucar-app-production

# Xóa image cũ
docker image prune -a

# Xem disk usage
docker system df
```

### Docker Compose

```bash
# Update và restart
docker-compose pull && docker-compose up -d

# Xem logs từ thời điểm cụ thể
docker-compose logs --since="2025-10-11T10:00:00"

# Scale service
docker-compose up -d --scale vucar-app=2
```

### Jenkins

```bash
# Restart Jenkins
sudo systemctl restart jenkins

# Xem Jenkins status
sudo systemctl status jenkins

# Jenkins config location
ls -la /var/lib/jenkins/
```

---

## ✅ Checklist Triển Khai

- [ ] Server được chuẩn bị với Docker & Docker Compose
- [ ] Jenkins được cài đặt và cấu hình
- [ ] Credentials được thêm vào Jenkins
- [ ] Pipeline job được tạo
- [ ] Webhooks GitHub được thiết lập
- [ ] Domain và SSL được cấu hình
- [ ] Nginx reverse proxy hoạt động
- [ ] Health check endpoint hoạt động
- [ ] Monitoring được thiết lập
- [ ] Backup strategy được định nghĩa

Chúc bạn triển khai thành công! 🎉
