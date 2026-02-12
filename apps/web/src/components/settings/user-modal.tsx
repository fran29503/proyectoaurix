"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserPlus, Mail, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useCurrentUser, type Role, roleDisplayNames } from "@/lib/rbac";
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

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        // Creating new user
        setFullName("");
        setEmail("");
        setPhone("");
        setRole(creatableRoles[0] || "");
        // If manager, default to their market
        setMarket(managementScope === "market" && currentUserMarket ? (currentUserMarket as "dubai" | "usa") : "");
        setTeam("");
        setSendInvite(true);
      }
      setError(null);
    }
  }, [open, user, creatableRoles, managementScope, currentUserMarket]);

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

    try {
      if (isEditing) {
        // Update existing user
        const input: UpdateUserInput = {
          full_name: fullName.trim(),
          role: role as Role,
          market: market || null,
          team: team || null,
          phone: phone.trim() || null,
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
        };

        const { user: newUser, error: createError } = await createUser(input, currentUser.id);

        if (createError || !newUser) {
          setError(createError || "Failed to create user");
          return;
        }

        // Send invitation if requested
        if (sendInvite) {
          await sendInvitation(newUser.id);
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving user:", err);
      setError(t.common?.error || "An error occurred");
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
      <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl">
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
                : t.settings?.addUserDesc || "Add a new team member to your organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.form?.fullName || "Full Name"} *</Label>
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
                onValueChange={(value) => setRole(value as Role)}
                disabled={loading || (isEditing && !creatableRoles.includes(user?.role as Role))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t.settings?.selectRole || "Select role"} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {creatableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t.roles?.[r as keyof typeof t.roles] || roleDisplayNames[r]}
                    </SelectItem>
                  ))}
                  {/* If editing a user with a role we can't create, still show their current role */}
                  {isEditing && !creatableRoles.includes(user?.role as Role) && (
                    <SelectItem value={user?.role || ""} disabled>
                      {t.roles?.[user?.role as keyof typeof t.roles] || user?.role}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Market (only if scope allows) */}
            {managementScope === "all" && (
              <div className="space-y-2">
                <Label>{t.form?.market || "Market"}</Label>
                <Select
                  value={market}
                  onValueChange={(value) => {
                    setMarket(value as "dubai" | "usa");
                    // Reset team if market changes
                    setTeam("");
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={t.settings?.selectMarket || "Select market"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {marketOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value === "dubai" ? "🇦🇪 " : "🇺🇸 "}
                        {t.market?.[option.value as keyof typeof t.market] || option.label}
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
                value={team}
                onValueChange={setTeam}
                disabled={loading}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t.settings?.selectTeam || "Select team"} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="">{t.common?.none || "None"}</SelectItem>
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
                  onCheckedChange={(checked: boolean | "indeterminate") => setSendInvite(checked === true)}
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
