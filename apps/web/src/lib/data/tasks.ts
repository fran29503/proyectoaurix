// Mock tasks data for MVP
export interface TaskData {
  id: string;
  leadId: string | null;
  leadName: string | null;
  assignedTo: {
    id: string;
    fullName: string;
  };
  createdBy: {
    id: string;
    fullName: string;
  };
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  dueDate: string;
  completedAt: string | null;
}

export const tasksData: TaskData[] = [
  {
    id: "task-001",
    leadId: "44444444-0001-0001-0001-000000000003",
    leadName: "Ahmed Sharif",
    assignedTo: { id: "6", fullName: "Hassan Ali" },
    createdBy: { id: "2", fullName: "Sarah Khan" },
    title: "Qualify Ahmed S. via WhatsApp",
    description: "New lead from Bayut. Interested in Damac Lagoons Villa. Need to qualify budget and timing.",
    priority: "high",
    dueDate: new Date(Date.now() + 1800000).toISOString(),
    completedAt: null,
  },
  {
    id: "task-002",
    leadId: "44444444-0001-0001-0001-000000000002",
    leadName: "Elena Kozlova",
    assignedTo: { id: "4", fullName: "Lina Petrova" },
    createdBy: { id: "2", fullName: "Sarah Khan" },
    title: "Call Elena K. at 19:00",
    description: "Russian-speaking lead interested in Downtown 2BR. Immediate buyer. High priority.",
    priority: "high",
    dueDate: new Date(Date.now() + 10800000).toISOString(),
    completedAt: null,
  },
  {
    id: "task-003",
    leadId: "44444444-0001-0001-0001-000000000006",
    leadName: "Oleg Medvedev",
    assignedTo: { id: "4", fullName: "Lina Petrova" },
    createdBy: { id: "4", fullName: "Lina Petrova" },
    title: "Send offer terms to Oleg M.",
    description: "Prepare and send formal offer for Marina Pinnacle 3BR. Client confirmed AED 4.5M offer.",
    priority: "high",
    dueDate: new Date(Date.now() + 7200000).toISOString(),
    completedAt: null,
  },
  {
    id: "task-004",
    leadId: "44444444-0001-0001-0001-000000000001",
    leadName: "Ravi Patel",
    assignedTo: { id: "5", fullName: "Aisha Rahman" },
    createdBy: { id: "5", fullName: "Aisha Rahman" },
    title: "Send brochure to Ravi P.",
    description: "Send Creekside Horizon brochure with payment plan details. Include 80/20 plan info.",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: "task-005",
    leadId: "44444444-0001-0001-0001-000000000008",
    leadName: "Carlos García",
    assignedTo: { id: "8", fullName: "Sofía Delgado" },
    createdBy: { id: "7", fullName: "Mark Rivera" },
    title: "Schedule Zoom with Carlos G.",
    description: "LATAM investor interested in Brickell. Send comparables and schedule virtual tour.",
    priority: "medium",
    dueDate: new Date(Date.now() + 21600000).toISOString(),
    completedAt: null,
  },
  {
    id: "task-006",
    leadId: "44444444-0001-0001-0001-000000000007",
    leadName: "Priya Nair",
    assignedTo: { id: "5", fullName: "Aisha Rahman" },
    createdBy: { id: "2", fullName: "Sarah Khan" },
    title: "Reactivate Priya N.",
    description: "Dormant lead. Send new off-plan options in her budget range (AED 1-1.3M).",
    priority: "low",
    dueDate: new Date(Date.now() + 604800000).toISOString(),
    completedAt: null,
  },
  {
    id: "task-007",
    leadId: "44444444-0001-0001-0001-000000000005",
    leadName: "Fatima Al-Rashid",
    assignedTo: { id: "4", fullName: "Lina Petrova" },
    createdBy: { id: "4", fullName: "Lina Petrova" },
    title: "Confirm viewing with Fatima",
    description: "Leasing viewing scheduled for tomorrow 17:30. Confirm attendance.",
    priority: "high",
    dueDate: new Date(Date.now() + 43200000).toISOString(),
    completedAt: null,
  },
  {
    id: "task-008",
    leadId: "44444444-0001-0001-0001-000000000010",
    leadName: "Daniel Thompson",
    assignedTo: { id: "8", fullName: "Sofía Delgado" },
    createdBy: { id: "8", fullName: "Sofía Delgado" },
    title: "Qualify Daniel T. - cash/mortgage",
    description: "New Austin lead. Need to determine payment method and exact timeline.",
    priority: "medium",
    dueDate: new Date(Date.now() + 3600000).toISOString(),
    completedAt: null,
  },
  // Completed tasks
  {
    id: "task-009",
    leadId: "44444444-0001-0001-0001-000000000001",
    leadName: "Ravi Patel",
    assignedTo: { id: "5", fullName: "Aisha Rahman" },
    createdBy: { id: "5", fullName: "Aisha Rahman" },
    title: "WhatsApp qualification",
    description: "Initial qualification via WhatsApp AI agent.",
    priority: "high",
    dueDate: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "task-010",
    leadId: "44444444-0001-0001-0001-000000000006",
    leadName: "Oleg Medvedev",
    assignedTo: { id: "4", fullName: "Lina Petrova" },
    createdBy: { id: "4", fullName: "Lina Petrova" },
    title: "Property viewing - Marina Pinnacle",
    description: "Show 3BR unit to client.",
    priority: "high",
    dueDate: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Helper functions
export function getPendingTasks(): TaskData[] {
  return tasksData.filter((t) => !t.completedAt).sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export function getCompletedTasks(): TaskData[] {
  return tasksData.filter((t) => t.completedAt).sort((a, b) =>
    new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );
}

export function getOverdueTasks(): TaskData[] {
  const now = new Date();
  return tasksData.filter((t) => !t.completedAt && new Date(t.dueDate) < now);
}

export function getTasksByAssignee(userId: string): TaskData[] {
  return tasksData.filter((t) => t.assignedTo.id === userId);
}
