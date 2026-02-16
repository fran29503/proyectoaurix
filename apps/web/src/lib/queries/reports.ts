import { createClient } from "@/lib/supabase/client";

// --- Types ---

export type MarketFilter = "all" | "dubai" | "usa";
export type PeriodFilter = "month" | "quarter" | "year";

export interface ReportFilters {
  market: MarketFilter;
  period: PeriodFilter;
}

export interface SummaryMetrics {
  totalLeads: number;
  totalClosings: number;
  conversionRate: number;
  avgBudget: number;
  avgBudgetCurrency: string;
  prevTotalLeads: number;
  prevTotalClosings: number;
  prevConversionRate: number;
  prevAvgBudget: number;
}

export interface MonthlyPerformance {
  month: string;
  leads: number;
  closings: number;
  conversionRate: number;
}

export interface AgentLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalLeads: number;
  closings: number;
  conversionRate: number;
}

export interface AgentChartEntry {
  name: string;
  leads: number;
  closings: number;
}

export interface ChannelPerformanceEntry {
  channel: string;
  leads: number;
  closings: number;
  conversionRate: number;
}

export interface ChannelPieEntry {
  name: string;
  value: number;
  color: string;
}

export interface LeadTrendPoint {
  name: string;
  dubai: number;
  usa: number;
}

export interface FunnelData {
  nuevo: number;
  contactado: number;
  calificado: number;
  meeting: number;
  oferta: number;
  negociacion: number;
  cerrado: number;
  total: number;
}

export interface PropertyTypePerformance {
  type: string;
  total: number;
  available: number;
  reserved: number;
  sold: number;
  avgPrice: number;
  currency: string;
}

export interface PropertySummary {
  totalActive: number;
  available: number;
  reserved: number;
  sold: number;
  avgPrice: number;
  maxPrice: number;
  minPrice: number;
  currency: string;
  byOperation: Record<string, number>;
}

export interface ReportsData {
  summaryMetrics: SummaryMetrics;
  monthlyPerformance: MonthlyPerformance[];
  agentLeaderboard: AgentLeaderboardEntry[];
  agentChartData: AgentChartEntry[];
  channelPerformance: ChannelPerformanceEntry[];
  channelPieData: ChannelPieEntry[];
  leadTrend: LeadTrendPoint[];
  funnelData: FunnelData;
  propertyPerformance: PropertyTypePerformance[];
  propertySummary: PropertySummary;
}

// --- Helpers ---

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CHANNEL_COLORS: Record<string, string> = {
  meta_ads: "#8b5cf6",
  portal: "#10b981",
  google: "#f59e0b",
  google_ads: "#f59e0b",
  partner: "#3b82f6",
  referral: "#ec4899",
  direct: "#06b6d4",
  whatsapp: "#22c55e",
  instagram: "#e879f9",
  facebook: "#3b82f6",
  linkedin: "#0ea5e9",
  website: "#6366f1",
  organic_tiktok: "#f43f5e",
};

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: "Meta Ads",
  portal: "Portal",
  google: "Google",
  google_ads: "Google Ads",
  partner: "Partner",
  referral: "Referral",
  direct: "Direct",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  website: "Website",
  organic_tiktok: "TikTok",
};

function getDateRange(period: PeriodFilter): { from: Date; to: Date } {
  const now = new Date();
  const to = now;
  let from: Date;

  switch (period) {
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter": {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      from = new Date(now.getFullYear(), quarterStart, 1);
      break;
    }
    case "year":
      from = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return { from, to };
}

function getPreviousDateRange(period: PeriodFilter): { from: Date; to: Date } {
  const { from: currentFrom, to: currentTo } = getDateRange(period);
  const durationMs = currentTo.getTime() - currentFrom.getTime();

  return {
    from: new Date(currentFrom.getTime() - durationMs),
    to: new Date(currentFrom.getTime() - 1),
  };
}

function isClosing(status: string): boolean {
  return status === "cerrado_ganado" || status === "cerrado" || status === "ganado";
}

// --- Raw data types ---

interface RawLead {
  status: string;
  market: string | null;
  channel: string | null;
  assigned_to: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string | null;
  created_at: string;
}

