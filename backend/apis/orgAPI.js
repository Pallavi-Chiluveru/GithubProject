import exp from "express";
import { OrganizationModel } from "../models/OrganizationModel.js";
import { InvitationModel } from "../models/InvitationModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { NotificationModel } from "../models/NotificationModel.js";
import { OrgMemberModel } from "../models/OrgMemberModel.js";
import { RepositoryModel } from "../models/RepositoryModel.js";
import { RepoPermissionModel } from "../models/RepoPermissionModel.js";
import { getIO } from "../socket.js";

export const orgApp = exp.Router();

/* ─── HELPERS ─────────────────────────────────────────────── */

/** Check if a user is owner or has one of the specified roles in the org.
 *  Returns { allowed: bool, role: string } */
async function getUserOrgRole(orgId, userId) {
  const org = await OrganizationModel.findById(orgId).lean();
  if (!org) return { allowed: false, role: null, org: null };

  if (org.owner.toString() === userId) {
    return { allowed: true, role: "OWNER", org };
  }

  const member = await OrgMemberModel.findOne({ organization: orgId, user: userId }).lean();
  if (!member) return { allowed: false, role: null, org };
  return { allowed: true, role: member.role, org };
}

const MANAGEABLE_ROLES = ["OWNER", "ADMIN", "MAINTAINER"];

/* ─── CREATE ORGANIZATION ──────────────────────────────────── */
orgApp.post("/create", verifyToken, async (req, res, next) => {
  try {
    const { name, description, logo, visibility } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Organization name is required" });
    }

    const existingOrg = await OrganizationModel.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({ message: "Organization name already exists" });
    }

    const newOrg = await OrganizationModel.create({
      name,
      description: description || "",
      logo: logo || "",
      visibility: visibility || "PUBLIC",
      owner: req.user.id,
    });

    // Create normalized OrgMember record for the owner
    await OrgMemberModel.create({
      organization: newOrg._id,
      user: req.user.id,
      role: "OWNER",
    });

    await ActivityLogModel.create({
      user: req.user.id,
      action: "org_created",
      message: `Created organization "${name}"`,
      metadata: { orgId: newOrg._id },
    });

    res.status(201).json({ message: "Organization created successfully", org: newOrg });
  } catch (err) {
    next(err);
  }
});

/* ─── GET MY ORGANIZATIONS ─────────────────────────────────── */
orgApp.get("/my-orgs", verifyToken, async (req, res, next) => {
  try {
    // Find all orgs where user is a member (via normalized table)
    const memberships = await OrgMemberModel.find({ user: req.user.id })
      .populate({
        path: "organization",
        populate: { path: "owner", select: "username email profileImageUrl" },
      })
      .lean();

    const orgs = memberships
      .filter((m) => m.organization) // guard deleted orgs
      .map((m) => ({ ...m.organization, myRole: m.role }));

    res.status(200).json(orgs);
  } catch (err) {
    next(err);
  }
});

/* ─── GET MY PENDING INVITES (must be before /:id to avoid route conflict) ── */
orgApp.get("/invites/my-invites", verifyToken, async (req, res, next) => {
  try {
    const invites = await InvitationModel.find({
      invitee: req.user.id,
      status: "pending",
    })
      .populate("organization", "name logo description")
      .populate("inviter", "username profileImageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(invites);
  } catch (err) {
    next(err);
  }
});

/* ─── GET ORG BY ID ────────────────────────────────────────── */
orgApp.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const org = await OrganizationModel.findById(req.params.id)
      .populate("owner", "username email profileImageUrl gitname")
      .populate("repositories")
      .lean();

    if (!org) return res.status(404).json({ message: "Organization not found" });

    // Fetch members from normalized table
    const members = await OrgMemberModel.find({ organization: req.params.id })
      .populate("user", "username email profileImageUrl gitname")
      .lean();

    // Check if requesting user has access (public orgs are viewable by all logged-in users)
    const isOwner = org.owner._id.toString() === req.user.id;
    const isMember = members.some((m) => m.user?._id?.toString() === req.user.id);

    if (org.visibility === "PRIVATE" && !isOwner && !isMember) {
      return res.status(403).json({ message: "This organization is private" });
    }

    res.status(200).json({ ...org, members });
  } catch (err) {
    next(err);
  }
});

