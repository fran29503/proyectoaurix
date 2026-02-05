import { createClient } from "@/lib/supabase/client";

export interface TeamMember {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: string;
  team: string | null;
  market: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamFilters {
  role?: string;
  market?: string;
  team?: string;
  isActive?: boolean;
}

export async function getTeamMembers(filters?: TeamFilters): Promise<TeamMember[]> {
  const supabase = createClient();

  let query = supabase
    .from("users")
    .select("*")
    .order("full_name", { ascending: true });

  if (filters?.role && filters.role !== "all") {
    query = query.eq("role", filters.role);
  }

  if (filters?.market && filters.market !== "all") {
    query = query.eq("market", filters.market);
  }

  if (filters?.team) {
    query = query.eq("team", filters.team);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }

  return data || [];
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching team member:", error);
    return null;
  }

  return data;
}

export async function getAgents(): Promise<TeamMember[]> {
  return getTeamMembers({ role: "agent" });
}

export async function getTeamStats() {
  const supabase = createClient();

  const { data: members, error } = await supabase
    .from("users")
    .select("role, market, is_active");

  if (error) {
    console.error("Error fetching team stats:", error);
    return null;
  }

  const total = members?.length || 0;
  const active = members?.filter((m) => m.is_active).length || 0;
  const byRole: Record<string, number> = {};
  const byMarket: Record<string, number> = {};

  members?.forEach((member) => {
    byRole[member.role] = (byRole[member.role] || 0) + 1;
    if (member.market) {
      byMarket[member.market] = (byMarket[member.market] || 0) + 1;
    }
  });

  return {
    total,
    active,
    byRole,
    byMarket,
    agents: (byRole["agent"] || 0) + (byRole["team_lead"] || 0),
  };
}

export const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  team_lead: "Team Lead",
  agent: "Agent",
  backoffice: "Back Office",
};

export const teamLabels: Record<string, string> = {
  "off-plan": "Off-Plan",
  secondary: "Secondary Market",
  leasing: "Leasing",
  usa_desk: "USA Desk",
};
