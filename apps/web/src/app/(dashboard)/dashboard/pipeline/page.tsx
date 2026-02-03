import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { leadsData } from "@/lib/data/leads";
import { Plus, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Pipeline</h1>
          <p className="text-muted-foreground">
            Visual overview of your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border p-1">
            <Button variant="ghost" size="sm" className="bg-white shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm">
                <List className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Button size="sm" className="bg-copper-500 hover:bg-copper-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total in Pipeline</p>
          <p className="text-2xl font-bold">{leadsData.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">New</p>
          <p className="text-2xl font-bold text-slate-600">
            {leadsData.filter((l) => l.status === "nuevo").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Qualified</p>
          <p className="text-2xl font-bold text-cyan-600">
            {leadsData.filter((l) => l.status === "calificado").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Meetings</p>
          <p className="text-2xl font-bold text-violet-600">
            {leadsData.filter((l) =>
              ["meeting_programado", "meeting_realizado"].includes(l.status)
            ).length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Negotiation</p>
          <p className="text-2xl font-bold text-orange-600">
            {leadsData.filter((l) =>
              ["oferta_reserva", "negociacion"].includes(l.status)
            ).length}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard leads={leadsData} />
    </div>
  );
}
