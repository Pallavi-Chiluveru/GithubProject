import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  category: {
    type: String,
    enum: ["GENERAL", "IDEAS", "Q&A", "SHOW_AND_TELL", "ANNOUNCEMENTS"],
    default: "GENERAL"
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  tags: [String],
  bestAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DiscussionReply"
  }
}, { timestamps: true });

export const DiscussionModel = mongoose.model("Discussion", discussionSchema);
