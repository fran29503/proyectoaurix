import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  decimal,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ ENUMS ============
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "team_lead",
  "agent",
  "backoffice",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "nuevo",
  "contactado",
  "calificado",
  "meeting_programado",
  "meeting_realizado",
  "oferta_reserva",
  "negociacion",
  "cerrado_ganado",
  "cerrado_perdido",
  "dormido",
]);

export const leadIntentEnum = pgEnum("lead_intent", ["alta", "media", "baja"]);

export const marketEnum = pgEnum("market", ["dubai", "usa"]);

export const propertyStatusEnum = pgEnum("property_status", [
  "disponible",
  "reservado",
  "vendido",
]);

// ============ TABLES ============

// Tenants (Multi-tenant support)
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  branding: jsonb("branding").default({}).$type<{
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    fontFamily?: string;
  }>(),
  settings: jsonb("settings").default({}).$type<{
    slaResponseMinutes?: number;
    defaultTimezone?: string;
    defaultCurrency?: string;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Users
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    authId: uuid("auth_id").unique(), // Supabase Auth user id
    email: text("email").unique().notNull(),
    fullName: text("full_name").notNull(),
    role: userRoleEnum("role").notNull(),
    team: text("team"), // 'off-plan', 'secondary', 'leasing', 'usa_desk'
    market: marketEnum("market"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_users_tenant").on(table.tenantId),
    index("idx_users_email").on(table.email),
  ]
);

// Properties
export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(), // 'AE-DCH-CH-1BR-1407'
    market: marketEnum("market").notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(), // '1BR', '2BR', 'Villa', 'Condo'
    zone: text("zone").notNull(),
    price: decimal("price", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").default("AED"),
    operation: text("operation").notNull(), // 'off-plan', 'resale', 'rent'
    status: propertyStatusEnum("status").default("disponible"),
    developer: text("developer"),
    description: text("description"),
    bedrooms: text("bedrooms"),
    bathrooms: text("bathrooms"),
    area: text("area"), // sqft or sqm
    features: jsonb("features").default([]).$type<string[]>(),
    images: jsonb("images").default([]).$type<string[]>(),
    tags: jsonb("tags").default([]).$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_properties_tenant_market").on(table.tenantId, table.market),
    index("idx_properties_status").on(table.status),
  ]
);

// Leads
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    // Basic Info
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    phoneCountry: text("phone_country"),
    email: text("email"),
    language: text("language").default("en"),
    countryResidence: text("country_residence"),

    // Source & Attribution
    channel: text("channel").notNull(), // 'meta_ads', 'google', 'portal', 'referral'
    source: text("source"), // specific: 'property_finder', 'zillow', etc.
    campaign: text("campaign"),
    adset: text("adset"),

    // Interest & Qualification
    market: marketEnum("market").notNull(),
    segment: text("segment").notNull(), // 'dubai_offplan', 'dubai_secondary', 'usa_desk'
    interestPropertyId: uuid("interest_property_id").references(
      () => properties.id
    ),
    interestZone: text("interest_zone"),
    interestType: text("interest_type"), // '1BR', '2BR', 'Villa'
    budgetMin: decimal("budget_min", { precision: 15, scale: 2 }),
    budgetMax: decimal("budget_max", { precision: 15, scale: 2 }),
    budgetCurrency: text("budget_currency").default("AED"),
    paymentMethod: text("payment_method"), // 'cash', 'mortgage', 'payment_plan'
    timing: text("timing"), // '0-30', '30-60', '60-90', '90+'
    goal: text("goal"), // 'investment', 'living', 'relocation'

    // AI Qualification
    intent: leadIntentEnum("intent"),
    intentReasons: jsonb("intent_reasons").default([]).$type<string[]>(),
    pendingQuestions: jsonb("pending_questions").default([]).$type<string[]>(),

    // Pipeline & Assignment
    status: leadStatusEnum("status").default("nuevo"),
    assignedTo: uuid("assigned_to").references(() => users.id),
    nextAction: text("next_action"),
    nextActionDate: timestamp("next_action_date", { withTimezone: true }),
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),

    // Timestamps
    firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
    qualifiedAt: timestamp("qualified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_leads_tenant_status").on(table.tenantId, table.status),
    index("idx_leads_assigned").on(table.assignedTo),
    index("idx_leads_market").on(table.tenantId, table.market),
    index("idx_leads_created").on(table.createdAt),
  ]
);

// Activities (Lead Timeline)
export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    leadId: uuid("lead_id")
      .references(() => leads.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id),

    type: text("type").notNull(), // 'note', 'call', 'whatsapp', 'email', 'meeting', 'status_change', 'assignment'
    title: text("title").notNull(),
    description: text("description"),
    metadata: jsonb("metadata").default({}).$type<{
      duration?: number;
      recordingUrl?: string;
      previousStatus?: string;
      newStatus?: string;
      previousAssignee?: string;
      newAssignee?: string;
    }>(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_activities_lead").on(table.leadId),
    index("idx_activities_user").on(table.userId),
  ]
);

// Tasks
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    assignedTo: uuid("assigned_to").references(() => users.id),
    createdBy: uuid("created_by").references(() => users.id),

    title: text("title").notNull(),
    description: text("description"),
    priority: text("priority").default("medium"), // 'low', 'medium', 'high'
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_tasks_assigned").on(table.assignedTo),
    index("idx_tasks_lead").on(table.leadId),
    index("idx_tasks_due").on(table.dueDate),
  ]
);

// ============ RELATIONS ============

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  properties: many(properties),
  leads: many(leads),
  activities: many(activities),
  tasks: many(tasks),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  assignedLeads: many(leads),
  activities: many(activities),
  assignedTasks: many(tasks),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [properties.tenantId],
    references: [tenants.id],
  }),
  interestedLeads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [leads.tenantId],
    references: [tenants.id],
  }),
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  interestProperty: one(properties, {
    fields: [leads.interestPropertyId],
    references: [properties.id],
  }),
  activities: many(activities),
  tasks: many(tasks),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activities.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tasks.tenantId],
    references: [tenants.id],
  }),
  lead: one(leads, {
    fields: [tasks.leadId],
    references: [leads.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}));

// ============ TYPE EXPORTS ============

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// Enum types
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
export type LeadIntent = (typeof leadIntentEnum.enumValues)[number];
export type Market = (typeof marketEnum.enumValues)[number];
export type PropertyStatus = (typeof propertyStatusEnum.enumValues)[number];
