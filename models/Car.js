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

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);

export default Car;
