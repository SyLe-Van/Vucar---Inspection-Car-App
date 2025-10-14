const { MongoClient } = require("mongodb");

// Đọc connection string từ environment variable
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://vucar-prod-user:YOUR_PASSWORD@vucar-production.xxxxx.mongodb.net/vucar_production?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function testConnection() {
  try {
    console.log("🔗 Đang kết nối tới MongoDB Atlas...");
    console.log(
      "📍 Connection string:",
      uri.replace(/:([^:@]{8})[^:@]*@/, ":$1***@")
    ); // Ẩn password

    await client.connect();
    console.log("✅ Kết nối thành công!");

    // Test ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Database ping thành công!");

    // Lấy thông tin database
    const db = client.db("vucar_production");

    try {
      const stats = await db.stats();
      console.log(`📊 Database: ${stats.db}`);
      console.log(`📊 Collections: ${stats.collections}`);
      console.log(`📊 Data Size: ${Math.round(stats.dataSize / 1024)} KB`);
    } catch (error) {
      console.log("📊 Database mới (chưa có dữ liệu)");
    }

    // Test write operation
    console.log("🧪 Đang test ghi dữ liệu...");
    const testCollection = db.collection("connection_test");
    await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: "Connection test thành công từ VuCar App",
      version: "1.0.0",
    });
    console.log("✅ Test ghi dữ liệu thành công!");

    // Đọc lại dữ liệu vừa ghi
    const testDoc = await testCollection.findOne({ test: true });
    console.log("✅ Test đọc dữ liệu thành công!");
    console.log("📄 Dữ liệu test:", testDoc);

    // Xóa dữ liệu test
    await testCollection.deleteOne({ test: true });
    console.log("✅ Dọn dẹp dữ liệu test thành công!");

    console.log("\n🎉 Tất cả test đều THÀNH CÔNG!");
    console.log("🚀 Database đã sẵn sàng cho production!");
  } catch (error) {
    console.error("\n❌ Test kết nối THẤT BẠI:");
    console.error("📋 Chi tiết lỗi:", error.message);

    if (error.message.includes("authentication failed")) {
      console.error("🔑 Lỗi xác thực: Kiểm tra username/password");
    } else if (
      error.message.includes("timeout") ||
      error.message.includes("ENOTFOUND")
    ) {
      console.error("🌐 Lỗi mạng: Kiểm tra Network Access trong Atlas");
    } else if (error.message.includes("bad auth")) {
      console.error("🔐 Lỗi database user: Tạo lại user trong Database Access");
    }

    console.error("\n🔧 Hướng dẫn sửa lỗi:");
    console.error("1. Kiểm tra connection string trong .env.production");
    console.error("2. Kiểm tra username/password đúng không");
    console.error("3. Kiểm tra Network Access cho phép IP này");
    console.error("4. Kiểm tra Database User có quyền read/write");

    process.exit(1);
  } finally {
    await client.close();
    console.log("👋 Đã đóng kết nối database");
  }
}

// Chạy test
console.log("🚀 VuCar Database Connection Test");
console.log("==================================");
testConnection();
