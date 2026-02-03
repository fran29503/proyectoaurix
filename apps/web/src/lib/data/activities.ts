// Mock activities data for lead timeline
export interface ActivityData {
  id: string;
  leadId: string;
  userId: string | null;
  userName: string | null;
  type: "note" | "call" | "whatsapp" | "email" | "meeting" | "status_change" | "assignment";
  title: string;
  description: string | null;
  metadata: {
    duration?: number;
    previousStatus?: string;
    newStatus?: string;
    previousAssignee?: string;
    newAssignee?: string;
  };
  createdAt: string;
}

export const activitiesData: ActivityData[] = [
  // Ravi P. activities
  {
    id: "act-001",
    leadId: "44444444-0001-0001-0001-000000000001",
    userId: null,
    userName: "System",
    type: "status_change",
    title: "Lead created",
    description: "Lead entered from Property Finder",
    metadata: { newStatus: "nuevo" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "act-002",
    leadId: "44444444-0001-0001-0001-000000000001",
    userId: "5",
    userName: "Aisha Rahman",
    type: "whatsapp",
    title: "IA Qualification Complete",
    description: "AI qualified lead via WhatsApp. Intent: Alta. Budget: AED 1.4-1.8M. Timing: 30-60 days. Cash buyer interested in Creek Harbour 1BR for investment.",
    metadata: {},
    createdAt: new Date(Date.now() - 6300000).toISOString(),
  },
  {
    id: "act-003",
    leadId: "44444444-0001-0001-0001-000000000001",
    userId: "5",
    userName: "Aisha Rahman",
    type: "status_change",
    title: "Status changed to Calificado",
    description: null,
    metadata: { previousStatus: "contactado", newStatus: "calificado" },
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  // Elena K. activities
  {
    id: "act-004",
    leadId: "44444444-0001-0001-0001-000000000002",
    userId: null,
    userName: "System",
    type: "status_change",
    title: "Lead created",
    description: "Lead from Meta Ads campaign: downtown_luxury_q1",
    metadata: { newStatus: "nuevo" },
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
  {
    id: "act-005",
    leadId: "44444444-0001-0001-0001-000000000002",
    userId: "4",
    userName: "Lina Petrova",
    type: "assignment",
    title: "Assigned to Lina Petrova",
    description: "Auto-assigned based on segment: Secondary Market",
    metadata: { newAssignee: "Lina Petrova" },
    createdAt: new Date(Date.now() - 2640000).toISOString(),
  },
  // Oleg M. activities
  {
    id: "act-006",
    leadId: "44444444-0001-0001-0001-000000000006",
    userId: null,
    userName: "System",
    type: "status_change",
    title: "Lead created",
    description: "Lead from partner referral",
    metadata: { newStatus: "nuevo" },
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: "act-007",
    leadId: "44444444-0001-0001-0001-000000000006",
    userId: "4",
    userName: "Lina Petrova",
    type: "call",
    title: "Initial Call - 15 min",
    description: "Discussed requirements. Looking for 3BR in Marina. Budget up to 5M AED. Cash buyer from Russia. Interested in investment property.",
    metadata: { duration: 15 },
    createdAt: new Date(Date.now() - 360000000).toISOString(),
  },
  {
    id: "act-008",
    leadId: "44444444-0001-0001-0001-000000000006",
    userId: "4",
    userName: "Lina Petrova",
    type: "meeting",
    title: "Property Viewing - Marina Pinnacle",
    description: "Showed Marina Pinnacle 3BR (Unit 903). Client very interested in the marina view and penthouse features. Discussed price negotiation possibilities.",
    metadata: {},
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "act-009",
    leadId: "44444444-0001-0001-0001-000000000006",
    userId: "4",
    userName: "Lina Petrova",
    type: "status_change",
    title: "Moved to Oferta/Reserva",
    description: "Client ready to make offer",
    metadata: { previousStatus: "meeting_realizado", newStatus: "oferta_reserva" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "act-010",
    leadId: "44444444-0001-0001-0001-000000000006",
    userId: "4",
    userName: "Lina Petrova",
    type: "note",
    title: "Offer preparation",
    description: "Preparing formal offer documents. Client confirmed AED 4.5M offer price. Awaiting final confirmation on payment terms.",
    metadata: {},
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export function getActivitiesByLeadId(leadId: string): ActivityData[] {
  return activitiesData
    .filter((a) => a.leadId === leadId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
