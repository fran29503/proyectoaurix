"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Filter,
} from "lucide-react";
import { cn, getInitials, formatDate, formatRelativeTime } from "@/lib/utils";
import {
  tasksData,
  getPendingTasks,
  getCompletedTasks,
  getOverdueTasks,
  type TaskData,
} from "@/lib/data/tasks";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

interface TaskItemProps {
  task: TaskData;
  showCompleted?: boolean;
}

function TaskItem({ task, showCompleted = false }: TaskItemProps) {
  const isOverdue = !task.completedAt && new Date(task.dueDate) < new Date();
  const isCompleted = !!task.completedAt;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border p-4 transition-colors",
        isCompleted && "bg-slate-50",
        isOverdue && !isCompleted && "border-red-200 bg-red-50/50"
      )}
    >
      <button className="mt-0.5 flex-shrink-0">
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
          {!isCompleted && (
            <Badge variant="outline" className={cn("flex-shrink-0", priorityColors[task.priority])}>
              {priorityLabels[task.priority]}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          {/* Lead */}
          {task.leadName && (
            <Link
              href={`/dashboard/leads/${task.leadId}`}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-copper-600"
            >
              <User className="h-3.5 w-3.5" />
              {task.leadName}
            </Link>
          )}

          {/* Due date */}
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
            {isCompleted
              ? `Completed ${formatRelativeTime(task.completedAt!)}`
              : isOverdue
                ? `Overdue: ${formatDate(task.dueDate)}`
                : `Due: ${formatDate(task.dueDate)}`}
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px]">
                {getInitials(task.assignedTo.fullName)}
              </AvatarFallback>
            </Avatar>
            {task.assignedTo.fullName.split(" ")[0]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const pendingTasks = getPendingTasks();
  const completedTasks = getCompletedTasks();
  const overdueTasks = getOverdueTasks();

  // Get unique assignees
  const assignees = Array.from(
    new Map(tasksData.map((t) => [t.assignedTo.id, t.assignedTo])).values()
  );

  // Filter tasks
  const filterTasks = (tasks: TaskData[]) => {
    return tasks.filter((task) => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== "all" && task.assignedTo.id !== assigneeFilter) return false;
      return true;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Tasks</h1>
          <p className="text-muted-foreground">Manage follow-ups and action items</p>
        </div>
        <Button size="sm" className="bg-copper-500 hover:bg-copper-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Clock className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={overdueTasks.length > 0 ? "border-red-200 bg-red-50/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  overdueTasks.length > 0 ? "bg-red-100" : "bg-slate-100"
                )}
              >
                <AlertTriangle
                  className={cn("h-5 w-5", overdueTasks.length > 0 ? "text-red-600" : "text-slate-600")}
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {pendingTasks.filter((t) => t.priority === "high").length}
                </p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assignees.map((assignee) => (
              <SelectItem key={assignee.id} value={assignee.id}>
                {assignee.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            <Badge variant="secondary" className="h-5 px-1.5">
              {filterTasks(pendingTasks).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            Overdue
            {overdueTasks.length > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5">
                {filterTasks(overdueTasks).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            <Badge variant="secondary" className="h-5 px-1.5">
              {filterTasks(completedTasks).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {filterTasks(pendingTasks).length > 0 ? (
                  filterTasks(pendingTasks).map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                    <h3 className="font-medium">All caught up!</h3>
                    <p className="text-sm text-muted-foreground">No pending tasks</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {filterTasks(overdueTasks).length > 0 ? (
                  filterTasks(overdueTasks).map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
                    <h3 className="font-medium">No overdue tasks</h3>
                    <p className="text-sm text-muted-foreground">Great job staying on track!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {filterTasks(completedTasks).length > 0 ? (
                  filterTasks(completedTasks).map((task) => (
                    <TaskItem key={task.id} task={task} showCompleted />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium">No completed tasks</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed tasks will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
