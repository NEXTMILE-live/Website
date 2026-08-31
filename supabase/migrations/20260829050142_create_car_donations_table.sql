/*
# Create car_donations table

1. Purpose
   - Stores vehicle donation submissions from the "Donate Your Car" section.
   - Visitors submit their vehicle info (year, make, model, mileage, condition, contact).
   - Admin can view and manage submissions from the dashboard.

2. New Tables
   - `car_donations`
     - `id` (uuid, primary key)
     - `year` (text, not null) — vehicle year
     - `make` (text, not null) — vehicle make
     - `model` (text, not null) — vehicle model
     - `mileage` (text, not null) — vehicle mileage
     - `clean_title` (boolean, not null) — must have clean title
     - `runs_and_drives` (boolean, not null) — must run and drive
     - `no_accidents` (boolean, not null) — no accidents
     - `up_to_date_maintenance` (boolean, not null) — maintenance up to date
     - `notes` (text, nullable) — additional info from donor
     - `donor_name` (text, not null)
     - `donor_email` (text, not null)
     - `donor_phone` (text, nullable)
     - `city` (text, nullable)
     - `state` (text, nullable)
     - `status` (text, not null default 'pending') — pending, reviewed, accepted, declined
     - `created_at` (timestamptz, default now())

3. Security
   - Enable RLS on `car_donations`.
   - Allow anon + authenticated INSERT (anyone can submit a donation offer).
   - Allow anon + authenticated SELECT, UPDATE, DELETE (admin dashboard manages via anon key).
   - Single-tenant app with password-based admin login.

4. Notes
   - This is a donation form, NOT an entry mechanism. No connection to giveaway entries.
   - The form validates that clean_title, runs_and_drives, no_accidents, and up_to_date_maintenance are all true.
*/

CREATE TABLE IF NOT EXISTS car_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  mileage text NOT NULL,
  clean_title boolean NOT NULL DEFAULT false,
  runs_and_drives boolean NOT NULL DEFAULT false,
  no_accidents boolean NOT NULL DEFAULT false,
  up_to_date_maintenance boolean NOT NULL DEFAULT false,
  notes text,
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  donor_phone text,
  city text,
  state text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE car_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_car_donations" ON car_donations;
CREATE POLICY "anon_select_car_donations" ON car_donations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_car_donations" ON car_donations;
CREATE POLICY "anon_insert_car_donations" ON car_donations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_car_donations" ON car_donations;
CREATE POLICY "anon_update_car_donations" ON car_donations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_car_donations" ON car_donations;
CREATE POLICY "anon_delete_car_donations" ON car_donations FOR DELETE
  TO anon, authenticated USING (true);
