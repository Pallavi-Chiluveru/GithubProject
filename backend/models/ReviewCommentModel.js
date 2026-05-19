import { Schema, model } from "mongoose";

const reviewCommentSchema = new Schema(
  {
    prId: {
      type: Schema.Types.ObjectId,
      ref: "PullRequest",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    lineNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const ReviewCommentModel = model("ReviewComment", reviewCommentSchema);
