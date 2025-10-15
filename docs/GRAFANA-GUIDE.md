# 🎯 Hướng Dẫn Xem Dashboard VucarApp Trong Grafana

## Bước 1: Truy Cập Dashboard

### Cách 1: Từ Menu

1. Nhấn vào biểu tượng **☰** (menu hamburger) ở góc trên bên trái
2. Chọn **Dashboards**
3. Tìm và click vào **"VucarApp Performance Dashboard"**

### Cách 2: Tìm Kiếm Nhanh

1. Nhấn phím `/` hoặc click vào ô search ở đầu trang
2. Gõ: `VucarApp`
3. Click vào **"VucarApp Performance Dashboard"**

### Cách 3: URL Trực Tiếp

Truy cập: http://localhost:3001/d/vucar-dashboard

---

## Bước 2: Dashboard Hiển Thị Gì?

Bạn sẽ thấy **10 panels** (biểu đồ):

### Hàng 1: Tổng Quan HTTP

- **HTTP Request Rate** - Tốc độ request theo thời gian
- **Requests per Minute** - Đồng hồ hiển thị tổng request/phút
- **Database Status** - Trạng thái kết nối DB (xanh = connected)
- **Total Cars** - Tổng số xe trong DB

### Hàng 2: Performance

- **Response Time (p50, p95)** - Thời gian phản hồi
- **Car Operations Rate** - Tốc độ thao tác CRUD

### Hàng 3: Database & Endpoints

- **Database Query Duration (p95)** - Thời gian query DB
- **Requests by Endpoint** - Bảng chi tiết từng endpoint

### Hàng 4: System Metrics

- **Application Memory Usage** - Bộ nhớ ứng dụng đang dùng
- **Application Uptime** - Thời gian app chạy

---

## ⚠️ Nếu Dashboard Trống (No Data)

### Nguyên Nhân: Chưa có dữ liệu metrics

### Giải Pháp:

#### 1. Đảm bảo Next.js app đang chạy

```bash
# Terminal mới
cd /Users/mac/projects/VucarApp
npm run dev
```

Đợi thấy: `✓ Ready on http://localhost:3000`

#### 2. Tạo traffic để sinh metrics

```bash
# Terminal khác
# Get cars
curl http://localhost:3000/api/v1/car

# Create a car
curl -X POST http://localhost:3000/api/v1/car \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Toyota Camry Test",
    "licensePlate": "TEST123",
    "status": true
  }'

# Get cars again
curl http://localhost:3000/api/v1/car
```

#### 3. Kiểm tra metrics endpoint

```bash
curl http://localhost:3000/api/metrics | head -50
```

Bạn phải thấy output như:

```
# HELP vucar_http_requests_total Total number of HTTP requests
# TYPE vucar_http_requests_total counter
vucar_http_requests_total{method="GET",route="/api/v1/car",status_code="200"} 1

# HELP vucar_database_connection_status Database connection status
# TYPE vucar_database_connection_status gauge
vucar_database_connection_status 1
```

#### 4. Kiểm tra Prometheus đang scrape

1. Mở: http://localhost:9090
2. Vào **Status** → **Targets**
3. Kiểm tra `vucar-app` target:
   - **State** phải là **UP** (màu xanh)
   - **Last Scrape** hiển thị thời gian gần đây

Nếu target **DOWN**:

```bash
# Check app đang chạy
lsof -ti:3000

# Nếu không có kết quả, start app:
npm run dev
```

#### 5. Đợi 15-30 giây

Prometheus scrape metrics mỗi 10 giây. Đợi một chút rồi refresh dashboard.

#### 6. Refresh Grafana Dashboard

- Click nút **Refresh** (↻) ở góc trên bên phải
- Hoặc nhấn `Ctrl+R` / `Cmd+R`

---

## 🎯 Test Thực Tế - Tạo Traffic

Chạy script này để tạo nhiều request:

```bash
# Tạo 20 requests
for i in {1..20}; do
  echo "Request $i"
  curl -s http://localhost:3000/api/v1/car > /dev/null
  sleep 0.5
done
```

Quay lại Grafana và xem dashboard **live update**! 📊

---

## 📊 Cách Đọc Dashboard

### HTTP Request Rate (Panel 1)

- **Trục Y**: Requests/second
- **Màu sắc**: Mỗi màu = 1 endpoint
- **Ý nghĩa**: Càng cao = càng nhiều traffic

### Requests per Minute (Panel 2)

- **Đồng hồ**: Hiển thị tổng request/phút
- **Màu xanh**: < 1000 req/min (tốt)
- **Màu vàng**: 1000-5000 req/min (cảnh báo)
- **Màu đỏ**: > 5000 req/min (cao)

### Database Status (Panel 3)

- **Green "Connected"**: Database OK ✅
- **Red "Disconnected"**: Database lỗi ❌

### Total Cars (Panel 4)

- Số lượng xe hiện tại trong DB
- Update real-time khi thêm/xóa xe

### Response Time (Panel 5)

- **p50**: 50% requests nhanh hơn giá trị này
- **p95**: 95% requests nhanh hơn giá trị này
- **Mục tiêu**: p95 < 1 second

### Car Operations Rate (Panel 6)

- **Success**: Thao tác thành công (màu xanh)
- **Error**: Thao tác lỗi (màu đỏ)
- Theo dõi create, read, update, delete

