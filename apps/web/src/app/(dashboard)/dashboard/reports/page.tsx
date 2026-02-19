"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Target,
  Download,
  Loader2,
  BarChart3,
} from "lucide-react";
import { LeadTrendChart } from "@/components/charts/lead-trend-chart";
import { ConversionFunnel, type FunnelStage } from "@/components/charts/conversion-funnel";
import { ChannelPieChart } from "@/components/charts/channel-pie-chart";
import { AgentPerformanceChart } from "@/components/charts/agent-performance-chart";
import { useLanguage } from "@/lib/i18n";
import { logAuditAction } from "@/lib/queries/audit";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  getReportsData,
  type ReportsData,
  type MarketFilter,
  type PeriodFilter,
  type FunnelData,
} from "@/lib/queries/reports";

// --- Animation variants ---
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

// --- Helpers ---

function formatCurrency(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${currency} ${(value / 1_000).toFixed(0)}K`;
  }
  return `${currency} ${value.toFixed(0)}`;
}

function percentChange(current: number, previous: number): { text: string; isUp: boolean } {
  if (previous === 0) {
    return current > 0 ? { text: "+100%", isUp: true } : { text: "0%", isUp: true };
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return { text: `${sign}${change.toFixed(1)}%`, isUp: change >= 0 };
}

function funnelToStages(data: FunnelData): FunnelStage[] {
  const total = data.total || 1;
  const stages: { name: string; value: number; gradient: string; color: string }[] = [
    { name: "New", value: data.nuevo, gradient: "from-slate-400 to-slate-600", color: "bg-slate-500" },
    { name: "Contacted", value: data.contactado, gradient: "from-blue-400 to-blue-600", color: "bg-blue-500" },
    { name: "Qualified", value: data.calificado, gradient: "from-cyan-400 to-cyan-600", color: "bg-cyan-500" },
    { name: "Meeting", value: data.meeting, gradient: "from-violet-400 to-violet-600", color: "bg-violet-500" },
    { name: "Offer", value: data.oferta, gradient: "from-amber-400 to-amber-600", color: "bg-amber-500" },
    { name: "Negotiation", value: data.negociacion, gradient: "from-orange-400 to-orange-600", color: "bg-orange-500" },
    { name: "Closed Won", value: data.cerrado, gradient: "from-emerald-400 to-emerald-600", color: "bg-emerald-500" },
  ];

  return stages.map((s) => ({
    name: s.name,
    value: s.value,
    percentage: Math.round((s.value / total) * 100),
    color: s.color,
    gradient: s.gradient,
  }));
}

// --- MetricCard ---

function MetricCard({
  title,
  value,
  change,
  isUp,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: React.ElementType;
}) {
  return (
    <motion.div variants={fadeIn}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-navy-950/5">
              <Icon className="h-4 w-4 md:h-5 md:w-5 text-navy-950" />
            </div>
            <div className={`flex items-center gap-1 text-xs md:text-sm ${isUp ? "text-emerald-600" : "text-red-600"}`}>
              {isUp ? <TrendingUp className="h-3 w-3 md:h-4 md:w-4" /> : <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />}
              {change}
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold truncate">{value}</p>
          <p className="text-xs md:text-sm text-muted-foreground truncate">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Empty state ---

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <BarChart3 className="h-12 w-12 text-slate-300 mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );
}

// === MAIN PAGE ===

export default function ReportsPage() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<PeriodFilter>("year");
  const [market, setMarket] = useState<MarketFilter>("all");
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getReportsData({ market, period });
    setData(result);
    setLoading(false);
  }, [market, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sm = data?.summaryMetrics;
  const leadsChange = sm ? percentChange(sm.totalLeads, sm.prevTotalLeads) : { text: "0%", isUp: true };
  const closingsChange = sm ? percentChange(sm.totalClosings, sm.prevTotalClosings) : { text: "0%", isUp: true };
  const convChange = sm ? percentChange(sm.conversionRate, sm.prevConversionRate) : { text: "0%", isUp: true };
  const budgetChange = sm ? percentChange(sm.avgBudget, sm.prevAvgBudget) : { text: "0%", isUp: true };

  // Funnel stages
  const funnelStages = data?.funnelData ? funnelToStages(data.funnelData) : undefined;
  const overallConv = sm ? `${sm.conversionRate.toFixed(1)}%` : undefined;

  // Channel insights
  const topChannel = data?.channelPerformance?.[0];
  const bestConverter = data?.channelPerformance
    ? [...data.channelPerformance].sort((a, b) => b.conversionRate - a.conversionRate)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-950">{t.reports.title}</h1>
          <p className="text-muted-foreground text-sm md:text-base hidden sm:block">{t.reports.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Select value={market} onValueChange={(v) => setMarket(v as MarketFilter)}>
            <SelectTrigger className="w-[110px] md:w-[140px]">
              <SelectValue placeholder={t.market.all} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg z-50">
              <SelectItem value="all">{t.market.all}</SelectItem>
              <SelectItem value="dubai">{t.market.dubai}</SelectItem>
              <SelectItem value="usa">{t.market.usa}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[110px] md:w-[140px]">
              <SelectValue placeholder={t.reports.dateRange} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg z-50">
              <SelectItem value="month">{t.time.thisMonth}</SelectItem>
              <SelectItem value="quarter">{t.reports.thisQuarter}</SelectItem>
              <SelectItem value="year">{t.reports.thisYear}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.print();
              logAuditAction({
                action: "export",
                resource: "report",
                metadata: { format: "pdf", market, period },
              }).catch(() => {});
              toast.success(t.messages.exportSuccess);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export</span> PDF
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-24"
        >
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-3 text-sm text-muted-foreground">{t.reports.loadingReports}</span>
        </motion.div>
      )}

      {/* No data */}
      {!loading && !data && (
        <EmptyState message={t.reports.noDataForPeriod} />
      )}

      {/* Data loaded */}
      {!loading && data && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Summary Metrics */}
          <motion.div variants={staggerContainer} className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title={t.reports.totalLeads}
              value={sm!.totalLeads.toLocaleString()}
              change={leadsChange.text}
              isUp={leadsChange.isUp}
              icon={Users}
            />
            <MetricCard
              title={t.reports.totalClosings}
              value={sm!.totalClosings.toLocaleString()}
              change={closingsChange.text}
              isUp={closingsChange.isUp}
              icon={Target}
            />
            <MetricCard
              title={t.reports.conversionRate}
              value={`${sm!.conversionRate.toFixed(1)}%`}
              change={convChange.text}
              isUp={convChange.isUp}
              icon={TrendingUp}
            />
            <MetricCard
              title={t.reports.avgBudget}
              value={formatCurrency(sm!.avgBudget, sm!.avgBudgetCurrency)}
              change={budgetChange.text}
              isUp={budgetChange.isUp}
              icon={DollarSign}
            />
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm flex-1 sm:flex-initial">{t.reports.overview}</TabsTrigger>
              <TabsTrigger value="agents" className="text-xs sm:text-sm flex-1 sm:flex-initial">{t.team.agents}</TabsTrigger>
              <TabsTrigger value="channels" className="text-xs sm:text-sm flex-1 sm:flex-initial">{t.reports.channels}</TabsTrigger>
              <TabsTrigger value="properties" className="text-xs sm:text-sm flex-1 sm:flex-initial">{t.nav.properties}</TabsTrigger>
            </TabsList>

            {/* === OVERVIEW TAB === */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div variants={fadeIn} className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-base">{t.dashboard.leadTrends}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">{t.dashboard.leadTrendsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <LeadTrendChart data={data.leadTrend} />
                    <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-navy-950" />
                        <span className="text-sm text-muted-foreground">{t.market.dubai}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-copper-500" />
                        <span className="text-sm text-muted-foreground">{t.market.usa}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.dashboard.conversionFunnel}</CardTitle>
                    <CardDescription>{t.dashboard.conversionFunnelDesc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConversionFunnel data={funnelStages} overallConversionRate={overallConv} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Performance Table */}
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.reports.monthlyPerformance}</CardTitle>
                    <CardDescription>{t.reports.periodBreakdown}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.monthlyPerformance.length === 0 ? (
                      <EmptyState message={t.reports.noDataForPeriod} />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-left text-sm text-muted-foreground">
                              <th className="pb-3 font-medium">{t.reports.month}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.leads}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.closings}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.convRate}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.monthlyPerformance.map((row) => (
                              <tr key={row.month} className="text-sm">
                                <td className="py-3 font-medium">{row.month}</td>
                                <td className="py-3 text-right">{row.leads}</td>
                                <td className="py-3 text-right">{row.closings}</td>
                                <td className="py-3 text-right">{row.conversionRate.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t-2">
                            <tr className="text-sm font-semibold">
                              <td className="pt-3">{t.reports.total}</td>
                              <td className="pt-3 text-right">
                                {data.monthlyPerformance.reduce((s, r) => s + r.leads, 0)}
                              </td>
                              <td className="pt-3 text-right">
                                {data.monthlyPerformance.reduce((s, r) => s + r.closings, 0)}
                              </td>
                              <td className="pt-3 text-right">{sm!.conversionRate.toFixed(1)}%</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* === AGENTS TAB === */}
            <TabsContent value="agents" className="space-y-6">
              <motion.div variants={fadeIn} className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">{t.dashboard.agentPerformance}</CardTitle>
                    <CardDescription>{t.dashboard.agentPerformanceDesc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.agentChartData.length === 0 ? (
                      <EmptyState message={t.dashboard.noAgentData} />
                    ) : (
                      <>
                        <AgentPerformanceChart data={data.agentChartData} />
                        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-navy-950" />
                            <span className="text-sm text-muted-foreground">{t.reports.leads}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-copper-500" />
                            <span className="text-sm text-muted-foreground">{t.reports.closings}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.dashboard.leadsByChannel}</CardTitle>
                    <CardDescription>{t.reports.channel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.channelPieData.length === 0 ? (
                      <EmptyState message={t.reports.noDataForPeriod} />
                    ) : (
                      <ChannelPieChart data={data.channelPieData} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Agent Leaderboard */}
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.reports.agentLeaderboard}</CardTitle>
                    <CardDescription>{t.reports.performanceRanking}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.agentLeaderboard.length === 0 ? (
                      <EmptyState message={t.dashboard.noAgentData} />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-left text-sm text-muted-foreground">
                              <th className="pb-3 font-medium">{t.reports.rank}</th>
                              <th className="pb-3 font-medium">{t.reports.agent}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.leads}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.closings}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.convRate}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.agentLeaderboard.map((agent) => (
                              <tr key={agent.userId} className="text-sm">
                                <td className="py-3">
                                  <Badge
                                    variant="secondary"
                                    className={
                                      agent.rank === 1
                                        ? "bg-amber-100 text-amber-700"
                                        : agent.rank === 2
                                        ? "bg-slate-200 text-slate-700"
                                        : agent.rank === 3
                                        ? "bg-amber-50 text-amber-600"
                                        : ""
                                    }
                                  >
                                    #{agent.rank}
                                  </Badge>
                                </td>
                                <td className="py-3 font-medium">{agent.name}</td>
                                <td className="py-3 text-right">{agent.totalLeads}</td>
                                <td className="py-3 text-right">{agent.closings}</td>
                                <td className="py-3 text-right">{agent.conversionRate.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* === CHANNELS TAB === */}
            <TabsContent value="channels" className="space-y-6">
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.reports.channelPerformance}</CardTitle>
                    <CardDescription>{t.reports.channelEffectiveness}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.channelPerformance.length === 0 ? (
                      <EmptyState message={t.reports.noDataForPeriod} />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-left text-sm text-muted-foreground">
                              <th className="pb-3 font-medium">{t.reports.channel}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.leads}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.closings}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.convRate}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.channelPerformance.map((ch) => (
                              <tr key={ch.channel} className="text-sm">
                                <td className="py-3 font-medium">{ch.channel}</td>
                                <td className="py-3 text-right">{ch.leads}</td>
                                <td className="py-3 text-right">{ch.closings}</td>
                                <td className="py-3 text-right">{ch.conversionRate.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn} className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.reports.leadDistribution}</CardTitle>
                    <CardDescription>{t.reports.bySourceChannel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.channelPieData.length === 0 ? (
                      <EmptyState message={t.reports.noDataForPeriod} />
                    ) : (
                      <ChannelPieChart data={data.channelPieData} />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.reports.channelInsights}</CardTitle>
                    <CardDescription>{t.reports.keyTakeaways}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bestConverter && bestConverter.closings > 0 && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-900">{t.reports.topPerformer}</p>
                        <p className="text-xs text-emerald-700 mt-1">
                          {bestConverter.channel} {t.reports.topPerformerDesc} ({bestConverter.conversionRate.toFixed(1)}%)
                        </p>
                      </div>
                    )}
                    {topChannel && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">{t.reports.mostVolume}</p>
                        <p className="text-xs text-blue-700 mt-1">
                          {topChannel.channel} {t.reports.mostVolumeDesc} ({topChannel.leads} {t.reports.leads.toLowerCase()})
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* === PROPERTIES TAB === */}
            <TabsContent value="properties" className="space-y-6">
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.reports.propertyTypePerformance}</CardTitle>
                    <CardDescription>{t.reports.propertyBreakdown}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.propertyPerformance.length === 0 ? (
                      <EmptyState message={t.reports.noDataForPeriod} />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-left text-sm text-muted-foreground">
                              <th className="pb-3 font-medium">{t.reports.type}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.total}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.available}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.reserved}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.sold}</th>
                              <th className="pb-3 font-medium text-right">{t.reports.avgPrice}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.propertyPerformance.map((prop) => (
                              <tr key={prop.type} className="text-sm">
                                <td className="py-3 font-medium capitalize">{prop.type}</td>
                                <td className="py-3 text-right">{prop.total}</td>
                                <td className="py-3 text-right">{prop.available}</td>
                                <td className="py-3 text-right">{prop.reserved}</td>
                                <td className="py-3 text-right font-medium">{prop.sold}</td>
                                <td className="py-3 text-right">{formatCurrency(prop.avgPrice, prop.currency)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Properties summary cards */}
              <motion.div variants={fadeIn} className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950/5">
                        <Building2 className="h-5 w-5 text-navy-950" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{data.propertySummary.totalActive}</p>
                        <p className="text-sm text-muted-foreground">{t.reports.activeListings}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.reports.available}</span>
                        <span className="font-medium">{data.propertySummary.available}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.reports.reserved}</span>
                        <span className="font-medium">{data.propertySummary.reserved}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.reports.sold}</span>
                        <span className="font-medium">{data.propertySummary.sold}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950/5">
                        <DollarSign className="h-5 w-5 text-navy-950" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {formatCurrency(data.propertySummary.avgPrice, data.propertySummary.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.reports.avgListingPrice}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.reports.highest}</span>
                        <span className="font-medium">
                          {formatCurrency(data.propertySummary.maxPrice, data.propertySummary.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.reports.lowest}</span>
                        <span className="font-medium">
                          {formatCurrency(data.propertySummary.minPrice, data.propertySummary.currency)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950/5">
                        <Target className="h-5 w-5 text-navy-950" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {Object.keys(data.propertySummary.byOperation).length}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.reports.byOperation}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(data.propertySummary.byOperation).map(([op, count]) => (
                        <div key={op} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{op}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
