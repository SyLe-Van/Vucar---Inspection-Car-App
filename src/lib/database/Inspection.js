import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    criteries: [
      {
        criteria_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Criteria",
          required: true,
        },
        criteria_name: {
          type: String,
          required: true,
        },
        is_good: Boolean,
        note: {
          type: String,
          required: function () {
            return !this.is_good;
          },
        },
      },
    ],
    status: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Inspection =
  mongoose.models.Inspection || mongoose.model("Inspection", inspectionSchema);

export default Inspection;
