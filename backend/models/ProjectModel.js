import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    repoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    columns: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        cards: [
          {
            id: { type: String, required: true },
            title: { type: String, required: true },
            content: { type: String, default: "" },
            type: { type: String, enum: ["note", "issue", "pr"], default: "note" },
            referenceId: { type: Schema.Types.ObjectId },
          }
        ]
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }
  },
  { timestamps: true }
);

export const ProjectModel = model("Project", projectSchema);