### Database Query Duration (Panel 7)

- **p95**: 95% queries nhanh hơn giá trị này
- **Mục tiêu**: p95 < 100ms
- Theo dõi performance từng collection

### Requests by Endpoint (Panel 8)

- **Bảng** hiển thị tất cả endpoints
- Cột **Rate**: Requests/second cho mỗi endpoint
- Cột **Method, Route, Status**: Chi tiết request

### Memory Usage (Panel 9)

- Theo dõi memory leak
- Nếu tăng liên tục = có vấn đề

### Uptime (Panel 10)

- Thời gian app đã chạy (giây)
- Reset về 0 khi restart app

---

## 🔧 Troubleshooting

### "No data" hoặc "N/A"

**Kiểm tra:**

```bash
# 1. App đang chạy?
lsof -ti:3000

# 2. Metrics endpoint hoạt động?
curl http://localhost:3000/api/metrics

# 3. Prometheus đang scrape?
# Mở: http://localhost:9090/targets
# Check "vucar-app" target = UP

# 4. Tạo traffic
curl http://localhost:3000/api/v1/car
```

### Panels hiển thị nhưng giá trị = 0

**Cần tạo nhiều traffic hơn:**

```bash
# Tạo xe mới
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/v1/car \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Car Test $i\",
      \"licensePlate\": \"TEST$i\",
      \"status\": true
    }"
done

# Get nhiều lần
for i in {1..50}; do
  curl -s http://localhost:3000/api/v1/car > /dev/null
done
```

### Dashboard bị lỗi "Panel plugin not found"

**Giải pháp:**

```bash
# Restart Grafana
docker compose -f docker-compose.monitoring.yml restart grafana

# Đợi 10 giây rồi refresh browser
```

---

## 🎨 Tùy Chỉnh Dashboard

### Thay Đổi Time Range

- Click **Last 1 hour** ở góc trên bên phải
- Chọn:
  - **Last 5 minutes** - Xem real-time
  - **Last 1 hour** - Xem tổng quan
  - **Last 6 hours** - Xem xu hướng

### Tự Động Refresh

- Click **Refresh** dropdown
- Chọn **10s** hoặc **30s**
- Dashboard sẽ tự động cập nhật!

### Zoom In/Out

- Click và kéo trên biểu đồ để zoom vào khoảng thời gian
- Click **Zoom out** để trở lại

### Xem Chi Tiết Panel

- Click vào tiêu đề panel
- Chọn **Edit** để xem query
- Chọn **View** để xem full screen

---

## 💡 Mẹo Hay

### 1. So Sánh Before/After

```bash
# Before: Chụp ảnh dashboard hiện tại

# Tạo nhiều traffic
for i in {1..100}; do
  curl -s http://localhost:3000/api/v1/car > /dev/null
done

# After: Xem sự thay đổi trên dashboard
```

### 2. Test Performance

```bash
# Dùng Apache Bench
ab -n 1000 -c 50 http://localhost:3000/api/v1/car

# Xem response time tăng như thế nào trong panel 5
```

### 3. Monitor Memory Leak

- Để app chạy lâu (vài giờ)
- Xem panel 9 (Memory Usage)
- Nếu tăng liên tục = có leak

---

## 📸 Ảnh Chụp Dashboard (Ví dụ)

**Dashboard sẽ trông như thế này:**

```
┌─────────────────────────────────────────────────────────────┐
│ VucarApp Performance Dashboard            [Last 1h] [↻ 10s] │
├─────────────────────────────────────────────────────────────┤
│ [HTTP Request Rate 📈] [RPM: 45 ⏱️] [DB: ✅] [Cars: 12 🚗]  │
├─────────────────────────────────────────────────────────────┤
│ [Response Time p50/p95 📊]      [Car Operations 🔄]         │
├─────────────────────────────────────────────────────────────┤
│ [DB Query Duration 📉]          [Endpoints Table 📋]        │
├─────────────────────────────────────────────────────────────┤
│ [Memory Usage 💾]               [Uptime ⏰]                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Thành Công

Sau khi làm theo hướng dẫn, bạn phải thấy:

- ✅ Dashboard "VucarApp Performance Dashboard" xuất hiện
- ✅ 10 panels đều hiển thị dữ liệu
- ✅ Database Status = "Connected" (xanh)
- ✅ Total Cars hiển thị số xe thực tế
- ✅ HTTP Request Rate có đường line
- ✅ Requests by Endpoint có dữ liệu trong table
- ✅ Memory Usage hiển thị số byte
- ✅ Uptime đang đếm lên

---

## 🚀 Next Steps

Khi dashboard đã chạy:

1. **Để chạy liên tục** khi dev:

   ```bash
   # Terminal 1: App
   npm run dev

   # Terminal 2: Monitoring (already running)
   # Mở Grafana: http://localhost:3001
   ```

2. **Add metrics cho các API khác:**
   - `src/pages/api/v1/criteria.js`
   - `src/pages/api/v1/inspection.js`

3. **Tạo alerts** khi có vấn đề:
   - Error rate > 5%
   - Response time > 2s
   - Database disconnected

4. **Export dashboard** để backup:
   - Click **Share** → **Export** → **Save to file**

---

**Chúc bạn monitoring thành công! 🎉📊**
