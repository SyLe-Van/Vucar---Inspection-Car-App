const { MongoClient } = require("mongodb");

const uri =
  process.env.MONGODB_URL ||
  "mongodb+srv://vucar-prod-user:YOUR_PASSWORD@vucar-production.xxxxx.mongodb.net/vucar_production?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function createIndexes() {
  try {
    console.log("🔗 Đang kết nối tới MongoDB Atlas...");
    await client.connect();
    console.log("✅ Kết nối thành công!");

    const db = client.db("vucar_production");

    console.log("\n📊 Đang tạo indexes cho performance...");

    // Cars collection indexes
    console.log("🚗 Tạo indexes cho Cars collection...");
    const carsCollection = db.collection("cars");

    await carsCollection.createIndex({ createdAt: -1 });
    console.log("  ✅ Index: createdAt (DESC) - cho việc sắp xếp theo ngày");

    await carsCollection.createIndex({ status: 1 });
    console.log("  ✅ Index: status - cho việc lọc theo trạng thái");

    await carsCollection.createIndex({ make: 1, model: 1 });
    console.log("  ✅ Index: make + model - cho việc tìm kiếm xe");

    await carsCollection.createIndex({ licensePlate: 1 });
    console.log("  ✅ Index: licensePlate - cho việc tìm kiếm biển số");

    // Inspections collection indexes
    console.log("\n🔍 Tạo indexes cho Inspections collection...");
    const inspectionsCollection = db.collection("inspections");

    await inspectionsCollection.createIndex({ carId: 1 });
    console.log("  ✅ Index: carId - cho việc lấy inspection theo xe");

    await inspectionsCollection.createIndex({ createdAt: -1 });
    console.log("  ✅ Index: createdAt (DESC) - cho việc sắp xếp theo ngày");

    await inspectionsCollection.createIndex({ status: 1 });
    console.log("  ✅ Index: status - cho việc lọc theo trạng thái inspection");

    await inspectionsCollection.createIndex({ inspectorId: 1 });
    console.log(
      "  ✅ Index: inspectorId - cho việc lấy inspection theo người kiểm tra"
    );

    // Criteria collection indexes
    console.log("\n📋 Tạo indexes cho Criteria collection...");
    const criteriaCollection = db.collection("criteria");

    await criteriaCollection.createIndex({ category: 1 });
    console.log("  ✅ Index: category - cho việc nhóm criteria theo loại");

    await criteriaCollection.createIndex({ active: 1 });
    console.log("  ✅ Index: active - cho việc lọc criteria đang hoạt động");

    await criteriaCollection.createIndex({ order: 1 });
    console.log("  ✅ Index: order - cho việc sắp xếp criteria");

    // Users collection indexes (nếu có)
    console.log("\n👥 Tạo indexes cho Users collection...");
    const usersCollection = db.collection("users");

    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log("  ✅ Index: email (UNIQUE) - cho việc đăng nhập");

    await usersCollection.createIndex({ role: 1 });
    console.log("  ✅ Index: role - cho việc phân quyền");

    await usersCollection.createIndex({ createdAt: -1 });
    console.log("  ✅ Index: createdAt (DESC) - cho việc sắp xếp user");

    // Compound indexes cho performance
    console.log("\n🔄 Tạo compound indexes...");

    await carsCollection.createIndex({ status: 1, createdAt: -1 });
    console.log("  ✅ Compound Index: status + createdAt - cho dashboard");

    await inspectionsCollection.createIndex({ carId: 1, createdAt: -1 });
    console.log(
      "  ✅ Compound Index: carId + createdAt - cho lịch sử inspection"
    );

    await inspectionsCollection.createIndex({ status: 1, createdAt: -1 });
    console.log("  ✅ Compound Index: status + createdAt - cho báo cáo");

    console.log("\n🎉 Tất cả indexes đã được tạo thành công!");

    // Hiển thị danh sách indexes
    console.log("\n📊 Danh sách indexes hiện tại:");
    const collections = ["cars", "inspections", "criteria", "users"];

    for (const collName of collections) {
      try {
        const indexes = await db.collection(collName).indexes();
        console.log(`\n📁 ${collName}:`);
        indexes.forEach((index) => {
          const keys = Object.keys(index.key)
            .map((key) => `${key}:${index.key[key]}`)
            .join(", ");
          console.log(`  - ${index.name}: {${keys}}`);
        });
      } catch (error) {
        console.log(`  ⚠️  Collection ${collName} chưa tồn tại`);
      }
    }

    console.log("\n✨ Database production đã được tối ưu hóa!");
  } catch (error) {
    console.error("\n❌ Lỗi khi tạo indexes:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n👋 Đã đóng kết nối database");
  }
}

// Chạy script tạo indexes
console.log("🚀 VuCar Database Indexes Setup");
console.log("===============================");
createIndexes();
