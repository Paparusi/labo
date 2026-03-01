-- ============================================================
-- Migration: VietQR Bank Transfer Payment
-- Creates app_settings table for admin config (bank account)
-- Updates payment flow for bank transfer method
-- ============================================================

-- App settings key-value store
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Admin can read/write all settings
CREATE POLICY "admin_manage_settings" ON app_settings
  FOR ALL USING (is_admin());

-- Anyone authenticated can read bank_account setting (needed for QR display)
CREATE POLICY "authenticated_read_bank_account" ON app_settings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND key = 'bank_account'
  );

-- Add transfer_note column to payments for bank transfer tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transfer_note TEXT;
