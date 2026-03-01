-- ============================================================
-- Saved Jobs (favorites/bookmarks)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, job_id)
);

CREATE INDEX idx_saved_jobs_worker ON saved_jobs(worker_id);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own saved jobs"
  ON saved_jobs FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Workers can save jobs"
  ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can unsave jobs"
  ON saved_jobs FOR DELETE USING (auth.uid() = worker_id);

-- ============================================================
-- Reviews: average rating RPC
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_avg_rating(p_user_id UUID)
RETURNS TABLE(avg_rating NUMERIC, review_count BIGINT)
LANGUAGE sql STABLE
AS $$
  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS avg_rating,
    COUNT(*) AS review_count
  FROM reviews
  WHERE to_user_id = p_user_id;
$$;

-- Reviews: get reviews for a user
CREATE OR REPLACE FUNCTION get_user_reviews(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ,
  reviewer_name TEXT,
  reviewer_role user_role
)
LANGUAGE sql STABLE
AS $$
  SELECT
    r.id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(wp.full_name, fp.company_name, 'Người dùng') AS reviewer_name,
    u.role AS reviewer_role
  FROM reviews r
  JOIN users u ON u.id = r.from_user_id
  LEFT JOIN worker_profiles wp ON wp.user_id = r.from_user_id
  LEFT JOIN factory_profiles fp ON fp.user_id = r.from_user_id
  WHERE r.to_user_id = p_user_id
  ORDER BY r.created_at DESC
  LIMIT p_limit;
$$;

-- Reviews RLS (already has from initial schema, add if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can view reviews'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view reviews" ON reviews FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can create reviews'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id)';
  END IF;
END $$;
