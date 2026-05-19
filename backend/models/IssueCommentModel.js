import { Schema, model } from "mongoose";

const issueCommentSchema = new Schema(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
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

export const IssueCommentModel = model("IssueComment", issueCommentSchema);