/* ─── GET ORG ACTIVITY ─────────────────────────────────────── */
orgApp.get("/:orgId/activity", verifyToken, async (req, res, next) => {
  try {
    const { orgId } = req.params;

    const { allowed } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed) return res.status(403).json({ message: "Not a member of this organization" });

    const logs = await ActivityLogModel.find({
      "metadata.orgId": orgId,
    })
      .populate("user", "username profileImageUrl")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Fallback: get member IDs and fetch their activity
    if (logs.length === 0) {
      const members = await OrgMemberModel.find({ organization: orgId }).select("user").lean();
      const userIds = members.map((m) => m.user);
      const activityLogs = await ActivityLogModel.find({ user: { $in: userIds } })
        .populate("user", "username profileImageUrl")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      return res.status(200).json(activityLogs);
    }

    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
});

/* ─── INVITE MEMBER ────────────────────────────────────────── */
orgApp.post("/invite", verifyToken, async (req, res) => {
  try {
    const { orgId, usernameOrEmail, role, customPermissions } = req.body;

    const { allowed, role: requesterRole, org } = await getUserOrgRole(orgId, req.user.id);

    if (!allowed || !MANAGEABLE_ROLES.includes(requesterRole)) {
      return res.status(403).json({ message: "Only owners and admins can invite members" });
    }

    // Find the user to invite
    const invitee = await UserModel.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
        { gitname: usernameOrEmail },
      ],
    });

    if (!invitee) return res.status(404).json({ message: "User not found" });

    // Prevent inviting self
    if (invitee._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot invite yourself" });
    }

    // Check if already a member (normalized table)
    const existingMember = await OrgMemberModel.findOne({
      organization: orgId,
      user: invitee._id,
    });
    if (existingMember) {
      return res.status(400).json({ message: "User is already a member of this organization" });
    }

    // Check if also the owner
    if (org.owner.toString() === invitee._id.toString()) {
      return res.status(400).json({ message: "User is already the owner of this organization" });
    }

    // Prevent duplicate pending invitations
    const existingInvite = await InvitationModel.findOne({
      organization: orgId,
      invitee: invitee._id,
      status: "pending",
    });
    if (existingInvite) {
      return res.status(400).json({ message: "An invitation is already pending for this user" });
    }

    // Validate role
    const validRoles = ["OWNER", "COLLABORATOR", "VIEWER"];
    const assignedRole = validRoles.includes(role) ? role : "COLLABORATOR";
    
    // Check if requester has authority to grant this role
    // (Only owners can grant OWNER role)
    if (assignedRole === "OWNER" && requesterRole !== "OWNER") {
      return res.status(403).json({ message: "Only the organization owner can invite another owner" });
    }

    const invitation = await InvitationModel.create({
      organization: orgId,
      inviter: req.user.id,
      invitee: invitee._id,
      role: assignedRole,
      customPermissions: customPermissions || {}
    });

    await ActivityLogModel.create({
      user: req.user.id,
      action: "org_invite_sent",
      message: `Invited ${invitee.username} to organization "${org.name}" as ${assignedRole}`,
      metadata: { orgId },
    });

    // Create real-time notification for invitee
    const inviterUser = await UserModel.findById(req.user.id).select("username profileImageUrl").lean();
    const notification = await NotificationModel.create({
      user: invitee._id,
      type: "org_invite",
      message: `${inviterUser.username} invited you to join "${org.name}" as ${assignedRole}`,
      relatedId: invitation._id,
    });

    // Emit via Socket.IO
    getIO().to(invitee._id.toString()).emit("new_notification", {
      ...notification.toObject(),
      invitation: {
        _id: invitation._id,
        organization: { _id: org._id, name: org.name, logo: org.logo },
        inviter: { username: inviterUser.username, profileImageUrl: inviterUser.profileImageUrl },
        role: assignedRole,
      },
    });

    res.status(200).json({ message: "Invitation sent successfully", invitation });
  } catch (err) {
    next(err);
  }
});

// GET /invites/my-invites moved above GET /:id to fix route ordering

