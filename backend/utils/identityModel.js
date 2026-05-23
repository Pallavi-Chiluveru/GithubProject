/**
 * identityModel.js
 * Defines the unified identity contract across backend systems.
 * Ensures consistent username, owner name, commit author and avatar mapping.
 */

/**
 * @typedef {Object} RepositoryIdentity
 * @property {string} giteaUsername - The real authenticated Gitea username (from payload.sender.login or payload.pusher.username)
 * @property {string} repoOwner - The owner of the repository
 * @property {string} commitAuthor - The Git commit author name (from raw commit metadata)
 * @property {string} [avatarUrl] - Optional avatar URL of the user
 */

/**
 * Normalizes identity fields into the standard contract.
 * @param {string} giteaUsername 
 * @param {string} repoOwner 
 * @param {string} commitAuthor 
 * @param {string} [avatarUrl] 
 * @returns {RepositoryIdentity}
 */
export const createRepositoryIdentity = (giteaUsername, repoOwner, commitAuthor, avatarUrl = "") => {
  return {
    giteaUsername: giteaUsername || "Unknown",
    repoOwner: repoOwner || "Unknown",
    commitAuthor: commitAuthor || "Unknown",
    avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${giteaUsername || "Guest"}&background=random`
  };
};
