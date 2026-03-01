-- ============================================================
-- Fix FK relationships for PostgREST joins + Fix plan names
-- ============================================================
-- Problem: jobs.factory_id → users(id) and factory_profiles.user_id → users(id)
-- But PostgREST needs a direct FK to join jobs ↔ factory_profiles.
-- Same issue for applications.worker_id → worker_profiles.
-- Also: subscription plan names missing Vietnamese diacriticals.
-- ============================================================

-- Add direct FK: jobs.factory_id → factory_profiles(user_id)
-- This allows PostgREST to join jobs with factory_profiles directly
ALTER TABLE jobs ADD CONSTRAINT jobs_factory_profile_fkey
  FOREIGN KEY (factory_id) REFERENCES factory_profiles(user_id);

-- Add direct FK: applications.worker_id → worker_profiles(user_id)
-- This allows PostgREST to join applications with worker_profiles directly
ALTER TABLE applications ADD CONSTRAINT applications_worker_profile_fkey
  FOREIGN KEY (worker_id) REFERENCES worker_profiles(user_id);

-- Fix subscription plan names with proper Vietnamese diacriticals
UPDATE subscription_plans SET name = 'Dùng thử' WHERE slug = 'trial';
UPDATE subscription_plans SET name = 'Cơ bản' WHERE slug = 'basic';
UPDATE subscription_plans SET name = 'Chuyên nghiệp' WHERE slug = 'pro';
UPDATE subscription_plans SET name = 'Doanh nghiệp' WHERE slug = 'enterprise';
