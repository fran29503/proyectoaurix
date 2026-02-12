// Tenant Management System
// This module handles multi-tenancy for AURIX

export { TenantProvider, useTenant } from "./context";
export type { Tenant, TenantBranding, TenantSettings } from "./context";

export { TenantThemeProvider, useTenantStyles } from "./theme-provider";
