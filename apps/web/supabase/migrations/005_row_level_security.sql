-- =============================================================================
-- AURIX CRM - Row Level Security (RLS) Policies
-- =============================================================================
-- This migration creates comprehensive RLS policies for all tables
-- Run this in your Supabase SQL Editor after authentication is set up
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get current user's ID from users table
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
    SELECT id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get current user's market
CREATE OR REPLACE FUNCTION get_current_user_market()
RETURNS TEXT AS $$
    SELECT market FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get current user's team
CREATE OR REPLACE FUNCTION get_current_user_team()
RETURNS TEXT AS $$
    SELECT team FROM users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
        AND role = 'admin'
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if current user is manager or above
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if current user is team lead or above
CREATE OR REPLACE FUNCTION is_team_lead_or_above()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users
        WHERE auth_id = auth.uid()
        AND role IN ('admin', 'manager', 'team_lead')
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- USERS TABLE RLS
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view themselves
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth_id = auth.uid());

-- Admin can view all users in tenant
CREATE POLICY "Admin can view all users" ON users
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND is_admin()
    );

-- Manager can view users in their market
CREATE POLICY "Manager can view market users" ON users
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'manager'
        AND (market::text = get_current_user_market() OR market IS NULL)
    );

-- Team lead can view users in their team
CREATE POLICY "Team lead can view team users" ON users
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'team_lead'
        AND team = get_current_user_team()
    );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- Admin can update any user in tenant
CREATE POLICY "Admin can update users" ON users
    FOR UPDATE
    USING (tenant_id = get_current_tenant_id() AND is_admin())
    WITH CHECK (tenant_id = get_current_tenant_id() AND is_admin());

-- Manager can update users in their market (except admin/manager roles)
CREATE POLICY "Manager can update market users" ON users
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'manager'
        AND (market::text = get_current_user_market() OR market IS NULL)
        AND role NOT IN ('admin', 'manager')
    )
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND role NOT IN ('admin', 'manager')
    );

-- Admin can insert new users
CREATE POLICY "Admin can create users" ON users
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id() AND is_admin());

-- Manager can create team_lead and agent users
CREATE POLICY "Manager can create team users" ON users
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'manager'
        AND role IN ('team_lead', 'agent')
    );

-- =============================================================================
-- LEADS TABLE RLS
-- =============================================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Admin/Manager can view all leads in tenant
CREATE POLICY "Admin/Manager view all leads" ON leads
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND is_manager_or_above()
    );

-- Team lead can view leads assigned to team members or themselves
CREATE POLICY "Team lead view team leads" ON leads
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'team_lead'
        AND (
            assigned_to = get_current_user_id()
            OR assigned_to IN (
                SELECT id FROM users
                WHERE team = get_current_user_team()
            )
        )
    );

-- Agent can view only their assigned leads
CREATE POLICY "Agent view own leads" ON leads
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'agent'
        AND assigned_to = get_current_user_id()
    );

-- Backoffice can view all leads (read-only)
CREATE POLICY "Backoffice view leads" ON leads
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'backoffice'
    );

-- Admin/Manager can create leads
CREATE POLICY "Admin/Manager create leads" ON leads
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND is_manager_or_above()
    );

-- Team lead/Agent can create leads (assigned to themselves)
CREATE POLICY "Team members create leads" ON leads
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('team_lead', 'agent')
        AND (assigned_to IS NULL OR assigned_to = get_current_user_id())
    );

-- Admin/Manager can update any lead
CREATE POLICY "Admin/Manager update leads" ON leads
    FOR UPDATE
    USING (tenant_id = get_current_tenant_id() AND is_manager_or_above())
    WITH CHECK (tenant_id = get_current_tenant_id() AND is_manager_or_above());

-- Team lead can update leads in their team
CREATE POLICY "Team lead update team leads" ON leads
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'team_lead'
        AND (
            assigned_to = get_current_user_id()
            OR assigned_to IN (SELECT id FROM users WHERE team = get_current_user_team())
        )
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Agent can update only their own leads
CREATE POLICY "Agent update own leads" ON leads
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'agent'
        AND assigned_to = get_current_user_id()
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Only Admin/Manager can delete leads
CREATE POLICY "Admin/Manager delete leads" ON leads
    FOR DELETE
    USING (tenant_id = get_current_tenant_id() AND is_manager_or_above());

-- =============================================================================
-- PROPERTIES TABLE RLS
-- =============================================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- All authenticated users in tenant can view properties
CREATE POLICY "Users view properties" ON properties
    FOR SELECT
    USING (tenant_id = get_current_tenant_id());