interface RawPrevLead {
  status: string;
  market: string | null;
  budget_min: number | null;
  budget_max: number | null;
}

interface RawProperty {
  type: string;
  status: string;
  price: number;
  currency: string;
  operation: string;
  market: string | null;
}

interface RawUser {
  id: string;
  full_name: string;
  role: string;
}

// --- Compute functions ---

function computeSummaryMetrics(
  leads: RawLead[],
  prevLeads: RawPrevLead[],
  marketFilter: MarketFilter
): SummaryMetrics {
  const totalLeads = leads.length;
  const totalClosings = leads.filter((l) => isClosing(l.status)).length;
  const conversionRate = totalLeads > 0 ? (totalClosings / totalLeads) * 100 : 0;

  // Avg budget from closed leads
  const closedWithBudget = leads.filter(
    (l) => isClosing(l.status) && l.budget_min && l.budget_max
  );
  const avgBudget =
    closedWithBudget.length > 0
      ? closedWithBudget.reduce((sum, l) => sum + ((l.budget_min! + l.budget_max!) / 2), 0) /
        closedWithBudget.length
      : 0;

  const currency = marketFilter === "usa" ? "USD" : "AED";

  // Previous period
  const prevTotalLeads = prevLeads.length;
  const prevTotalClosings = prevLeads.filter((l) => isClosing(l.status)).length;
  const prevConversionRate = prevTotalLeads > 0 ? (prevTotalClosings / prevTotalLeads) * 100 : 0;
  const prevClosedWithBudget = prevLeads.filter(
    (l) => isClosing(l.status) && l.budget_min && l.budget_max
  );
  const prevAvgBudget =
    prevClosedWithBudget.length > 0
      ? prevClosedWithBudget.reduce((sum, l) => sum + ((l.budget_min! + l.budget_max!) / 2), 0) /
        prevClosedWithBudget.length
      : 0;

  return {
    totalLeads,
    totalClosings,
    conversionRate,
    avgBudget,
    avgBudgetCurrency: currency,
    prevTotalLeads,
    prevTotalClosings,
    prevConversionRate,
    prevAvgBudget,
  };
}

function computeMonthlyPerformance(leads: RawLead[], period: PeriodFilter): MonthlyPerformance[] {
  const { from } = getDateRange(period);
  const monthMap: Record<string, { leads: number; closings: number }> = {};

  // Initialize months in range
  const current = new Date(from);
  const now = new Date();
  while (current <= now) {
    const key = MONTHS[current.getMonth()];
    if (!monthMap[key]) {
      monthMap[key] = { leads: 0, closings: 0 };
    }
    current.setMonth(current.getMonth() + 1);
  }

  leads.forEach((lead) => {
    const date = new Date(lead.created_at);
    const key = MONTHS[date.getMonth()];
    if (monthMap[key] !== undefined) {
      monthMap[key].leads++;
      if (isClosing(lead.status)) {
        monthMap[key].closings++;
      }
    }
  });

  return Object.entries(monthMap).map(([month, data]) => ({
    month,
    leads: data.leads,
    closings: data.closings,
    conversionRate: data.leads > 0 ? (data.closings / data.leads) * 100 : 0,
  }));
}

function computeAgentLeaderboard(
  leads: RawLead[],
  users: RawUser[]
): AgentLeaderboardEntry[] {
  const agentStats: Record<string, { totalLeads: number; closings: number }> = {};

  leads.forEach((lead) => {
    if (lead.assigned_to) {
      if (!agentStats[lead.assigned_to]) {
        agentStats[lead.assigned_to] = { totalLeads: 0, closings: 0 };
      }
      agentStats[lead.assigned_to].totalLeads++;
      if (isClosing(lead.status)) {
        agentStats[lead.assigned_to].closings++;
      }
    }
  });

  const userMap = new Map(users.map((u) => [u.id, u.full_name]));

  return Object.entries(agentStats)
    .map(([userId, stats]) => ({
      rank: 0,
      userId,
      name: userMap.get(userId) || "Unknown",
      totalLeads: stats.totalLeads,
      closings: stats.closings,
      conversionRate: stats.totalLeads > 0 ? (stats.closings / stats.totalLeads) * 100 : 0,
    }))
    .filter((a) => a.name !== "Unknown")
    .sort((a, b) => b.closings - a.closings || b.totalLeads - a.totalLeads)
    .map((agent, idx) => ({ ...agent, rank: idx + 1 }));
}

