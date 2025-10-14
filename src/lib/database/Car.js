import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [2, "must be atleast 2 charcters"],
      maxlength: [32, "must be atleast 2 charcters"],
      unique: true,
    },
    licensePlate: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
      minlength: [2, "License plate must be at least 2 characters"],
      maxlength: [15, "License plate must be at most 15 characters"],
    },
    status: {
      type: Number,
      required: true,
      enum: [0, 1, 2],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo unique index cho licensePlate với sparse option
carSchema.index({ licensePlate: 1 }, { unique: true, sparse: true });

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);

export default Car;
