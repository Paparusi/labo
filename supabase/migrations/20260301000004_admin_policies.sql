-- ============================================================
-- Admin RLS Policies
-- Allow admin role users to read and manage all platform data
-- ============================================================

-- Allow admin to read all users
CREATE POLICY "Admin can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to update all users
CREATE POLICY "Admin can update all users" ON users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to view all jobs
CREATE POLICY "Admin can view all jobs" ON jobs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to update all jobs
CREATE POLICY "Admin can update all jobs" ON jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to view all applications
CREATE POLICY "Admin can view all applications" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to view all subscriptions
CREATE POLICY "Admin can view all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to view all conversations
CREATE POLICY "Admin can view all conversations" ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to view all factory profiles
CREATE POLICY "Admin can view all factory profiles" ON factory_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- Allow admin to view all worker profiles
CREATE POLICY "Admin can view all worker profiles" ON worker_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);
