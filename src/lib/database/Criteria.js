import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

const criteriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, "must be at least 2 characters"],
    maxlength: [32, "must be at most 32 characters"],
  },
  description: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
  },
});

const Criteria =
  mongoose.models.Criteria || mongoose.model("Criteria", criteriaSchema);

export default Criteria;
