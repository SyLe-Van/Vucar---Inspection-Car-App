#!/bin/bash
# Script tạo .env.production từ template và prompt user nhập thông tin

echo "🔧 Tạo file .env.production cho VuCar"
echo "======================================="

# Kiểm tra nếu file đã tồn tại
if [[ -f ".env.production" ]]; then
    echo "⚠️  File .env.production đã tồn tại!"
    read -p "Bạn có muốn ghi đè? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Hủy tạo file."
        exit 1
    fi
fi

# Copy từ template
if [[ -f ".env.production.example" ]]; then
    cp .env.production.example .env.production
    echo "✅ Đã copy từ template .env.production.example"
else
    echo "❌ Không tìm thấy file .env.production.example"
    exit 1
fi

echo ""
echo "📝 Vui lòng cập nhật các thông tin sau trong file .env.production:"
echo "================================================================"
echo "1. MONGODB_URL - Connection string MongoDB Atlas"
echo "2. Kiểm tra các secret keys đã được generate chưa"
echo "3. NEXTAUTH_URL - Domain production"
echo ""
echo "🔐 Lưu ý bảo mật:"
echo "- KHÔNG commit file .env.production lên Git"
echo "- Chỉ chia sẻ với team members cần thiết"
echo "- Thay đổi passwords định kỳ"
echo ""

# Hiển thị nội dung cần chỉnh sửa
echo "📋 Nội dung cần kiểm tra:"
grep -E "(CHANGE_ME|YOUR_|your-)" .env.production || echo "✅ Không có placeholder nào cần thay đổi"

echo ""
echo "✅ File .env.production đã được tạo"
echo "📝 Hãy chỉnh sửa file này với thông tin production thật"