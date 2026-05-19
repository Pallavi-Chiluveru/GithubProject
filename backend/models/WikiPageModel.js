import { Schema, model } from "mongoose";

const wikiPageSchema = new Schema(
  {
    repoId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }
  },
  { timestamps: true }
);

export const WikiPageModel = model("WikiPage", wikiPageSchema);
