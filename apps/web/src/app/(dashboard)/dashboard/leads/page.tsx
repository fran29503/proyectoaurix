"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/components/leads/leads-table";
import { Plus, Download, Upload, Loader2 } from "lucide-react";
import { getLeads, type Lead } from "@/lib/queries/leads";
import type { LeadStatusType } from "@/types";

// Transform Supabase data to match the table format (LeadData type)
function transformLeadData(lead: Lead) {
  return {
    id: lead.id,
    fullName: lead.full_name,
    phone: lead.phone || "",
    email: lead.email || null,
    language: lead.language || "en",
    countryResidence: lead.nationality || "Unknown",
    channel: lead.source_channel || "direct",
    source: lead.source_campaign || null,
    market: (lead.market || "dubai") as "dubai" | "usa",
    segment: lead.market === "usa" ? "usa_buyers" : "dubai_offplan",
    interestZone: lead.interest_zone || null,
    interestType: lead.interest_type || null,
    budgetMin: lead.budget_min || null,
    budgetMax: lead.budget_max || null,
    budgetCurrency: lead.budget_currency,
    paymentMethod: null,
    timing: lead.timeline || null,
    goal: null,
    intent: (lead.intent as "alta" | "media" | "baja" | null) || null,
    intentReasons: [] as string[],
    status: lead.status as LeadStatusType,
    assignedTo: lead.assigned_user
      ? {
          id: lead.assigned_user.id,
          fullName: lead.assigned_user.full_name,
          avatarUrl: null,
        }
      : null,
    nextAction: null,
    nextActionDate: null,
    createdAt: lead.created_at,
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (err) {
        setError("Failed to load leads");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  const transformedLeads = leads.map(transformLeadData);

  // Calculate stats
  const stats = {
    total: leads.length,
    nuevo: leads.filter((l) => l.status === "nuevo").length,
    calificado: leads.filter((l) => l.status === "calificado").length,
    negotiation: leads.filter((l) =>
      ["oferta_reserva", "negociacion"].includes(l.status)
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-copper-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your leads in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="bg-copper-500 hover:bg-copper-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">New</p>
          <p className="text-2xl font-bold">{stats.nuevo}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Qualified</p>
          <p className="text-2xl font-bold">{stats.calificado}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">In Negotiation</p>
          <p className="text-2xl font-bold">{stats.negotiation}</p>
        </div>
      </div>

      {/* Table */}
      <LeadsTable data={transformedLeads} />
    </div>
  );
}
