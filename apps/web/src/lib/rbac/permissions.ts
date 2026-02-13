/**
 * AURIX Role-Based Access Control (RBAC) Configuration
 *
 * This file defines all permissions and role mappings for the system.
 */

export type Role = "admin" | "manager" | "team_lead" | "agent" | "backoffice";

export type Resource =
  | "dashboard"
  | "leads"
  | "properties"
  | "pipeline"
  | "tasks"
  | "team"
  | "reports"
  | "settings";

export type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "assign"
  | "export"
  | "import"
  | "manage";

export interface Permission {
  resource: Resource;
  actions: Action[];
  scope?: "own" | "team" | "all"; // own = only their data, team = their team's data, all = everything
}

/**
 * Permission definitions for each role
 */
export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: "dashboard", actions: ["view"], scope: "all" },
    { resource: "leads", actions: ["view", "create", "edit", "delete", "assign", "export", "import"], scope: "all" },
    { resource: "properties", actions: ["view", "create", "edit", "delete", "export", "import"], scope: "all" },
    { resource: "pipeline", actions: ["view", "edit"], scope: "all" },
    { resource: "tasks", actions: ["view", "create", "edit", "delete", "assign"], scope: "all" },
    { resource: "team", actions: ["view", "create", "edit", "delete", "manage"], scope: "all" },
    { resource: "reports", actions: ["view", "export"], scope: "all" },
    { resource: "settings", actions: ["view", "edit", "manage"], scope: "all" },
  ],

  manager: [
    { resource: "dashboard", actions: ["view"], scope: "all" },
    { resource: "leads", actions: ["view", "create", "edit", "delete", "assign", "export"], scope: "all" },
    { resource: "properties", actions: ["view", "create", "edit", "delete", "export"], scope: "all" },
    { resource: "pipeline", actions: ["view", "edit"], scope: "all" },
    { resource: "tasks", actions: ["view", "create", "edit", "delete", "assign"], scope: "all" },
    { resource: "team", actions: ["view", "create", "edit", "manage"], scope: "all" },
    { resource: "reports", actions: ["view", "export"], scope: "all" },
    { resource: "settings", actions: ["view", "edit"], scope: "all" },
  ],

  team_lead: [
    { resource: "dashboard", actions: ["view"], scope: "team" },
    { resource: "leads", actions: ["view", "create", "edit", "assign"], scope: "team" },
    { resource: "properties", actions: ["view"], scope: "all" },
    { resource: "pipeline", actions: ["view", "edit"], scope: "team" },
    { resource: "tasks", actions: ["view", "create", "edit", "assign"], scope: "team" },
    { resource: "team", actions: ["view"], scope: "team" },
    { resource: "reports", actions: ["view"], scope: "team" },
    { resource: "settings", actions: ["view"], scope: "own" },
  ],

  agent: [
    { resource: "dashboard", actions: ["view"], scope: "own" },
    { resource: "leads", actions: ["view", "create", "edit"], scope: "own" },
    { resource: "properties", actions: ["view"], scope: "all" },
    { resource: "pipeline", actions: ["view", "edit"], scope: "own" },
    { resource: "tasks", actions: ["view", "create", "edit"], scope: "own" },
    { resource: "team", actions: ["view"], scope: "team" },
    { resource: "reports", actions: ["view"], scope: "own" },
    { resource: "settings", actions: ["view"], scope: "own" },
  ],

  backoffice: [
    { resource: "dashboard", actions: ["view"], scope: "all" },
    { resource: "leads", actions: ["view"], scope: "all" },
    { resource: "properties", actions: ["view", "create", "edit", "delete", "export", "import"], scope: "all" },
    { resource: "pipeline", actions: ["view"], scope: "all" },
    { resource: "tasks", actions: ["view", "create", "edit"], scope: "own" },
    { resource: "team", actions: ["view"], scope: "all" },
    { resource: "reports", actions: ["view"], scope: "all" },
    { resource: "settings", actions: ["view"], scope: "own" },
  ],
};

/**
 * Navigation items visibility per role
 */
export const navPermissions: Record<Role, Resource[]> = {
  admin: ["dashboard", "leads", "pipeline", "properties", "tasks", "team", "reports", "settings"],
  manager: ["dashboard", "leads", "pipeline", "properties", "tasks", "team", "reports", "settings"],
  team_lead: ["dashboard", "leads", "pipeline", "properties", "tasks", "team", "reports"],
  agent: ["dashboard", "leads", "pipeline", "properties", "tasks"],
  backoffice: ["dashboard", "properties", "tasks", "reports"],
};

