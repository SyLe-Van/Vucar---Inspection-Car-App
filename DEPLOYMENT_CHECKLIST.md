# ✅ Checklist Triển Khai VuCar App với Jenkins CI/CD

## 🖥️ Chuẩn Bị Server

- [ ] **Server có IP public** và có thể SSH
- [ ] **Cài đặt Jenkins** (`sudo apt install jenkins`)
- [ ] **Cài đặt Docker** (`curl -fsSL https://get.docker.com | sh`)
- [ ] **Cài đặt Docker Compose**
- [ ] **Thêm jenkins user vào docker group** (`sudo usermod -aG docker jenkins`)
- [ ] **Restart Jenkins** (`sudo systemctl restart jenkins`)

## 🔧 Cấu Hình Jenkins

- [ ] **Truy cập Jenkins** (`http://your-server:8080`)
- [ ] **Lấy initial password** (`sudo cat /var/lib/jenkins/secrets/initialAdminPassword`)
- [ ] **Cài đặt plugins:**
  - [ ] NodeJS Plugin
  - [ ] Docker Pipeline Plugin
  - [ ] SSH Agent Plugin
  - [ ] Slack Notification Plugin (tùy chọn)
- [ ] **Cấu hình Global Tools:**
  - [ ] NodeJS 18 (name: `Node-18`)
  - [ ] Docker (name: `docker`)

## 🔑 Thiết Lập Credentials

- [ ] **Docker Hub credentials** (ID: `docker-registry-credentials`)
- [ ] **SSH key cho production server** (ID: `ssh-deployment-key`)
- [ ] **GitHub credentials** (ID: `github-credentials`) - nếu repo private

## 📝 Cập Nhật Code

- [ ] **Sửa Jenkinsfile:**
  ```groovy
  DOCKER_IMAGE_NAME = 'YOUR-DOCKERHUB-USERNAME/vucar-app'
  PRODUCTION_SERVER = 'YOUR-SERVER-IP-OR-DOMAIN'
  ```

- [ ] **Copy và sửa .env.production:**
  ```bash
  cp .env.production.example .env.production
  # Sửa các thông tin trong .env.production
  ```

## 🏗️ Tạo Jenkins Pipeline

- [ ] **Tạo new item:** `VuCar-App-Pipeline` (type: Pipeline)
- [ ] **Cấu hình:**
  - [ ] GitHub project URL
  - [ ] Poll SCM: `H/5 * * * *`
  - [ ] Pipeline from SCM
  - [ ] Repository URL
  - [ ] Branch: `*/main`
  - [ ] Script path: `Jenkinsfile`

## 🔗 GitHub Integration

- [ ] **Tạo GitHub webhook:**
  - URL: `http://your-jenkins-server:8080/github-webhook/`
  - Content type: `application/json`
  - Events: `push`

## 🚀 Production Server Setup

- [ ] **Tạo thư mục app:**
  ```bash
  sudo mkdir -p /opt/vucar-app
  sudo chown $USER:$USER /opt/vucar-app
  ```

- [ ] **Copy file docker-compose.production.yml** lên server
- [ ] **Tạo .env.production** trên server với thông tin thật

## 🧪 Test Deployment

- [ ] **Test build manually:** "Build Now" trong Jenkins
- [ ] **Kiểm tra logs:** Console Output không có lỗi
- [ ] **Test webhook:** Push commit và xem Jenkins tự động build
- [ ] **Kiểm tra app:** `curl http://your-server:3000/api/health`

## 🌐 Production Setup (Optional)

- [ ] **Cài đặt Nginx:**
  ```bash
  sudo apt install nginx
  ```

- [ ] **Copy nginx.conf** và cấu hình
- [ ] **Thiết lập SSL với Let's Encrypt:**
  ```bash
  sudo certbot --nginx -d your-domain.com
  ```

## 📊 Monitoring

- [ ] **Health check** hoạt động: `/api/health`
- [ ] **Docker logs:** `docker logs vucar-app-production`
- [ ] **Nginx logs:** `/var/log/nginx/`
- [ ] **Jenkins build history** lưu được

## 🔧 Final Verification

- [ ] **Ứng dụng accessible:** `https://your-domain.com`
- [ ] **Auto deployment:** Push code → Jenkins build → Deploy thành công
- [ ] **Rollback capability:** Jenkins có thể rollback version cũ
- [ ] **Monitoring setup:** Logs và health checks hoạt động

---

## 🆘 Troubleshooting Quick Commands

```bash
# Jenkins status
sudo systemctl status jenkins

# Docker status
docker ps -a
docker logs vucar-app-production

# Nginx status
sudo systemctl status nginx
sudo nginx -t

# Application health
curl http://localhost:3000/api/health

# Build manually
cd /opt/vucar-app
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Jenkins console logs
2. Docker container logs
3. Nginx error logs
4. Application health endpoint

**Hoàn thành checklist này = Deployment thành công! 🎉**