"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from "@/components/ui/motion";
import { LeadTrendChart } from "@/components/charts/lead-trend-chart";
import { ConversionFunnel } from "@/components/charts/conversion-funnel";
import { ChannelPieChart } from "@/components/charts/channel-pie-chart";
import { AgentPerformanceChart } from "@/components/charts/agent-performance-chart";

// Mock data for MVP demo
const kpis = [
  {
    title: "Total Leads",
    value: "1,847",
    change: "+12%",
    trend: "up" as const,
    icon: Users,
    description: "vs last month",
    gradient: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/20",
  },
  {
    title: "Qualified",
    value: "423",
    change: "+8%",
    trend: "up" as const,
    icon: UserCheck,
    description: "conversion 22.9%",
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    title: "Properties",
    value: "156",
    change: "+5",
    trend: "up" as const,
    icon: Building2,
    description: "active listings",
    gradient: "from-blue-500 to-cyan-600",
    shadowColor: "shadow-blue-500/20",
  },
  {
    title: "Closings",
    value: "18",
    change: "+25%",
    trend: "up" as const,
    icon: TrendingUp,
    description: "this month",
    gradient: "from-amber-500 to-orange-600",
    shadowColor: "shadow-amber-500/20",
  },
];

const slaAlerts = [
  {
    id: 1,
    leadName: "Ahmed Sharif",
    market: "Dubai",
    time: "45 min",
    assignee: "Hassan Ali",
    severity: "high",
  },
  {
    id: 2,
    leadName: "Victoria Rodriguez",
    market: "USA",
    time: "22 min",
    assignee: "Mark Rivera",
    severity: "medium",
  },
  {
    id: 3,
    leadName: "Daniel Thompson",
    market: "USA",
    time: "18 min",
    assignee: "Sofía Delgado",
    severity: "medium",
  },
];

const recentLeads = [
  {
    id: "11111111-0001-0001-0001-000000000001",
    name: "Ahmed Sharif",
    channel: "Bayut",
    interest: "Villa Dubailand",
    budget: "AED 2.0M - 2.6M",
    status: "nuevo",
    time: "8 min ago",
  },
  {
    id: "11111111-0001-0001-0001-000000000002",
    name: "Elena Kozlova",
    channel: "Meta Ads",
    interest: "Downtown 2BR",
    budget: "AED 3.5M - 4.2M",
    status: "contactado",
    time: "45 min ago",
  },
  {
    id: "11111111-0001-0001-0001-000000000003",
    name: "Daniel Thompson",
    channel: "Google",
    interest: "Austin Home",
    budget: "USD 850k - 1.1M",
    status: "nuevo",
    time: "5 min ago",
  },
  {
    id: "11111111-0001-0001-0001-000000000004",
    name: "Hanna Zimmerman",
    channel: "Meta Ads",
    interest: "Studio Investment",
    budget: "AED 650k - 850k",
    status: "calificado",
    time: "1 hour ago",
  },
];

const topAgents = [
  { name: "Lina Petrova", closings: 7, revenue: "AED 28.4M", avatar: "LP" },
  { name: "Youssef Nasser", closings: 5, revenue: "AED 19.2M", avatar: "YN" },
  { name: "Aisha Rahman", closings: 4, revenue: "AED 12.8M", avatar: "AR" },
];

