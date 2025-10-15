# 🔍 Hướng Dẫn Xem VucarApp Trong Prometheus

## Bước 1: Kiểm Tra Target (Mục Tiêu)

1. **Mở Prometheus**: http://localhost:9090

2. **Vào mục Targets**:
   - Click vào menu **Status** (ở thanh menu trên)
   - Chọn **Targets**
3. **Tìm VucarApp**:
   - Bạn sẽ thấy danh sách các targets
   - Tìm target có tên: **`vucar-app`**
   - Kiểm tra cột **State**:
     - ✅ **UP** (màu xanh) = Đang theo dõi thành công
     - ❌ **DOWN** (màu đỏ) = Có vấn đề

4. **Thông tin target**:
   ```
   Job: vucar-app
   Instance: host.docker.internal:3000
   Endpoint: http://host.docker.internal:3000/api/metrics
   ```

---

## Bước 2: Xem Metrics (Chỉ Số) Của App

### Trong Prometheus UI (http://localhost:9090)

1. **Vào tab Graph** (trang chính)

2. **Thử các query sau** (copy và paste vào ô query):

### Query Cơ Bản

```promql
# Xem tất cả metrics của VucarApp
{job="vucar-app"}

# Hoặc tìm theo prefix
vucar_
```

### Query Theo Loại Metric

#### 📊 HTTP Metrics - Yêu cầu HTTP

```promql
# Tổng số requests
vucar_http_requests_total

# Request rate (requests/giây)
rate(vucar_http_requests_total[5m])

# Requests theo route
vucar_http_requests_total{route="/api/v1/car"}

# Requests theo status code
vucar_http_requests_total{status_code="200"}
```

#### 🗄️ Database Metrics - Cơ sở dữ liệu

```promql
# Trạng thái kết nối database (1=connected, 0=disconnected)
vucar_database_connection_status

# Tổng số queries
vucar_database_queries_total

# Query rate
rate(vucar_database_queries_total[5m])

# Queries theo collection
vucar_database_queries_total{collection="cars"}
```

#### 🚗 Business Metrics - Nghiệp vụ

```promql
# Tổng số cars
vucar_total_cars

# Car operations (create/read/update/delete)
vucar_car_operations_total

# Operation rate
rate(vucar_car_operations_total[5m])

# Thành công vs lỗi
vucar_car_operations_total{status="success"}
vucar_car_operations_total{status="error"}
```

#### ⚡ Performance Metrics - Hiệu năng

```promql
# Response time trung bình
rate(vucar_http_request_duration_seconds_sum[5m]) /
rate(vucar_http_request_duration_seconds_count[5m])

# P95 response time (95% requests nhanh hơn giá trị này)
histogram_quantile(0.95, rate(vucar_http_request_duration_seconds_bucket[5m]))

# P50 response time (median)
histogram_quantile(0.50, rate(vucar_http_request_duration_seconds_bucket[5m]))
```

#### 💻 Application Metrics - Ứng dụng

```promql
# Memory usage (bytes)
vucar_process_resident_memory_bytes

# Memory in MB
vucar_process_resident_memory_bytes / 1024 / 1024

# CPU usage
rate(vucar_process_cpu_seconds_total[5m])

# Uptime (giây)
vucar_app_uptime_seconds

# Uptime in hours
vucar_app_uptime_seconds / 3600
```

---

## Bước 3: Tạo Graph (Biểu Đồ)

1. **Nhập query** (một trong các query ở trên)

2. **Click nút "Execute"**

3. **Chọn tab**:
   - **Table**: Xem dạng bảng
   - **Graph**: Xem dạng biểu đồ thời gian

4. **Điều chỉnh thời gian**:
   - Ở góc trên, chọn: Last 5m, 15m, 1h, 3h, etc.

---

## Bước 4: Query Nâng Cao

### Tổng Request Rate

```promql
# Tổng requests/giây của toàn app
sum(rate(vucar_http_requests_total[5m]))
```

### Error Rate (Tỷ lệ lỗi)

