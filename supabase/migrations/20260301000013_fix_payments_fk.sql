-- Fix: Add direct FK from payments.factory_id to factory_profiles.user_id
-- This enables PostgREST joins like factory_profiles!payments_factory_profile_fkey
ALTER TABLE payments
  ADD CONSTRAINT payments_factory_profile_fkey
  FOREIGN KEY (factory_id) REFERENCES factory_profiles(user_id);
