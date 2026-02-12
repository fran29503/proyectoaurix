-- ============================================
-- AURIX - Multi-Tenant Enhancements
-- This migration adds support for custom domains and improved tenant configuration
-- ============================================

-- Add domain column to tenants table (for custom domains)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS domain TEXT UNIQUE;

-- Add is_active column to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update branding JSONB structure with new fields
-- (existing data will be preserved, new fields will be null until set)
COMMENT ON COLUMN tenants.branding IS 'JSON structure: {
  primaryColor: string (hex),
  accentColor: string (hex),
  logoUrl: string | null,
  logoWhiteUrl: string | null,
  faviconUrl: string | null,
  fontFamily: string,
  companyName: string,
  companyShortName: string
}';

-- Update settings JSONB structure with new fields
COMMENT ON COLUMN tenants.settings IS 'JSON structure: {
  slaResponseMinutes: number,
  defaultTimezone: string,
  defaultCurrency: string,
  defaultLanguage: string,
  enabledMarkets: string[] (dubai, usa),
  enabledFeatures: string[],
  customFields: object
}';

-- Create index for domain lookups
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain) WHERE domain IS NOT NULL;

-- Create index for active tenants
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active) WHERE is_active = true;

-- ============================================
-- RLS Policies for Multi-Tenant Security
-- These should be enabled for production
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tenant
-- (Commented out for development - enable for production)
/*
CREATE POLICY "tenant_isolation_users" ON users
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_leads" ON leads
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_properties" ON properties
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_activities" ON activities
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "tenant_isolation_tasks" ON tasks
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE auth_id = auth.uid())
  );
*/

-- For development: Allow all operations with anon key
CREATE POLICY IF NOT EXISTS "dev_allow_all_tenants" ON tenants FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "dev_allow_all_users" ON users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "dev_allow_all_leads" ON leads FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "dev_allow_all_properties" ON properties FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "dev_allow_all_activities" ON activities FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "dev_allow_all_tasks" ON tasks FOR ALL USING (true);