/* ─── ACCEPT / REJECT INVITE ───────────────────────────────── */
orgApp.post("/respond-invite", verifyToken, async (req, res) => {
  try {
    const { inviteId, action } = req.body;

    const invite = await InvitationModel.findById(inviteId)
      .populate("organization")
      .populate("inviter", "username");

    if (!invite) return res.status(404).json({ message: "Invitation not found" });

    if (invite.invitee.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to respond to this invitation" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: `Invitation already ${invite.status}` });
    }

    if (action === "accept") {
      invite.status = "accepted";
      await invite.save();

      const org = invite.organization;
      const role = invite.role || "COLLABORATOR";

      // Add to normalized OrgMember table (upsert to be safe)
      await OrgMemberModel.findOneAndUpdate(
        { organization: org._id, user: req.user.id },
        { role },
        { upsert: true, new: true }
      );

      // Also sync to embedded org.members array for backwards compatibility
      const orgDoc = await OrganizationModel.findById(org._id);
      const alreadyEmbedded = orgDoc.members.some(
        (m) => m.user.toString() === req.user.id
      );
      if (!alreadyEmbedded) {
        orgDoc.members.push({ user: req.user.id, role });
        await orgDoc.save();
      }

      await ActivityLogModel.create({
        user: req.user.id,
        action: "org_invite_accepted",
        message: `Joined organization "${org.name}" as ${role}`,
        metadata: { orgId: org._id },
      });

      // Notify inviter
      const notification = await NotificationModel.create({
        user: invite.inviter._id,
        type: "invite_accepted",
        message: `${req.user.username || "A user"} accepted your invitation to join "${org.name}"`,
        relatedId: org._id,
      });

      getIO().to(invite.inviter._id.toString()).emit("new_notification", notification);
      getIO().to(org._id.toString()).emit("member_joined", {
        user: req.user.id,
        role,
        orgId: org._id,
      });

      // Return the updated org with members
      const updatedOrg = await OrganizationModel.findById(org._id)
        .populate("owner", "username email profileImageUrl")
        .lean();
      const members = await OrgMemberModel.find({ organization: org._id })
        .populate("user", "username email profileImageUrl")
        .lean();

      res.status(200).json({ message: "Invitation accepted", org: { ...updatedOrg, members } });
    } else if (action === "reject") {
      invite.status = "rejected";
      await invite.save();

      const notification = await NotificationModel.create({
        user: invite.inviter._id || invite.inviter,
        type: "invite_rejected",
        message: `${req.user.username || "A user"} declined your invitation to join "${invite.organization.name}"`,
        relatedId: invite.organization._id,
      });

      getIO().to((invite.inviter._id || invite.inviter).toString()).emit("new_notification", notification);

      res.status(200).json({ message: "Invitation rejected" });
    } else {
      res.status(400).json({ message: "Invalid action. Use 'accept' or 'reject'" });
    }
  } catch (err) {
    next(err);
  }
});

