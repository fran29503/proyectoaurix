import { createClient } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "lead" | "task" | "property" | "system";
  href?: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const supabase = createClient();

  // Get recent audit logs as notifications (last 24h)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("id, action, resource, resource_name, user_name, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !logs) return [];

  const now = Date.now();

  return logs.map((log) => {
    const created = new Date(log.created_at).getTime();
    const diffMs = now - created;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    let time: string;
    if (diffMin < 1) time = "just now";
    else if (diffMin < 60) time = `${diffMin}m ago`;
    else if (diffHours < 24) time = `${diffHours}h ago`;
    else time = "1d ago";

    const actionLabels: Record<string, string> = {
      create: "New",
      update: "Updated",
      delete: "Deleted",
      export: "Exported",
      import: "Imported",
    };

    const resourceLabels: Record<string, string> = {
      lead: "lead",
      property: "property",
      task: "task",
      user: "user",
    };

    const actionLabel = actionLabels[log.action] || log.action;
    const resourceLabel = resourceLabels[log.resource] || log.resource;
    const title = `${actionLabel} ${resourceLabel}`;
    const description = log.resource_name
      ? `${log.resource_name}${log.user_name ? ` by ${log.user_name}` : ""}`
      : log.user_name || "";

    const typeMap: Record<string, Notification["type"]> = {
      lead: "lead",
      property: "property",
      task: "task",
    };

    return {
      id: log.id,
      title,
      description,
      time,
      unread: diffMin < 60,
      type: typeMap[log.resource] || "system",
    };
  });
}
