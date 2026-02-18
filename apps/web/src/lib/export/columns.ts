import type { Lead } from "@/lib/queries/leads";
import type { Property } from "@/lib/queries/properties";
import type { Task } from "@/lib/queries/tasks";
import type { AuditLog } from "@/lib/queries/audit";
import type { Translations } from "@/lib/i18n/translations/en";
import type { CsvColumn } from "./csv";

export function getLeadCsvColumns(t: Translations): CsvColumn<Lead>[] {
  return [
    { key: "full_name", header: t.leads.fullName, accessor: (r) => r.full_name },
    { key: "email", header: t.leads.email, accessor: (r) => r.email },
    { key: "phone", header: t.leads.phone, accessor: (r) => r.phone },
    { key: "country", header: t.leads.nationality, accessor: (r) => r.country_residence },
    { key: "channel", header: t.leads.channel, accessor: (r) => r.channel },
    { key: "campaign", header: t.leads.campaign, accessor: (r) => r.campaign },
    { key: "status", header: t.leads.status, accessor: (r) => r.status },
    { key: "intent", header: t.leads.intent, accessor: (r) => r.intent },
    { key: "interest_zone", header: t.leads.interestZone, accessor: (r) => r.interest_zone },
    { key: "interest_type", header: t.leads.interestType, accessor: (r) => r.interest_type },
    { key: "budget_min", header: t.leads.budgetMin, accessor: (r) => r.budget_min },
    { key: "budget_max", header: t.leads.budgetMax, accessor: (r) => r.budget_max },
    { key: "currency", header: t.form.currency, accessor: (r) => r.budget_currency },
    { key: "market", header: t.leads.market, accessor: (r) => r.market },
    { key: "assigned_to", header: t.leads.assignedTo, accessor: (r) => r.assigned_user?.full_name },
    { key: "created_at", header: t.leads.createdAt, accessor: (r) => r.created_at },
  ];
}

export function getPropertyCsvColumns(t: Translations): CsvColumn<Property>[] {
  return [
    { key: "code", header: t.form.code, accessor: (r) => r.code },
    { key: "title", header: t.properties.propertyName, accessor: (r) => r.title },
    { key: "type", header: t.properties.type, accessor: (r) => r.type },
    { key: "bedrooms", header: t.properties.bedrooms, accessor: (r) => r.bedrooms },
    { key: "bathrooms", header: t.properties.bathrooms, accessor: (r) => r.bathrooms },
    { key: "area", header: t.properties.area, accessor: (r) => r.area },
    { key: "price", header: t.properties.price, accessor: (r) => r.price },
    { key: "currency", header: t.form.currency, accessor: (r) => r.currency },
    { key: "status", header: t.properties.status, accessor: (r) => r.status },
    { key: "operation", header: t.properties.operation, accessor: (r) => r.operation },
    { key: "market", header: t.leads.market, accessor: (r) => r.market },
    { key: "zone", header: t.form.zone, accessor: (r) => r.zone },
    { key: "developer", header: t.properties.developer, accessor: (r) => r.developer },
    { key: "created_at", header: t.leads.createdAt, accessor: (r) => r.created_at },
  ];
}

export function getTaskCsvColumns(t: Translations): CsvColumn<Task>[] {
  return [
    { key: "title", header: t.tasks.taskTitle, accessor: (r) => r.title },
    { key: "type", header: t.tasks.type, accessor: (r) => r.type },
    { key: "priority", header: t.tasks.priority, accessor: (r) => r.priority },
    { key: "status", header: t.tasks.status, accessor: (r) => r.status },
    { key: "due_date", header: t.tasks.dueDate, accessor: (r) => r.due_date },
    { key: "assigned_to", header: t.tasks.assignee, accessor: (r) => r.assigned_user?.full_name },
    { key: "lead", header: t.tasks.relatedLead, accessor: (r) => r.lead?.full_name },
    { key: "created_at", header: t.leads.createdAt, accessor: (r) => r.created_at },
  ];
}

export function getAuditCsvColumns(t: Translations): CsvColumn<AuditLog>[] {
  return [
    { key: "user_name", header: t.audit.user, accessor: (r) => r.user_name },
    { key: "user_email", header: t.leads.email, accessor: (r) => r.user_email },
    { key: "action", header: t.audit.action, accessor: (r) => r.action },
    { key: "resource", header: t.audit.resource, accessor: (r) => r.resource },
    { key: "resource_name", header: t.audit.details, accessor: (r) => r.resource_name },
    { key: "created_at", header: t.audit.timestamp, accessor: (r) => r.created_at },
  ];
}