/* ─── REMOVE MEMBER ────────────────────────────────────────── */
orgApp.delete("/remove-member", verifyToken, async (req, res) => {
  try {
    const { orgId, memberId } = req.body;

    const { allowed, role: requesterRole, org } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed || !MANAGEABLE_ROLES.includes(requesterRole)) {
      return res.status(403).json({ message: "Only owners and admins can remove members" });
    }

    if (org.owner.toString() === memberId) {
      return res.status(400).json({ message: "Cannot remove the organization owner" });
    }

    // Prevent admin from removing owner or another admin (only owner can do that)
    if (requesterRole === "ADMIN") {
      const targetMember = await OrgMemberModel.findOne({ organization: orgId, user: memberId });
      if (targetMember && targetMember.role === "ADMIN") {
        return res.status(403).json({ message: "Admins cannot remove other admins" });
      }
    }

    // Remove from normalized table
    const deleted = await OrgMemberModel.findOneAndDelete({
      organization: orgId,
      user: memberId,
    });
    if (!deleted) return res.status(404).json({ message: "User is not a member" });

    // Sync: remove from embedded array
    await OrganizationModel.findByIdAndUpdate(orgId, {
      $pull: { members: { user: memberId } },
    });

    const notification = await NotificationModel.create({
      user: memberId,
      type: "member_removed",
      message: `You have been removed from the organization "${org.name}"`,
      relatedId: org._id,
    });

    getIO().to(memberId.toString()).emit("new_notification", notification);
    getIO().to(org._id.toString()).emit("member_removed", { userId: memberId, orgId });

    await ActivityLogModel.create({
      user: req.user.id,
      action: "member_removed",
      message: `Removed member from organization "${org.name}"`,
      metadata: { orgId, memberId },
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
});

/* ─── CHANGE MEMBER ROLE ───────────────────────────────────── */
orgApp.patch("/change-role", verifyToken, async (req, res) => {
  try {
    const { orgId, memberId, newRole } = req.body;

    const validRoles = ["OWNER", "MAINTAINER", "COLLABORATOR", "CONTRIBUTOR", "VIEWER"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    const { allowed, role: requesterRole, org } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed || requesterRole !== "OWNER") {
      return res.status(403).json({ message: "Only the owner can change member roles" });
    }

    if (org.owner.toString() === memberId) {
      return res.status(400).json({ message: "Cannot change the owner's role" });
    }

    // Update normalized table
    const updated = await OrgMemberModel.findOneAndUpdate(
      { organization: orgId, user: memberId },
      { role: newRole },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User is not a member" });

    // Sync embedded array
    await OrganizationModel.findOneAndUpdate(
      { _id: orgId, "members.user": memberId },
      { $set: { "members.$.role": newRole } }
    );

    const notification = await NotificationModel.create({
      user: memberId,
      type: "role_updated",
      message: `Your role in "${org.name}" has been updated to ${newRole}`,
      relatedId: org._id,
    });

    getIO().to(memberId.toString()).emit("new_notification", notification);
    getIO().to(org._id.toString()).emit("role_updated", { userId: memberId, role: newRole, orgId });

    res.status(200).json({ message: "Role updated successfully", member: updated });
  } catch (err) {
    next(err);
  }
});

/* ─── LEAVE ORGANIZATION ───────────────────────────────────── */
orgApp.delete("/leave/:orgId", verifyToken, async (req, res) => {
  try {
    const { orgId } = req.params;

    const org = await OrganizationModel.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    if (org.owner.toString() === req.user.id) {
      return res.status(400).json({
        message: "Owners cannot leave their organization. Transfer ownership or delete it instead.",
      });
    }

    // Remove from normalized table
    const deleted = await OrgMemberModel.findOneAndDelete({
      organization: orgId,
      user: req.user.id,
    });
    if (!deleted) {
      return res.status(400).json({ message: "You are not a member of this organization" });
    }

    // Sync embedded array
    await OrganizationModel.findByIdAndUpdate(orgId, {
      $pull: { members: { user: req.user.id } },
    });

    await ActivityLogModel.create({
      user: req.user.id,
      action: "org_left",
      message: `Left organization "${org.name}"`,
      metadata: { orgId },
    });

    res.status(200).json({ message: "You have left the organization" });
  } catch (err) {
    next(err);
  }
});

/* ─── UPDATE ORGANIZATION ──────────────────────────────────── */
orgApp.patch("/:orgId/update", verifyToken, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { description, logo, visibility } = req.body;

    const { allowed, role: requesterRole } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed || !MANAGEABLE_ROLES.includes(requesterRole)) {
      return res.status(403).json({ message: "Only owners and admins can update organization settings" });
    }

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (logo !== undefined) updates.logo = logo;
    if (visibility !== undefined && ["PUBLIC", "PRIVATE"].includes(visibility)) {
      updates.visibility = visibility;
    }

    const updated = await OrganizationModel.findByIdAndUpdate(orgId, updates, { new: true });
    res.status(200).json({ message: "Organization updated", org: updated });
  } catch (err) {
    next(err);
  }
});

/* ─── DELETE ORGANIZATION ──────────────────────────────────── */
orgApp.delete("/:orgId", verifyToken, async (req, res) => {
  try {
    const { orgId } = req.params;

    const org = await OrganizationModel.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    if (org.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can delete the organization" });
    }

    // Cascade delete: OrgMembers
    await OrgMemberModel.deleteMany({ organization: orgId });
    // Optionally unlink repos (keep repos but remove org association)
    await RepositoryModel.updateMany({ organization: orgId }, { $unset: { organization: 1 } });
    await org.deleteOne();

    await ActivityLogModel.create({
      user: req.user.id,
      action: "org_deleted",
      message: `Deleted organization "${org.name}"`,
    });

    res.status(200).json({ message: "Organization deleted" });
  } catch (err) {
    next(err);
  }
});

