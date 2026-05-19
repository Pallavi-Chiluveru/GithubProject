/**
 * giteaOrgService.js
 * Manages organization mirroring between MongoDB and Gitea.
 * Gitea organizations enable proper team-based Git access control.
 */

import { adminClient, isGiteaConfigured } from "./giteaClient.js";

/**
 * Creates an organization in Gitea mirroring a MongoDB org.
 * @param {{ name: string, fullName?: string, description?: string, isPrivate?: boolean }} orgData
 * @returns {Promise<{ id: number, name: string } | null>}
 */
export const createGiteaOrg = async ({ name, fullName = "", description = "", isPrivate = false }) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().post("/orgs", {
      username: name,
      full_name: fullName || name,
      description,
      visibility: isPrivate ? "private" : "public",
    });
    console.log(`[Gitea] Created org: ${name}`);
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 422) {
      console.warn(`[Gitea] Org ${name} already exists — fetching.`);
      return getGiteaOrg(name);
    }
    console.error(`[Gitea] createGiteaOrg failed for ${name}:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Fetches Gitea org info by org username.
 * @param {string} orgName
 */
export const getGiteaOrg = async (orgName) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().get(`/orgs/${orgName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] getGiteaOrg failed for ${orgName}:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Adds a member to a Gitea organization team.
 * @param {string} orgName
 * @param {string} giteaUsername
 * @param {string} role — "owner" | "admin" | "member"
 */
export const addOrgMember = async (orgName, giteaUsername, role = "member") => {
  if (!isGiteaConfigured()) return;
  try {
    await adminClient().put(`/orgs/${orgName}/members/${giteaUsername}`);
    console.log(`[Gitea] Added ${giteaUsername} to org ${orgName} as ${role}`);
  } catch (err) {
    console.error(`[Gitea] addOrgMember failed:`, err.response?.data?.message);
  }
};

/**
 * Removes a member from a Gitea organization.
 * @param {string} orgName
 * @param {string} giteaUsername
 */
export const removeOrgMember = async (orgName, giteaUsername) => {
  if (!isGiteaConfigured()) return;
  try {
    await adminClient().delete(`/orgs/${orgName}/members/${giteaUsername}`);
    console.log(`[Gitea] Removed ${giteaUsername} from org ${orgName}`);
  } catch (err) {
    console.error(`[Gitea] removeOrgMember failed:`, err.response?.data?.message);
  }
};

/**
 * Transfers an existing Gitea repo to an organization.
 * @param {string} currentOwner
 * @param {string} repoName
 * @param {string} orgName
 */
export const transferRepoToOrg = async (currentOwner, repoName, orgName) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().post(`/repos/${currentOwner}/${repoName}/transfer`, {
      new_owner: orgName,
    });
    console.log(`[Gitea] Transferred ${repoName} to org ${orgName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] transferRepoToOrg failed:`, err.response?.data?.message);
    return null;
  }
};

/**
 * Creates a Gitea team within an organization.
 * @param {string} orgName
 * @param {{ name: string, description?: string, permission?: string }} teamData
 */
export const createGiteaTeam = async (orgName, { name, description = "", permission = "read" }) => {
  if (!isGiteaConfigured()) return null;
  try {
    const res = await adminClient().post(`/orgs/${orgName}/teams`, {
      name,
      description,
      permission,
      units: ["repo.code", "repo.issues", "repo.pulls"],
    });
    console.log(`[Gitea] Created team ${name} in org ${orgName}`);
    return res.data;
  } catch (err) {
    console.error(`[Gitea] createGiteaTeam failed:`, err.response?.data?.message);
    return null;
  }
};