/**
 * Get the default modules a role has access to
 */
export function getDefaultModules(role: Role): Resource[] {
  return navPermissions[role] || [];
}

/**
 * Check if a user has access to a module, considering custom overrides
 */
export function hasModuleAccess(
  role: Role,
  resource: Resource,
  enabledModules: Resource[] | null
): boolean {
  if (enabledModules === null) {
    // No overrides - use role defaults
    return navPermissions[role]?.includes(resource) || false;
  }
  return enabledModules.includes(resource);
}

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action,
  enabledModules?: Resource[] | null
): boolean {
  // If custom modules are set, check module access first
  if (enabledModules !== undefined && enabledModules !== null) {
    if (!enabledModules.includes(resource)) return false;
  }

  const permissions = rolePermissions[role];
  if (!permissions) return false;

  const resourcePermission = permissions.find(p => p.resource === resource);
  if (!resourcePermission) {
    // If the role doesn't have this resource by default but it's in enabledModules,
    // grant basic view access
    if (enabledModules?.includes(resource)) {
      return action === "view";
    }
    return false;
  }

  return resourcePermission.actions.includes(action);
}

/**
 * Get the data scope for a role on a resource
 */
export function getDataScope(
  role: Role,
  resource: Resource
): "own" | "team" | "all" | null {
  const permissions = rolePermissions[role];
  if (!permissions) return null;

  const resourcePermission = permissions.find(p => p.resource === resource);
  return resourcePermission?.scope || null;
}

/**
 * Check if a role can see a navigation item, considering custom overrides
 */
export function canAccessNav(
  role: Role,
  resource: Resource,
  enabledModules?: Resource[] | null
): boolean {
  return hasModuleAccess(role, resource, enabledModules ?? null);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Role hierarchy for comparison (higher number = more access)
 */
export const roleHierarchy: Record<Role, number> = {
  admin: 5,
  manager: 4,
  team_lead: 3,
  agent: 2,
  backoffice: 1,
};

/**
 * Check if role A is higher or equal to role B
 */
export function isRoleHigherOrEqual(roleA: Role, roleB: Role): boolean {
  return roleHierarchy[roleA] >= roleHierarchy[roleB];
}

/**
 * Role display names
 */
export const roleDisplayNames: Record<Role, string> = {
  admin: "Administrator",
  manager: "Manager",
  team_lead: "Team Lead",
  agent: "Agent",
  backoffice: "Back Office",
};

/**
 * User Management Delegation Rules
 * Defines which roles each role can create/manage
 */
export const userManagementRules: Record<Role, {
  canCreateRoles: Role[];
  canManageScope: "all" | "market" | "team" | "none";
  canDeactivateRoles: Role[];
  canEditRoles: Role[];
}> = {
  admin: {
    canCreateRoles: ["admin", "manager", "team_lead", "agent", "backoffice"],
    canManageScope: "all",
    canDeactivateRoles: ["admin", "manager", "team_lead", "agent", "backoffice"],
    canEditRoles: ["admin", "manager", "team_lead", "agent", "backoffice"],
  },
  manager: {
    canCreateRoles: ["team_lead", "agent"],
    canManageScope: "market", // Only users in their market
    canDeactivateRoles: ["team_lead", "agent"],
    canEditRoles: ["team_lead", "agent"],
  },
  team_lead: {
    canCreateRoles: [], // Cannot create users
    canManageScope: "team", // Can only view their team
    canDeactivateRoles: [],
    canEditRoles: [],
  },
  agent: {
    canCreateRoles: [],
    canManageScope: "none",
    canDeactivateRoles: [],
    canEditRoles: [],
  },
  backoffice: {
    canCreateRoles: [],
    canManageScope: "none",
    canDeactivateRoles: [],
    canEditRoles: [],
  },
};

/**
 * Check if a role can create another role
 */
export function canCreateRole(creatorRole: Role, targetRole: Role): boolean {
  return userManagementRules[creatorRole]?.canCreateRoles.includes(targetRole) || false;
}

/**
 * Check if a role can manage (edit/deactivate) another role
 */
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  return userManagementRules[managerRole]?.canEditRoles.includes(targetRole) || false;
}

/**
 * Get the management scope for a role
 */
export function getManagementScope(role: Role): "all" | "market" | "team" | "none" {
  return userManagementRules[role]?.canManageScope || "none";
}

/**
 * Get roles that a user can create
 */
export function getCreatableRoles(role: Role): Role[] {
  return userManagementRules[role]?.canCreateRoles || [];
}
