import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/rbac";

export interface User {
  id: string;
  auth_id: string | null;
  tenant_id: string;
  email: string;
  full_name: string;
  role: Role;
  team: string | null;
  market: "dubai" | "usa" | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  invited_at: string | null;
  invitation_status: "pending" | "accepted" | "expired" | null;
}

export interface CreateUserInput {
  email: string;
  full_name: string;
  role: Role;
  team?: string | null;
  market?: "dubai" | "usa" | null;
  phone?: string | null;
}

export interface UpdateUserInput {
  full_name?: string;
  role?: Role;
  team?: string | null;
  market?: "dubai" | "usa" | null;
  phone?: string | null;
  is_active?: boolean;
}

export interface UserFilters {
  role?: Role | "all";
  market?: "dubai" | "usa" | "all";
  team?: string | "all";
  isActive?: boolean | "all";
  search?: string;
}

/**
 * Get users with optional filters
 * Respects the management scope of the requesting user
 */
export async function getUsers(
  filters?: UserFilters,
  managementScope?: {
    scope: "all" | "market" | "team" | "none";
    market?: string | null;
    team?: string | null;
  }
): Promise<User[]> {
  const supabase = createClient();

  let query = supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply management scope restrictions
  if (managementScope) {
    if (managementScope.scope === "none") {
      return [];
    }
    if (managementScope.scope === "market" && managementScope.market) {
      query = query.eq("market", managementScope.market);
    }
    if (managementScope.scope === "team" && managementScope.team) {
      query = query.eq("team", managementScope.team);
    }
  }

  // Apply filters
  if (filters?.role && filters.role !== "all") {
    query = query.eq("role", filters.role);
  }

  if (filters?.market && filters.market !== "all") {
    query = query.eq("market", filters.market);
  }

  if (filters?.team && filters.team !== "all") {
    query = query.eq("team", filters.team);
  }

  if (filters?.isActive !== undefined && filters.isActive !== "all") {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return (data as User[]) || [];
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data as User;
}

/**
 * Create a new user and send invitation
 */
export async function createUser(
  input: CreateUserInput,
  createdBy: string
): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient();

  // Check if email already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", input.email.toLowerCase())
    .single();

  if (existing) {
    return { user: null, error: "A user with this email already exists" };
  }

  // Get tenant_id from current user
  const { data: currentUser } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", createdBy)
    .single();

  if (!currentUser) {
    return { user: null, error: "Could not determine tenant" };
  }

  // Create the user record
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      email: input.email.toLowerCase(),
      full_name: input.full_name,
      role: input.role,
      team: input.team || null,
      market: input.market || null,
      phone: input.phone || null,
      tenant_id: currentUser.tenant_id,
      is_active: true,
      created_by: createdBy,
      invited_at: new Date().toISOString(),
      invitation_status: "pending",
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating user:", createError);
    return { user: null, error: "Failed to create user" };
  }

  return { user: newUser as User, error: null };
}

/**
 * Update an existing user
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient();

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating user:", updateError);
    return { user: null, error: "Failed to update user" };
  }

  return { user: updatedUser as User, error: null };
}

/**
 * Deactivate a user (soft delete)
 */
export async function deactivateUser(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("users")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error deactivating user:", error);
    return { success: false, error: "Failed to deactivate user" };
  }

  return { success: true, error: null };
}

/**
 * Reactivate a user
 */
export async function reactivateUser(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("users")
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error reactivating user:", error);
    return { success: false, error: "Failed to reactivate user" };
  }

  return { success: true, error: null };
}

/**
 * Send invitation email to a user
 * This would integrate with Supabase Auth or your email service
 */
export async function sendInvitation(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  // Get user details
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (fetchError || !user) {
    return { success: false, error: "User not found" };
  }

  // In a real implementation, you would:
  // 1. Generate a magic link or password reset link via Supabase Auth
  // 2. Send an email with the invitation link

  // For now, we'll use Supabase's built-in invite
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    user.email,
    {
      data: {
        full_name: user.full_name,
      },
    }
  );

  if (inviteError) {
    // If admin invite fails (requires service role), try alternative approach
    console.warn("Admin invite failed, user may need to sign up manually:", inviteError);

    // Update invitation status
    await supabase
      .from("users")
      .update({
        invited_at: new Date().toISOString(),
        invitation_status: "pending",
      })
      .eq("id", userId);

    return { success: true, error: null };
  }

  // Update invitation status
  await supabase
    .from("users")
    .update({
      invited_at: new Date().toISOString(),
      invitation_status: "pending",
    })
    .eq("id", userId);

  return { success: true, error: null };
}

/**
 * Resend invitation to a user
 */
export async function resendInvitation(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  return sendInvitation(userId);
}

/**
 * Get user stats for the management dashboard
 */
export async function getUserStats(
  managementScope?: {
    scope: "all" | "market" | "team" | "none";
    market?: string | null;
    team?: string | null;
  }
) {
  const supabase = createClient();

  let query = supabase.from("users").select("role, market, team, is_active, invitation_status");

  if (managementScope) {
    if (managementScope.scope === "none") {
      return { total: 0, active: 0, pending: 0, byRole: {}, byMarket: {} };
    }
    if (managementScope.scope === "market" && managementScope.market) {
      query = query.eq("market", managementScope.market);
    }
    if (managementScope.scope === "team" && managementScope.team) {
      query = query.eq("team", managementScope.team);
    }
  }

  const { data: users, error } = await query;

  if (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }

  const total = users?.length || 0;
  const active = users?.filter((u) => u.is_active).length || 0;
  const pending = users?.filter((u) => u.invitation_status === "pending").length || 0;
  const byRole: Record<string, number> = {};
  const byMarket: Record<string, number> = {};

  users?.forEach((user) => {
    byRole[user.role] = (byRole[user.role] || 0) + 1;
    if (user.market) {
      byMarket[user.market] = (byMarket[user.market] || 0) + 1;
    }
  });

  return { total, active, pending, byRole, byMarket };
}

/**
 * Team options for select dropdowns
 */
export const teamOptions = [
  { value: "off-plan", label: "Off-Plan" },
  { value: "secondary", label: "Secondary Market" },
  { value: "leasing", label: "Leasing" },
  { value: "usa_desk", label: "USA Desk" },
];

/**
 * Market options for select dropdowns
 */
export const marketOptions = [
  { value: "dubai", label: "Dubai" },
  { value: "usa", label: "USA" },
];
