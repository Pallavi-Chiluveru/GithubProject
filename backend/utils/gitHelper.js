import { exec } from 'child_process';
import path from 'path';

/**
 * Executes a git command in the specified repository directory.
 * @param {string} repoPath Absolute path to the repository root.
 * @param {string[]} args Array of git arguments (e.g., ['rev-parse', '--abbrev-ref', 'HEAD']).
 * @returns {Promise<string>} Resolves with stdout trimmed.
 */
export const runGitCommand = (repoPath, args) => {
  return new Promise((resolve, reject) => {
    const cmd = `git ${args.map(arg => `"${arg}"`).join(' ')}`;
    exec(cmd, { cwd: repoPath }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Git command failed: ${cmd}\n${stderr.trim()}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

/**
 * Gets the latest commit SHA for a given branch.
 * @param {string} repoPath
 * @param {string} branch
 * @returns {Promise<string>}
 */
export const getLatestCommitSha = async (repoPath, branch) => {
  const sha = await runGitCommand(repoPath, ['rev-parse', branch]);
  return sha;
};

/**
 * Calculates ahead/behind counts between two branches.
 * Returns an object { ahead: number, behind: number }.
 */
export const getAheadBehind = async (repoPath, base, head) => {
  const result = await runGitCommand(repoPath, ['rev-list', '--left-right', '--count', `${base}...${head}`]);
  const [behind, ahead] = result.split('\t').map(Number);
  return { ahead, behind };
};

/**
 * Returns a list of commits that differ between base and head.
 */
export const getCommitsBetween = async (repoPath, base, head) => {
  const log = await runGitCommand(repoPath, ['log', '--pretty=format:%H|%an|%s', `${base}..${head}`]);
  if (!log) return [];
  return log.split('\n').map(line => {
    const [hash, author, subject] = line.split('|');
    return { hash, author, subject };
  });
};

/**
 * Returns a unified diff between two branches.
 */
export const getDiffBetween = async (repoPath, base, head) => {
  const diff = await runGitCommand(repoPath, ['diff', `${base}..${head}`]);
  return diff;
};
