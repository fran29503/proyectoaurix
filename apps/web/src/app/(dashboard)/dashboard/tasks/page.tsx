"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Filter,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn, getInitials, formatDate, formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import {
  getTasks,
  updateTaskStatus,
  type Task,
  taskPriorityLabels,
} from "@/lib/queries/tasks";
import { TaskModal } from "@/components/tasks/task-modal";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { useLanguage } from "@/lib/i18n";
import { Can, useCurrentUser } from "@/lib/rbac";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

interface TaskItemProps {
  task: Task;
  showCompleted?: boolean;
  onToggleStatus: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

function TaskItem({ task, showCompleted = false, onToggleStatus, onEdit, onDelete }: TaskItemProps) {
  const { t } = useLanguage();
  const isOverdue = task.status !== "completed" && task.due_date && new Date(task.due_date) < new Date();
  const isCompleted = task.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 transition-colors hover:shadow-sm",
        isCompleted && "bg-slate-50",
        isOverdue && !isCompleted && "border-red-200 bg-red-50/50"
      )}
    >
      <button
        onClick={() => onToggleStatus(task)}
        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className={cn("h-5 w-5", isOverdue ? "text-red-400" : "text-muted-foreground")} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className={cn(
                "font-medium",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <Badge variant="outline" className={cn("flex-shrink-0", priorityColors[task.priority])}>
                {t.taskPriority[task.priority as keyof typeof t.taskPriority]}
              </Badge>
            )}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white rounded-xl">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)} className="rounded-lg cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      {t.common.edit}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(task)}
                      className="rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t.common.delete}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          {/* Lead */}
          {task.lead && (
            <Link
              href={`/dashboard/leads/${task.lead_id}`}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-violet-600"
            >
              <User className="h-3.5 w-3.5" />
              {task.lead.full_name}
            </Link>
          )}

          {/* Due date */}
          {task.due_date && (
            <div
              className={cn(
                "flex items-center gap-1.5",
                isOverdue && !isCompleted ? "text-red-600" : "text-muted-foreground"
              )}
            >
              {isOverdue && !isCompleted ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <Calendar className="h-3.5 w-3.5" />
              )}
              {isCompleted && task.completed_at
                ? `${t.tasks.completedLabel} ${formatRelativeTime(task.completed_at)}`
                : isOverdue
                  ? `${t.tasks.overdueLabel} ${formatDate(task.due_date)}`
                  : `${t.tasks.dueLabel} ${formatDate(task.due_date)}`}
            </div>
          )}

          {/* Assignee */}
          {task.assigned_user && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px]">
                  {getInitials(task.assigned_user.full_name)}
                </AvatarFallback>
              </Avatar>
              {task.assigned_user.full_name.split(" ")[0]}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function TasksPage() {
  const { t } = useLanguage();
  const { can } = useCurrentUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<{ id: string; title: string } | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask({ id: task.id, title: task.title });
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const success = await updateTaskStatus(task.id, newStatus, {
      oldStatus: task.status,
      taskName: task.title,
    });
    if (success) {
      fetchTasks();
    }
  };

  // Get unique assignees
  const assignees = Array.from(
    new Map(
      tasks
        .filter((t) => t.assigned_user)
        .map((t) => [t.assigned_user!.id, t.assigned_user!])
    ).values()
  );

  // Filter and categorize tasks
  const filterTasks = (taskList: Task[]) => {
    return taskList.filter((task) => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== "all" && task.assigned_to !== assigneeFilter) return false;
      return true;
    });
  };

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()
  );
  const highPriorityPending = pendingTasks.filter((t) => t.priority === "high");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.tasks.title}</h1>
            <p className="text-slate-500 mt-1">{t.tasks.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {t.common.refresh}
              </Button>
            </motion.div>
            <Can resource="tasks" action="create">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  onClick={handleAddTask}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t.tasks.newTask}
                </Button>
              </motion.div>
            </Can>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t.taskStatus.pending, value: pendingTasks.length, icon: Clock, color: "slate" },
          { label: t.tasks.overdue, value: overdueTasks.length, icon: AlertTriangle, color: overdueTasks.length > 0 ? "red" : "slate", alert: overdueTasks.length > 0 },
          { label: t.taskPriority.high, value: highPriorityPending.length, icon: Calendar, color: "amber" },
          { label: t.tasks.completed, value: completedTasks.length, icon: CheckCircle2, color: "emerald" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <HoverLift>
              <Card className={stat.alert ? "border-red-200 bg-red-50/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        `bg-${stat.color}-100`
                      )}
                    >
                      <stat.icon className={cn("h-5 w-5", `text-${stat.color}-600`)} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HoverLift>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.tasks.filters}</span>
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t.tasks.priority} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t.tasks.allPriorities}</SelectItem>
            <SelectItem value="high">{t.taskPriority.high}</SelectItem>
            <SelectItem value="medium">{t.taskPriority.medium}</SelectItem>
            <SelectItem value="low">{t.taskPriority.low}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t.tasks.assignee} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t.tasks.allAssignees}</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee.id} value={assignee.id}>
                {assignee.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="pending" className="gap-2 rounded-lg">
            {t.tasks.pending}
            <Badge variant="secondary" className="h-5 px-1.5">
              {filterTasks(pendingTasks).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2 rounded-lg">
            {t.tasks.overdue}
            {overdueTasks.length > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5">
                {filterTasks(overdueTasks).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 rounded-lg">
            {t.tasks.completed}
            <Badge variant="secondary" className="h-5 px-1.5">
              {filterTasks(completedTasks).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                {filterTasks(pendingTasks).length > 0 ? (
                  filterTasks(pendingTasks).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={can("tasks", "edit") ? handleEditTask : undefined}
                      onDelete={can("tasks", "delete") ? handleDeleteTask : undefined}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                    <h3 className="font-medium">{t.tasks.allCaughtUp}</h3>
                    <p className="text-sm text-muted-foreground">{t.tasks.noPendingTasks}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                {filterTasks(overdueTasks).length > 0 ? (
                  filterTasks(overdueTasks).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={can("tasks", "edit") ? handleEditTask : undefined}
                      onDelete={can("tasks", "delete") ? handleDeleteTask : undefined}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                    <h3 className="font-medium">{t.tasks.noOverdueTasks}</h3>
                    <p className="text-sm text-muted-foreground">{t.tasks.greatJobOnTrack}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                {filterTasks(completedTasks).length > 0 ? (
                  filterTasks(completedTasks).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      showCompleted
                      onToggleStatus={handleToggleStatus}
                      onEdit={can("tasks", "edit") ? handleEditTask : undefined}
                      onDelete={can("tasks", "delete") ? handleDeleteTask : undefined}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium">{t.tasks.noCompletedTasks}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.tasks.completedTasksWillAppear}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        task={editingTask}
        onSuccess={fetchTasks}
      />

      <DeleteTaskDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        task={deletingTask}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
