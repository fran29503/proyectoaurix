import { createClient } from "@/lib/supabase/client";

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  totalProperties: number;
  closings: number;
  leadsByMarket: { dubai: number; usa: number };
  propertiesByMarket: { dubai: number; usa: number };
  leadsByStatus: Record<string, number>;
  leadsByChannel: Record<string, number>;
}

export interface RecentLead {
  id: string;
  name: string;
  channel: string;
  interest: string;
  budget: string;
  status: string;
  time: string;
  market: string;
}

export interface TopAgent {
  id: string;
  name: string;
  closings: number;
  totalLeads: number;
  avatar: string;
}

export interface SLAAlert {
  id: string;
  leadName: string;
  market: string;
  time: string;
  assignee: string;
  severity: "high" | "medium" | "low";
  createdAt: Date;
}

// Get all dashboard stats in one call
export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = createClient();

  try {
    // Fetch leads and properties in parallel
    const [leadsResult, propertiesResult] = await Promise.all([
      supabase.from("leads").select("status, market, channel"),
      supabase.from("properties").select("status, market"),
    ]);

    if (leadsResult.error) {
      console.error("Error fetching leads for stats:", leadsResult.error.message, leadsResult.error.details);
      return null;
    }

    if (propertiesResult.error) {
      console.error("Error fetching properties for stats:", propertiesResult.error.message, propertiesResult.error.details);
      return null;
    }

  const leads = leadsResult.data || [];
  const properties = propertiesResult.data || [];

  // Calculate lead stats
  const leadsByStatus: Record<string, number> = {};
  const leadsByChannel: Record<string, number> = {};
  let dubaiLeads = 0;
  let usaLeads = 0;

  leads.forEach((lead) => {
    leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
    if (lead.channel) {
      leadsByChannel[lead.channel] = (leadsByChannel[lead.channel] || 0) + 1;
    }
    if (lead.market === "dubai") dubaiLeads++;
    if (lead.market === "usa") usaLeads++;
  });

  // Calculate property stats
  let dubaiProperties = 0;
  let usaProperties = 0;
  let availableProperties = 0;

  properties.forEach((property) => {
    if (property.market === "dubai") dubaiProperties++;
    if (property.market === "usa") usaProperties++;
    if (property.status === "disponible") availableProperties++;
  });

  // Closings = leads with status "cerrado" or "ganado"
  const closings = (leadsByStatus["cerrado"] || 0) + (leadsByStatus["ganado"] || 0);

    return {
      totalLeads: leads.length,
      qualifiedLeads: leadsByStatus["calificado"] || 0,
      totalProperties: availableProperties,
      closings,
      leadsByMarket: { dubai: dubaiLeads, usa: usaLeads },
      propertiesByMarket: { dubai: dubaiProperties, usa: usaProperties },
      leadsByStatus,
      leadsByChannel,
    };
  } catch (err) {
    console.error("Unexpected error in getDashboardStats:", err);
    return null;
  }
}

// Get recent leads for dashboard
export async function getRecentLeads(limit: number = 5): Promise<RecentLead[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("id, full_name, channel, interest_zone, interest_type, budget_min, budget_max, budget_currency, status, market, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent leads:", error.message, error.details);
      return [];
    }

    return (data || []).map((lead) => {
      const now = new Date();
      const created = new Date(lead.created_at);
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo: string;
      if (diffMins < 1) {
        timeAgo = "just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} min ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else {
        timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      }

      // Format budget
      let budget = "Not specified";
      if (lead.budget_min && lead.budget_max) {
        const currency = lead.budget_currency || "AED";
        const formatPrice = (price: number) => {
          if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
          if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
          return price.toLocaleString();
        };
        budget = `${currency} ${formatPrice(lead.budget_min)} - ${formatPrice(lead.budget_max)}`;
      }

      return {
        id: lead.id,
        name: lead.full_name,
        channel: lead.channel || "Direct",
        interest: lead.interest_type || lead.interest_zone || "Not specified",
        budget,
        status: lead.status,
        time: timeAgo,
        market: lead.market || "dubai",
      };
    });
  } catch (err) {
    console.error("Unexpected error in getRecentLeads:", err);
    return [];
  }
}

