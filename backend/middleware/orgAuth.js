import { OrgMemberModel } from "../models/OrgMemberModel.js";
import { OrganizationModel } from "../models/OrganizationModel.js";

/**
 * Role hierarchy for comparison
 */
const ROLE_LEVELS = {
  OWNER: 5,
  ADMIN: 4,
  MAINTAINER: 3,
  COLLABORATOR: 2,
  VIEWER: 1,
};

/**
 * Middleware to check if the user has a specific role in an organization.
 * Uses the normalized OrgMemberModel as the source of truth.
 * @param {Array} allowedRoles - List of roles that are allowed to access the route
 */
export const checkOrgRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.body.orgId || req.query.orgId;
      if (!orgId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }

      const org = await OrganizationModel.findById(orgId);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Check if user is owner (owner always has full access)
      const isOwner = org.owner.toString() === req.user.id;
      if (isOwner) {
        req.orgRole = "OWNER";
        req.org = org;
        return next();
      }

      // Check normalized OrgMember record
      const member = await OrgMemberModel.findOne({
        organization: orgId,
        user: req.user.id,
      });

      if (!member) {
        return res.status(403).json({ message: "You are not a member of this organization" });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          message: `This action requires one of these roles: ${allowedRoles.join(", ")}. Your role: ${member.role}`,
        });
      }

      req.orgRole = member.role;
      req.org = org;
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};

/**
 * Middleware to verify user is a member (any role) of the org.
 * Attaches req.orgRole.
 */
export const requireOrgMember = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.body.orgId || req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const org = await OrganizationModel.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Owner always passes
    if (org.owner.toString() === req.user.id) {
      req.orgRole = "OWNER";
      req.org = org;
      return next();
    }

    const member = await OrgMemberModel.findOne({
      organization: orgId,
      user: req.user.id,
    });

    if (!member) {
      return res.status(403).json({ message: "You are not a member of this organization" });
    }

    req.orgRole = member.role;
    req.org = org;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
