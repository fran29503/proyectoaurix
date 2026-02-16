import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "./audit";

export interface Task {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  lead?: {
    id: string;
    full_name: string;
  };
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  type?: string;
  dueBefore?: string;
}

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  const supabase = createClient();

  let query = supabase
    .from("tasks")
    .select(`
      *,
      assigned_user:users!tasks_assigned_to_fkey(id, full_name, email),
      lead:leads!tasks_lead_id_fkey(id, full_name)
    `)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  if (filters?.assignedTo) {
    query = query.eq("assigned_to", filters.assignedTo);
  }

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters?.dueBefore) {
    query = query.lte("due_date", filters.dueBefore);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data || [];
}

export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assigned_user:users!tasks_assigned_to_fkey(id, full_name, email),
      lead:leads!tasks_lead_id_fkey(id, full_name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching task:", error);
    return null;
  }

  return data;
}

export async function getTasksByLead(leadId: string): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assigned_user:users!tasks_assigned_to_fkey(id, full_name, email)
    `)
    .eq("lead_id", leadId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching tasks by lead:", error);
    return [];
  }

  return data || [];
}

export async function updateTaskStatus(
  id: string,
  status: string,
  meta?: { oldStatus?: string; taskName?: string }
): Promise<boolean> {
  const supabase = createClient();

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating task status:", error);
    return false;
  }

  logAuditAction({
    action: "update",
    resource: "task",
    resourceId: id,
    resourceName: meta?.taskName,
    oldValues: meta?.oldStatus ? { status: meta.oldStatus } : undefined,
    newValues: { status },
  }).catch(() => {});

  return true;
}

export async function getTasksStats() {
  const supabase = createClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("status, priority, due_date");

  if (error) {
    console.error("Error fetching tasks stats:", error);
    return null;
  }

  const total = tasks?.length || 0;
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let overdue = 0;
  let dueToday = 0;

  tasks?.forEach((task) => {
    byStatus[task.status] = (byStatus[task.status] || 0) + 1;
    byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

    if (task.due_date && task.status !== "completed") {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        overdue++;
      } else if (dueDate.getTime() === today.getTime()) {
        dueToday++;
      }
    }
  });

  return {
    total,
    byStatus,
    byPriority,
    pending: byStatus["pending"] || 0,
    inProgress: byStatus["in_progress"] || 0,
    completed: byStatus["completed"] || 0,
    overdue,
    dueToday,
  };
}

export const taskTypeLabels: Record<string, string> = {
  follow_up: "Follow Up",
  call: "Call",
  meeting: "Meeting",
  email: "Email",
  document: "Document",
  other: "Other",
};

export const taskPriorityLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const taskStatusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};
