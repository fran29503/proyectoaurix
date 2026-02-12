import { createClient } from "@/lib/supabase/client";

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  resource_name: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditFilters {
  action?: string;
  resource?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "assign"
  | "login"
  | "logout"
  | "export"
  | "import"
  | "invite"
  | "deactivate"
  | "reactivate";

export type AuditResource =
  | "lead"
  | "property"
  | "task"
  | "user"
  | "team"
  | "report"
  | "settings";

/**
 * Get audit logs with filters and pagination
 */
export async function getAuditLogs(
  filters?: AuditFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<{ logs: AuditLog[]; total: number }> {
  const supabase = createClient();

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.action) {
    query = query.eq("action", filters.action);
  }

  if (filters?.resource) {
    query = query.eq("resource", filters.resource);
  }

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  if (filters?.search) {
    query = query.or(
      `user_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%,resource_name.ilike.%${filters.search}%`
    );
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching audit logs:", error);
    return { logs: [], total: 0 };
  }

  return {
    logs: (data as AuditLog[]) || [],
    total: count || 0,
  };
}

/**
 * Log an action to the audit trail
 * This is the main function to call from the application
 */
export async function logAuditAction(params: {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user profile for tenant_id
  const { data: profile } = await supabase
    .from("users")
    .select("id, tenant_id, email, full_name")
    .eq("auth_id", authUser.id)
    .single();

  if (!profile) {
    return { success: false, error: "User profile not found" };
  }

  // Insert audit log
  const { error } = await supabase.from("audit_logs").insert({
    tenant_id: profile.tenant_id,
    user_id: profile.id,
    user_email: profile.email,
    user_name: profile.full_name,
    action: params.action,
    resource: params.resource,
    resource_id: params.resourceId || null,
    resource_name: params.resourceName || null,
    old_values: params.oldValues || null,
    new_values: params.newValues || null,
    metadata: params.metadata || {},
  });

  if (error) {
    console.error("Error logging audit action:", error);
    return { success: false, error: "Failed to log action" };
  }

  return { success: true, error: null };
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(id: string): Promise<AuditLog | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching audit log:", error);
    return null;
  }

  return data as AuditLog;
}

/**
 * Get recent activity for a specific resource
 */
export async function getResourceActivity(
  resource: AuditResource,
  resourceId: string,
  limit: number = 10
): Promise<AuditLog[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("resource", resource)
    .eq("resource_id", resourceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching resource activity:", error);
    return [];
  }

  return (data as AuditLog[]) || [];
}

/**
 * Get user activity
 */
export async function getUserActivity(
  userId: string,
  limit: number = 20
): Promise<AuditLog[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }

  return (data as AuditLog[]) || [];
}

/**
 * Get audit stats for dashboard
 */
export async function getAuditStats(
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  mostActiveUsers: Array<{ user_name: string; count: number }>;
}> {
  const supabase = createClient();

  let query = supabase.from("audit_logs").select("action, resource, user_name");

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("created_at", dateTo);
  }

  const { data, error } = await query;

  if (error || !data) {
    return {
      totalActions: 0,
      actionsByType: {},
      actionsByResource: {},
      mostActiveUsers: [],
    };
  }

  const actionsByType: Record<string, number> = {};
  const actionsByResource: Record<string, number> = {};
  const userCounts: Record<string, number> = {};

  data.forEach((log) => {
    actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    actionsByResource[log.resource] = (actionsByResource[log.resource] || 0) + 1;
    if (log.user_name) {
      userCounts[log.user_name] = (userCounts[log.user_name] || 0) + 1;
    }
  });

  const mostActiveUsers = Object.entries(userCounts)
    .map(([user_name, count]) => ({ user_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalActions: data.length,
    actionsByType,
    actionsByResource,
    mostActiveUsers,
  };
}

/**
 * Action labels for display
 */
export const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  assign: "Assigned",
  login: "Logged in",
  logout: "Logged out",
  export: "Exported",
  import: "Imported",
  invite: "Invited",
  deactivate: "Deactivated",
  reactivate: "Reactivated",
};

/**
 * Resource labels for display
 */
export const resourceLabels: Record<string, string> = {
  lead: "Lead",
  property: "Property",
  task: "Task",
  user: "User",
  team: "Team",
  report: "Report",
  settings: "Settings",
};

/**
 * Get color for action type
 */
export const actionColors: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  assign: "bg-violet-100 text-violet-700",
  login: "bg-slate-100 text-slate-700",
  logout: "bg-slate-100 text-slate-700",
  export: "bg-amber-100 text-amber-700",
  import: "bg-cyan-100 text-cyan-700",
  invite: "bg-purple-100 text-purple-700",
  deactivate: "bg-red-100 text-red-700",
  reactivate: "bg-emerald-100 text-emerald-700",
};
