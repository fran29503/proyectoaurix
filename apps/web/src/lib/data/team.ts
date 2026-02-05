// Mock team data based on MHR seed data
export interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "team_lead" | "agent" | "backoffice";
  team: string | null;
  market: "dubai" | "usa" | null;
  phone: string;
  avatarUrl: string | null;
  isActive: boolean;
  // Performance metrics (mock)
  metrics: {
    leadsAssigned: number;
    leadsContacted: number;
    meetingsScheduled: number;
    closings: number;
    avgResponseTime: number; // minutes
    slaCompliance: number; // percentage
  };
}

export const teamData: TeamMember[] = [
  {
    id: "22222222-0001-0001-0001-000000000001",
    email: "omar@meridianharbor.ae",
    fullName: "Omar Al-Mansouri",
    role: "admin",
    team: null,
    market: "dubai",
    phone: "+971501234567",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 0,
      leadsContacted: 0,
      meetingsScheduled: 0,
      closings: 0,
      avgResponseTime: 0,
      slaCompliance: 100,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000002",
    email: "sarah@meridianharbor.ae",
    fullName: "Sarah Khan",
    role: "manager",
    team: null,
    market: "dubai",
    phone: "+971501234568",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 0,
      leadsContacted: 0,
      meetingsScheduled: 0,
      closings: 0,
      avgResponseTime: 0,
      slaCompliance: 100,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000003",
    email: "youssef@meridianharbor.ae",
    fullName: "Youssef Nasser",
    role: "team_lead",
    team: "off-plan",
    market: "dubai",
    phone: "+971501234569",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 45,
      leadsContacted: 42,
      meetingsScheduled: 18,
      closings: 5,
      avgResponseTime: 8,
      slaCompliance: 94,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000004",
    email: "lina@meridianharbor.ae",
    fullName: "Lina Petrova",
    role: "team_lead",
    team: "secondary",
    market: "dubai",
    phone: "+971501234570",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 52,
      leadsContacted: 51,
      meetingsScheduled: 24,
      closings: 7,
      avgResponseTime: 6,
      slaCompliance: 98,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000005",
    email: "aisha@meridianharbor.ae",
    fullName: "Aisha Rahman",
    role: "agent",
    team: "off-plan",
    market: "dubai",
    phone: "+971501234571",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 38,
      leadsContacted: 36,
      meetingsScheduled: 15,
      closings: 4,
      avgResponseTime: 7,
      slaCompliance: 95,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000006",
    email: "hassan@meridianharbor.ae",
    fullName: "Hassan Ali",
    role: "agent",
    team: "off-plan",
    market: "dubai",
    phone: "+971501234572",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 35,
      leadsContacted: 28,
      meetingsScheduled: 10,
      closings: 2,
      avgResponseTime: 15,
      slaCompliance: 78,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000007",
    email: "mark@meridianharbor.com",
    fullName: "Mark Rivera",
    role: "manager",
    team: "usa_desk",
    market: "usa",
    phone: "+13055550199",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 28,
      leadsContacted: 27,
      meetingsScheduled: 12,
      closings: 3,
      avgResponseTime: 9,
      slaCompliance: 92,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000008",
    email: "sofia@meridianharbor.com",
    fullName: "Sofía Delgado",
    role: "agent",
    team: "usa_desk",
    market: "usa",
    phone: "+13055550200",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 22,
      leadsContacted: 21,
      meetingsScheduled: 9,
      closings: 2,
      avgResponseTime: 11,
      slaCompliance: 88,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000009",
    email: "nadia.bo@meridianharbor.ae",
    fullName: "Nadia Farooq",
    role: "backoffice",
    team: null,
    market: "dubai",
    phone: "+971501234573",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 0,
      leadsContacted: 0,
      meetingsScheduled: 0,
      closings: 0,
      avgResponseTime: 0,
      slaCompliance: 100,
    },
  },
  {
    id: "22222222-0001-0001-0001-000000000010",
    email: "jason@meridianharbor.com",
    fullName: "Jason Kim",
    role: "backoffice",
    team: null,
    market: "usa",
    phone: "+13055550201",
    avatarUrl: null,
    isActive: true,
    metrics: {
      leadsAssigned: 0,
      leadsContacted: 0,
      meetingsScheduled: 0,
      closings: 0,
      avgResponseTime: 0,
      slaCompliance: 100,
    },
  },
];

// Helper functions
export function getAgents(): TeamMember[] {
  return teamData.filter((m) => ["agent", "team_lead"].includes(m.role));
}

export function getTeamByMarket(market: "dubai" | "usa"): TeamMember[] {
  return teamData.filter((m) => m.market === market);
}

export function getMemberById(id: string): TeamMember | undefined {
  return teamData.find((m) => m.id === id);
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
