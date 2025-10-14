// Script to remove cars without license plate
// Run: node scripts/cleanup-cars-without-license.js

const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: String,
    licensePlate: String,
    status: Number,
    slug: String,
  },
  { timestamps: true }
);

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);

async function cleanup() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/vucar";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Find cars without license plate
    const carsWithoutLicense = await Car.find({
      $or: [
        { licensePlate: { $exists: false } },
        { licensePlate: null },
        { licensePlate: "" },
      ],
    });

    console.log(
      `Found ${carsWithoutLicense.length} cars without license plate`
    );

    if (carsWithoutLicense.length > 0) {
      console.log("Cars to be deleted:");
      carsWithoutLicense.forEach(car => {
        console.log(`- ID: ${car._id}, Name: ${car.name}`);
      });

      // Delete cars without license plate
      const result = await Car.deleteMany({
        $or: [
          { licensePlate: { $exists: false } },
          { licensePlate: null },
          { licensePlate: "" },
        ],
      });

      console.log(
        `\nDeleted ${result.deletedCount} cars without license plate`
      );
    } else {
      console.log("No cars to delete. All cars have license plates.");
    }

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanup();
