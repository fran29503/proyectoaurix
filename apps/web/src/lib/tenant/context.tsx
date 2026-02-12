"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

// Tenant branding configuration
export interface TenantBranding {
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  logoWhiteUrl: string | null;
  faviconUrl: string | null;
  fontFamily: string;
  companyName: string;
  companyShortName: string;
}

// Tenant settings configuration
export interface TenantSettings {
  slaResponseMinutes: number;
  defaultTimezone: string;
  defaultCurrency: string;
  defaultLanguage: string;
  enabledMarkets: ("dubai" | "usa")[];
  enabledFeatures: string[];
  customFields: Record<string, { label: string; type: string; required: boolean }>;
}

// Complete tenant data
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  branding: TenantBranding;
  settings: TenantSettings;
  isActive: boolean;
  createdAt: string;
}

// Default branding (AURIX default theme)
const defaultBranding: TenantBranding = {
  primaryColor: "#7C3AED", // Violet
  accentColor: "#B87333", // Copper
  logoUrl: null,
  logoWhiteUrl: null,
  faviconUrl: null,
  fontFamily: "Inter",
  companyName: "AURIX",
  companyShortName: "AX",
};

// Default settings
const defaultSettings: TenantSettings = {
  slaResponseMinutes: 15,
  defaultTimezone: "UTC",
  defaultCurrency: "USD",
  defaultLanguage: "en",
  enabledMarkets: ["dubai", "usa"],
  enabledFeatures: ["leads", "properties", "pipeline", "tasks", "reports", "team"],
  customFields: {},
};

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  branding: TenantBranding;
  settings: TenantSettings;
  isFeatureEnabled: (feature: string) => boolean;
  isMarketEnabled: (market: "dubai" | "usa") => boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
  branding: defaultBranding,
  settings: defaultSettings,
  isFeatureEnabled: () => true,
  isMarketEnabled: () => true,
});

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

interface TenantProviderProps {
  children: ReactNode;
  tenantSlug?: string; // Can be passed from middleware or detected from subdomain
}

export function TenantProvider({ children, tenantSlug }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenant() {
      try {
        const supabase = createClient();

        // Detect tenant from subdomain, custom domain, or use provided slug
        let slug = tenantSlug;

        if (!slug && typeof window !== "undefined") {
          const hostname = window.location.hostname;

          // Check for subdomain pattern: {tenant}.aurix.app
          if (hostname.includes(".aurix.app") || hostname.includes(".aurix.com")) {
            slug = hostname.split(".")[0];
          }
          // For localhost or custom domains, try to get from a cookie or default
          else if (hostname === "localhost" || hostname === "127.0.0.1") {
            // In development, use default tenant or check cookie
            slug = "meridian-harbor"; // Default for development
          }
        }

        if (!slug) {
          // If no slug found, get the first active tenant (for MVP)
          const { data: tenants, error: fetchError } = await supabase
            .from("tenants")
            .select("*")
            .eq("is_active", true)
            .limit(1);

          if (fetchError) throw fetchError;
          if (tenants && tenants.length > 0) {
            setTenant(normalizeTenant(tenants[0]));
          }
        } else {
          // Fetch specific tenant by slug
          const { data, error: fetchError } = await supabase
            .from("tenants")
            .select("*")
            .eq("slug", slug)
            .single();

          if (fetchError) throw fetchError;
          if (data) {
            setTenant(normalizeTenant(data));
          }
        }
      } catch (err) {
        console.error("Error loading tenant:", err);
        setError(err instanceof Error ? err.message : "Failed to load tenant");
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [tenantSlug]);

  // Normalize tenant data from database
  function normalizeTenant(data: Record<string, unknown>): Tenant {
    const branding = (data.branding as Partial<TenantBranding>) || {};
    const settings = (data.settings as Partial<TenantSettings>) || {};

    return {
      id: data.id as string,
      name: data.name as string,
      slug: data.slug as string,
      domain: (data.domain as string) || null,
      branding: {
        ...defaultBranding,
        ...branding,
        companyName: branding.companyName || (data.name as string),
        companyShortName: branding.companyShortName || (data.name as string).charAt(0),
      },
      settings: {
        ...defaultSettings,
        ...settings,
      },
      isActive: (data.is_active as boolean) ?? true,
      createdAt: data.created_at as string,
    };
  }

  const branding = tenant?.branding || defaultBranding;
  const settings = tenant?.settings || defaultSettings;

  const isFeatureEnabled = (feature: string) => {
    return settings.enabledFeatures.includes(feature);
  };

  const isMarketEnabled = (market: "dubai" | "usa") => {
    return settings.enabledMarkets.includes(market);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        loading,
        error,
        branding,
        settings,
        isFeatureEnabled,
        isMarketEnabled,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
