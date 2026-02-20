"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "@/lib/queries/audit";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";

interface DeleteLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    full_name: string;
  } | null;
  onSuccess?: () => void;
}

export function DeleteLeadDialog({ open, onOpenChange, lead, onSuccess }: DeleteLeadDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!lead) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("leads").delete().eq("id", lead.id);

      if (error) throw error;

      logAuditAction({
        action: "delete",
        resource: "lead",
        resourceId: lead.id,
        resourceName: lead.full_name,
      }).catch(() => {});

      toast.success(t.messages.deleteSuccess);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error(t.messages.deleteError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.leads.deleteLead}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-600">
            {t.leads.deleteConfirm.replace("this lead", "")} <span className="font-medium text-slate-900">{lead?.full_name}</span>?
            {" "}{t.leads.deleteConfirmDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="rounded-xl">{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl min-w-[100px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
