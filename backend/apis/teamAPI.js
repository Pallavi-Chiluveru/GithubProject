import exp from "express";
import { TeamModel } from "../models/TeamModel.js";
import { OrganizationModel } from "../models/OrganizationModel.js";
import { ActivityLogModel } from "../models/ActivityLogModel.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { OrgMemberModel } from "../models/OrgMemberModel.js";
import { UserModel } from "../models/UserModel.js";

export const teamApp = exp.Router();

// Helper to check if user has permission to manage teams in an org
async function canManageTeams(orgId, userId) {
  const org = await OrganizationModel.findById(orgId);
  if (!org) return false;
  if (org.owner.toString() === userId) return true;

  const member = await OrgMemberModel.findOne({ organization: orgId, user: userId });
  return member && ["OWNER", "ADMIN", "MAINTAINER"].includes(member.role);
}

/* ─── CREATE TEAM ────────────────────────────────────────── */
teamApp.post("/create", verifyToken, async (req, res, next) => {
  try {
    const { name, description, organizationId, parentTeamId, avatar, visibility } = req.body;

    if (!name || !organizationId) {
      return res.status(400).json({ message: "Name and Organization ID are required" });
    }

    const hasPermission = await canManageTeams(organizationId, req.user.id);
    if (!hasPermission) {
      return res.status(403).json({ message: "Unauthorized to create teams in this organization" });
    }

    const newTeam = await TeamModel.create({
      name,
      description: description || "",
      organization: organizationId,
      parentTeam: parentTeamId || null,
      avatar: avatar || "",
      visibility: visibility || "VISIBLE",
      members: [{ user: req.user.id, role: "MAINTAINER" }]
    });

    // Add to organization's teams array
    await OrganizationModel.findByIdAndUpdate(organizationId, {
      $push: { teams: newTeam._id }
    });

    await ActivityLogModel.create({
      user: req.user.id,
      action: "team_created",
      message: `Created team "${name}"`,
      metadata: { orgId: organizationId, teamId: newTeam._id },
    });

    res.status(201).json({ message: "Team created successfully", team: newTeam });
  } catch (err) {
    next(err);
  }
});

/* ─── GET ORG TEAMS ───────────────────────────────────────── */
teamApp.get("/org/:orgId", verifyToken, async (req, res, next) => {
  try {
    const { orgId } = req.params;
    
    // Check if user is member of org
    const member = await OrgMemberModel.findOne({ organization: orgId, user: req.user.id });
    if (!member) {
      return res.status(403).json({ message: "Not a member of this organization" });
    }

    const teams = await TeamModel.find({ organization: orgId })
      .populate("parentTeam", "name")
      .populate("members.user", "username profileImageUrl")
      .lean();

    res.status(200).json(teams);
  } catch (err) {
    next(err);
  }
});

/* ─── GET TEAM DETAILS ────────────────────────────────────── */
teamApp.get("/:teamId", verifyToken, async (req, res, next) => {
  try {
    const team = await TeamModel.findById(req.params.teamId)
      .populate("organization", "name logo")
      .populate("parentTeam", "name")
      .populate("members.user", "username profileImageUrl email")
      .populate("repositories.repository", "name visibility")
      .lean();

    if (!team) return res.status(404).json({ message: "Team not found" });

    // Check visibility
    if (team.visibility === "SECRET") {
      const isMember = team.members.some(m => m.user._id.toString() === req.user.id);
      const isOrgAdmin = await canManageTeams(team.organization._id, req.user.id);
      if (!isMember && !isOrgAdmin) {
        return res.status(403).json({ message: "This team is secret" });
      }
    }

    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
});

/* ─── UPDATE TEAM ─────────────────────────────────────────── */
teamApp.patch("/:teamId", verifyToken, async (req, res, next) => {
  try {
    const team = await TeamModel.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const isMaintainer = team.members.some(m => m.user.toString() === req.user.id && m.role === "MAINTAINER");
    const isOrgAdmin = await canManageTeams(team.organization, req.user.id);

    if (!isMaintainer && !isOrgAdmin) {
      return res.status(403).json({ message: "Unauthorized to update this team" });
    }

    const { name, description, avatar, visibility } = req.body;
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (avatar !== undefined) team.avatar = avatar;
    if (visibility) team.visibility = visibility;

    await team.save();
    res.status(200).json({ message: "Team updated successfully", team });
  } catch (err) {
    next(err);
  }
});

/* ─── ADD TEAM MEMBER ─────────────────────────────────────── */
teamApp.post("/:teamId/members", verifyToken, async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { usernameOrEmail, role } = req.body;

    const team = await TeamModel.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const isMaintainer = team.members.some(m => m.user.toString() === req.user.id && m.role === "MAINTAINER");
    const isOrgAdmin = await canManageTeams(team.organization, req.user.id);

    if (!isMaintainer && !isOrgAdmin) {
      return res.status(403).json({ message: "Unauthorized to add members to this team" });
    }

    const userToAdd = await UserModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!userToAdd) return res.status(404).json({ message: "User not found" });

    // Check if user is part of the organization
    const isOrgMember = await OrgMemberModel.findOne({ organization: team.organization, user: userToAdd._id });
    if (!isOrgMember) {
      return res.status(400).json({ message: "User must be a member of the organization first" });
    }

    // Check if already a member
    if (team.members.some(m => m.user.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: "User is already a member of this team" });
    }

    team.members.push({ user: userToAdd._id, role: role || "MEMBER" });
    await team.save();

    res.status(200).json({ message: "Member added to team", team });
  } catch (err) {
    next(err);
  }
});

export default teamApp;
