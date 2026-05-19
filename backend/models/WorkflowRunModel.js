import { Schema, model } from "mongoose";

const workflowRunSchema = new Schema(
  {
    repoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    workflowFile: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "running", "success", "failed"],
      default: "queued",
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    commitSha: {
      type: String,
      default: "",
    },
    logs: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

export const WorkflowRunModel = model("WorkflowRun", workflowRunSchema);
