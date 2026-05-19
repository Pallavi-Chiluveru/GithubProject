import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    prId: {
      type: Schema.Types.ObjectId,
      ref: "PullRequest",
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reviewType: {
      type: String,
      enum: ["approve", "request_changes", "comment"],
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const ReviewModel = model("Review", reviewSchema);
