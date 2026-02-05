import { createClient } from "@/lib/supabase/client";

export interface Activity {
  id: string;
  tenant_id: string;
  lead_id: string;
  user_id: string | null;
  type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Joined fields
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  lead?: {
    id: string;
    full_name: string;
  };
}

export async function getActivitiesByLead(leadId: string): Promise<Activity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      user:users!activities_user_id_fkey(id, full_name, email)
    `)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  return data || [];
}

export async function getRecentActivities(limit: number = 20): Promise<Activity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      user:users!activities_user_id_fkey(id, full_name, email),
      lead:leads!activities_lead_id_fkey(id, full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }

  return data || [];
}

export async function createActivity(activity: {
  lead_id: string;
  user_id?: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<Activity | null> {
  const supabase = createClient();

  // Get the tenant_id from the lead
  const { data: lead } = await supabase
    .from("leads")
    .select("tenant_id")
    .eq("id", activity.lead_id)
    .single();

  if (!lead) {
    console.error("Lead not found");
    return null;
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({
      tenant_id: lead.tenant_id,
      ...activity,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating activity:", error);
    return null;
  }

  return data;
}

export const activityTypeIcons: Record<string, string> = {
  call: "Phone",
  email: "Mail",
  whatsapp: "MessageCircle",
  meeting: "Calendar",
  note: "FileText",
  status_change: "ArrowRight",
  assignment: "UserPlus",
  property_view: "Building2",
};

export const activityTypeLabels: Record<string, string> = {
  call: "Call",
  email: "Email",
  whatsapp: "WhatsApp",
  meeting: "Meeting",
  note: "Note",
  status_change: "Status Change",
  assignment: "Assignment",
  property_view: "Property View",
};
