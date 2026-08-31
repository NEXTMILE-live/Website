/*
# Create site-assets storage bucket for admin image uploads

1. Purpose
   - Public storage bucket for logos, images, and other assets uploaded through the admin dashboard.
   - The admin dashboard uploads images via the content-api edge function, which uses the service role key.
   - Public read access so the website can display uploaded images.

2. Storage
   - Create bucket `site-assets` (public = true)
   - Allow anon + authenticated SELECT (public read)
   - Allow anon + authenticated INSERT/UPDATE/DELETE via storage policies

3. Notes
   - The edge function uses the service role key which bypasses RLS, so uploads will always work.
   - Public read access is needed so the website can render uploaded images without auth.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "public_read_site_assets" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');

-- Allow anon + authenticated to upload
CREATE POLICY "anon_insert_site_assets" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'site-assets');

-- Allow anon + authenticated to update
CREATE POLICY "anon_update_site_assets" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'site-assets')
  WITH CHECK (bucket_id = 'site-assets');

-- Allow anon + authenticated to delete
CREATE POLICY "anon_delete_site_assets" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'site-assets');
