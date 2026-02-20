"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "@/lib/queries/audit";
import { Loader2, UserPlus, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  market: string | null;
}

interface AssignLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    full_name: string;
    assigned_to: string | null;
  } | null;
  onSuccess?: () => void;
}

export function AssignLeadDialog({ open, onOpenChange, lead, onSuccess }: AssignLeadDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      setLoading(true);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, market")
        .in("role", ["agent", "manager", "admin"])
        .order("full_name");

      if (!error && data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [open]);

  const handleAssign = async (userId: string | null) => {
    if (!lead) return;
    setAssigning(userId);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("leads")
        .update({
          assigned_to: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (error) throw error;

      const assignedUser = users.find((u) => u.id === userId);
      logAuditAction({
        action: "assign",
        resource: "lead",
        resourceId: lead.id,
        resourceName: lead.full_name,
        oldValues: { assigned_to: lead.assigned_to },
        newValues: { assigned_to: userId, assigned_user_name: assignedUser?.full_name || null },
      }).catch(() => {});

      toast.success(t.messages.assignSuccess);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error assigning lead:", err);
      toast.error(t.messages.assignError);
    } finally {
      setAssigning(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    admin: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    agent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-white rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-violet-600" />
            {t.leads.assignLead}
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-1">
            {t.leads.assignTo}: <span className="font-medium text-slate-900">{lead?.full_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t.common.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Unassign option */}
              {lead?.assigned_to && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleAssign(null)}
                  disabled={assigning !== null}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-600">{t.leads.unassigned}</p>
                    <p className="text-sm text-slate-400">{t.form.unassigned}</p>
                  </div>
                  {assigning === null && lead?.assigned_to && (
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                  )}
                </motion.button>
              )}

              {/* Team members */}
              {filteredUsers.map((user, index) => {
                const isCurrentAssignee = lead?.assigned_to === user.id;
                const isAssigning = assigning === user.id;

                return (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleAssign(user.id)}
                    disabled={assigning !== null || isCurrentAssignee}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isCurrentAssignee
                        ? "border-violet-200 bg-violet-50"
                        : "border-slate-100 hover:border-violet-200 hover:bg-violet-50/50"
                    }`}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white text-sm font-semibold">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate">{user.full_name}</p>
                        <Badge className={`${roleColors[user.role]} text-xs`}>
                          {t.roles[user.role as keyof typeof t.roles] || user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{user.email}</p>
                    </div>
                    {isCurrentAssignee ? (
                      <div className="flex items-center gap-1 text-violet-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">{t.leads.assignedTo}</span>
                      </div>
                    ) : isAssigning ? (
                      <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                    ) : null}
                  </motion.button>
                );
              })}

              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-500">
                  <p>{t.form.noTeamMembers}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl"
          >
            {t.common.cancel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
