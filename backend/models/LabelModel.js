import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    default: "#000000"
  },
  description: {
    type: String,
    default: ""
  }
}, { timestamps: true });

// Ensure labels are unique within a repository
labelSchema.index({ repoId: 1, name: 1 }, { unique: true });

export const LabelModel = mongoose.model("Label", labelSchema);
