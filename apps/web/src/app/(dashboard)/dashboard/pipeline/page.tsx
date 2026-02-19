"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { LeadModal } from "@/components/leads/lead-modal";
import { getLeads, type Lead } from "@/lib/queries/leads";
import { Plus, LayoutGrid, List, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { useLanguage } from "@/lib/i18n";
import type { LeadStatusType } from "@/types";

// Transform Supabase data to match the kanban format
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
    segment: lead.market === "usa" ? "usa_desk" : "dubai_offplan",
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

export default function PipelinePage() {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
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

  const transformedLeads = leads.map(transformLeadData);

  // Calculate stats
  const stats = {
    total: leads.length,
    nuevo: leads.filter((l) => l.status === "nuevo").length,
    calificado: leads.filter((l) => l.status === "calificado").length,
    meetings: leads.filter((l) =>
      ["meeting_programado", "meeting_realizado"].includes(l.status)
    ).length,
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
          <p className="text-slate-500">{t.pipeline.loadingPipeline}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t.pipeline.title}</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base hidden sm:block">
              {t.pipeline.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{t.common.refresh}</span>
              </Button>
            </motion.div>
            <div className="hidden sm:flex items-center rounded-xl border p-1 bg-white">
              <Button variant="ghost" size="sm" className="bg-violet-50 text-violet-700 rounded-lg">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Link href="/dashboard/leads">
                <Button variant="ghost" size="sm" className="rounded-lg">
                  <List className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={() => setShowLeadModal(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t.pipeline.addLead}
              </Button>
            </motion.div>
          </div>
        </div>
      </FadeIn>

      {/* Pipeline Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-5">
        {[
          { label: t.pipeline.totalInPipeline, value: stats.total, color: "slate" },
          { label: t.leadStatus.nuevo, value: stats.nuevo, color: "slate" },
          { label: t.leadStatus.calificado, value: stats.calificado, color: "cyan" },
          { label: t.pipeline.meetings, value: stats.meetings, color: "violet" },
          { label: t.pipeline.negotiation, value: stats.negotiation, color: "orange" },
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

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden sm:flex items-center gap-3 p-4 rounded-xl bg-violet-50 border border-violet-200"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-white flex-shrink-0">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-violet-900">
            {t.pipeline.dragDropEnabled}
          </p>
          <p className="text-xs text-violet-700">
            {t.pipeline.dragDropInfo}
          </p>
        </div>
        <Badge className="bg-violet-100 text-violet-700 border-violet-200 flex-shrink-0">
          {leads.length} {t.pipeline.totalLeads}
        </Badge>
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <KanbanBoard
          leads={transformedLeads}
          onLeadUpdate={(leadId, newStatus) => {
            console.log(`Lead ${leadId} moved to ${newStatus}`);
          }}
        />
      </motion.div>

      {/* Add Lead Modal */}
      <LeadModal
        open={showLeadModal}
        onOpenChange={setShowLeadModal}
        lead={null}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
