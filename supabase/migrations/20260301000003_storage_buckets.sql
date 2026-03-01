-- Create storage buckets for avatars and logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('logos', 'logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS for logos bucket
CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Users can upload own logo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own logo" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own logo" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
