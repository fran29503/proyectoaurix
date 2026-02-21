"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
  Plus,
  Send,
  RefreshCw,
} from "lucide-react";
import { cn, getInitials, formatRelativeTime, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { getLeadById, type Lead } from "@/lib/queries/leads";
import { getActivitiesByLead, createActivity, type Activity, activityTypeLabels } from "@/lib/queries/activities";
import { getTasksByLead, updateTaskStatus, type Task } from "@/lib/queries/tasks";
import { PIPELINE_STAGES } from "@/types";
import { LeadModal } from "@/components/leads/lead-modal";
import { AssignLeadDialog } from "@/components/leads/assign-lead-dialog";
import { TaskModal } from "@/components/tasks/task-modal";
import { useLanguage } from "@/lib/i18n";

const statusColors: Record<string, string> = {
  nuevo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  contactado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  calificado: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  meeting_programado: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  meeting_realizado: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  oferta_reserva: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  negociacion: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  cerrado_ganado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cerrado_perdido: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  dormido: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
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
  property_view: <Building2 className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  note: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  call: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  whatsapp: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  email: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  meeting: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  status_change: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  assignment: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  property_view: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", activityColors[activity.type] || activityColors.note)}>
          {activityIcons[activity.type] || activityIcons.note}
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{activity.title}</p>
            {activity.user && (
              <p className="text-sm text-muted-foreground">by {activity.user.full_name}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.created_at)}
          </span>
        </div>
        {activity.description && (
          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
        )}
      </div>
    </motion.div>
  );
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const isCompleted = task.status === "completed";
  const isOverdue = !isCompleted && task.due_date && new Date(task.due_date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
        isCompleted && "bg-slate-50",
        isOverdue && "border-red-200 bg-red-50/50"
      )}
    >
      <button onClick={() => onToggle(task)} className="mt-0.5 hover:scale-110 transition-transform">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className={cn("h-5 w-5", isOverdue ? "text-red-400" : "text-muted-foreground")} />
        )}
      </button>
      <div className="flex-1">
        <p className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.due_date && (
          <p className={cn("text-sm", isOverdue && !isCompleted ? "text-red-600" : "text-muted-foreground")}>
            {isOverdue && !isCompleted ? "Overdue: " : "Due: "}{formatDate(task.due_date)}
          </p>
        )}
      </div>
      {!isCompleted && task.priority === "high" && (
        <Badge className={priorityColors.high}>High</Badge>
      )}
    </motion.div>
  );
}

function formatBudgetRange(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return "Not specified";
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
    return price.toLocaleString();
  };
  if (min && max) return `${currency} ${formatPrice(min)} - ${formatPrice(max)}`;
  if (min) return `${currency} ${formatPrice(min)}+`;
  if (max) return `Up to ${currency} ${formatPrice(max)}`;
  return "Not specified";
}

