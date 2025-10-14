const mongoose = require("mongoose");

async function rebuildIndex() {
  const MONGODB_URI = process.argv[2];

  if (!MONGODB_URI) {
    console.error("Usage: node rebuild-car-index.js <MONGODB_URI>");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("cars");

    // Drop old indexes if they exist
    try {
      await collection.dropIndex("licensePlate_1");
      console.log("Dropped old licensePlate index");
    } catch (err) {
      console.log("No old index to drop:", err.message);
    }

    // Create new sparse unique index
    await collection.createIndex(
      { licensePlate: 1 },
      { unique: true, sparse: true }
    );
    console.log("Created new sparse unique index for licensePlate");

    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log("\nCurrent indexes:");
    indexes.forEach(idx => {
      console.log(
        `- ${idx.name}:`,
        JSON.stringify(idx.key),
        idx.unique ? "(unique)" : "",
        idx.sparse ? "(sparse)" : ""
      );
    });

    await mongoose.connection.close();
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

rebuildIndex();