```promql
# Requests lỗi (5xx)
sum(rate(vucar_http_requests_total{status_code=~"5.."}[5m]))

# % lỗi
sum(rate(vucar_http_requests_total{status_code=~"5.."}[5m])) /
sum(rate(vucar_http_requests_total[5m])) * 100
```

### Success Rate (Tỷ lệ thành công)

```promql
# % thành công
sum(rate(vucar_http_requests_total{status_code=~"2.."}[5m])) /
sum(rate(vucar_http_requests_total[5m])) * 100
```

### Requests Theo Endpoint

```promql
# Top endpoints theo traffic
topk(5, sum(rate(vucar_http_requests_total[5m])) by (route))
```

### Database Performance

```promql
# P95 database query time
histogram_quantile(0.95,
  rate(vucar_database_query_duration_seconds_bucket[5m])
)

# Slowest operations
topk(3,
  histogram_quantile(0.95,
    rate(vucar_database_query_duration_seconds_bucket[5m])
  ) by (operation)
)
```

---

## Bước 5: Tạo Traffic Để Xem Metrics

Nếu chưa thấy data, tạo traffic:

```bash
# Terminal mới
# Get cars
curl http://localhost:3000/api/v1/car

# Create a car
curl -X POST http://localhost:3000/api/v1/car \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Car",
    "licensePlate": "TEST123",
    "status": true
  }'

# Tạo nhiều requests
for i in {1..20}; do
  curl -s http://localhost:3000/api/v1/car > /dev/null
  sleep 1
done
```

Sau đó refresh Prometheus và chạy lại queries!

---

## 🎯 Các Metric Quan Trọng Cần Theo Dõi

### 1. Request Rate

```promql
sum(rate(vucar_http_requests_total[5m]))
```

**Ý nghĩa**: Số requests/giây app đang xử lý

### 2. Error Rate

```promql
sum(rate(vucar_http_requests_total{status_code=~"5.."}[5m]))
```

**Ý nghĩa**: Số requests lỗi/giây (nên < 1%)

### 3. Response Time

```promql
histogram_quantile(0.95, rate(vucar_http_request_duration_seconds_bucket[5m]))
```

**Ý nghĩa**: 95% requests hoàn thành trong bao lâu (nên < 1s)

### 4. Database Status

```promql
vucar_database_connection_status
```

**Ý nghĩa**: 1 = connected, 0 = disconnected

### 5. Total Cars

```promql
vucar_total_cars
```

**Ý nghĩa**: Số lượng cars hiện tại trong DB

### 6. Memory Usage

```promql
vucar_process_resident_memory_bytes / 1024 / 1024
```

**Ý nghĩa**: Memory app đang dùng (MB)

---

## 🔧 Troubleshooting

### Target DOWN (Đỏ)?

**Kiểm tra**:

```bash
# App có chạy không?
lsof -ti:3000

# Metrics endpoint có hoạt động?
curl http://localhost:3000/api/metrics
```

**Nếu target DOWN**:

1. Start app: `npm run dev`
2. Restart Prometheus: `docker compose -f docker-compose.monitoring.yml restart prometheus`

### Không thấy metrics?

**Tạo traffic trước**:

```bash
curl http://localhost:3000/api/v1/car
```

Metrics chỉ xuất hiện sau khi có requests!

### Query không trả về data?

**Điều chỉnh time range**:

- Chọn "Last 5 minutes" hoặc "Last 1 hour"
- Click "Execute" lại

---

## 📊 Next: Xem Dashboard Trong Grafana

Sau khi hiểu Prometheus, chuyển sang Grafana để xem dashboard đẹp hơn:

**Mở Grafana**: http://localhost:3001

- Username: `admin`
- Password: `admin123`

**Xem dashboard**:

1. Click icon **Dashboards** (4 ô vuông)
2. Chọn **VucarApp Performance Dashboard**
3. Thấy 10 panels với biểu đồ thời gian thực!

---

**Chúc bạn monitor vui vẻ! 🚀📊**
