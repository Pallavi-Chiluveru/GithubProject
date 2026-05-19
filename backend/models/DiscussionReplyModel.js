import mongoose from "mongoose";

const discussionReplySchema = new mongoose.Schema({
  discussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discussion",
    required: true,
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
  parentReplyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DiscussionReply",
    default: null
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  isBestAnswer: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const DiscussionReplyModel = mongoose.model("DiscussionReply", discussionReplySchema);