function KPICard({ kpi, index }: { kpi: typeof kpis[0]; index: number }) {
  const Icon = kpi.icon;
  const isUp = kpi.trend === "up";

  return (
    <StaggerItem>
      <HoverLift>
        <Card className={`relative overflow-hidden border-0 shadow-lg ${kpi.shadowColor} transition-shadow duration-300 hover:shadow-xl`}>
          {/* Gradient accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient}`} />

          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>
              <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {kpi.change}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
              <p className="text-sm font-medium text-slate-600 mt-1">{kpi.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.description}</p>
            </motion.div>
          </CardContent>
        </Card>
      </HoverLift>
    </StaggerItem>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    nuevo: "bg-slate-100 text-slate-700 border-slate-200",
    contactado: "bg-blue-50 text-blue-700 border-blue-200",
    calificado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <Badge variant="outline" className={`${styles[status] || styles.nuevo} font-medium`}>
      {status}
    </Badge>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-slate-900"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-1"
            >
              Welcome back, Omar. Here&apos;s what&apos;s happening today.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </Badge>
          </motion.div>
        </div>
      </FadeIn>

      {/* KPI Cards */}
      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KPICard key={kpi.title} kpi={kpi} index={index} />
        ))}
      </StaggerContainer>

      {/* SLA Alert Banner */}
      {slaAlerts.length > 0 && (
        <FadeIn delay={0.3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden">
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30"
                    >
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="font-semibold text-amber-900">
                        {slaAlerts.length} leads exceeding SLA response time
                      </p>
                      <p className="text-sm text-amber-700">
                        Immediate action required to maintain service quality
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/leads?filter=sla_alert">
                    <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
                      View all
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </FadeIn>
      )}

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.4} direction="left">
          <HoverLift liftAmount={-2}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Lead Trends</CardTitle>
                    <CardDescription>Monthly lead volume by market</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">Last 12 months</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <LeadTrendChart />
                <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-900" />
                    <span className="text-sm text-slate-600">Dubai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-violet-500" />
                    <span className="text-sm text-slate-600">USA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>
        </FadeIn>

        <FadeIn delay={0.5} direction="right">
          <HoverLift liftAmount={-2}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Conversion Funnel</CardTitle>
                    <CardDescription>Lead progression through pipeline</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-violet-600">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-medium">AI Insights</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ConversionFunnel />
              </CardContent>
            </Card>
          </HoverLift>
        </FadeIn>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn delay={0.6} className="lg:col-span-2">
          <HoverLift liftAmount={-2}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Agent Performance</CardTitle>
                  <CardDescription>Leads assigned vs closings</CardDescription>
                </div>
                <Link href="/dashboard/team">
                  <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                    View team
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <AgentPerformanceChart />
                <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-slate-900" />
                    <span className="text-sm text-slate-600">Leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-violet-500" />
                    <span className="text-sm text-slate-600">Closings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>
        </FadeIn>

        <FadeIn delay={0.7}>
          <HoverLift liftAmount={-2}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Top Performers</CardTitle>
                <CardDescription>This month&apos;s leaders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topAgents.map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                        <AvatarFallback className={`text-white text-xs font-semibold ${
                          index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                          index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-600" :
                          "bg-gradient-to-br from-amber-600 to-amber-800"
                        }`}>
                          {agent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-500" : "bg-amber-700"
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{agent.name}</p>
                      <p className="text-xs text-slate-500">
                        {agent.closings} closings · {agent.revenue}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </HoverLift>
        </FadeIn>
      </div>

      {/* Third Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FadeIn delay={0.8} className="lg:col-span-2">
          <HoverLift liftAmount={-2}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Recent Leads</CardTitle>
                  <CardDescription>Latest leads requiring attention</CardDescription>
                </div>
                <Link href="/dashboard/leads">
                  <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                        <th className="pb-3 font-medium">Lead</th>
                        <th className="pb-3 font-medium">Channel</th>
                        <th className="pb-3 font-medium">Budget</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentLeads.map((lead, index) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.05 }}
                          className="text-sm group hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3">
                            <Link href={`/dashboard/leads/${lead.id}`} className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-semibold">
                                  {getInitials(lead.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-slate-900 group-hover:text-violet-600 transition-colors">
                                  {lead.name}
                                </span>
                                <p className="text-xs text-slate-500">{lead.interest}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="py-3 text-slate-600">{lead.channel}</td>
                          <td className="py-3 font-medium text-slate-900">{lead.budget}</td>
                          <td className="py-3">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="py-3 text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lead.time}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </HoverLift>
        </FadeIn>

        <FadeIn delay={0.9}>
          <HoverLift liftAmount={-2}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900">Leads by Channel</CardTitle>
                <CardDescription>Source attribution this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChannelPieChart />
              </CardContent>
            </Card>
          </HoverLift>
        </FadeIn>
      </div>

      {/* SLA Alerts Detail */}
      {slaAlerts.length > 0 && (
        <FadeIn delay={1}>
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base text-amber-900">SLA Alert Details</CardTitle>
                  <CardDescription className="text-amber-700">
                    Leads without response exceeding 10 minute SLA
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {slaAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                      <AvatarFallback className={`text-xs font-semibold ${
                        alert.severity === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {getInitials(alert.leadName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{alert.leadName}</p>
                      <p className="text-sm text-slate-500">
                        {alert.market} · Assigned to {alert.assignee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        alert.severity === "high"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }
                    >
                      {alert.time} waiting
                    </Badge>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                        Contact Now
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
