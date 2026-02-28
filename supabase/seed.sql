-- ============================================================
-- Labo - Seed Data for Demo
-- ============================================================
-- Note: Run this AFTER schema.sql and after creating users via Supabase Auth
-- This seed creates demo data with known UUIDs

-- ============================================================
-- Demo Worker Profiles (must create auth users first via Supabase dashboard)
-- For demo purposes, using placeholder UUIDs
-- ============================================================

-- Insert demo worker profiles (using gen_random_uuid since real auth users would be created separately)
-- In production, these would be linked to actual auth.users records

-- Sample factories around Binh Duong Industrial Zone (Vietnam)
-- Factory 1: Thu Dau Mot
INSERT INTO factory_profiles (id, user_id, company_name, industry, address, latitude, longitude, size, contact_person, contact_phone, description)
SELECT
  gen_random_uuid(),
  id,
  'Cong ty TNHH Dien tu ABC',
  'electronics',
  'KCN VSIP, Thuan An, Binh Duong',
  11.0089,
  106.6556,
  'large',
  'Nguyen Van Hung',
  '0901234567',
  'Chuyen san xuat linh kien dien tu xuat khau'
FROM users WHERE role = 'factory' LIMIT 1;

-- Note: To populate demo data:
-- 1. Create users via Supabase Auth (or registration flow)
-- 2. The handle_new_user() trigger auto-creates users table entries
-- 3. Create profiles via the app registration flow
-- 4. Or use the SQL below with actual user IDs

-- ============================================================
-- Quick demo: Insert factory jobs (run after creating factory users)
-- ============================================================

-- Example job data to insert manually after factory users exist:
/*
INSERT INTO jobs (factory_id, title, description, industry, skills_required, salary_min, salary_max, positions, shift_type, latitude, longitude, address, status)
VALUES
  ('<factory_user_id>', 'Tuyen cong nhan lap rap dien tu', 'Can tuyen gap 20 cong nhan lap rap, lam viec tai KCN VSIP', 'electronics', ARRAY['Lap rap', 'Kiem tra chat luong'], 6000000, 8000000, 20, 'day', 11.0089, 106.6556, 'KCN VSIP, Thuan An, Binh Duong', 'active'),
  ('<factory_user_id>', 'Tuyen tho may co kinh nghiem', 'Tuyen 10 tho may lanh nghe, uu tien co kinh nghiem', 'garment', ARRAY['May'], 7000000, 10000000, 10, 'day', 11.0089, 106.6556, 'KCN VSIP, Thuan An, Binh Duong', 'active'),
  ('<factory_user_id>', 'Cong nhan dong goi', 'Tuyen cong nhan dong goi san pham, khong can kinh nghiem', 'packaging', ARRAY['Dong goi'], 5000000, 6500000, 30, 'rotating', 11.0089, 106.6556, 'KCN VSIP, Thuan An, Binh Duong', 'active'),
  ('<factory_user_id>', 'Tho han co khi', 'Can tho han co kinh nghiem, biet doc ban ve', 'mechanical', ARRAY['Han', 'Han dien'], 8000000, 12000000, 5, 'day', 11.0089, 106.6556, 'KCN VSIP, Thuan An, Binh Duong', 'active'),
  ('<factory_user_id>', 'Cong nhan van hanh may CNC', 'Tuyen cong nhan van hanh may CNC, dao tao tai cho', 'mechanical', ARRAY['Van hanh may', 'CNC'], 7000000, 9000000, 8, 'rotating', 11.0089, 106.6556, 'KCN VSIP, Thuan An, Binh Duong', 'active');
*/

-- ============================================================
-- Ensure subscription plans exist
-- ============================================================
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_job_posts, max_view_profiles, radius_km, features, sort_order)
VALUES
  ('Dung thu', 'trial', 0, 0, 5, 20, 5, '{"analytics": false, "api_access": false, "priority_support": false}', 0),
  ('Co ban', 'basic', 2000000, 20000000, 20, 100, 10, '{"analytics": false, "api_access": false, "priority_support": false}', 1),
  ('Chuyen nghiep', 'pro', 5000000, 50000000, 50, -1, 20, '{"analytics": true, "api_access": false, "priority_support": true}', 2),
  ('Doanh nghiep', 'enterprise', 15000000, 150000000, -1, -1, 50, '{"analytics": true, "api_access": true, "priority_support": true}', 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_job_posts = EXCLUDED.max_job_posts,
  max_view_profiles = EXCLUDED.max_view_profiles,
  radius_km = EXCLUDED.radius_km,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order;
