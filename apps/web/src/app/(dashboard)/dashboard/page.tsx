import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getInitials, formatCurrency, formatRelativeTime } from "@/lib/utils";

// Mock data for MVP demo
const kpis = [
  {
    title: "Total Leads",
    value: "1,847",
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Qualified",
    value: "423",
    change: "+8%",
    trend: "up",
    icon: UserCheck,
    description: "vs last month",
  },
  {
    title: "SLA Compliance",
    value: "89%",
    change: "-2%",
    trend: "down",
    icon: Clock,
    description: "response < 10min",
  },
  {
    title: "Closings",
    value: "18",
    change: "+25%",
    trend: "up",
    icon: TrendingUp,
    description: "this month",
  },
];

const slaAlerts = [
  {
    id: 1,
    leadName: "Ahmed S.",
    market: "Dubai",
    time: "45 min",
    assignee: "Hassan Ali",
  },
  {
    id: 2,
    leadName: "Victoria R.",
    market: "USA",
    time: "22 min",
    assignee: "Mark Rivera",
  },
  {
    id: 3,
    leadName: "Daniel T.",
    market: "USA",
    time: "18 min",
    assignee: "Sofía Delgado",
  },
];

const recentLeads = [
  {
    id: 1,
    name: "Ahmed Sharif",
    channel: "Bayut",
    interest: "Villa Dubailand",
    budget: "AED 2.0M - 2.6M",
    status: "nuevo",
    time: "8 min ago",
  },
  {
    id: 2,
    name: "Elena Kozlova",
    channel: "Meta Ads",
    interest: "Downtown 2BR",
    budget: "AED 3.5M - 4.2M",
    status: "contactado",
    time: "45 min ago",
  },
  {
    id: 3,
    name: "Daniel Thompson",
    channel: "Google",
    interest: "Austin Home",
    budget: "USD 850k - 1.1M",
    status: "nuevo",
    time: "5 min ago",
  },
  {
    id: 4,
    name: "Hanna Zimmerman",
    channel: "Meta Ads",
    interest: "Studio Investment",
    budget: "AED 650k - 850k",
    status: "contactado",
    time: "1 hour ago",
  },
];

const pipelineSummary = [
  { stage: "Nuevo", count: 127, color: "bg-slate-500" },
  { stage: "Contactado", count: 234, color: "bg-blue-500" },
  { stage: "Calificado", count: 423, color: "bg-cyan-500" },
  { stage: "Meeting", count: 89, color: "bg-violet-500" },
  { stage: "Oferta", count: 34, color: "bg-amber-500" },
  { stage: "Negociación", count: 12, color: "bg-orange-500" },
];

const channelBreakdown = [
  { channel: "Meta Ads", leads: 647, percentage: 35, color: "bg-blue-500" },
  { channel: "Portales", leads: 647, percentage: 35, color: "bg-emerald-500" },
  { channel: "Google", leads: 277, percentage: 15, color: "bg-amber-500" },
  { channel: "Partners", leads: 277, percentage: 15, color: "bg-purple-500" },
];

function KPICard({ kpi }: { kpi: typeof kpis[0] }) {
  const Icon = kpi.icon;
  const isUp = kpi.trend === "up";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-950/5">
            <Icon className="h-6 w-6 text-navy-950" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${isUp ? "text-emerald-600" : "text-red-600"}`}>
            {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {kpi.change}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-3xl font-bold">{kpi.value}</h3>
          <p className="text-sm text-muted-foreground">{kpi.title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    nuevo: "bg-slate-100 text-slate-700",
    contactado: "bg-blue-100 text-blue-700",
    calificado: "bg-cyan-100 text-cyan-700",
  };

  return (
    <Badge variant="secondary" className={colors[status] || colors.nuevo}>
      {status}
    </Badge>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Omar. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SLA Alerts */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base text-amber-900">SLA Alerts</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Leads without response exceeding SLA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {slaAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                      {getInitials(alert.leadName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{alert.leadName}</p>
                    <p className="text-xs text-muted-foreground">{alert.market}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-700">{alert.time}</p>
                  <p className="text-xs text-muted-foreground">{alert.assignee}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pipeline Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline Overview</CardTitle>
            <CardDescription>Current lead distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineSummary.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{stage.stage}</span>
                    <span className="text-sm font-medium">{stage.count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${stage.color}`}
                      style={{ width: `${(stage.count / 500) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Channel Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by Channel</CardTitle>
            <CardDescription>Source attribution this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelBreakdown.map((channel) => (
              <div key={channel.channel} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{channel.channel}</span>
                  <span className="font-medium">{channel.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full ${channel.color}`}
                    style={{ width: `${channel.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Leads</CardTitle>
          <CardDescription>Latest leads requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Lead</th>
                  <th className="pb-3 font-medium">Channel</th>
                  <th className="pb-3 font-medium">Interest</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="text-sm">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-navy-950 text-white text-xs">
                            {getInitials(lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{lead.channel}</td>
                    <td className="py-3">{lead.interest}</td>
                    <td className="py-3 font-medium">{lead.budget}</td>
                    <td className="py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3 text-muted-foreground">{lead.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
