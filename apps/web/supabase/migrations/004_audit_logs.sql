-- =============================================================================
-- AURIX CRM - Audit Logs Table
-- =============================================================================
-- This migration creates the audit_logs table for tracking user actions
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_name TEXT,

    -- Action details
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'assign', etc.
    resource TEXT NOT NULL, -- 'lead', 'property', 'task', 'user', etc.
    resource_id UUID, -- ID of the affected resource
    resource_name TEXT, -- Name/title of the resource for display

    -- Change details (for updates)
    old_values JSONB, -- Previous values before change
    new_values JSONB, -- New values after change

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin can view all audit logs in their tenant
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE auth_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Managers can view audit logs (excluding admin actions)
CREATE POLICY "Managers can view non-admin audit logs" ON audit_logs
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE auth_id = auth.uid()
            AND role = 'manager'
        )
        AND user_id NOT IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- System can insert audit logs (via service role or triggers)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- =============================================================================
-- Function to log actions (can be called from application or triggers)
-- =============================================================================

CREATE OR REPLACE FUNCTION log_audit_action(
    p_tenant_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_resource_name TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_user_email TEXT;
    v_user_name TEXT;
BEGIN
    -- Get user info
    SELECT email, full_name INTO v_user_email, v_user_name
    FROM users WHERE id = p_user_id;

    -- Insert audit log
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        user_email,
        user_name,
        action,
        resource,
        resource_id,
        resource_name,
        old_values,
        new_values,
        metadata
    ) VALUES (
        p_tenant_id,
        p_user_id,
        v_user_email,
        v_user_name,
        p_action,
        p_resource,
        p_resource_id,
        p_resource_name,
        p_old_values,
        p_new_values,
        p_metadata
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Example trigger for automatic logging (optional - can be added per table)
-- =============================================================================

-- Trigger function for leads table
CREATE OR REPLACE FUNCTION audit_leads_changes() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_action(
            NEW.tenant_id,
            NEW.created_by,
            'create',
            'lead',
            NEW.id,
            NEW.full_name,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if there are actual changes
        IF OLD IS DISTINCT FROM NEW THEN
            PERFORM log_audit_action(
                NEW.tenant_id,
                COALESCE(NEW.updated_by, NEW.assigned_to, NEW.created_by),
                'update',
                'lead',
                NEW.id,
                NEW.full_name,
                to_jsonb(OLD),
                to_jsonb(NEW)
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_action(
            OLD.tenant_id,
            OLD.created_by,
            'delete',
            'lead',
            OLD.id,
            OLD.full_name,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To enable automatic audit logging for leads, run:
-- CREATE TRIGGER audit_leads_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON leads
--     FOR EACH ROW EXECUTE FUNCTION audit_leads_changes();

-- =============================================================================
-- Cleanup old logs (optional scheduled job)
-- =============================================================================

-- Function to delete logs older than X days
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- To schedule automatic cleanup, set up a pg_cron job (requires pg_cron extension):
-- SELECT cron.schedule('cleanup-audit-logs', '0 3 * * *', 'SELECT cleanup_old_audit_logs(90)');

COMMENT ON TABLE audit_logs IS 'Stores all user actions for compliance and debugging';
