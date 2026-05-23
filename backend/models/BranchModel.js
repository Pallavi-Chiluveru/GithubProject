import { Schema, model } from 'mongoose';

const branchProtectionSchema = new Schema({
  requirePRReviews: { type: Boolean, default: false },
  requiredApprovals: { type: Number, default: 0 },
  allowForcePush: { type: Boolean, default: false },
  allowDirectPush: { type: Boolean, default: false },
}, { _id: false });

const branchSchema = new Schema({
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  name: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  createdAt: { type: Date, default: Date.now },
  latestCommitSha: { type: String },
  isDefault: { type: Boolean, default: false },
  isProtected: { type: Boolean, default: false },
  protection: { type: branchProtectionSchema },
  aheadCount: { type: Number, default: 0 },
  behindCount: { type: Number, default: 0 },
}, { timestamps: true });

branchSchema.index({ repoId: 1, name: 1 }, { unique: true });
branchSchema.index({ repoId: 1, isDefault: 1 });
branchSchema.index({ repoId: 1, isProtected: 1 });

export const BranchModel = model('Branch', branchSchema);
