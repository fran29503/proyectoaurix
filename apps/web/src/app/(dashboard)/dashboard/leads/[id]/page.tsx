import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  Target,
  Clock,
  User,
  Building2,
  Edit,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  MessageCircle,
  PhoneCall,
  FileText,
  ArrowRightLeft,
  UserPlus,
} from "lucide-react";
import { cn, getInitials, formatRelativeTime, formatDate } from "@/lib/utils";
import { leadsData, formatBudgetRange } from "@/lib/data/leads";
import { getActivitiesByLeadId, type ActivityData } from "@/lib/data/activities";
import { PIPELINE_STAGES } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  nuevo: "bg-slate-100 text-slate-700",
  contactado: "bg-blue-100 text-blue-700",
  calificado: "bg-cyan-100 text-cyan-700",
  meeting_programado: "bg-violet-100 text-violet-700",
  meeting_realizado: "bg-purple-100 text-purple-700",
  oferta_reserva: "bg-amber-100 text-amber-700",
  negociacion: "bg-orange-100 text-orange-700",
  cerrado_ganado: "bg-emerald-100 text-emerald-700",
  cerrado_perdido: "bg-red-100 text-red-700",
  dormido: "bg-gray-100 text-gray-600",
};

const intentColors: Record<string, string> = {
  alta: "bg-emerald-500",
  media: "bg-amber-500",
  baja: "bg-red-500",
};

const activityIcons: Record<string, React.ReactNode> = {
  note: <FileText className="h-4 w-4" />,
  call: <PhoneCall className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  status_change: <ArrowRightLeft className="h-4 w-4" />,
  assignment: <UserPlus className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  note: "bg-slate-100 text-slate-600",
  call: "bg-blue-100 text-blue-600",
  whatsapp: "bg-green-100 text-green-600",
  email: "bg-purple-100 text-purple-600",
  meeting: "bg-amber-100 text-amber-600",
  status_change: "bg-cyan-100 text-cyan-600",
  assignment: "bg-pink-100 text-pink-600",
};

function ActivityItem({ activity }: { activity: ActivityData }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", activityColors[activity.type])}>
          {activityIcons[activity.type]}
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{activity.title}</p>
            {activity.userName && (
              <p className="text-sm text-muted-foreground">by {activity.userName}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>
        {activity.description && (
          <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </div>
  );
}

// Sample tasks for the lead
const leadTasks = [
  {
    id: "1",
    title: "Send brochure with payment plan",
    completed: false,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: "high",
  },
  {
    id: "2",
    title: "Schedule 15-min discovery call",
    completed: false,
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    priority: "medium",
  },
  {
    id: "3",
    title: "Initial WhatsApp qualification",
    completed: true,
    dueDate: new Date(Date.now() - 3600000).toISOString(),
    priority: "high",
  },
];

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = leadsData.find((l) => l.id === id);

  if (!lead) {
    notFound();
  }

  const activities = getActivitiesByLeadId(id);
  const stage = PIPELINE_STAGES.find((s) => s.id === lead.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-navy-950 text-white text-xl">
                {getInitials(lead.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-navy-950">{lead.fullName}</h1>
                <Badge variant="outline" className={cn("font-normal", statusColors[lead.status])}>
                  {stage?.label || lead.status}
                </Badge>
                {lead.intent && (
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-2 w-2 rounded-full", intentColors[lead.intent])} />
                    <span className="text-sm text-muted-foreground capitalize">
                      Intent {lead.intent}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {lead.market === "dubai" ? "🇦🇪" : "🇺🇸"} {lead.countryResidence}
                </span>
                <span>•</span>
                <span>Created {formatRelativeTime(lead.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Phone className="mr-2 h-4 w-4" />
          Call
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
        {lead.email && (
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        )}
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Action Alert */}
          {lead.nextAction && (
            <Card className="border-copper-200 bg-copper-50/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-copper-900">Next Action</p>
                    <p className="text-copper-800">{lead.nextAction}</p>
                    {lead.nextActionDate && (
                      <p className="text-sm text-copper-600 mt-1">
                        Due: {formatDate(lead.nextActionDate)}
                      </p>
                    )}
                  </div>
                  <Button size="sm" className="bg-copper-500 hover:bg-copper-600">
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <div className="space-y-0">
                      {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No activities recorded yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Tasks</CardTitle>
                  <Button size="sm" variant="outline">
                    Add Task
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leadTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3",
                          task.completed && "bg-slate-50"
                        )}
                      >
                        <button className="mt-0.5">
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        </div>
                        {!task.completed && task.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interested Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.interestZone ? (
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                            <Building2 className="h-6 w-6 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium">{lead.interestZone}</p>
                            <p className="text-sm text-muted-foreground">{lead.interestType}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Matches
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No specific property interest recorded
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Phone className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Mail className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{lead.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <MapPin className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{lead.countryResidence}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <DollarSign className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">
                    {formatBudgetRange(lead.budgetMin, lead.budgetMax, lead.budgetCurrency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Clock className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timing</p>
                  <p className="font-medium">{lead.timing || "Not specified"} days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Target className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goal</p>
                  <p className="font-medium capitalize">{lead.goal || "Not specified"}</p>
                </div>
              </div>
              {lead.paymentMethod && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <DollarSign className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-medium capitalize">{lead.paymentMethod.replace("_", " ")}</p>
                  </div>
                </div>
              )}
              {lead.intentReasons.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Intent Reasons</p>
                    <div className="flex flex-wrap gap-1">
                      {lead.intentReasons.map((reason) => (
                        <Badge key={reason} variant="secondary" className="text-xs">
                          {reason.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.assignedTo ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-navy-950 text-white">
                        {getInitials(lead.assignedTo.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{lead.assignedTo.fullName}</p>
                      <p className="text-sm text-muted-foreground">Agent</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Reassign
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">Not assigned</p>
                  <Button size="sm">Assign Agent</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Source */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="font-medium capitalize">{lead.channel.replace("_", " ")}</span>
              </div>
              {lead.source && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-medium capitalize">{lead.source.replace("_", " ")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market</span>
                <span className="font-medium uppercase">{lead.market}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Segment</span>
                <span className="font-medium capitalize">{lead.segment.replace(/_/g, " ")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
