-- ============================================================
-- Fix Admin RLS Policies - Replace self-referencing policies
-- The old policies caused infinite recursion (500 error) because
-- they queried the 'users' table within a policy ON the 'users' table.
-- Fix: Use a SECURITY DEFINER function to check admin role.
-- ============================================================

-- Create a helper function to check if current user is admin
-- SECURITY DEFINER bypasses RLS, avoiding the recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop old recursive admin policies
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can update all users" ON users;
DROP POLICY IF EXISTS "Admin can view all jobs" ON jobs;
DROP POLICY IF EXISTS "Admin can update all jobs" ON jobs;
DROP POLICY IF EXISTS "Admin can view all applications" ON applications;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Admin can view all factory profiles" ON factory_profiles;
DROP POLICY IF EXISTS "Admin can view all worker profiles" ON worker_profiles;

-- Recreate admin policies using the SECURITY DEFINER function
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can update all users" ON users
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admin can view all jobs" ON jobs
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can update all jobs" ON jobs
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admin can view all applications" ON applications
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can view all subscriptions" ON subscriptions
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can view all conversations" ON conversations
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can view all factory profiles" ON factory_profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can view all worker profiles" ON worker_profiles
  FOR SELECT USING (is_admin());

-- Also add missing admin policies for tables used in admin dashboard
CREATE POLICY "Admin can view all reviews" ON reviews
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can view all payments" ON payments
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can view all notifications" ON notifications
  FOR SELECT USING (is_admin());
