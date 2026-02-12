"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type Role,
  type Resource,
  type Action,
  hasPermission,
  getDataScope,
  canAccessNav,
  getRolePermissions,
  type Permission,
} from "./permissions";

/**
 * Current user profile from database
 */
export interface CurrentUser {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  role: Role;
  team: string | null;
  market: "dubai" | "usa" | null;
  avatarUrl: string | null;
  phone: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
}

interface UserContextType {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;

  // Permission helpers
  can: (resource: Resource, action: Action) => boolean;
  canAccessNavItem: (resource: Resource) => boolean;
  getScope: (resource: Resource) => "own" | "team" | "all" | null;
  permissions: Permission[];

  // User helpers
  isAdmin: boolean;
  isManager: boolean;
  isTeamLead: boolean;
  isAgent: boolean;
  isBackoffice: boolean;
  hasRole: (role: Role) => boolean;
  hasMinimumRole: (role: Role) => boolean;

  // Actions
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

// Demo user for development/demo mode
const DEMO_USER: CurrentUser = {
  id: "demo-user-id",
  authId: "demo-auth-id",
  email: "demo@aurix.com",
  fullName: "Demo User",
  role: "admin",
  team: null,
  market: "dubai",
  avatarUrl: null,
  phone: "+971 50 123 4567",
  isActive: true,
  tenantId: "demo-tenant",
  createdAt: new Date().toISOString(),
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Check for demo mode
      const isDemoModeCookie = document.cookie.includes("demo_mode=true");
      if (isDemoModeCookie) {
        setIsDemoMode(true);
        setUser(DEMO_USER);
        setLoading(false);
        return;
      }

      // Get authenticated user from Supabase Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch user profile from database using auth_id
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.id)
        .single();

      if (profileError) {
        // If no profile exists, try by email as fallback
        const { data: userByEmail, error: emailError } = await supabase
          .from("users")
          .select("*")
          .eq("email", authUser.email)
          .single();

        if (emailError || !userByEmail) {
          console.error("User profile not found:", profileError, emailError);
          setError("User profile not found. Please contact support.");
          setUser(null);
          setLoading(false);
          return;
        }

        // Update auth_id for future queries
        await supabase
          .from("users")
          .update({ auth_id: authUser.id })
          .eq("id", userByEmail.id);

        setUser(transformUserProfile(userByEmail));
      } else {
        setUser(transformUserProfile(userProfile));
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Transform database row to CurrentUser type
  function transformUserProfile(dbUser: Record<string, unknown>): CurrentUser {
    return {
      id: dbUser.id as string,
      authId: (dbUser.auth_id as string) || "",
      email: dbUser.email as string,
      fullName: dbUser.full_name as string,
      role: (dbUser.role as Role) || "agent",
      team: (dbUser.team as string) || null,
      market: (dbUser.market as "dubai" | "usa") || null,
      avatarUrl: (dbUser.avatar_url as string) || null,
      phone: (dbUser.phone as string) || null,
      isActive: (dbUser.is_active as boolean) ?? true,
      tenantId: (dbUser.tenant_id as string) || "",
      createdAt: dbUser.created_at as string,
    };
  }

  // Listen for auth state changes
  useEffect(() => {
    fetchUserProfile();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchUserProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsDemoMode(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Memoized context value
  const contextValue = useMemo<UserContextType>(() => {
    const role = user?.role || "agent";

    return {
      user,
      loading,
      error,
      isAuthenticated: !!user,
      isDemoMode,

      // Permission helpers
      can: (resource: Resource, action: Action) => {
        if (!user) return false;
        return hasPermission(role, resource, action);
      },
      canAccessNavItem: (resource: Resource) => {
        if (!user) return false;
        return canAccessNav(role, resource);
      },
      getScope: (resource: Resource) => getDataScope(role, resource),
      permissions: getRolePermissions(role),

      // Role helpers
      isAdmin: role === "admin",
      isManager: role === "manager",
      isTeamLead: role === "team_lead",
      isAgent: role === "agent",
      isBackoffice: role === "backoffice",
      hasRole: (r: Role) => role === r,
      hasMinimumRole: (minRole: Role) => {
        const hierarchy: Record<Role, number> = {
          admin: 5,
          manager: 4,
          team_lead: 3,
          agent: 2,
          backoffice: 1,
        };
        return hierarchy[role] >= hierarchy[minRole];
      },

      // Actions
      refreshUser: fetchUserProfile,
    };
  }, [user, loading, error, isDemoMode, fetchUserProfile]);

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

/**
 * Hook to access current user and permissions
 */
export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context;
}

/**
 * Hook for permission checking
 */
export function usePermissions() {
  const { can, canAccessNavItem, getScope, permissions } = useCurrentUser();
  return { can, canAccessNavItem, getScope, permissions };
}

/**
 * Hook to check if user has specific role
 */
export function useRole() {
  const { user, isAdmin, isManager, isTeamLead, isAgent, isBackoffice, hasRole, hasMinimumRole } =
    useCurrentUser();
  return {
    role: user?.role || null,
    isAdmin,
    isManager,
    isTeamLead,
    isAgent,
    isBackoffice,
    hasRole,
    hasMinimumRole,
  };
}
