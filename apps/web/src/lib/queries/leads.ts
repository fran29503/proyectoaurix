import { createClient } from "@/lib/supabase/client";

export interface Lead {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  nationality: string | null;
  language: string | null;
  source_channel: string | null;
  source_campaign: string | null;
  status: string;
  intent: string | null;
  interest_zone: string | null;
  interest_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  timeline: string | null;
  ai_score: number | null;
  ai_summary: string | null;
  assigned_to: string | null;
  market: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface LeadFilters {
  status?: string;
  market?: string;
  assignedTo?: string;
  search?: string;
}

export async function getLeads(filters?: LeadFilters): Promise<Lead[]> {
  const supabase = createClient();

  let query = supabase
    .from("leads")
    .select(`
      *,
      assigned_user:users!leads_assigned_to_fkey(id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.market && filters.market !== "all") {
    query = query.eq("market", filters.market);
  }

  if (filters?.assignedTo) {
    query = query.eq("assigned_to", filters.assignedTo);
  }

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return data || [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      assigned_user:users!leads_assigned_to_fkey(id, full_name, email)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching lead:", error);
    return null;
  }

  return data;
}

export async function getLeadsByStatus(): Promise<Record<string, Lead[]>> {
  const leads = await getLeads();

  const grouped: Record<string, Lead[]> = {};

  leads.forEach((lead) => {
    if (!grouped[lead.status]) {
      grouped[lead.status] = [];
    }
    grouped[lead.status].push(lead);
  });

  return grouped;
}

export async function updateLeadStatus(id: string, status: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating lead status:", error);
    return false;
  }

  return true;
}

export async function getLeadsStats() {
  const supabase = createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("status, market, ai_score");

  if (error) {
    console.error("Error fetching leads stats:", error);
    return null;
  }

  const total = leads?.length || 0;
  const byStatus: Record<string, number> = {};
  const byMarket: Record<string, number> = {};

  leads?.forEach((lead) => {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    if (lead.market) {
      byMarket[lead.market] = (byMarket[lead.market] || 0) + 1;
    }
  });

  return {
    total,
    byStatus,
    byMarket,
    qualified: byStatus["calificado"] || 0,
  };
}
