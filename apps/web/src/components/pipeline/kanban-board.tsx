"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Phone,
  Clock,
  GripVertical,
  Filter,
  Mail,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import { LeadData, formatBudgetRange } from "@/lib/data/leads";
import { PIPELINE_STAGES, type LeadStatusType } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateLeadStatus } from "@/lib/queries/leads";
import { useLanguage } from "@/lib/i18n";

interface KanbanBoardProps {
  leads: LeadData[];
  onLeadUpdate?: (leadId: string, newStatus: LeadStatusType) => void;
}

const stageColors: Record<string, {
  light: { bg: string; border: string; text: string };
  dark: { bg: string; border: string; text: string };
  gradient: string;
  dot: string;
}> = {
  nuevo:             { light: { bg: "#f8fafc", border: "#e2e8f0", text: "#334155" }, dark: { bg: "#1e293b", border: "#334155", text: "#cbd5e1" }, gradient: "from-slate-400 to-slate-600", dot: "#94a3b8" },
  contactado:        { light: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" }, dark: { bg: "rgba(30,58,138,0.2)", border: "#1e3a5f", text: "#93c5fd" }, gradient: "from-blue-400 to-blue-600", dot: "#3b82f6" },
  calificado:        { light: { bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490" }, dark: { bg: "rgba(22,78,99,0.2)", border: "#164e63", text: "#67e8f9" }, gradient: "from-cyan-400 to-cyan-600", dot: "#06b6d4" },
  meeting_programado:{ light: { bg: "#f5f3ff", border: "#c4b5fd", text: "#6d28d9" }, dark: { bg: "rgba(76,29,149,0.2)", border: "#4c1d95", text: "#c4b5fd" }, gradient: "from-violet-400 to-violet-600", dot: "#8b5cf6" },
  meeting_realizado: { light: { bg: "#faf5ff", border: "#d8b4fe", text: "#7e22ce" }, dark: { bg: "rgba(88,28,135,0.2)", border: "#581c87", text: "#d8b4fe" }, gradient: "from-purple-400 to-purple-600", dot: "#a855f7" },
  oferta_reserva:    { light: { bg: "#fffbeb", border: "#fcd34d", text: "#b45309" }, dark: { bg: "rgba(120,53,15,0.2)", border: "#78350f", text: "#fcd34d" }, gradient: "from-amber-400 to-amber-600", dot: "#f59e0b" },
  negociacion:       { light: { bg: "#fff7ed", border: "#fdba74", text: "#c2410c" }, dark: { bg: "rgba(124,45,18,0.2)", border: "#7c2d12", text: "#fdba74" }, gradient: "from-orange-400 to-orange-600", dot: "#f97316" },
  cerrado_ganado:    { light: { bg: "#ecfdf5", border: "#6ee7b7", text: "#047857" }, dark: { bg: "rgba(6,78,59,0.2)", border: "#064e3b", text: "#6ee7b7" }, gradient: "from-emerald-400 to-emerald-600", dot: "#10b981" },
  cerrado_perdido:   { light: { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c" }, dark: { bg: "rgba(127,29,29,0.2)", border: "#7f1d1d", text: "#fca5a5" }, gradient: "from-red-400 to-red-600", dot: "#ef4444" },
  dormido:           { light: { bg: "#f9fafb", border: "#d1d5db", text: "#4b5563" }, dark: { bg: "#1f2937", border: "#374151", text: "#9ca3af" }, gradient: "from-gray-400 to-gray-600", dot: "#6b7280" },
};

const intentDots: Record<string, string> = {
  alta: "bg-emerald-500",
  media: "bg-amber-500",
  baja: "bg-red-500",
};

// Sortable Lead Card Component
interface SortableLeadCardProps {
  lead: LeadData;
  isDragging?: boolean;
}

function SortableLeadCard({ lead, isDragging }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none",
        isSortableDragging && "opacity-50"
      )}
    >
      <LeadCard
        lead={lead}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging || isSortableDragging}
      />
    </div>
  );
}

interface LeadCardProps {
  lead: LeadData;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
  isOverlay?: boolean;
}

function LeadCard({ lead, dragHandleProps, isDragging, isOverlay }: LeadCardProps) {
  return (
    <motion.div
      layout={!isOverlay}
      initial={!isOverlay ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "p-3 cursor-pointer group bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          "hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200",
          isDragging && "shadow-2xl border-violet-400 ring-2 ring-violet-400/20",
          isOverlay && "shadow-2xl rotate-2 scale-105"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-800 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-semibold">
                {getInitials(lead.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/dashboard/leads/${lead.id}`}
                className="font-medium text-sm hover:text-violet-600 transition-colors"
              >
                {lead.fullName}
              </Link>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                {lead.market === "dubai" ? "🇦🇪" : "🇺🇸"}
                <span>{lead.countryResidence}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div
              {...dragHandleProps}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              <GripVertical className="h-4 w-4 text-slate-400" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 z-50">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/leads/${lead.id}`}>
                    <User className="mr-2 h-3 w-3" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="mr-2 h-3 w-3" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-3 w-3" />
                  Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Interest */}
        {lead.interestZone && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
            📍 {lead.interestZone} {lead.interestType && `• ${lead.interestType}`}
          </div>
        )}

        {/* Budget */}
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {formatBudgetRange(lead.budgetMin, lead.budgetMax, lead.budgetCurrency)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {lead.intent && (
              <div className="flex items-center gap-1">
                <div className={cn("h-2 w-2 rounded-full", intentDots[lead.intent])} />
                <span className="text-xs text-slate-500 capitalize">{lead.intent}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(lead.createdAt)}
          </div>
        </div>

        {/* Assigned */}
        {lead.assignedTo && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-[10px] font-semibold">
                {getInitials(lead.assignedTo.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-500">
              {lead.assignedTo.fullName.split(" ")[0]}
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

interface KanbanColumnProps {
  stage: (typeof PIPELINE_STAGES)[0];
  leads: LeadData[];
  stageLabel: string;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function KanbanColumn({ stage, leads, stageLabel }: KanbanColumnProps) {
  const { t } = useLanguage();
  const isDark = useIsDark();
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });
  const colors = stageColors[stage.id];
  const theme = isDark ? colors.dark : colors.light;
  const totalValue = leads.reduce((sum, lead) => {
    const avg = lead.budgetMin && lead.budgetMax
      ? (lead.budgetMin + lead.budgetMax) / 2
      : lead.budgetMin || lead.budgetMax || 0;
    return sum + avg;
  }, 0);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="flex-shrink-0 w-64 md:w-72">
      {/* Column Header */}
      <motion.div
        className={cn(
          "rounded-xl p-3 mb-3 border-2 transition-all duration-200",
          isOver && "!border-violet-400 ring-2 ring-violet-400/20 shadow-lg"
        )}
        style={{
          backgroundColor: theme.bg,
          borderColor: isOver ? undefined : theme.border,
        }}
        animate={isOver ? { scale: 1.02 } : { scale: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full bg-gradient-to-br", colors.gradient)} />
            <h3 className="font-semibold text-sm" style={{ color: theme.text }}>{stageLabel}</h3>
            <span
              className="inline-flex items-center h-5 px-1.5 text-xs font-semibold rounded-md"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                color: theme.text,
              }}
            >
              {leads.length}
            </span>
          </div>
          {totalValue > 0 && (
            <span className="text-xs font-medium" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
              ~{formatValue(totalValue)}
            </span>
          )}
        </div>
      </motion.div>

      {/* Cards Container */}
      <SortableContext
        items={leads.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-2 min-h-[200px] p-2 rounded-xl transition-all duration-200",
            isOver && "bg-violet-50/50 dark:bg-violet-900/10 border-2 border-dashed border-violet-300 dark:border-violet-700"
          )}
        >
          <AnimatePresence mode="popLayout">
            {leads.map((lead) => (
              <SortableLeadCard key={lead.id} lead={lead} />
            ))}
          </AnimatePresence>
          {leads.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "flex items-center justify-center h-24 border-2 border-dashed rounded-xl text-sm",
                isOver ? "border-violet-300 bg-violet-50 text-violet-600 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-400" : "border-slate-200 dark:border-slate-700 text-slate-400"
              )}
            >
              {isOver ? t.pipeline.dropHere : t.pipeline.noLeadsInStage}
            </motion.div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ leads: initialLeads, onLeadUpdate }: KanbanBoardProps) {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<LeadData[]>(initialLeads);
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Get translated label for a stage
  const getStageLabel = (stageId: LeadStatusType): string => {
    return t.leadStatus[stageId] || stageId;
  };

  // Sync leads when initialLeads changes (e.g., after refresh or add)
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    if (marketFilter !== "all" && lead.market !== marketFilter) return false;
    if (segmentFilter !== "all" && lead.segment !== segmentFilter) return false;
    return true;
  });

  // Group leads by status
  const leadsByStatus = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = filteredLeads.filter((lead) => lead.status === stage.id);
      return acc;
    },
    {} as Record<LeadStatusType, LeadData[]>
  );

  // Only show stages that have leads or are in the main flow
  const activeStages = PIPELINE_STAGES.filter(
    (stage) =>
      leadsByStatus[stage.id].length > 0 ||
      !["cerrado_ganado", "cerrado_perdido", "dormido"].includes(stage.id)
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over) return;

      const activeLeadId = active.id as string;
      const overTargetId = over.id as string;

      // Find the active lead
      const activeLead = leads.find((l) => l.id === activeLeadId);
      if (!activeLead) return;

      const oldStatus = activeLead.status;

      // Find which column the card was dropped into
      let newStatus: LeadStatusType | null = null;

      // Check if dropped on another lead card
      const overLead = leads.find((l) => l.id === overTargetId);
      if (overLead) {
        newStatus = overLead.status as LeadStatusType;
      } else {
        // Check if dropped on a column (stage id)
        const stage = PIPELINE_STAGES.find((s) => s.id === overTargetId);
        if (stage) {
          newStatus = stage.id;
        }
      }

      if (!newStatus) {
        console.log("Could not determine new status for drop target:", overTargetId);
        return;
      }

      // Don't update if status hasn't changed
      if (newStatus === oldStatus) {
        return;
      }

      console.log(`Moving lead ${activeLeadId} from ${oldStatus} to ${newStatus}`);

      // Update local state optimistically
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === activeLeadId
            ? { ...lead, status: newStatus as LeadStatusType }
            : lead
        )
      );

      // Call the update callback
      if (onLeadUpdate) {
        onLeadUpdate(activeLeadId, newStatus);
      }

      // Update in Supabase
      try {
        const activeLead = leads.find((l) => l.id === activeLeadId);
        const success = await updateLeadStatus(activeLeadId, newStatus, {
          oldStatus,
          leadName: activeLead?.fullName,
        });
        if (!success) {
          console.error("Failed to update lead status in database, reverting...");
          // Revert the local state change
          setLeads((prevLeads) =>
            prevLeads.map((lead) =>
              lead.id === activeLeadId
                ? { ...lead, status: oldStatus }
                : lead
            )
          );
        }
      } catch (error) {
        console.error("Failed to update lead status:", error);
        // Revert the local state change
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === activeLeadId
              ? { ...lead, status: oldStatus }
              : lead
          )
        );
      }
    },
    [leads, onLeadUpdate]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 md:gap-4"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{t.common.filters}:</span>
          </div>
          <Select value={marketFilter} onValueChange={setMarketFilter}>
            <SelectTrigger className="w-[110px] md:w-[130px] bg-white">
              <SelectValue placeholder={t.leads.market} />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">{t.market.all}</SelectItem>
              <SelectItem value="dubai">🇦🇪 {t.market.dubai}</SelectItem>
              <SelectItem value="usa">🇺🇸 {t.market.usa}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-[130px] md:w-[160px] bg-white">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="dubai_offplan">Dubai Off-plan</SelectItem>
              <SelectItem value="dubai_secondary">Dubai Secondary</SelectItem>
              <SelectItem value="dubai_leasing">Dubai Leasing</SelectItem>
              <SelectItem value="usa_desk">USA Desk</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-slate-600">
              {filteredLeads.length} {t.leads.title.toLowerCase()}
            </Badge>
          </div>
        </motion.div>

        {/* Board */}
        <HorizontalScroll scrollAmount={288}>
          <div className="flex gap-4 pb-4">
            {activeStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <KanbanColumn
                  stage={stage}
                  leads={leadsByStatus[stage.id]}
                  stageLabel={getStageLabel(stage.id)}
                />
              </motion.div>
            ))}
          </div>
        </HorizontalScroll>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeLead ? (
          <LeadCard lead={activeLead} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
