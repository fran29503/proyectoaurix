"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

interface KanbanBoardProps {
  leads: LeadData[];
}

const stageColors: Record<string, { bg: string; border: string; text: string }> = {
  nuevo: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
  contactado: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  calificado: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  meeting_programado: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
  meeting_realizado: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  oferta_reserva: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  negociacion: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  cerrado_ganado: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  cerrado_perdido: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  dormido: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
};

const intentDots: Record<string, string> = {
  alta: "bg-emerald-500",
  media: "bg-amber-500",
  baja: "bg-red-500",
};

interface LeadCardProps {
  lead: LeadData;
  onDragStart?: () => void;
}

function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-navy-950 text-white text-xs">
              {getInitials(lead.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="font-medium text-sm hover:text-copper-600 hover:underline"
            >
              {lead.fullName}
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {lead.market === "dubai" ? "🇦🇪" : "🇺🇸"}
              <span>{lead.countryResidence}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/leads/${lead.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="mr-2 h-3 w-3" />
                Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Interest */}
      {lead.interestZone && (
        <div className="text-xs text-muted-foreground mb-2">
          {lead.interestZone} {lead.interestType && `• ${lead.interestType}`}
        </div>
      )}

      {/* Budget */}
      <div className="text-sm font-medium mb-2">
        {formatBudgetRange(lead.budgetMin, lead.budgetMax, lead.budgetCurrency)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          {lead.intent && (
            <div className="flex items-center gap-1">
              <div className={cn("h-2 w-2 rounded-full", intentDots[lead.intent])} />
              <span className="text-xs text-muted-foreground capitalize">{lead.intent}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(lead.createdAt)}
        </div>
      </div>

      {/* Assigned */}
      {lead.assignedTo && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px]">
              {getInitials(lead.assignedTo.fullName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {lead.assignedTo.fullName.split(" ")[0]}
          </span>
        </div>
      )}
    </Card>
  );
}

interface KanbanColumnProps {
  stage: (typeof PIPELINE_STAGES)[0];
  leads: LeadData[];
}

function KanbanColumn({ stage, leads }: KanbanColumnProps) {
  const colors = stageColors[stage.id];
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
    <div className="flex-shrink-0 w-72">
      <div className={cn("rounded-lg p-3 mb-3", colors.bg, "border", colors.border)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-semibold text-sm", colors.text)}>{stage.label}</h3>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {leads.length}
            </Badge>
          </div>
          {totalValue > 0 && (
            <span className="text-xs text-muted-foreground">
              ~{formatValue(totalValue)}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
            No leads
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ leads }: KanbanBoardProps) {
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="dubai">Dubai</SelectItem>
            <SelectItem value="usa">USA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="dubai_offplan">Dubai Off-plan</SelectItem>
            <SelectItem value="dubai_secondary">Dubai Secondary</SelectItem>
            <SelectItem value="dubai_leasing">Dubai Leasing</SelectItem>
            <SelectItem value="usa_desk">USA Desk</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredLeads.length} leads
        </div>
      </div>

      {/* Board */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {activeStages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStatus[stage.id]}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
