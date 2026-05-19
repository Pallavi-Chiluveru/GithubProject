import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  invitee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  role: {
    type: String,
    enum: ["OWNER", "MAINTAINER", "COLLABORATOR", "CONTRIBUTOR", "VIEWER"],
    default: "COLLABORATOR"
  },
  customPermissions: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, { timestamps: true });

// Prevent duplicate pending invitations for the same user+org
invitationSchema.index({ organization: 1, invitee: 1, status: 1 });

export const InvitationModel = mongoose.model("Invitation", invitationSchema);
