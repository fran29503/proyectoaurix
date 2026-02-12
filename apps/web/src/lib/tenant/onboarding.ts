/**
 * AURIX Client Onboarding System
 *
 * This module provides utilities to onboard new clients to the AURIX platform.
 *
 * WORKFLOW FOR NEW CLIENT:
 * 1. Gather client information (company name, branding, settings)
 * 2. Create tenant record with createTenant()
 * 3. Create admin user with createTenantAdmin()
 * 4. Optionally seed initial data with seedTenantData()
 * 5. Configure custom domain (optional)
 */

import { createClient } from "@supabase/supabase-js";
import type { TenantBranding, TenantSettings } from "./context";

// Client configuration for onboarding
export interface NewClientConfig {
  // Company Information
  companyName: string;
  companySlug: string; // URL-friendly identifier (e.g., "acme-realty")

  // Branding
  branding: Partial<TenantBranding>;

  // Settings
  settings: Partial<TenantSettings>;

  // Admin User
  adminUser: {
    email: string;
    fullName: string;
    phone?: string;
  };

  // Optional: Custom domain
  customDomain?: string;
}

// Result of tenant creation
export interface OnboardingResult {
  success: boolean;
  tenantId?: string;
  adminUserId?: string;
  error?: string;
  accessUrl?: string;
}

/**
 * Creates a new tenant (client) in the system
 *
 * @param config - Client configuration
 * @param serviceRoleKey - Supabase service role key (required for admin operations)
 * @returns OnboardingResult
 */
export async function onboardNewClient(
  config: NewClientConfig,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<OnboardingResult> {
  // Use service role for admin operations
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // 1. Validate slug is unique
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", config.companySlug)
      .single();

    if (existingTenant) {
      return {
        success: false,
        error: `Tenant with slug "${config.companySlug}" already exists`,
      };
    }

    // 2. Create tenant record
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: config.companyName,
        slug: config.companySlug,
        domain: config.customDomain || null,
        branding: {
          primaryColor: config.branding.primaryColor || "#7C3AED",
          accentColor: config.branding.accentColor || "#B87333",
          logoUrl: config.branding.logoUrl || null,
          logoWhiteUrl: config.branding.logoWhiteUrl || null,
          faviconUrl: config.branding.faviconUrl || null,
          fontFamily: config.branding.fontFamily || "Inter",
          companyName: config.companyName,
          companyShortName: config.branding.companyShortName || config.companyName.charAt(0),
        },
        settings: {
          slaResponseMinutes: config.settings.slaResponseMinutes || 15,
          defaultTimezone: config.settings.defaultTimezone || "UTC",
          defaultCurrency: config.settings.defaultCurrency || "USD",
          defaultLanguage: config.settings.defaultLanguage || "en",
          enabledMarkets: config.settings.enabledMarkets || ["dubai", "usa"],
          enabledFeatures: config.settings.enabledFeatures || [
            "leads", "properties", "pipeline", "tasks", "reports", "team"
          ],
          customFields: config.settings.customFields || {},
        },
        is_active: true,
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      throw new Error(tenantError?.message || "Failed to create tenant");
    }

    // 3. Create auth user
    const tempPassword = generateTempPassword();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: config.adminUser.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: config.adminUser.fullName,
        tenant_id: tenant.id,
      },
    });

    if (authError || !authData.user) {
      // Rollback: delete tenant if user creation fails
      await supabase.from("tenants").delete().eq("id", tenant.id);
      throw new Error(authError?.message || "Failed to create admin user");
    }

    // 4. Create user record in users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        tenant_id: tenant.id,
        auth_id: authData.user.id,
        email: config.adminUser.email,
        full_name: config.adminUser.fullName,
        phone: config.adminUser.phone || null,
        role: "admin",
        is_active: true,
      })
      .select()
      .single();

    if (userError || !user) {
      // Rollback
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from("tenants").delete().eq("id", tenant.id);
      throw new Error(userError?.message || "Failed to create user record");
    }

    // 5. Determine access URL
    const accessUrl = config.customDomain
      ? `https://${config.customDomain}`
      : `https://${config.companySlug}.aurix.app`;

    return {
      success: true,
      tenantId: tenant.id,
      adminUserId: user.id,
      accessUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Seeds initial data for a new tenant
 * This can be customized based on the client's industry/needs
 */
export async function seedTenantData(
  tenantId: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  options: {
    sampleLeads?: boolean;
    sampleProperties?: boolean;
    teamMembers?: Array<{
      email: string;
      fullName: string;
      role: "manager" | "team_lead" | "agent" | "backoffice";
      team?: string;
      market?: "dubai" | "usa";
    }>;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Add team members if provided
    if (options.teamMembers && options.teamMembers.length > 0) {
      for (const member of options.teamMembers) {
        const tempPassword = generateTempPassword();

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: member.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: member.fullName,
            tenant_id: tenantId,
          },
        });

        if (authError) {
          console.error(`Failed to create auth user for ${member.email}:`, authError);
          continue;
        }

        // Create user record
        await supabase.from("users").insert({
          tenant_id: tenantId,
          auth_id: authData.user.id,
          email: member.email,
          full_name: member.fullName,
          role: member.role,
          team: member.team || null,
          market: member.market || null,
          is_active: true,
        });
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to seed data",
    };
  }
}

/**
 * Updates tenant branding
 */
export async function updateTenantBranding(
  tenantId: string,
  branding: Partial<TenantBranding>,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Get current branding
    const { data: tenant } = await supabase
      .from("tenants")
      .select("branding")
      .eq("id", tenantId)
      .single();

    if (!tenant) {
      return { success: false, error: "Tenant not found" };
    }

    // Merge with new branding
    const updatedBranding = {
      ...(tenant.branding as object),
      ...branding,
    };

    // Update
    const { error } = await supabase
      .from("tenants")
      .update({ branding: updatedBranding })
      .eq("id", tenantId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update branding",
    };
  }
}

/**
 * Updates tenant settings
 */
export async function updateTenantSettings(
  tenantId: string,
  settings: Partial<TenantSettings>,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Get current settings
    const { data: tenant } = await supabase
      .from("tenants")
      .select("settings")
      .eq("id", tenantId)
      .single();

    if (!tenant) {
      return { success: false, error: "Tenant not found" };
    }

    // Merge with new settings
    const updatedSettings = {
      ...(tenant.settings as object),
      ...settings,
    };

    // Update
    const { error } = await supabase
      .from("tenants")
      .update({ settings: updatedSettings })
      .eq("id", tenantId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

// Helper: Generate temporary password
function generateTempPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * EXAMPLE USAGE:
 *
 * // Onboard a new real estate client
 * const result = await onboardNewClient({
 *   companyName: "Luxury Homes Dubai",
 *   companySlug: "luxury-homes-dubai",
 *   branding: {
 *     primaryColor: "#1E3A5F",
 *     accentColor: "#D4AF37",
 *     companyShortName: "LHD",
 *   },
 *   settings: {
 *     defaultCurrency: "AED",
 *     defaultTimezone: "Asia/Dubai",
 *     enabledMarkets: ["dubai"],
 *   },
 *   adminUser: {
 *     email: "admin@luxuryhomesdubai.com",
 *     fullName: "Ahmed Hassan",
 *     phone: "+971501234567",
 *   },
 * }, SUPABASE_URL, SERVICE_ROLE_KEY);
 *
 * if (result.success) {
 *   console.log(`Client onboarded! Access URL: ${result.accessUrl}`);
 * }
 */
