"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  UserX,
  UserCheck,
  Mail,
  RefreshCw,
  Loader2,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";
import {
  useCurrentUser,
  Can,
  getCreatableRoles,
  getManagementScope,
  canManageRole,
  type Role,
} from "@/lib/rbac";
import {
  getUsers,
  getUserStats,
  deactivateUser,
  reactivateUser,
  resendInvitation,
  type User,
  type UserFilters,
} from "@/lib/queries/user-management";
import { UserModal } from "@/components/settings/user-modal";
import Link from "next/link";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  manager: "bg-blue-100 text-blue-700 border-blue-200",
  team_lead: "bg-cyan-100 text-cyan-700 border-cyan-200",
  agent: "bg-slate-100 text-slate-700 border-slate-200",
  backoffice: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

export default function UserManagementPage() {
  const { t } = useLanguage();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    pending: number;
    byRole: Record<string, number>;
    byMarket: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Get management scope based on current user's role
  const managementScope = currentUser
    ? {
        scope: getManagementScope(currentUser.role as Role),
        market: currentUser.market,
        team: currentUser.team,
      }
    : undefined;

  // Get roles that current user can create
  const creatableRoles = currentUser
    ? getCreatableRoles(currentUser.role as Role)
    : [];

  const fetchData = useCallback(async () => {
    if (!managementScope) return;

    try {
      const filters: UserFilters = {
        role: roleFilter as Role | "all",
        market: marketFilter as "dubai" | "usa" | "all",
        isActive: statusFilter === "all" ? "all" : statusFilter === "active",
        search: search || undefined,
      };

      const [usersData, statsData] = await Promise.all([
        getUsers(filters, managementScope),
        getUserStats(managementScope),
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [managementScope, roleFilter, marketFilter, statusFilter, search]);

  useEffect(() => {
    if (!userLoading && currentUser) {
      fetchData();
    }
  }, [fetchData, userLoading, currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeactivateUser = async (user: User) => {
    const result = await deactivateUser(user.id, user.full_name);
    if (result.success) {
      toast.success(t.messages.updateSuccess);
      fetchData();
    } else {
      console.error("Failed to deactivate user:", result.error);
      toast.error(result.error || t.messages.updateError);
    }
  };

  const handleReactivateUser = async (user: User) => {
    const result = await reactivateUser(user.id, user.full_name);
    if (result.success) {
      toast.success(t.messages.updateSuccess);
      fetchData();
    } else {
      console.error("Failed to reactivate user:", result.error);
      toast.error(result.error || t.messages.updateError);
    }
  };

  const handleResendInvitation = async (user: User) => {
    const result = await resendInvitation(user.id);
    if (result.success) {
      toast.success(t.settings.invitationSent);
      fetchData();
    } else {
      console.error("Failed to resend invitation:", result.error);
      toast.error(result.error || t.messages.updateError);
    }
  };

  const canManageUser = (targetUser: User): boolean => {
    if (!currentUser) return false;
    return canManageRole(currentUser.role as Role, targetUser.role as Role);
  };

  const getUserStatus = (user: User): string => {
    if (!user.is_active) return "inactive";
    if (!user.auth_id) return "pending";
    return "active";
  };

  if (userLoading || loading) {
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

  // Check if user has permission to view this page
  if (managementScope?.scope === "none") {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Shield className="h-16 w-16 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-900">
          {t.common.accessDenied || "Access Denied"}
        </h2>
        <p className="text-slate-500 text-center max-w-md">
          {t.common.noPermission || "You don't have permission to manage users."}
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.common.backToDashboard || "Back to Dashboard"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {t.settings?.userManagement || "User Management"}
              </h1>
            </div>
            <p className="text-slate-500 ml-8 text-sm md:text-base hidden sm:block">
              {t.settings?.userManagementDesc || "Manage team members and their permissions"}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{t.common.refresh}</span>
              </Button>
            </motion.div>
            {creatableRoles.length > 0 && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  onClick={handleAddUser}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 rounded-xl"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t.settings?.addUser || "Add User"}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
          {[
            {
              label: t.settings?.totalUsers || "Total Users",
              value: stats.total,
              icon: Users,
              color: "slate",
            },
            {
              label: t.settings?.activeUsers || "Active",
              value: stats.active,
              icon: UserCheck,
              color: "emerald",
            },
            {
              label: t.settings?.pendingInvitations || "Pending",
              value: stats.pending,
              icon: Mail,
              color: "amber",
            },
            {
              label: t.settings?.inactiveUsers || "Inactive",
              value: stats.total - stats.active,
              icon: UserX,
              color: "red",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <HoverLift>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
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
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.settings?.searchUsers || "Search users..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
            <SelectValue placeholder={t.team?.role || "Role"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t.roles?.all || "All Roles"}</SelectItem>
            <SelectItem value="admin">{t.roles?.admin || "Admin"}</SelectItem>
            <SelectItem value="manager">{t.roles?.manager || "Manager"}</SelectItem>
            <SelectItem value="team_lead">{t.roles?.team_lead || "Team Lead"}</SelectItem>
            <SelectItem value="agent">{t.roles?.agent || "Agent"}</SelectItem>
            <SelectItem value="backoffice">{t.roles?.backoffice || "Backoffice"}</SelectItem>
          </SelectContent>
        </Select>
        {managementScope?.scope === "all" && (
          <Select value={marketFilter} onValueChange={setMarketFilter}>
            <SelectTrigger className="w-[130px] rounded-xl">
              <SelectValue placeholder={t.market?.all || "Market"} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">{t.market?.all || "All Markets"}</SelectItem>
              <SelectItem value="dubai">{t.market?.dubai || "Dubai"}</SelectItem>
              <SelectItem value="usa">{t.market?.usa || "USA"}</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] rounded-xl">
            <SelectValue placeholder={t.common?.status || "Status"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t.settings?.allStatus || "All Status"}</SelectItem>
            <SelectItem value="active">{t.team?.active || "Active"}</SelectItem>
            <SelectItem value="inactive">{t.team?.inactive || "Inactive"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <HorizontalScroll arrowSize="sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">{t.table?.member || "User"}</TableHead>
                <TableHead className="font-semibold">{t.table?.role || "Role"}</TableHead>
                <TableHead className="font-semibold">{t.table?.market || "Market"}</TableHead>
                <TableHead className="font-semibold">{t.table?.team || "Team"}</TableHead>
                <TableHead className="font-semibold">{t.table?.status || "Status"}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user, index) => {
                  const status = getUserStatus(user);
                  const canManage = canManageUser(user);
                  const roleKey = user.role as keyof typeof t.roles;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-semibold">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("font-normal", roleColors[user.role])}
                        >
                          {t.roles?.[roleKey] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.market ? (
                          <span className="text-lg">
                            {user.market === "dubai" ? "🇦🇪" : "🇺🇸"}{" "}
                            <span className="text-sm text-slate-600">
                              {user.market === "dubai" ? t.market?.dubai : t.market?.usa}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.team ? (
                          <span className="text-sm text-slate-600">{user.team}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-normal", statusColors[status])}>
                          {status === "active" && (t.team?.active || "Active")}
                          {status === "inactive" && (t.team?.inactive || "Inactive")}
                          {status === "pending" && (t.settings?.pending || "Pending")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white rounded-xl">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                                className="rounded-lg cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t.common?.edit || "Edit"}
                              </DropdownMenuItem>
                              {status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() => handleResendInvitation(user)}
                                  className="rounded-lg cursor-pointer"
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  {t.settings?.resendInvitation || "Resend Invitation"}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {user.is_active ? (
                                <DropdownMenuItem
                                  onClick={() => handleDeactivateUser(user)}
                                  className="rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  {t.settings?.deactivate || "Deactivate"}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleReactivateUser(user)}
                                  className="rounded-lg cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  {t.settings?.reactivate || "Reactivate"}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="h-12 w-12 text-slate-300" />
                      <p className="text-slate-500">
                        {t.settings?.noUsersFound || "No users found"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </HorizontalScroll>
        </CardContent>
      </Card>

      {/* User Modal */}
      <UserModal
        open={showUserModal}
        onOpenChange={setShowUserModal}
        user={editingUser}
        creatableRoles={creatableRoles}
        currentUserMarket={currentUser?.market || null}
        managementScope={managementScope?.scope || "none"}
        onSuccess={fetchData}
      />
    </div>
  );
}