function computeAgentChartData(leaderboard: AgentLeaderboardEntry[]): AgentChartEntry[] {
  return leaderboard.slice(0, 6).map((agent) => {
    const parts = agent.name.split(" ");
    const shortName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    return { name: shortName, leads: agent.totalLeads, closings: agent.closings };
  });
}

function computeChannelPerformance(leads: RawLead[]): ChannelPerformanceEntry[] {
  const channelMap: Record<string, { leads: number; closings: number }> = {};

  leads.forEach((lead) => {
    const ch = lead.channel || "direct";
    if (!channelMap[ch]) {
      channelMap[ch] = { leads: 0, closings: 0 };
    }
    channelMap[ch].leads++;
    if (isClosing(lead.status)) {
      channelMap[ch].closings++;
    }
  });

  return Object.entries(channelMap)
    .map(([channel, stats]) => ({
      channel: CHANNEL_LABELS[channel] || channel,
      leads: stats.leads,
      closings: stats.closings,
      conversionRate: stats.leads > 0 ? (stats.closings / stats.leads) * 100 : 0,
    }))
    .sort((a, b) => b.leads - a.leads);
}

function computeChannelPieData(leads: RawLead[]): ChannelPieEntry[] {
  const channelMap: Record<string, number> = {};

  leads.forEach((lead) => {
    const ch = lead.channel || "direct";
    channelMap[ch] = (channelMap[ch] || 0) + 1;
  });

  return Object.entries(channelMap)
    .map(([channel, count]) => ({
      name: CHANNEL_LABELS[channel] || channel,
      value: count,
      color: CHANNEL_COLORS[channel] || "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);
}

function computeLeadTrend(leads: RawLead[], period: PeriodFilter): LeadTrendPoint[] {
  const { from } = getDateRange(period);
  const monthData: Record<string, { dubai: number; usa: number }> = {};

  // Initialize months
  const current = new Date(from);
  const now = new Date();
  while (current <= now) {
    const key = MONTHS[current.getMonth()];
    if (!monthData[key]) {
      monthData[key] = { dubai: 0, usa: 0 };
    }
    current.setMonth(current.getMonth() + 1);
  }

  leads.forEach((lead) => {
    const date = new Date(lead.created_at);
    const key = MONTHS[date.getMonth()];
    if (monthData[key]) {
      if (lead.market === "dubai") monthData[key].dubai++;
      else if (lead.market === "usa") monthData[key].usa++;
    }
  });

  return Object.entries(monthData).map(([month, counts]) => ({
    name: month,
    dubai: counts.dubai,
    usa: counts.usa,
  }));
}

function computeFunnelData(leads: RawLead[]): FunnelData {
  const statusCounts: Record<string, number> = {};
  leads.forEach((lead) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });

  return {
    nuevo: statusCounts["nuevo"] || 0,
    contactado: statusCounts["contactado"] || 0,
    calificado: statusCounts["calificado"] || 0,
    meeting: (statusCounts["meeting_programado"] || 0) + (statusCounts["meeting_realizado"] || 0),
    oferta: statusCounts["oferta_reserva"] || 0,
    negociacion: statusCounts["negociacion"] || 0,
    cerrado: (statusCounts["cerrado_ganado"] || 0) + (statusCounts["cerrado"] || 0) + (statusCounts["ganado"] || 0),
    total: leads.length,
  };
}

function computePropertyPerformance(
  properties: RawProperty[],
  marketFilter: MarketFilter
): PropertyTypePerformance[] {
  const typeMap: Record<string, { total: number; available: number; reserved: number; sold: number; prices: number[] }> = {};

  properties.forEach((prop) => {
    if (!typeMap[prop.type]) {
      typeMap[prop.type] = { total: 0, available: 0, reserved: 0, sold: 0, prices: [] };
    }
    typeMap[prop.type].total++;
    typeMap[prop.type].prices.push(prop.price);

    if (prop.status === "disponible") typeMap[prop.type].available++;
    else if (prop.status === "reservado") typeMap[prop.type].reserved++;
    else if (prop.status === "vendido") typeMap[prop.type].sold++;
  });

  const currency = marketFilter === "usa" ? "USD" : "AED";

  return Object.entries(typeMap)
    .map(([type, data]) => ({
      type,
      total: data.total,
      available: data.available,
      reserved: data.reserved,
      sold: data.sold,
      avgPrice: data.prices.length > 0 ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length : 0,
      currency,
    }))
    .sort((a, b) => b.total - a.total);
}

function computePropertySummary(
  properties: RawProperty[],
  marketFilter: MarketFilter
): PropertySummary {
  const prices = properties.map((p) => p.price).sort((a, b) => a - b);
  const currency = marketFilter === "usa" ? "USD" : "AED";

  const byOperation: Record<string, number> = {};
  let available = 0;
  let reserved = 0;
  let sold = 0;

  properties.forEach((prop) => {
    byOperation[prop.operation] = (byOperation[prop.operation] || 0) + 1;
    if (prop.status === "disponible") available++;
    else if (prop.status === "reservado") reserved++;
    else if (prop.status === "vendido") sold++;
  });

  return {
    totalActive: properties.length,
    available,
    reserved,
    sold,
    avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    maxPrice: prices.length > 0 ? prices[prices.length - 1] : 0,
    minPrice: prices.length > 0 ? prices[0] : 0,
    currency,
    byOperation,
  };
}

// --- Master fetch function ---

export async function getReportsData(filters: ReportFilters): Promise<ReportsData | null> {
  const supabase = createClient();
  const { from, to } = getDateRange(filters.period);
  const { from: prevFrom, to: prevTo } = getPreviousDateRange(filters.period);

  // Build queries
  let leadsQuery = supabase
    .from("leads")
    .select("status, market, channel, assigned_to, budget_min, budget_max, budget_currency, created_at")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString());

  let prevLeadsQuery = supabase
    .from("leads")
    .select("status, market, budget_min, budget_max")
    .gte("created_at", prevFrom.toISOString())
    .lte("created_at", prevTo.toISOString());

  let propertiesQuery = supabase
    .from("properties")
    .select("type, status, price, currency, operation, market");

  const usersQuery = supabase
    .from("users")
    .select("id, full_name, role")
    .in("role", ["agent", "team_lead", "manager", "admin"]);

  // Apply market filter
  if (filters.market !== "all") {
    leadsQuery = leadsQuery.eq("market", filters.market);
    prevLeadsQuery = prevLeadsQuery.eq("market", filters.market);
    propertiesQuery = propertiesQuery.eq("market", filters.market);
  }

  try {
    const [leadsResult, prevLeadsResult, propertiesResult, usersResult] = await Promise.all([
      leadsQuery,
      prevLeadsQuery,
      propertiesQuery,
      usersQuery,
    ]);

    if (leadsResult.error) {
      console.error("Error fetching leads for reports:", leadsResult.error);
      return null;
    }

    const leads = (leadsResult.data || []) as RawLead[];
    const prevLeads = (prevLeadsResult.data || []) as RawPrevLead[];
    const properties = (propertiesResult.data || []) as RawProperty[];
    const users = (usersResult.data || []) as RawUser[];

    // Compute all derived data
    const summaryMetrics = computeSummaryMetrics(leads, prevLeads, filters.market);
    const monthlyPerformance = computeMonthlyPerformance(leads, filters.period);
    const agentLeaderboard = computeAgentLeaderboard(leads, users);
    const agentChartData = computeAgentChartData(agentLeaderboard);
    const channelPerformance = computeChannelPerformance(leads);
    const channelPieData = computeChannelPieData(leads);
    const leadTrend = computeLeadTrend(leads, filters.period);
    const funnelData = computeFunnelData(leads);
    const propertyPerformance = computePropertyPerformance(properties, filters.market);
    const propertySummary = computePropertySummary(properties, filters.market);

    return {
      summaryMetrics,
      monthlyPerformance,
      agentLeaderboard,
      agentChartData,
      channelPerformance,
      channelPieData,
      leadTrend,
      funnelData,
      propertyPerformance,
      propertySummary,
    };
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return null;
  }
}