export default function LeadDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // New activity form
  const [newActivityType, setNewActivityType] = useState("note");
  const [newActivityText, setNewActivityText] = useState("");
  const [submittingActivity, setSubmittingActivity] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [leadData, activitiesData, tasksData] = await Promise.all([
        getLeadById(leadId),
        getActivitiesByLead(leadId),
        getTasksByLead(leadId),
      ]);

      if (!leadData) {
        router.push("/dashboard/leads");
        return;
      }

      setLead(leadData);
      setActivities(activitiesData);
      setTasks(tasksData);
    } catch (err) {
      console.error("Error fetching lead data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leadId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const success = await updateTaskStatus(task.id, newStatus, {
      oldStatus: task.status,
      taskName: task.title,
    });
    if (success) {
      fetchData();
    }
  };

  const handleSubmitActivity = async () => {
    if (!newActivityText.trim() || !lead) return;

    setSubmittingActivity(true);
    try {
      await createActivity({
        lead_id: lead.id,
        type: newActivityType,
        title: activityTypeLabels[newActivityType] || "Note",
        description: newActivityText,
      });

      setNewActivityText("");
      fetchData();
    } catch (err) {
      console.error("Error creating activity:", err);
    } finally {
      setSubmittingActivity(false);
    }
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
          <p className="text-slate-500">{t.common.loading}</p>
        </motion.div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-slate-600">{t.leads.noLeads}</p>
        <Link href="/dashboard/leads">
          <Button>{t.common.back}</Button>
        </Link>
      </div>
    );
  }

  const stage = PIPELINE_STAGES.find((s) => s.id === lead.status);
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xl">
                  {getInitials(lead.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{lead.full_name}</h1>
                  <Badge variant="outline" className={cn("font-normal", statusColors[lead.status])}>
                    {t.leadStatus[lead.status as keyof typeof t.leadStatus] || lead.status}
                  </Badge>
                  {lead.intent && (
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-2 w-2 rounded-full", intentColors[lead.intent])} />
                      <span className="text-sm text-muted-foreground capitalize">
                        {t.leads.intent}: {t.intentLevel[lead.intent as keyof typeof t.intentLevel]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {lead.market === "dubai" ? "🇦🇪" : "🇺🇸"} {lead.country_residence || "Unknown"}
                  </span>
                  <span>•</span>
                  <span>Created {formatRelativeTime(lead.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {t.common.refresh}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)} className="rounded-xl">
              <Edit className="mr-2 h-4 w-4" />
              {t.common.edit}
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {lead.phone && (
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <a href={`tel:${lead.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              {t.common.call}
            </a>
          </Button>
        )}
        {lead.phone && (
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        )}
        {lead.email && (
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <a href={`mailto:${lead.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              {t.common.email}
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => {
            setShowTaskModal(true);
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {t.taskType.meeting}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="bg-slate-100 rounded-xl p-1">
              <TabsTrigger value="timeline" className="rounded-lg">{t.dashboard.monthlyTrend}</TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-lg">
                {t.nav.tasks}
                {pendingTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {pendingTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="properties" className="rounded-lg">{t.nav.properties}</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Activity Form */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="flex gap-3 mb-3">
                      <Select value={newActivityType} onValueChange={setNewActivityType}>
                        <SelectTrigger className="w-[140px] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="note">{t.activityTypes.note}</SelectItem>
                          <SelectItem value="call">{t.activityTypes.call}</SelectItem>
                          <SelectItem value="whatsapp">{t.activityTypes.whatsapp}</SelectItem>
                          <SelectItem value="email">{t.activityTypes.email}</SelectItem>
                          <SelectItem value="meeting">{t.activityTypes.meeting}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Add a note or log an activity..."
                      value={newActivityText}
                      onChange={(e) => setNewActivityText(e.target.value)}
                      className="min-h-[80px] bg-white"
                    />
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        onClick={handleSubmitActivity}
                        disabled={!newActivityText.trim() || submittingActivity}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
                      >
                        {submittingActivity ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t.common.add}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Activities List */}
                  {activities.length > 0 ? (
                    <div className="space-y-0">
                      {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No activities recorded yet. Add one above!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{t.nav.tasks}</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowTaskModal(true)} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.tasks.newTask}
                  </Button>
                </CardHeader>
                <CardContent>
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {pendingTasks.map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                      ))}
                      {completedTasks.length > 0 && pendingTasks.length > 0 && (
                        <Separator className="my-4" />
                      )}
                      {completedTasks.map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">{t.tasks.noTasks}</p>
                      <Button size="sm" onClick={() => setShowTaskModal(true)} className="rounded-xl">
                        <Plus className="h-4 w-4 mr-2" />
                        {t.tasks.newTask}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="mt-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Interested Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.interest_zone ? (
                    <div className="rounded-xl border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                            <Building2 className="h-6 w-6 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium">{lead.interest_zone}</p>
                            <p className="text-sm text-muted-foreground">{lead.interest_type}</p>
                          </div>
                        </div>
                        <Link href="/dashboard/properties">
                          <Button size="sm" variant="outline" className="rounded-xl">
                            View Matches
                          </Button>
                        </Link>
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
          <HoverLift>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">{t.form.phone} & {t.form.email}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    <Phone className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.form.phone}</p>
                    <p className="font-medium">{lead.phone || t.form.notSpecified}</p>
                  </div>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                      <Mail className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.form.email}</p>
                      <p className="font-medium">{lead.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    <MapPin className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{lead.country_residence || "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>

          {/* Qualification */}
          <HoverLift>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Qualification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    <DollarSign className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">
                      {formatBudgetRange(lead.budget_min, lead.budget_max, lead.budget_currency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    <Clock className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">{lead.timing || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    <Target className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Intent Level</p>
                    <p className="font-medium capitalize">{lead.intent || "Not assessed"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>

          {/* Assignment */}
          <HoverLift>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.assigned_user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white">
                          {getInitials(lead.assigned_user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lead.assigned_user.full_name}</p>
                        <p className="text-sm text-muted-foreground">Agent</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowAssignDialog(true)} className="rounded-xl">
                      Reassign
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">Not assigned</p>
                    <Button size="sm" onClick={() => setShowAssignDialog(true)} className="rounded-xl">
                      Assign Agent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </HoverLift>

          {/* Source */}
          <HoverLift>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="font-medium capitalize">{lead.channel?.replace("_", " ") || "Direct"}</span>
                </div>
                {lead.campaign && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign</span>
                    <span className="font-medium capitalize">{lead.campaign.replace("_", " ")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market</span>
                  <span className="font-medium uppercase">{lead.market || "Dubai"}</span>
                </div>
              </CardContent>
            </Card>
          </HoverLift>
        </div>
      </div>

      {/* Modals */}
      <LeadModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        lead={lead}
        onSuccess={fetchData}
      />

      <AssignLeadDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        lead={lead ? { id: lead.id, full_name: lead.full_name, assigned_to: lead.assigned_to } : null}
        onSuccess={fetchData}
      />

      <TaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        defaultLeadId={lead?.id}
        onSuccess={fetchData}
      />
    </div>
  );
}
