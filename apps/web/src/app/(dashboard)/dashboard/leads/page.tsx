import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/components/leads/leads-table";
import { leadsData } from "@/lib/data/leads";
import { Plus, Download, Upload } from "lucide-react";

export default function LeadsPage() {
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
          <p className="text-2xl font-bold">{leadsData.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">New Today</p>
          <p className="text-2xl font-bold">
            {leadsData.filter((l) => l.status === "nuevo").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Qualified</p>
          <p className="text-2xl font-bold">
            {leadsData.filter((l) => l.status === "calificado").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">In Negotiation</p>
          <p className="text-2xl font-bold">
            {leadsData.filter((l) => ["oferta_reserva", "negociacion"].includes(l.status)).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <LeadsTable data={leadsData} />
    </div>
  );
}