// Get SLA alerts (leads without response for more than 10 minutes)
export async function getSLAAlerts(): Promise<SLAAlert[]> {
  const supabase = createClient();

  // Get leads that are new and haven't been contacted yet
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      full_name,
      market,
      created_at,
      assigned_to
    `)
    .eq("status", "nuevo")
    .lt("created_at", tenMinutesAgo)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching SLA alerts:", error);
    return [];
  }

  // Get assignee names separately if there are assigned leads
  const assignedToIds = (data || [])
    .map((lead) => lead.assigned_to)
    .filter((id): id is string => id !== null);

  let assigneeMap: Record<string, string> = {};
  if (assignedToIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name")
      .in("id", assignedToIds);

    users?.forEach((user) => {
      assigneeMap[user.id] = user.full_name;
    });
  }

  return (data || []).map((lead) => {
    const now = new Date();
    const created = new Date(lead.created_at);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    let severity: "high" | "medium" | "low" = "low";
    if (diffMins > 30) severity = "high";
    else if (diffMins > 15) severity = "medium";

    return {
      id: lead.id,
      leadName: lead.full_name,
      market: lead.market === "dubai" ? "Dubai" : "USA",
      time: `${diffMins} min`,
      assignee: lead.assigned_to ? assigneeMap[lead.assigned_to] || "Unknown" : "Unassigned",
      severity,
      createdAt: created,
    };
  });
}

// Get top performing agents
export async function getTopAgents(limit: number = 3): Promise<TopAgent[]> {
  const supabase = createClient();

  // Get users with their lead counts
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "agent");

  if (usersError) {
    console.error("Error fetching users:", usersError);
    return [];
  }

  // Get leads grouped by assigned_to
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("assigned_to, status");

  if (leadsError) {
    console.error("Error fetching leads for agents:", leadsError);
    return [];
  }

  // Calculate stats per agent
  const agentStats: Record<string, { totalLeads: number; closings: number }> = {};

  leads?.forEach((lead) => {
    if (lead.assigned_to) {
      if (!agentStats[lead.assigned_to]) {
        agentStats[lead.assigned_to] = { totalLeads: 0, closings: 0 };
      }
      agentStats[lead.assigned_to].totalLeads++;
      if (lead.status === "cerrado" || lead.status === "ganado") {
        agentStats[lead.assigned_to].closings++;
      }
    }
  });

  // Map users with their stats and sort by closings
  const agentsWithStats = (users || [])
    .map((user) => ({
      id: user.id,
      name: user.full_name,
      closings: agentStats[user.id]?.closings || 0,
      totalLeads: agentStats[user.id]?.totalLeads || 0,
      avatar: user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    }))
    .filter((agent) => agent.totalLeads > 0)
    .sort((a, b) => b.closings - a.closings || b.totalLeads - a.totalLeads)
    .slice(0, limit);

  return agentsWithStats;
}

// Get lead trend data for charts
export async function getLeadTrendData() {
  const supabase = createClient();

  // Get leads from last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const { data, error } = await supabase
    .from("leads")
    .select("market, created_at")
    .gte("created_at", twelveMonthsAgo.toISOString());

  if (error) {
    console.error("Error fetching lead trend data:", error);
    return [];
  }

  // Group by month and market
  const monthlyData: Record<string, { dubai: number; usa: number }> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize all months
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const key = months[date.getMonth()];
    monthlyData[key] = { dubai: 0, usa: 0 };
  }

  // Count leads per month
  data?.forEach((lead) => {
    const date = new Date(lead.created_at);
    const key = months[date.getMonth()];
    if (monthlyData[key]) {
      if (lead.market === "dubai") {
        monthlyData[key].dubai++;
      } else if (lead.market === "usa") {
        monthlyData[key].usa++;
      }
    }
  });

  // Convert to array format for charts
  return Object.entries(monthlyData).map(([month, counts]) => ({
    month,
    dubai: counts.dubai,
    usa: counts.usa,
  }));
}

// Get conversion funnel data
export async function getConversionFunnelData() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("status");

  if (error) {
    console.error("Error fetching funnel data:", error);
    return null;
  }

  const statusCounts: Record<string, number> = {};
  data?.forEach((lead) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });

  const total = data?.length || 0;

  return {
    nuevo: statusCounts["nuevo"] || 0,
    contactado: statusCounts["contactado"] || 0,
    calificado: statusCounts["calificado"] || 0,
    propuesta: statusCounts["propuesta"] || 0,
    negociacion: statusCounts["negociacion"] || 0,
    cerrado: (statusCounts["cerrado"] || 0) + (statusCounts["ganado"] || 0),
    total,
  };
}
