-- Job templates for factories
CREATE TABLE IF NOT EXISTS job_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  template_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Factories can manage own templates"
  ON job_templates FOR ALL
  USING (auth.uid() = factory_id)
  WITH CHECK (auth.uid() = factory_id);

-- Resume/CV fields on worker_profiles
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS resume_url text;
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS resume_filename text;

-- Hiring pipeline: application stages
DO $$ BEGIN
  CREATE TYPE application_stage AS ENUM ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS stage application_stage DEFAULT 'applied';

-- Stage history tracking
CREATE TABLE IF NOT EXISTS application_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_stage application_stage,
  to_stage application_stage NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Factory can view stage history for their applications"
  ON application_stage_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = application_stage_history.application_id
      AND j.factory_id = auth.uid()
    )
  );

CREATE POLICY "Factory can insert stage history"
  ON application_stage_history FOR INSERT
  WITH CHECK (auth.uid() = changed_by);

CREATE POLICY "Worker can view own stage history"
  ON application_stage_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = application_stage_history.application_id
      AND a.worker_id = auth.uid()
    )
  );

-- Applicant notes & shortlisting
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_shortlisted boolean DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS applicant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  factory_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE applicant_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Factory can manage own notes"
  ON applicant_notes FOR ALL
  USING (auth.uid() = factory_id)
  WITH CHECK (auth.uid() = factory_id);

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Workers can upload resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');

CREATE POLICY "Workers can delete own resumes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
