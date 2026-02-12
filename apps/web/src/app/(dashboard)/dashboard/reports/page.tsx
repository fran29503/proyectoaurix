"use client";

import { useState } from "react";
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
  DollarSign,
  Users,
  Building2,
  Clock,
  Target,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { LeadTrendChart } from "@/components/charts/lead-trend-chart";
import { ConversionFunnel } from "@/components/charts/conversion-funnel";
import { ChannelPieChart } from "@/components/charts/channel-pie-chart";
import { AgentPerformanceChart } from "@/components/charts/agent-performance-chart";
import { useLanguage } from "@/lib/i18n";

// Mock data for reports
const summaryMetrics = {
  totalRevenue: { value: "AED 124.8M", change: "+18%", trend: "up" },
  avgDealSize: { value: "AED 6.9M", change: "+5%", trend: "up" },
  conversionRate: { value: "2.0%", change: "-0.1%", trend: "down" },
  avgCycleTime: { value: "45 days", change: "-3 days", trend: "up" },
};

const monthlyData = [
  { month: "Jan", leads: 190, closings: 3, revenue: 8.4 },
  { month: "Feb", leads: 220, closings: 4, revenue: 11.2 },
  { month: "Mar", leads: 257, closings: 5, revenue: 14.8 },
  { month: "Apr", leads: 237, closings: 4, revenue: 10.6 },
  { month: "May", leads: 273, closings: 6, revenue: 18.2 },
  { month: "Jun", leads: 316, closings: 5, revenue: 12.8 },
  { month: "Jul", leads: 323, closings: 7, revenue: 21.4 },
  { month: "Aug", leads: 363, closings: 6, revenue: 16.2 },
  { month: "Sep", leads: 401, closings: 8, revenue: 24.6 },
  { month: "Oct", leads: 437, closings: 7, revenue: 19.8 },
  { month: "Nov", leads: 416, closings: 9, revenue: 28.4 },
  { month: "Dec", leads: 459, closings: 10, revenue: 32.8 },
];

const agentLeaderboard = [
  { rank: 1, name: "Lina Petrova", closings: 24, revenue: "AED 68.4M", convRate: "13.5%", avgCycle: "38 days" },
  { rank: 2, name: "Youssef Nasser", closings: 18, revenue: "AED 52.2M", convRate: "11.1%", avgCycle: "42 days" },
  { rank: 3, name: "Aisha Rahman", closings: 15, revenue: "AED 38.4M", convRate: "10.5%", avgCycle: "45 days" },
  { rank: 4, name: "Mark Rivera", closings: 12, revenue: "AED 28.8M", convRate: "10.7%", avgCycle: "48 days" },
  { rank: 5, name: "Hassan Ali", closings: 8, revenue: "AED 18.4M", convRate: "5.7%", avgCycle: "52 days" },
  { rank: 6, name: "Sofía Delgado", closings: 7, revenue: "AED 14.2M", convRate: "9.1%", avgCycle: "50 days" },
];

const channelPerformance = [
  { channel: "Meta Ads", leads: 647, closings: 12, revenue: "AED 42.8M", costPerLead: "AED 850", roi: "4.2x" },
  { channel: "Portals", leads: 555, closings: 18, revenue: "AED 58.4M", costPerLead: "AED 420", roi: "6.8x" },
  { channel: "Google Ads", leads: 277, closings: 8, revenue: "AED 28.2M", costPerLead: "AED 1,200", roi: "3.1x" },
  { channel: "Partners", leads: 185, closings: 15, revenue: "AED 48.6M", costPerLead: "AED 0", roi: "∞" },
  { channel: "Organic", leads: 111, closings: 6, revenue: "AED 18.4M", costPerLead: "AED 0", roi: "∞" },
  { channel: "Referral", leads: 72, closings: 5, revenue: "AED 14.8M", costPerLead: "AED 0", roi: "∞" },
];

const propertyPerformance = [
  { type: "Apartment", views: 1240, inquiries: 380, closings: 42, avgPrice: "AED 2.8M" },
  { type: "Villa", views: 680, inquiries: 145, closings: 18, avgPrice: "AED 8.4M" },
  { type: "Townhouse", views: 420, inquiries: 98, closings: 12, avgPrice: "AED 4.2M" },
  { type: "Penthouse", views: 180, inquiries: 32, closings: 4, avgPrice: "AED 12.6M" },
  { type: "Studio", views: 560, inquiries: 168, closings: 8, avgPrice: "AED 850K" },
];

