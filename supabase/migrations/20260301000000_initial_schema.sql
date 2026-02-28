-- ============================================================
-- Labo - Worker Marketplace Platform
-- Database Schema for Supabase (PostgreSQL + PostGIS)
-- ============================================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('worker', 'factory', 'admin');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE factory_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE availability_type AS ENUM ('immediate', 'one_week', 'one_month');
CREATE TYPE shift_type AS ENUM ('day', 'night', 'rotating', 'flexible');
CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'expired', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  role user_role NOT NULL DEFAULT 'worker',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WORKER PROFILES
-- ============================================================
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender gender_type,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER NOT NULL DEFAULT 0,
  availability availability_type NOT NULL DEFAULT 'immediate',
  avatar_url TEXT,
  bio TEXT,
  phone_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update location geography from lat/lng
CREATE OR REPLACE FUNCTION update_worker_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER worker_location_trigger
  BEFORE INSERT OR UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_worker_location();

-- ============================================================
-- FACTORY PROFILES
-- ============================================================
CREATE TABLE factory_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  size factory_size NOT NULL DEFAULT 'medium',
  contact_person TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_factory_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER factory_location_trigger
  BEFORE INSERT OR UPDATE ON factory_profiles
  FOR EACH ROW EXECUTE FUNCTION update_factory_location();

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  skills_required TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  positions INTEGER NOT NULL DEFAULT 1,
  shift_type shift_type NOT NULL DEFAULT 'day',
  gender_requirement gender_type,
  start_date DATE,
  end_date DATE,
  status job_status NOT NULL DEFAULT 'active',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_job_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_location_trigger
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_job_location();

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  note TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- ============================================================
-- SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  max_job_posts INTEGER NOT NULL DEFAULT 5,
  max_view_profiles INTEGER NOT NULL DEFAULT 20,
  radius_km INTEGER NOT NULL DEFAULT 5,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Insert default plans
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_job_posts, max_view_profiles, radius_km, features, sort_order) VALUES
  ('Dung thu', 'trial', 0, 0, 5, 20, 5, '{"analytics": false, "api_access": false, "priority_support": false}', 0),
  ('Co ban', 'basic', 2000000, 20000000, 20, 100, 10, '{"analytics": false, "api_access": false, "priority_support": false}', 1),
  ('Chuyen nghiep', 'pro', 5000000, 50000000, 50, -1, 20, '{"analytics": true, "api_access": false, "priority_support": true}', 2),
  ('Doanh nghiep', 'enterprise', 15000000, 150000000, -1, -1, 50, '{"analytics": true, "api_access": true, "priority_support": true}', 3);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'trial',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  factory_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL DEFAULT 'vnpay',
  transaction_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  vnpay_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST (location);
CREATE INDEX idx_factory_profiles_location ON factory_profiles USING GIST (location);
CREATE INDEX idx_jobs_location ON jobs USING GIST (location);
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_factory_id ON jobs (factory_id);
CREATE INDEX idx_applications_job_id ON applications (job_id);
CREATE INDEX idx_applications_worker_id ON applications (worker_id);
CREATE INDEX idx_subscriptions_factory_id ON subscriptions (factory_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Users: read own, admin reads all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Worker profiles: workers can CRUD own, factories can read all
CREATE POLICY "Workers can manage own profile" ON worker_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view worker profiles" ON worker_profiles FOR SELECT USING (true);

-- Factory profiles: factories can CRUD own, all can read
CREATE POLICY "Factories can manage own profile" ON factory_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view factory profiles" ON factory_profiles FOR SELECT USING (true);

-- Jobs: factories manage own, all can read active
CREATE POLICY "Factories can manage own jobs" ON jobs FOR ALL USING (auth.uid() = factory_id);
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT USING (status = 'active');

-- Applications: workers apply, factories view their job apps
CREATE POLICY "Workers can manage own applications" ON applications FOR ALL USING (auth.uid() = worker_id);
CREATE POLICY "Factories can view applications for their jobs" ON applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.factory_id = auth.uid()));
CREATE POLICY "Factories can update applications for their jobs" ON applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.factory_id = auth.uid()));

-- Subscriptions: factories view own
CREATE POLICY "Factories can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = factory_id);
CREATE POLICY "Factories can manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = factory_id);

-- Payments: factories view own
CREATE POLICY "Factories can view own payments" ON payments FOR SELECT USING (auth.uid() = factory_id);

-- Subscription plans: everyone can read
CREATE POLICY "Anyone can view plans" ON subscription_plans FOR SELECT USING (true);

-- Reviews: authenticated users can read/write
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Notifications: users view own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS: Nearby Jobs (PostGIS)
-- ============================================================
CREATE OR REPLACE FUNCTION nearby_jobs(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 10000
)
RETURNS TABLE (
  id UUID,
  factory_id UUID,
  title TEXT,
  description TEXT,
  industry TEXT,
  skills_required TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  positions INTEGER,
  shift_type shift_type,
  gender_requirement gender_type,
  start_date DATE,
  end_date DATE,
  status job_status,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  created_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION,
  company_name TEXT,
  logo_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id, j.factory_id, j.title, j.description, j.industry,
    j.skills_required, j.salary_min, j.salary_max, j.positions,
    j.shift_type, j.gender_requirement, j.start_date, j.end_date,
    j.status, j.latitude, j.longitude, j.address, j.created_at,
    ROUND((ST_Distance(
      j.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000)::numeric, 1)::double precision AS distance_km,
    fp.company_name,
    fp.logo_url
  FROM jobs j
  LEFT JOIN factory_profiles fp ON fp.user_id = j.factory_id
  WHERE j.status = 'active'
    AND j.location IS NOT NULL
    AND ST_DWithin(
      j.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTIONS: Nearby Workers (PostGIS)
-- ============================================================
CREATE OR REPLACE FUNCTION nearby_workers(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 10000
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  gender gender_type,
  skills TEXT[],
  experience_years INTEGER,
  availability availability_type,
  avatar_url TEXT,
  bio TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wp.id, wp.user_id, wp.full_name, wp.gender,
    wp.skills, wp.experience_years, wp.availability,
    wp.avatar_url, wp.bio, wp.latitude, wp.longitude,
    ROUND((ST_Distance(
      wp.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000)::numeric, 1)::double precision AS distance_km
  FROM worker_profiles wp
  JOIN users u ON u.id = wp.user_id
  WHERE u.is_active = true
    AND wp.location IS NOT NULL
    AND ST_DWithin(
      wp.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Auto-create user record on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, phone, email, role)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCTION: Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_factory_profiles_updated_at BEFORE UPDATE ON factory_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
