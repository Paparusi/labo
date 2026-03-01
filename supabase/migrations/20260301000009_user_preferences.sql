-- Add preferences column to users table for settings
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"email_notifications": true, "in_app_notifications": true, "profile_visibility": true}'::jsonb;
