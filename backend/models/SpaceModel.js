import { Schema, model } from "mongoose";

const spaceSchema = new Schema(
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
    visibility: {
      type: String,
      enum: ["Private", "Public", "Organization"],
      default: "Private",
    },
    tags: {
      type: [String],
      default: [],
    },
    owner: {
      type: String,
      default: "Pallavi-Chiluveru",
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        id: String,
        avatar: String,
      },
    ],
    tab: {
      type: String,
      default: "yours",
    },
    files: [
      {
        name: String,
        size: String,
        date: String,
        type: { type: String },
      },
    ],
    tasks: [
      {
        id: String,
        title: String,
        status: { type: String, default: "pending" },
      },
    ],
    activity: [
      {
        user: String,
        action: String,
        target: String,
        time: String,
      },
    ],
  },
  { timestamps: true }
);

export const SpaceModel = model("Space", spaceSchema);
