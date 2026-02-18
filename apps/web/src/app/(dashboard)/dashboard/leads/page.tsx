"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadModal } from "@/components/leads/lead-modal";
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { AssignLeadDialog } from "@/components/leads/assign-lead-dialog";
import { Plus, Download, Upload, Loader2, RefreshCw } from "lucide-react";
import { getLeads, type Lead } from "@/lib/queries/leads";
import { logAuditAction } from "@/lib/queries/audit";
import { exportToCsv, getLeadCsvColumns } from "@/lib/export";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { useLanguage } from "@/lib/i18n";
import { Can, useCurrentUser } from "@/lib/rbac";
import type { LeadStatusType } from "@/types";

// Transform Supabase data to match the table format (LeadData type)
function transformLeadData(lead: Lead) {
  return {
    id: lead.id,
    fullName: lead.full_name,
    phone: lead.phone || "",
    email: lead.email || null,
    language: lead.language || "en",
    countryResidence: lead.country_residence || "Unknown",
    channel: lead.channel || "direct",
    source: lead.campaign || null,
    market: (lead.market || "dubai") as "dubai" | "usa",
    segment: lead.market === "usa" ? "usa_buyers" : "dubai_offplan",
    interestZone: lead.interest_zone || null,
    interestType: lead.interest_type || null,
    budgetMin: lead.budget_min || null,
    budgetMax: lead.budget_max || null,
    budgetCurrency: lead.budget_currency,
    paymentMethod: null,
    timing: lead.timing || null,
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
  const { t } = useLanguage();
  const { can } = useCurrentUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<{ id: string; full_name: string } | null>(null);
  const [assigningLead, setAssigningLead] = useState<{ id: string; full_name: string; assigned_to: string | null } | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError("loadLeadsError");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setShowLeadModal(true);
  };

  const handleEditLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setEditingLead(lead);
      setShowLeadModal(true);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setDeletingLead({ id: lead.id, full_name: lead.full_name });
    }
  };

  const handleAssignLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setAssigningLead({
        id: lead.id,
        full_name: lead.full_name,
        assigned_to: lead.assigned_to,
      });
    }
  };

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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-slate-500">{t.common.loading}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    const errorKey = error as keyof typeof t.messages;
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-red-600">{t.messages[errorKey] || error}</p>
        <Button onClick={() => window.location.reload()}>{t.common.refresh}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.leads.title}</h1>
            <p className="text-slate-500 mt-1">
              {t.leads.searchPlaceholder}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {t.common.refresh}
              </Button>
            </motion.div>
            <Can resource="leads" action="import">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Upload className="mr-2 h-4 w-4" />
                {t.common.import}
              </Button>
            </Can>
            <Can resource="leads" action="export">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  try {
                    const columns = getLeadCsvColumns(t);
                    const dateStr = new Date().toISOString().split("T")[0];
                    exportToCsv(`aurix-leads-${dateStr}.csv`, columns, leads);
                    toast.success(t.messages.exportSuccess);
                    logAuditAction({
                      action: "export",
                      resource: "lead",
                      metadata: { count: leads.length, format: "csv" },
                    }).catch(() => {});
                  } catch {
                    toast.error(t.messages.exportError);
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {t.common.export}
              </Button>
            </Can>
            <Can resource="leads" action="create">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  onClick={handleAddLead}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t.leads.newLead}
                </Button>
              </motion.div>
            </Can>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t.dashboard.totalLeads, value: stats.total, color: "slate" },
          { label: t.leadStatus.nuevo, value: stats.nuevo, color: "slate" },
          { label: t.leadStatus.calificado, value: stats.calificado, color: "cyan" },
          { label: t.leadStatus.negociacion, value: stats.negotiation, color: "orange" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <HoverLift>
              <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </p>
              </div>
            </HoverLift>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <LeadsTable
          data={transformedLeads}
          onEdit={can("leads", "edit") ? handleEditLead : undefined}
          onDelete={can("leads", "delete") ? handleDeleteLead : undefined}
          onAssign={can("leads", "assign") ? handleAssignLead : undefined}
        />
      </motion.div>

      {/* Modals */}
      <LeadModal
        open={showLeadModal}
        onOpenChange={setShowLeadModal}
        lead={editingLead}
        onSuccess={fetchLeads}
      />

      <DeleteLeadDialog
        open={!!deletingLead}
        onOpenChange={(open) => !open && setDeletingLead(null)}
        lead={deletingLead}
        onSuccess={fetchLeads}
      />

      <AssignLeadDialog
        open={!!assigningLead}
        onOpenChange={(open) => !open && setAssigningLead(null)}
        lead={assigningLead}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
