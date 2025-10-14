# License Plate Migration Guide

## Vấn đề

Database cũ không có trường `licensePlate`, cần phải:

1. Xóa dữ liệu cũ
2. Tạo xe mới với đầy đủ 3 trường: name, licensePlate, status

## Giải pháp

### Option 1: Xóa thủ công trong MongoDB

```bash
# Connect to MongoDB
mongo

# Switch to your database
use vucar

# Delete all cars without license plate
db.cars.deleteMany({
  $or: [
    { licensePlate: { $exists: false } },
    { licensePlate: null },
    { licensePlate: "" }
  ]
})
```

### Option 2: Chạy script tự động

```bash
# Đảm bảo MONGODB_URI được set trong .env
npm run cleanup:cars

# Hoặc chạy trực tiếp
node scripts/cleanup-cars-without-license.js
```

### Option 3: Xóa toàn bộ database và bắt đầu lại

```bash
# Trong MongoDB
use vucar
db.dropDatabase()
```

## Sau khi cleanup

1. Khởi động lại server
2. Tạo xe mới với đầy đủ thông tin:
   - Car name (bắt buộc)
   - License Plate (bắt buộc) - VD: ABC-1234
   - Status (bắt buộc)

## Validation Rules

### Car Name

- Bắt buộc
- 2-30 ký tự
- Phải unique

### License Plate

- Bắt buộc
- 2-15 ký tự
- Chỉ chấp nhận: chữ cái, số, khoảng trắng, dấu gạch ngang
- Tự động chuyển thành UPPERCASE
- Phải unique

### Status

- Bắt buộc
- 0: Not inspected
- 1: Inspecting
- 2: Inspected

## Thêm vào package.json

```json
"scripts": {
  "cleanup:cars": "node scripts/cleanup-cars-without-license.js"
}
```
