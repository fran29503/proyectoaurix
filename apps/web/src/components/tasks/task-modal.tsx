"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "@/lib/queries/audit";
import { Loader2, ClipboardList, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/queries/tasks";
import { useLanguage } from "@/lib/i18n";

interface User {
  id: string;
  full_name: string;
}

interface Lead {
  id: string;
  full_name: string;
}

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultLeadId?: string;
  onSuccess?: () => void;
}

const taskTypeKeys = ["follow_up", "call", "meeting", "email", "document", "other"] as const;
const priorityKeys = ["high", "medium", "low"] as const;
const statusKeys = ["pending", "in_progress", "completed"] as const;

export function TaskModal({ open, onOpenChange, task, defaultLeadId, onSuccess }: TaskModalProps) {
  const { t } = useLanguage();
  const isEditing = !!task;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "follow_up",
    priority: "medium",
    status: "pending",
    due_date: "",
    assigned_to: "",
    lead_id: defaultLeadId || "",
  });

  // Fetch users and leads for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const [usersResult, leadsResult] = await Promise.all([
        supabase.from("users").select("id, full_name").order("full_name"),
        supabase.from("leads").select("id, full_name").order("full_name").limit(100),
      ]);

      if (usersResult.data) setUsers(usersResult.data);
      if (leadsResult.data) setLeads(leadsResult.data);
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        type: task.type,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        assigned_to: task.assigned_to || "",
        lead_id: task.lead_id || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        type: "follow_up",
        priority: "medium",
        status: "pending",
        due_date: "",
        assigned_to: "",
        lead_id: defaultLeadId || "",
      });
    }
  }, [task, open, defaultLeadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const payload = {
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        assigned_to: formData.assigned_to || null,
        lead_id: formData.lead_id || null,
        updated_at: new Date().toISOString(),
        completed_at: formData.status === "completed" ? new Date().toISOString() : null,
      };

      if (isEditing && task) {
        const { error } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", task.id);
        if (error) throw error;

        logAuditAction({
          action: "update",
          resource: "task",
          resourceId: task.id,
          resourceName: payload.title,
          oldValues: { title: task.title, status: task.status, priority: task.priority },
          newValues: payload,
        }).catch(() => {});
      } else {
        // Get tenant_id
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .limit(1)
          .single();

        const { data: newTask, error } = await supabase
          .from("tasks")
          .insert([{ ...payload, tenant_id: tenant?.id }])
          .select("id")
          .single();
        if (error) throw error;

        logAuditAction({
          action: "create",
          resource: "task",
          resourceId: newTask?.id,
          resourceName: payload.title,
          newValues: payload,
        }).catch(() => {});
      }

      toast.success(isEditing ? t.messages.updateSuccess : t.messages.createSuccess);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving task:", err);
      setError(err instanceof Error ? err.message : "Failed to save task");
      toast.error(isEditing ? t.messages.updateError : t.messages.createError);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-white rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-violet-600" />
            {isEditing ? t.tasks.editTask : t.tasks.newTask}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <Label htmlFor="title">{t.form.title} {t.form.required}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.form.type}</Label>
              <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {taskTypeKeys.map((key) => (
                    <SelectItem key={key} value={key}>{t.taskType[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.form.priority}</Label>
              <Select value={formData.priority} onValueChange={(v) => updateField("priority", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {priorityKeys.map((key) => (
                    <SelectItem key={key} value={key}>{t.taskPriority[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.form.status}</Label>
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {statusKeys.map((key) => (
                    <SelectItem key={key} value={key}>{t.taskStatus[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="due_date">{t.form.dueDate}</Label>
              <div className="relative mt-1.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => updateField("due_date", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <Label>{t.form.assignTo}</Label>
            <Select
              value={formData.assigned_to || "__unassigned__"}
              onValueChange={(v) => updateField("assigned_to", v === "__unassigned__" ? "" : v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={t.form.selectAssignee} />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                <SelectItem value="__unassigned__">{t.form.unassigned}</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Related Lead */}
          <div>
            <Label>{t.form.relatedLead}</Label>
            <Select
              value={formData.lead_id || "__no_lead__"}
              onValueChange={(v) => updateField("lead_id", v === "__no_lead__" ? "" : v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={t.form.relatedLead} />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                <SelectItem value="__no_lead__">{t.form.noLead}</SelectItem>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>{lead.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t.form.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.title}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEditing ? (
              t.common.saveChanges
            ) : (
              t.common.create
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
