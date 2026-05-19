import { Schema, model } from "mongoose";

const repoFileSchema = new Schema(
  {
    repoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    storageProvider: {
      type: String,
      enum: ["local", "cloudinary", "s3"],
      default: "local",
    },

    cloudUrl: {
      type: String,
      default: "",
    },

    cloudPublicId: {
      type: String,
      default: "",
    },

    cloudResourceType: {
      type: String,
      default: "",
    },

    mimeType: {
      type: String,
    },

    size: {
      type: Number,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate filenames per repo
repoFileSchema.index({ repoId: 1, filename: 1 }, { unique: true });

export const RepoFileModel = model("RepoFile", repoFileSchema);
