/*
# Create giveaway_entries table (single-tenant, no auth)

1. New Tables
- `giveaway_entries`
  - `id` (uuid, primary key)
  - `full_name` (text, not null) — entrant's full name
  - `email` (text, not null) — entrant's email, used for one-entry-per-person enforcement
  - `phone` (text) — optional phone number
  - `city` (text) — optional city
  - `state` (text) — optional state/region
  - `story` (text) — optional short note about why they need the car
  - `created_at` (timestamptz, default now())
2. Constraints
- Unique constraint on `email` to enforce one free entry per eligible person.
3. Security
- Enable RLS on `giveaway_entries`.
- Allow anon + authenticated INSERT (so visitors can enter without signing in).
- Allow anon + authenticated SELECT only of aggregate-safe data? No — keep it simple and locked down: SELECT is disabled for anon/authenticated to protect entrant privacy. Aggregate counts are computed server-side if needed later.
  Actually, for a public giveaway the frontend needs to show a live entry count. To avoid exposing PII, we do NOT allow SELECT on the table; instead the frontend will not display a live count for now.
- No UPDATE or DELETE policies — entries are immutable once submitted.
*/

CREATE TABLE IF NOT EXISTS giveaway_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  state text,
  story text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS giveaway_entries_email_key ON giveaway_entries (lower(email));

ALTER TABLE giveaway_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_entries" ON giveaway_entries;
CREATE POLICY "anon_insert_entries"
ON giveaway_entries FOR INSERT
TO anon, authenticated
WITH CHECK (true);