function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: string;
  icon: React.ElementType;
}) {
  const isUp = trend === "up";
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950/5">
            <Icon className="h-5 w-5 text-navy-950" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${isUp ? "text-emerald-600" : "text-red-600"}`}>
            {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {change}
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState("year");
  const [market, setMarket] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">{t.reports.title}</h1>
          <p className="text-muted-foreground">
            {t.reports.agentPerformance}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t.form.market} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.market.all}</SelectItem>
              <SelectItem value="dubai">{t.market.dubai}</SelectItem>
              <SelectItem value="usa">{t.market.usa}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t.reports.dateRange} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t.time.thisMonth}</SelectItem>
              <SelectItem value="quarter">{t.time.thisWeek}</SelectItem>
              <SelectItem value="year">{t.dashboard.last12Months}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t.common.export}
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={summaryMetrics.totalRevenue.value}
          change={summaryMetrics.totalRevenue.change}
          trend={summaryMetrics.totalRevenue.trend}
          icon={DollarSign}
        />
        <MetricCard
          title="Avg Deal Size"
          value={summaryMetrics.avgDealSize.value}
          change={summaryMetrics.avgDealSize.change}
          trend={summaryMetrics.avgDealSize.trend}
          icon={Target}
        />
        <MetricCard
          title="Conversion Rate"
          value={summaryMetrics.conversionRate.value}
          change={summaryMetrics.conversionRate.change}
          trend={summaryMetrics.conversionRate.trend}
          icon={Users}
        />
        <MetricCard
          title="Avg Cycle Time"
          value={summaryMetrics.avgCycleTime.value}
          change={summaryMetrics.avgCycleTime.change}
          trend={summaryMetrics.avgCycleTime.trend}
          icon={Clock}
        />
      </div>

      {/* Tabs for different report views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.nav.dashboard}</TabsTrigger>
          <TabsTrigger value="agents">{t.team.agents}</TabsTrigger>
          <TabsTrigger value="channels">{t.leads.channel}</TabsTrigger>
          <TabsTrigger value="properties">{t.nav.properties}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.dashboard.leadTrends}</CardTitle>
                <CardDescription>{t.dashboard.leadTrendsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <LeadTrendChart />
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
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
                <ConversionFunnel />
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Performance</CardTitle>
              <CardDescription>Year-to-date breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Month</th>
                      <th className="pb-3 font-medium text-right">Leads</th>
                      <th className="pb-3 font-medium text-right">Closings</th>
                      <th className="pb-3 font-medium text-right">Conv. Rate</th>
                      <th className="pb-3 font-medium text-right">Revenue (M)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {monthlyData.map((row) => (
                      <tr key={row.month} className="text-sm">
                        <td className="py-3 font-medium">{row.month}</td>
                        <td className="py-3 text-right">{row.leads}</td>
                        <td className="py-3 text-right">{row.closings}</td>
                        <td className="py-3 text-right">
                          {((row.closings / row.leads) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-right font-medium">
                          AED {row.revenue}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2">
                    <tr className="text-sm font-semibold">
                      <td className="pt-3">Total</td>
                      <td className="pt-3 text-right">
                        {monthlyData.reduce((sum, row) => sum + row.leads, 0)}
                      </td>
                      <td className="pt-3 text-right">
                        {monthlyData.reduce((sum, row) => sum + row.closings, 0)}
                      </td>
                      <td className="pt-3 text-right">2.0%</td>
                      <td className="pt-3 text-right">
                        AED {monthlyData.reduce((sum, row) => sum + row.revenue, 0).toFixed(1)}M
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{t.dashboard.agentPerformance}</CardTitle>
                <CardDescription>{t.dashboard.agentPerformanceDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentPerformanceChart />
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-navy-950" />
                    <span className="text-sm text-muted-foreground">{t.nav.leads}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-copper-500" />
                    <span className="text-sm text-muted-foreground">{t.dashboard.closings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.dashboard.leadsByChannel}</CardTitle>
                <CardDescription>{t.leads.channel}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChannelPieChart />
              </CardContent>
            </Card>
          </div>

          {/* Agent Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agent Leaderboard</CardTitle>
              <CardDescription>Year-to-date performance ranking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Rank</th>
                      <th className="pb-3 font-medium">Agent</th>
                      <th className="pb-3 font-medium text-right">Closings</th>
                      <th className="pb-3 font-medium text-right">Revenue</th>
                      <th className="pb-3 font-medium text-right">Conv. Rate</th>
                      <th className="pb-3 font-medium text-right">Avg Cycle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {agentLeaderboard.map((agent) => (
                      <tr key={agent.name} className="text-sm">
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
                        <td className="py-3 text-right">{agent.closings}</td>
                        <td className="py-3 text-right font-medium">{agent.revenue}</td>
                        <td className="py-3 text-right">{agent.convRate}</td>
                        <td className="py-3 text-right text-muted-foreground">{agent.avgCycle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Channel Performance</CardTitle>
              <CardDescription>Lead source effectiveness and ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Channel</th>
                      <th className="pb-3 font-medium text-right">Leads</th>
                      <th className="pb-3 font-medium text-right">Closings</th>
                      <th className="pb-3 font-medium text-right">Conv. Rate</th>
                      <th className="pb-3 font-medium text-right">Revenue</th>
                      <th className="pb-3 font-medium text-right">Cost/Lead</th>
                      <th className="pb-3 font-medium text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {channelPerformance.map((channel) => (
                      <tr key={channel.channel} className="text-sm">
                        <td className="py-3 font-medium">{channel.channel}</td>
                        <td className="py-3 text-right">{channel.leads}</td>
                        <td className="py-3 text-right">{channel.closings}</td>
                        <td className="py-3 text-right">
                          {((channel.closings / channel.leads) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-right font-medium">{channel.revenue}</td>
                        <td className="py-3 text-right text-muted-foreground">{channel.costPerLead}</td>
                        <td className="py-3 text-right">
                          <Badge
                            variant="secondary"
                            className={
                              channel.roi === "∞"
                                ? "bg-emerald-100 text-emerald-700"
                                : parseFloat(channel.roi) >= 5
                                ? "bg-emerald-100 text-emerald-700"
                                : parseFloat(channel.roi) >= 3
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {channel.roi}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lead Distribution</CardTitle>
                <CardDescription>By source channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ChannelPieChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channel Insights</CardTitle>
                <CardDescription>Key takeaways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-900">Top Performer</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Portals have the highest conversion rate at 3.2% with the best ROI at 6.8x
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm font-medium text-amber-900">Optimization Opportunity</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Google Ads has high cost per lead. Consider optimizing targeting or reallocating budget.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Growth Area</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Referrals show strong conversion. Consider implementing a formal referral program.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Property Type Performance</CardTitle>
              <CardDescription>Engagement and sales by property type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium text-right">Views</th>
                      <th className="pb-3 font-medium text-right">Inquiries</th>
                      <th className="pb-3 font-medium text-right">Inquiry Rate</th>
                      <th className="pb-3 font-medium text-right">Closings</th>
                      <th className="pb-3 font-medium text-right">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {propertyPerformance.map((prop) => (
                      <tr key={prop.type} className="text-sm">
                        <td className="py-3 font-medium">{prop.type}</td>
                        <td className="py-3 text-right">{prop.views.toLocaleString()}</td>
                        <td className="py-3 text-right">{prop.inquiries}</td>
                        <td className="py-3 text-right">
                          {((prop.inquiries / prop.views) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-right font-medium">{prop.closings}</td>
                        <td className="py-3 text-right">{prop.avgPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950/5">
                    <Building2 className="h-5 w-5 text-navy-950" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-medium">124</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reserved</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sold</span>
                    <span className="font-medium">4</span>
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
                    <p className="text-2xl font-bold">AED 4.2M</p>
                    <p className="text-sm text-muted-foreground">Avg Listing Price</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Highest</span>
                    <span className="font-medium">AED 45M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lowest</span>
                    <span className="font-medium">AED 650K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Median</span>
                    <span className="font-medium">AED 2.8M</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-950/5">
                    <Clock className="h-5 w-5 text-navy-950" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">28 days</p>
                    <p className="text-sm text-muted-foreground">Avg Days on Market</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Off-Plan</span>
                    <span className="font-medium">42 days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resale</span>
                    <span className="font-medium">21 days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rent</span>
                    <span className="font-medium">14 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