-- Admin/Manager/Backoffice can create properties
CREATE POLICY "Create properties" ON properties
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('admin', 'manager', 'backoffice')
    );

-- Admin/Manager/Backoffice can update properties
CREATE POLICY "Update properties" ON properties
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('admin', 'manager', 'backoffice')
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Only Admin can delete properties
CREATE POLICY "Admin delete properties" ON properties
    FOR DELETE
    USING (tenant_id = get_current_tenant_id() AND is_admin());

-- =============================================================================
-- TASKS TABLE RLS
-- =============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Admin/Manager can view all tasks
CREATE POLICY "Admin/Manager view all tasks" ON tasks
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND is_manager_or_above()
    );

-- Team lead can view their team's tasks
CREATE POLICY "Team lead view team tasks" ON tasks
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'team_lead'
        AND (
            assigned_to = get_current_user_id()
            OR created_by = get_current_user_id()
            OR assigned_to IN (SELECT id FROM users WHERE team = get_current_user_team())
        )
    );

-- Agent/Backoffice can view only their tasks
CREATE POLICY "Agent view own tasks" ON tasks
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('agent', 'backoffice')
        AND (assigned_to = get_current_user_id() OR created_by = get_current_user_id())
    );

-- All users can create tasks
CREATE POLICY "Users create tasks" ON tasks
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Admin/Manager can update any task
CREATE POLICY "Admin/Manager update tasks" ON tasks
    FOR UPDATE
    USING (tenant_id = get_current_tenant_id() AND is_manager_or_above())
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Team lead can update team tasks
CREATE POLICY "Team lead update team tasks" ON tasks
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() = 'team_lead'
        AND (
            assigned_to = get_current_user_id()
            OR created_by = get_current_user_id()
            OR assigned_to IN (SELECT id FROM users WHERE team = get_current_user_team())
        )
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Agent can update own tasks
CREATE POLICY "Agent update own tasks" ON tasks
    FOR UPDATE
    USING (
        tenant_id = get_current_tenant_id()
        AND get_current_user_role() IN ('agent', 'backoffice')
        AND (assigned_to = get_current_user_id() OR created_by = get_current_user_id())
    )
    WITH CHECK (tenant_id = get_current_tenant_id());

-- Admin/Manager can delete any task
CREATE POLICY "Admin/Manager delete tasks" ON tasks
    FOR DELETE
    USING (tenant_id = get_current_tenant_id() AND is_manager_or_above());

-- Users can delete own tasks
CREATE POLICY "Users delete own tasks" ON tasks
    FOR DELETE
    USING (
        tenant_id = get_current_tenant_id()
        AND created_by = get_current_user_id()
    );

-- =============================================================================
-- TENANTS TABLE RLS
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Users can view their own tenant
CREATE POLICY "Users view own tenant" ON tenants
    FOR SELECT
    USING (id = get_current_tenant_id());

-- Only admin can update tenant
CREATE POLICY "Admin update tenant" ON tenants
    FOR UPDATE
    USING (id = get_current_tenant_id() AND is_admin())
    WITH CHECK (id = get_current_tenant_id());

-- =============================================================================
-- NOTES/ACTIVITIES TABLE RLS (if exists)
-- =============================================================================

-- Uncomment and adjust if you have a notes/activities table:
/*
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View lead activities" ON lead_activities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_activities.lead_id
            -- Inherits access from leads table
        )
    );

CREATE POLICY "Create lead activities" ON lead_activities
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = lead_activities.lead_id
            AND leads.tenant_id = get_current_tenant_id()
        )
    );
*/

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_market() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_team() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_manager_or_above() TO authenticated;
GRANT EXECUTE ON FUNCTION is_team_lead_or_above() TO authenticated;

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================

COMMENT ON FUNCTION get_current_user_id() IS 'Returns the current authenticated user ID from the users table';
COMMENT ON FUNCTION get_current_tenant_id() IS 'Returns the tenant ID for the current authenticated user';
COMMENT ON FUNCTION get_current_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION is_admin() IS 'Returns true if the current user has admin role';
COMMENT ON FUNCTION is_manager_or_above() IS 'Returns true if the current user is manager or admin';

-- =============================================================================
-- TESTING QUERIES (run these to verify RLS is working)
-- =============================================================================

/*
-- Test as different users by setting the auth.uid():
-- SET LOCAL auth.uid = 'your-user-auth-id';

-- Check what leads a user can see:
SELECT id, full_name, assigned_to FROM leads;

-- Check what users can be seen:
SELECT id, full_name, role, market FROM users;

-- Verify helper functions:
SELECT get_current_user_id();
SELECT get_current_user_role();
SELECT is_admin();
*/
