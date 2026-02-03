// Re-export database types
export type {
  Tenant,
  NewTenant,
  User,
  NewUser,
  Property,
  NewProperty,
  Lead,
  NewLead,
  Activity,
  NewActivity,
  Task,
  NewTask,
  UserRole,
  LeadStatus,
  LeadIntent,
  Market,
  PropertyStatus,
} from "@/lib/db/schema";

// Extended types with relations
export interface UserWithTenant {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "team_lead" | "agent" | "backoffice";
  team: string | null;
  market: "dubai" | "usa" | null;
  avatarUrl: string | null;
  isActive: boolean;
  tenant: {
    id: string;
    name: string;
    slug: string;
    branding: TenantBranding;
    settings: TenantSettings;
  };
}

export interface TenantBranding {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  fontFamily?: string;
}

export interface TenantSettings {
  slaResponseMinutes?: number;
  defaultTimezone?: string;
  defaultCurrency?: string;
}

export interface LeadWithRelations {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  language: string;
  channel: string;
  source: string | null;
  market: "dubai" | "usa";
  segment: string;
  status: LeadStatusType;
  intent: "alta" | "media" | "baja" | null;
  intentReasons: string[];
  budgetMin: string | null;
  budgetMax: string | null;
  budgetCurrency: string;
  timing: string | null;
  goal: string | null;
  nextAction: string | null;
  nextActionDate: Date | null;
  createdAt: Date;
  assignedUser?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  } | null;
  interestProperty?: {
    id: string;
    title: string;
    code: string;
  } | null;
}

export type LeadStatusType =
  | "nuevo"
  | "contactado"
  | "calificado"
  | "meeting_programado"
  | "meeting_realizado"
  | "oferta_reserva"
  | "negociacion"
  | "cerrado_ganado"
  | "cerrado_perdido"
  | "dormido";

// Pipeline configuration
export const PIPELINE_STAGES: {
  id: LeadStatusType;
  label: string;
  color: string;
}[] = [
  { id: "nuevo", label: "Nuevo", color: "bg-slate-500" },
  { id: "contactado", label: "Contactado", color: "bg-blue-500" },
  { id: "calificado", label: "Calificado", color: "bg-cyan-500" },
  { id: "meeting_programado", label: "Meeting Programado", color: "bg-violet-500" },
  { id: "meeting_realizado", label: "Meeting Realizado", color: "bg-purple-500" },
  { id: "oferta_reserva", label: "Oferta/Reserva", color: "bg-amber-500" },
  { id: "negociacion", label: "Negociación", color: "bg-orange-500" },
  { id: "cerrado_ganado", label: "Cerrado Ganado", color: "bg-emerald-500" },
  { id: "cerrado_perdido", label: "Cerrado Perdido", color: "bg-red-500" },
  { id: "dormido", label: "Dormido", color: "bg-gray-400" },
];

// Channel configuration
export const CHANNELS = [
  { id: "meta_ads", label: "Meta Ads", icon: "facebook" },
  { id: "google", label: "Google", icon: "search" },
  { id: "portal", label: "Portal", icon: "globe" },
  { id: "referral", label: "Referral", icon: "users" },
  { id: "partner", label: "Partner", icon: "handshake" },
] as const;

// Market configuration
export const MARKETS = [
  { id: "dubai", label: "Dubai", currency: "AED", timezone: "Asia/Dubai" },
  { id: "usa", label: "USA", currency: "USD", timezone: "America/New_York" },
] as const;

// Intent levels
export const INTENT_LEVELS = [
  { id: "alta", label: "Alta", color: "bg-emerald-500" },
  { id: "media", label: "Media", color: "bg-amber-500" },
  { id: "baja", label: "Baja", color: "bg-red-500" },
] as const;