/* ─── GET ORG MEMBERS (normalized) ────────────────────────── */
orgApp.get("/:orgId/members", verifyToken, async (req, res) => {
  try {
    const { orgId } = req.params;

    const { allowed } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed) return res.status(403).json({ message: "Not a member of this organization" });

    const members = await OrgMemberModel.find({ organization: orgId })
      .populate("user", "username email profileImageUrl gitname")
      .sort({ joinedAt: 1 })
      .lean();

    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
});

/* ─── GET ORG REPOSITORIES ─────────────────────────────────── */
orgApp.get("/:orgId/repos", verifyToken, async (req, res) => {
  try {
    const { orgId } = req.params;

    const { allowed, role } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed) return res.status(403).json({ message: "Not a member of this organization" });

    // Viewers and above can see all repos; non-members only see public ones
    const query = { organization: orgId };
    if (!["OWNER", "ADMIN", "MAINTAINER", "COLLABORATOR"].includes(role)) {
      query.visibility = { $in: ["PUBLIC", "INTERNAL"] };
    }

    const repos = await RepositoryModel.find(query)
      .populate("owner", "username profileImageUrl")
      .sort({ updatedAt: -1 });

    res.status(200).json(repos);
  } catch (err) {
    next(err);
  }
});

/* ─── REPO PERMISSION MANAGEMENT ───────────────────────────── */

/** Grant / update a user's explicit permission on an org repo */
orgApp.post("/:orgId/repos/:repoId/permissions", verifyToken, async (req, res) => {
  try {
    const { orgId, repoId } = req.params;
    const { userId, permission } = req.body;

    const { allowed, role: requesterRole } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed || !MANAGEABLE_ROLES.includes(requesterRole)) {
      return res.status(403).json({ message: "Only owners and admins can manage repository permissions" });
    }

    const validPerms = ["READ", "WRITE", "ADMIN"];
    if (!validPerms.includes(permission)) {
      return res.status(400).json({ message: `Invalid permission. Must be one of: ${validPerms.join(", ")}` });
    }

    const repo = await RepositoryModel.findOne({ _id: repoId, organization: orgId });
    if (!repo) return res.status(404).json({ message: "Repository not found in this organization" });

    const updated = await RepoPermissionModel.findOneAndUpdate(
      { repository: repoId, user: userId },
      { permission },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Permission updated", permission: updated });
  } catch (err) {
    next(err);
  }
});

/** Get all permissions for an org repo */
orgApp.get("/:orgId/repos/:repoId/permissions", verifyToken, async (req, res) => {
  try {
    const { orgId, repoId } = req.params;

    const { allowed, role: requesterRole } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed || !MANAGEABLE_ROLES.includes(requesterRole)) {
      return res.status(403).json({ message: "Only owners and admins can view repository permissions" });
    }

    const permissions = await RepoPermissionModel.find({ repository: repoId })
      .populate("user", "username email profileImageUrl")
      .lean();

    res.status(200).json(permissions);
  } catch (err) {
    next(err);
  }
});

/** Revoke a user's permission on a repo */
orgApp.delete("/:orgId/repos/:repoId/permissions/:userId", verifyToken, async (req, res) => {
  try {
    const { orgId, repoId, userId } = req.params;

    const { allowed, role: requesterRole } = await getUserOrgRole(orgId, req.user.id);
    if (!allowed || !MANAGEABLE_ROLES.includes(requesterRole)) {
      return res.status(403).json({ message: "Only owners and admins can revoke repository permissions" });
    }

    await RepoPermissionModel.findOneAndDelete({ repository: repoId, user: userId });

    res.status(200).json({ message: "Permission revoked" });
  } catch (err) {
    next(err);
  }
});

/* GET USER ORGANIZATIONS BY USERNAME */
orgApp.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const memberships = await OrgMemberModel.find({ user: user._id })
      .populate("organization", "name logo description visibility")
      .lean();

    const orgs = memberships
      .filter((m) => m.organization && m.organization.visibility === "PUBLIC")
      .map((m) => m.organization);

    res.status(200).json(orgs);
  } catch (err) {
    next(err);
  }
});
