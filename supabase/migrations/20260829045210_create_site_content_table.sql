/*
# Create site_content table for editable website content

1. Purpose
   - Stores all editable text, images, and settings for the NEXT MILE giveaway site.
   - The admin dashboard reads and writes this table; the public site reads from it.
   - Single-tenant (no auth) — the admin login is password-based, so anon access is needed.

2. New Tables
   - `site_content`
     - `key` (text, primary key) — identifies the content section (e.g. 'hero', 'giveaway', 'car')
     - `value` (jsonb, not null) — the content data for that section
     - `updated_at` (timestamptz, default now()) — last edit timestamp

3. Security
   - Enable RLS on `site_content`.
   - Allow anon + authenticated SELECT (public site needs to read content).
   - Allow anon + authenticated INSERT/UPDATE/DELETE (admin dashboard writes via anon key).
   - This is a single-tenant app with password-based admin login, so all access goes through the anon role.

4. Notes
   - The frontend uses default hardcoded values as fallback if no row exists yet.
   - On first admin save, a row is upserted with the new content.
*/

CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_content" ON site_content;
CREATE POLICY "anon_select_site_content" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_site_content" ON site_content;
CREATE POLICY "anon_insert_site_content" ON site_content FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_site_content" ON site_content;
CREATE POLICY "anon_update_site_content" ON site_content FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_site_content" ON site_content;
CREATE POLICY "anon_delete_site_content" ON site_content FOR DELETE
  TO anon, authenticated USING (true);
