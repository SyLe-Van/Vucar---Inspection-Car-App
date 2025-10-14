/**
 * Check Migration Status
 * Verifies if licensePlate field migration has been applied
 */

const mongoose = require("mongoose");

async function checkStatus() {
  const MONGODB_URI = process.argv[2];

  if (!MONGODB_URI) {
    console.error("❌ Usage: node check-migration-status.js <MONGODB_URI>");
    process.exit(1);
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const carsCollection = db.collection("cars");

    // Get statistics
    const totalCars = await carsCollection.countDocuments();
    const carsWithLicensePlate = await carsCollection.countDocuments({
      licensePlate: { $exists: true, $ne: null },
    });
    const carsWithoutField = await carsCollection.countDocuments({
      licensePlate: { $exists: false },
    });
    const carsWithNullLicensePlate = await carsCollection.countDocuments({
      licensePlate: null,
    });

    // Check indexes
    const indexes = await carsCollection.listIndexes().toArray();
    const licensePlateIndex = indexes.find(
      idx => idx.key.licensePlate !== undefined
    );

    // Display results
    console.log("📊 Database Status Report");
    console.log("=".repeat(50));
    console.log(`\n📝 Cars Collection:`);
    console.log(`   Total cars: ${totalCars}`);
    console.log(`   Cars with license plate: ${carsWithLicensePlate}`);
    console.log(`   Cars with null license plate: ${carsWithNullLicensePlate}`);
    console.log(`   Cars without licensePlate field: ${carsWithoutField}`);

    console.log(`\n🔍 Index Status:`);
    if (licensePlateIndex) {
      console.log(`   ✅ licensePlate index exists`);
      console.log(`   Index name: ${licensePlateIndex.name}`);
      console.log(`   Unique: ${licensePlateIndex.unique ? "Yes" : "No"}`);
      console.log(`   Sparse: ${licensePlateIndex.sparse ? "Yes" : "No"}`);
    } else {
      console.log(`   ❌ licensePlate index NOT found`);
    }

    console.log(`\n📋 All Indexes:`);
    indexes.forEach(idx => {
      const flags = [];
      if (idx.unique) flags.push("unique");
      if (idx.sparse) flags.push("sparse");
      const flagStr = flags.length > 0 ? ` (${flags.join(", ")})` : "";
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}${flagStr}`);
    });

    // Migration status
    console.log(`\n🎯 Migration Status:`);
    const migrationNeeded = carsWithoutField > 0 || !licensePlateIndex;

    if (migrationNeeded) {
      console.log(`   ⚠️  MIGRATION NEEDED`);
      if (carsWithoutField > 0) {
        console.log(`   - ${carsWithoutField} cars missing licensePlate field`);
      }
      if (!licensePlateIndex) {
        console.log(`   - licensePlate index not created`);
      }
      console.log(
        `\n   Run: ./scripts/run-migration.sh add-license-plate-field`
      );
    } else {
      console.log(`   ✅ MIGRATION COMPLETE`);
      console.log(`   - All cars have licensePlate field`);
      console.log(`   - Sparse unique index exists`);
      if (licensePlateIndex.unique && licensePlateIndex.sparse) {
        console.log(`   - Index correctly configured`);
      } else {
        console.log(`   ⚠️  Index may need reconfiguration`);
      }
    }

    console.log("\n" + "=".repeat(50) + "\n");

    await mongoose.connection.close();
  } catch (error) {
    console.error("\n❌ Check failed:", error.message);
    process.exit(1);
  }
}

checkStatus();
