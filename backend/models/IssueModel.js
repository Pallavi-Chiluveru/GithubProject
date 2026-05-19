import { Schema, model } from "mongoose";

const issueSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    repoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    labels: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const IssueModel = model("Issue", issueSchema);