"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  UserPlus,
  Mail,
  AlertCircle,
  LayoutDashboard,
  Users as UsersIcon,
  Building2,
  KanbanSquare,
  ClipboardList,
  UsersRound,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";
import {
  useCurrentUser,
  type Role,
  type Resource,
  roleDisplayNames,
  getDefaultModules,
} from "@/lib/rbac";
import {
  createUser,
  updateUser,
  sendInvitation,
  teamOptions,
  marketOptions,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/queries/user-management";

// Modules available for toggle (settings is always determined by role, not toggleable)
const TOGGLEABLE_MODULES: { key: Resource; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "leads", icon: UsersIcon },
  { key: "pipeline", icon: KanbanSquare },
  { key: "properties", icon: Building2 },
  { key: "tasks", icon: ClipboardList },
  { key: "team", icon: UsersRound },
  { key: "reports", icon: BarChart3 },
];

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  creatableRoles: Role[];
  currentUserMarket: string | null;
  managementScope: "all" | "market" | "team" | "none";
  onSuccess: () => void;
}

export function UserModal({
  open,
  onOpenChange,
  user,
  creatableRoles,
  currentUserMarket,
  managementScope,
  onSuccess,
}: UserModalProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useCurrentUser();
  const isEditing = !!user;

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [market, setMarket] = useState<"dubai" | "usa" | "">("");
  const [team, setTeam] = useState("");
  const [sendInvite, setSendInvite] = useState(true);
  const [enabledModules, setEnabledModules] = useState<Set<Resource>>(new Set());
  const [hasCustomModules, setHasCustomModules] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default modules for the currently selected role
  const defaultModules = useMemo(() => {
    if (!role) return new Set<Resource>();
    return new Set(getDefaultModules(role as Role));
  }, [role]);

  // Check if current modules differ from role defaults
  const isCustomized = useMemo(() => {
    if (!role) return false;
    const defaults = getDefaultModules(role as Role);
    if (enabledModules.size !== defaults.length) return true;
    return defaults.some((m) => !enabledModules.has(m)) ||
           Array.from(enabledModules).some((m) => !defaults.includes(m));
  }, [role, enabledModules]);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        // Editing existing user
        setFullName(user.full_name);
        setEmail(user.email);
        setPhone(user.phone || "");
        setRole(user.role);
        setMarket(user.market || "");
        setTeam(user.team || "");
        setSendInvite(false);
        // Load custom modules or defaults
        if (user.enabled_modules) {
          setEnabledModules(new Set(user.enabled_modules as Resource[]));
          setHasCustomModules(true);
        } else {
          setEnabledModules(new Set(getDefaultModules(user.role)));
          setHasCustomModules(false);
        }
      } else {
        // Creating new user
        setFullName("");
        setEmail("");
        setPhone("");
        const defaultRole = creatableRoles[0] || "";
        setRole(defaultRole);
        setMarket(
          managementScope === "market" && currentUserMarket
            ? (currentUserMarket as "dubai" | "usa")
            : ""
        );
        setTeam("");
        setSendInvite(true);
        setEnabledModules(
          defaultRole ? new Set(getDefaultModules(defaultRole)) : new Set()
        );
        setHasCustomModules(false);
      }
      setError(null);
    }
  }, [open, user, creatableRoles, managementScope, currentUserMarket]);

  // When role changes, reset modules to that role's defaults (unless user had custom)
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (!hasCustomModules) {
      setEnabledModules(new Set(getDefaultModules(newRole)));
    }
  };

  const toggleModule = (module: Resource) => {
    setHasCustomModules(true);
    setEnabledModules((prev) => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  const resetToDefaults = () => {
    if (role) {
      setEnabledModules(new Set(getDefaultModules(role as Role)));
      setHasCustomModules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError(t.settings?.nameRequired || "Name is required");
      return;
    }

    if (!isEditing && !email.trim()) {
      setError(t.settings?.emailRequired || "Email is required");
      return;
    }

    if (!role) {
      setError(t.settings?.roleRequired || "Role is required");
      return;
    }

    setLoading(true);

    // Determine if we need to store custom modules
    // If modules match role defaults exactly, store null
    const modulesToSave = isCustomized ? Array.from(enabledModules) : null;

    try {
      if (isEditing) {
        // Update existing user
        const input: UpdateUserInput = {
          full_name: fullName.trim(),
          role: role as Role,
          market: market || null,
          team: team || null,
          phone: phone.trim() || null,
          enabled_modules: modulesToSave,
        };

        const { error: updateError } = await updateUser(user.id, input);

        if (updateError) {
          setError(updateError);
          return;
        }
      } else {
        // Create new user
        if (!currentUser) {
          setError("Not authenticated");
          return;
        }

        const input: CreateUserInput = {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role: role as Role,
          market: market || null,
          team: team || null,
          phone: phone.trim() || null,
          enabled_modules: modulesToSave,
        };

        const { user: newUser, error: createError } = await createUser(
          input,
          currentUser.id
        );

        if (createError || !newUser) {
          setError(createError || "Failed to create user");
          return;
        }

        // Send invitation if requested
        if (sendInvite) {
          await sendInvitation(newUser.id);
        }
      }

      toast.success(isEditing ? t.settings.userUpdated : t.settings.userCreated);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving user:", err);
      setError(t.common?.error || "An error occurred");
      toast.error(isEditing ? t.messages.updateError : t.messages.createError);
    } finally {
      setLoading(false);
    }
  };

  // Filter team options based on market
  const filteredTeamOptions = teamOptions.filter((option) => {
    if (!market) return true;
    if (market === "usa") return option.value === "usa_desk";
    return option.value !== "usa_desk";
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-5 w-5 text-violet-600" />
              {isEditing
                ? t.settings?.editUser || "Edit User"
                : t.settings?.addUser || "Add User"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t.settings?.editUserDesc || "Update user information and role"
                : t.settings?.addUserDesc ||
                  "Add a new team member to your organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {t.form?.fullName || "Full Name"} *
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="rounded-xl"
                disabled={loading}
              />
            </div>

            {/* Email (only for new users) */}
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="email">{t.form?.email || "Email"} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="rounded-xl"
                  disabled={loading}
                />
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t.form?.phone || "Phone"}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                className="rounded-xl"
                disabled={loading}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>{t.team?.role || "Role"} *</Label>
              <Select
                value={role}
                onValueChange={(value) => handleRoleChange(value as Role)}
                disabled={
                  loading ||
                  (isEditing && !creatableRoles.includes(user?.role as Role))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue
                    placeholder={t.settings?.selectRole || "Select role"}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {creatableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t.roles?.[r as keyof typeof t.roles] ||
                        roleDisplayNames[r]}
                    </SelectItem>
                  ))}
                  {isEditing &&
                    user?.role &&
                    !creatableRoles.includes(user.role) && (
                      <SelectItem value={user.role} disabled>
                        {t.roles?.[user.role as keyof typeof t.roles] ||
                          user.role}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            {/* Module Access Toggles */}
            {role && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>
                      {t.settings?.moduleAccess || "Module Access"}
                    </Label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.settings?.moduleAccessDesc ||
                        "Toggle which modules this user can access"}
                    </p>
                  </div>
                  {isCustomized && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetToDefaults}
                      className="text-xs text-violet-600 hover:text-violet-700 gap-1 h-7"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t.settings?.resetToDefaults || "Reset to defaults"}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TOGGLEABLE_MODULES.map(({ key, icon: Icon }) => {
                    const isEnabled = enabledModules.has(key);
                    const isDefault = defaultModules.has(key);
                    const isOverridden = isEnabled !== isDefault;

                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                          isEnabled
                            ? "border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-900/20"
                            : "border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50",
                          isOverridden && "ring-1 ring-amber-300"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              isEnabled
                                ? "text-violet-600"
                                : "text-slate-400"
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isEnabled
                                ? "text-slate-900"
                                : "text-slate-400"
                            )}
                          >
                            {t.nav?.[key] || key}
                          </span>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => toggleModule(key)}
                          disabled={loading}
                          className="scale-90"
                        />
                      </div>
                    );
                  })}
                </div>
                {isCustomized && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                    {t.settings?.customAccess || "Custom access configured"}
                  </p>
                )}
              </div>
            )}

            {/* Market (only if scope allows) */}
            {managementScope === "all" && (
              <div className="space-y-2">
                <Label>{t.form?.market || "Market"}</Label>
                <Select
                  value={market}
                  onValueChange={(value) => {
                    setMarket(value as "dubai" | "usa");
                    setTeam("");
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue
                      placeholder={
                        t.settings?.selectMarket || "Select market"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {marketOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value === "dubai" ? "🇦🇪 " : "🇺🇸 "}
                        {t.market?.[option.value as keyof typeof t.market] ||
                          option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Team */}
            <div className="space-y-2">
              <Label>{t.table?.team || "Team"}</Label>
              <Select
                value={team || "none"}
                onValueChange={(value) =>
                  setTeam(value === "none" ? "" : value)
                }
                disabled={loading}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue
                    placeholder={t.settings?.selectTeam || "Select team"}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">
                    {t.common?.none || "None"}
                  </SelectItem>
                  {filteredTeamOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Send Invitation Checkbox (only for new users) */}
            {!isEditing && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="sendInvite"
                  checked={sendInvite}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    setSendInvite(checked === true)
                  }
                  disabled={loading}
                />
                <Label
                  htmlFor="sendInvite"
                  className="text-sm font-normal text-slate-600 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t.settings?.sendInvitation || "Send email invitation"}
                  </div>
                </Label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl"
            >
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.common?.saving || "Saving..."}
                </>
              ) : isEditing ? (
                t.common?.save || "Save Changes"
              ) : (
                t.settings?.createUser || "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
