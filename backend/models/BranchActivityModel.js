import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  type: { type: String, enum: ['push', 'merge', 'pr', 'protection_change'], required: true },
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Schema.Types.Mixed },
}, { timestamps: true });

activitySchema.index({ repoId: 1, branchId: 1, timestamp: -1 });

export const BranchActivityModel = model('BranchActivity', activitySchema);
