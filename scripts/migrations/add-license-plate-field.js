/**
 * Migration: Add licensePlate field to Car collection
 * Date: 2025-10-15
 * Description: Adds licensePlate field with sparse unique index
 */

const mongoose = require("mongoose");

async function migrate() {
  const MONGODB_URI = process.argv[2];

  if (!MONGODB_URI) {
    console.error("❌ Usage: node add-license-plate-field.js <MONGODB_URI>");
    console.error(
      'Example: node add-license-plate-field.js "mongodb+srv://user:pass@cluster.mongodb.net/dbname"'
    );
    process.exit(1);
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const carsCollection = db.collection("cars");

    // Step 1: Check current state
    console.log("\n📊 Checking current database state...");
    const totalCars = await carsCollection.countDocuments();
    const carsWithLicensePlate = await carsCollection.countDocuments({
      licensePlate: { $exists: true, $ne: null },
    });

    console.log(`   Total cars: ${totalCars}`);
    console.log(`   Cars with licensePlate: ${carsWithLicensePlate}`);
    console.log(
      `   Cars without licensePlate: ${totalCars - carsWithLicensePlate}`
    );

    // Step 2: Add licensePlate field to existing documents (set to null for backward compatibility)
    console.log("\n🔄 Adding licensePlate field to cars without it...");
    const updateResult = await carsCollection.updateMany(
      { licensePlate: { $exists: false } },
      { $set: { licensePlate: null } }
    );
    console.log(`   ✅ Updated ${updateResult.modifiedCount} documents`);

    // Step 3: Create sparse unique index
    console.log("\n🔄 Creating sparse unique index for licensePlate...");
    try {
      // Try to drop existing index if it exists (but not unique)
      const indexes = await carsCollection.listIndexes().toArray();
      const existingLicensePlateIndex = indexes.find(
        idx => idx.key.licensePlate && !idx.sparse
      );

      if (existingLicensePlateIndex) {
        console.log(`   Dropping old index: ${existingLicensePlateIndex.name}`);
        await carsCollection.dropIndex(existingLicensePlateIndex.name);
      }
    } catch (err) {
      console.log("   No old index to drop");
    }

    // Create new sparse unique index
    await carsCollection.createIndex(
      { licensePlate: 1 },
      {
        unique: true,
        sparse: true,
        name: "licensePlate_sparse_unique",
      }
    );
    console.log("   ✅ Created sparse unique index for licensePlate");

    // Step 4: Verify indexes
    console.log("\n📋 Current indexes on cars collection:");
    const finalIndexes = await carsCollection.listIndexes().toArray();
    finalIndexes.forEach(idx => {
      const uniqueFlag = idx.unique ? "(unique)" : "";
      const sparseFlag = idx.sparse ? "(sparse)" : "";
      console.log(
        `   - ${idx.name}: ${JSON.stringify(idx.key)} ${uniqueFlag} ${sparseFlag}`
      );
    });

    // Step 5: Final summary
    console.log("\n✅ Migration completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   - Added licensePlate field to all car documents");
    console.log(
      "   - Created sparse unique index (allows multiple null values)"
    );
    console.log("   - Existing cars can have null licensePlate");
    console.log("   - New cars with licensePlate must be unique");

    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    if (error.code === 11000) {
      console.error("\n⚠️  Duplicate key error detected!");
      console.error("   Some cars already have duplicate license plates.");
      console.error(
        "   Please clean up duplicates before running this migration."
      );
    }
    process.exit(1);
  }
}

// Run migration
migrate();
