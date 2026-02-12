"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Clock,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { useLanguage } from "@/lib/i18n";
import { useCurrentUser, AdminOnly } from "@/lib/rbac";
import {
  getAuditLogs,
  getAuditStats,
  actionLabels,
  resourceLabels,
  actionColors,
  type AuditLog,
  type AuditFilters,
} from "@/lib/queries/audit";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export default function AuditLogPage() {
  const { t } = useLanguage();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByResource: Record<string, number>;
    mostActiveUsers: Array<{ user_name: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const pageSize = 25;

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const filters: AuditFilters = {
        action: actionFilter !== "all" ? actionFilter : undefined,
        resource: resourceFilter !== "all" ? resourceFilter : undefined,
        search: search || undefined,
      };

      const [logsData, statsData] = await Promise.all([
        getAuditLogs(filters, page, pageSize),
        page === 1 ? getAuditStats() : Promise.resolve(null),
      ]);

      setLogs(logsData.logs);
      setTotal(logsData.total);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error("Error fetching audit data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, actionFilter, resourceFilter]);

  useEffect(() => {
    if (!userLoading) {
      fetchData();
    }
  }, [fetchData, userLoading]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const totalPages = Math.ceil(total / pageSize);

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-slate-500">{t.common?.loading}</p>
        </motion.div>
      </div>
    );
  }

  // Only admins can view audit logs
  if (currentUser?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Shield className="h-16 w-16 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-900">
          {t.common?.accessDenied}
        </h2>
        <p className="text-slate-500 text-center max-w-md">
          Only administrators can view audit logs.
        </p>
        <Link href="/dashboard/settings">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.common?.back}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">
                {t.audit?.title || "Audit Log"}
              </h1>
            </div>
            <p className="text-slate-500 ml-8">
              {t.audit?.subtitle || "Track all user actions and system changes"}
            </p>
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
                {t.common?.refresh}
              </Button>
            </motion.div>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <HoverLift>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                    <Activity className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalActions}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.audit?.totalActions || "Total Actions"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>

          <HoverLift>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.actionsByType.create || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.audit?.created || "Created"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>

          <HoverLift>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.actionsByType.update || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.audit?.updated || "Updated"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>

          <HoverLift>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.actionsByType.delete || 0}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.audit?.deleted || "Deleted"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverLift>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.audit?.searchPlaceholder || "Search logs..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        <Select
          value={actionFilter}
          onValueChange={(v) => {
            setActionFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder={t.audit?.action || "Action"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t.audit?.allActions || "All Actions"}</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="assign">Assign</SelectItem>
            <SelectItem value="invite">Invite</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={resourceFilter}
          onValueChange={(v) => {
            setResourceFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder={t.audit?.resource || "Resource"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t.audit?.allResources || "All Resources"}</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">{t.audit?.timestamp || "Time"}</TableHead>
                <TableHead className="font-semibold">{t.audit?.user || "User"}</TableHead>
                <TableHead className="font-semibold">{t.audit?.action || "Action"}</TableHead>
                <TableHead className="font-semibold">{t.audit?.resource || "Resource"}</TableHead>
                <TableHead className="font-semibold">{t.audit?.details || "Details"}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600" title={formatDate(log.created_at)}>
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {log.user_name || "System"}
                          </p>
                          <p className="text-xs text-slate-500">{log.user_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("font-normal", actionColors[log.action] || "bg-slate-100")}>
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {resourceLabels[log.resource] || log.resource}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 truncate max-w-[200px] block">
                        {log.resource_name || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="h-12 w-12 text-slate-300" />
                      <p className="text-slate-500">
                        {t.audit?.noLogs || "No audit logs found"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-slate-500">
                {t.common?.showing} {(page - 1) * pageSize + 1} {t.common?.to}{" "}
                {Math.min(page * pageSize, total)} {t.common?.of} {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600">
                  {t.common?.page} {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-600" />
              {t.audit?.logDetails || "Log Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">{t.audit?.timestamp}</p>
                  <p className="font-medium">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.audit?.user}</p>
                  <p className="font-medium">{selectedLog.user_name || "System"}</p>
                  <p className="text-sm text-slate-500">{selectedLog.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.audit?.action}</p>
                  <Badge className={cn("font-normal", actionColors[selectedLog.action])}>
                    {actionLabels[selectedLog.action] || selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.audit?.resource}</p>
                  <p className="font-medium">
                    {resourceLabels[selectedLog.resource]} - {selectedLog.resource_name || "-"}
                  </p>
                </div>
              </div>

              {(selectedLog.old_values || selectedLog.new_values) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">{t.audit?.changes || "Changes"}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.old_values && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                        <p className="text-xs font-medium text-red-700 mb-2">{t.audit?.before || "Before"}</p>
                        <pre className="text-xs text-red-800 overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.new_values && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                        <p className="text-xs font-medium text-emerald-700 mb-2">{t.audit?.after || "After"}</p>
                        <pre className="text-xs text-emerald-800 overflow-auto max-h-40">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
