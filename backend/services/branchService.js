import { BranchModel } from '../models/BranchModel.js';
import { RepositoryModel } from '../models/RepositoryModel.js'; // assuming exists
import { runGitCommand } from '../utils/gitHelper.js';
import path from 'path';

/**
 * List branches for a repository with optional filters.
 */
export const listBranches = async (repoId, filters = {}, pagination = { page: 1, limit: 20 }) => {
  const query = { repoId };
  if (filters.protected !== undefined) query.isProtected = filters.protected;
  if (filters.default !== undefined) query.isDefault = filters.default;
  if (filters.search) query.name = { $regex: filters.search, $options: 'i' };

  const skip = (pagination.page - 1) * pagination.limit;
  const branches = await BranchModel.find(query)
    .skip(skip)
    .limit(pagination.limit)
    .sort({ isDefault: -1, name: 1 })
    .lean();
  const total = await BranchModel.countDocuments(query);
  return { branches, total };
};

/**
 * Helper to get the absolute path of the repo on the filesystem.
 */
const getRepoPath = async (repoId) => {
  const repo = await RepositoryModel.findById(repoId).lean();
  if (!repo) throw new Error('Repository not found');
  // Assuming repo.localPath stores absolute path to repo directory
  return repo.localPath;
};

/**
 * Create a new branch from a source branch.
 */
export const createBranch = async (repoId, newName, sourceBranch = 'main', creatorId) => {
  if (!creatorId) throw new Error('Branch creator is required');
  if (!/^[A-Za-z0-9._/-]+$/.test(newName) || newName.includes('..') || newName.endsWith('/')) {
    throw new Error('Invalid branch name');
  }

  const repoPath = await getRepoPath(repoId);
  const existingDoc = await BranchModel.findOne({ repoId, name: newName });
  if (existingDoc) throw new Error('Branch already exists');

  // Verify source branch exists
  await runGitCommand(repoPath, ['rev-parse', '--verify', sourceBranch]);

  // Create branch unless a previous partial attempt already created it in Git.
  const branchAlreadyExistsInGit = await runGitCommand(repoPath, ['rev-parse', '--verify', newName])
    .then(() => true)
    .catch(() => false);
  if (!branchAlreadyExistsInGit) {
    await runGitCommand(repoPath, ['branch', newName, sourceBranch]);
  }

  const latestSha = await runGitCommand(repoPath, ['rev-parse', newName]);
  const branch = await BranchModel.create({
    repoId,
    name: newName,
    creator: creatorId,
    latestCommitSha: latestSha,
    isDefault: false,
    isProtected: false,
  });
  return branch;
};

/**
 * Delete a branch if it is not default or protected.
 */
export const deleteBranch = async (repoId, branchName) => {
  const branch = await BranchModel.findOne({ repoId, name: branchName });
  if (!branch) throw new Error('Branch not found');
  if (branch.isDefault) throw new Error('Cannot delete default branch');
  if (branch.isProtected) throw new Error('Branch is protected');
  const repoPath = await getRepoPath(repoId);
  // Delete locally
  await runGitCommand(repoPath, ['branch', '-D', branchName]);
  await BranchModel.deleteOne({ _id: branch._id });
  return true;
};

/**
 * Set a branch as the default.
 */
export const setDefaultBranch = async (repoId, branchName) => {
  const repo = await RepositoryModel.findById(repoId);
  if (!repo) throw new Error('Repository not found');
  const branch = await BranchModel.findOne({ repoId, name: branchName });
  if (!branch) throw new Error('Branch not found');
  // Update DB flags
  await BranchModel.updateMany({ repoId, isDefault: true }, { isDefault: false });
  branch.isDefault = true;
  await branch.save();
  // Update Git HEAD reference
  const repoPath = await getRepoPath(repoId);
  await runGitCommand(repoPath, ['symbolic-ref', 'HEAD', `refs/heads/${branchName}`]);
  return branch;
};

/**
 * Apply or update protection rules for a branch.
 */
export const protectBranch = async (repoId, branchName, rules) => {
  const branch = await BranchModel.findOne({ repoId, name: branchName });
  if (!branch) throw new Error('Branch not found');
  branch.isProtected = true;
  branch.protection = { ...branch.protection, ...rules };
  await branch.save();
  return branch;
};

/**
 * Remove protection from a branch.
 */
export const unprotectBranch = async (repoId, branchName) => {
  const branch = await BranchModel.findOne({ repoId, name: branchName });
  if (!branch) throw new Error('Branch not found');
  branch.isProtected = false;
  branch.protection = undefined;
  await branch.save();
  return branch;
};

/**
 * Compute ahead/behind counts relative to another branch.
 */
export const calculateAheadBehind = async (repoId, baseBranch, headBranch) => {
  const repoPath = await getRepoPath(repoId);
  const { ahead, behind } = await runGitCommand(repoPath, ['rev-list', '--left-right', '--count', `${baseBranch}...${headBranch}`])
    .then(res => {
      const [behindStr, aheadStr] = res.split('\t');
      return { ahead: Number(aheadStr), behind: Number(behindStr) };
    });
  // Update DB for headBranch
  await BranchModel.updateOne({ repoId, name: headBranch }, { aheadCount: ahead, behindCount: behind });
  return { ahead, behind };
};

/**
 * Compare two branches and return commit list and diff.
 */
export const compareBranches = async (repoId, baseBranch, headBranch) => {
  const repoPath = await getRepoPath(repoId);
  const commits = await runGitCommand(repoPath, ['log', '--pretty=format:%H|%an|%s', `${baseBranch}..${headBranch}`])
    .then(out => out ? out.split('\n').map(l => {
      const [hash, author, subject] = l.split('|');
      return { hash, author, subject };
    }) : []);
  const diff = await runGitCommand(repoPath, ['diff', `${baseBranch}..${headBranch}`]);
  return { commits, diff };
};
