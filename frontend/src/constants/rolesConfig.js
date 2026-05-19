import { Shield, Users, Glasses } from "lucide-react";

export const ROLES = {
  OWNER: "OWNER",
  COLLABORATOR: "COLLABORATOR",
  VIEWER: "VIEWER",
};

export const ROLE_CONFIGS = {
  [ROLES.OWNER]: {
    title: "Owner",
    icon: Shield,
    color: "#ff4444",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    description: "Full administrative access to the organization and all repositories. Can manage all settings and members.",
    permissions: [
      { id: "full_control", label: "Full repository control", allowed: true },
      { id: "manage_members", label: "Add/remove members", allowed: true },
      { id: "delete_repo", label: "Delete repository", allowed: true },
      { id: "manage_settings", label: "Manage settings", allowed: true },
      { id: "manage_permissions", label: "Manage permissions", allowed: true },
      { id: "merge_prs", label: "Merge PRs", allowed: true },
      { id: "manage_branches", label: "Create/Delete branches", allowed: true },
    ],
    warning: "Owners have full administrative access.",
  },
  [ROLES.COLLABORATOR]: {
    title: "Collaborator",
    icon: Users,
    color: "#58a6ff",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "Can push to the repository, create branches, and manage pull requests.",
    permissions: [
      { id: "push_code", label: "Push code", allowed: true },
      { id: "create_branches", label: "Create branches", allowed: true },
      { id: "create_prs", label: "Create pull requests", allowed: true },
      { id: "review_prs", label: "Review PRs", allowed: true },
      { id: "limited_settings", label: "Limited settings access", allowed: true },
    ],
  },
  [ROLES.VIEWER]: {
    title: "Viewer",
    icon: Glasses,
    color: "#8b949e",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    description: "Read-only access to the organization and repositories. Can clone and view code.",
    permissions: [
      { id: "read_only", label: "Read-only access", allowed: true },
      { id: "clone_view", label: "Clone/view repository", allowed: true },
      { id: "push_modify", label: "Push or modify code", allowed: false },
    ],
  },
};

export const CUSTOM_PERMISSIONS_LIST = [
  { id: "canMergePRs", label: "Can Merge PRs" },
  { id: "canPush", label: "Can Push" },
  { id: "canManageMembers", label: "Can Manage Members" },
  { id: "canEditSettings", label: "Can Edit Settings" },
  { id: "canDeleteRepository", label: "Can Delete Repository" },
];


