/*
# Add anon SELECT policy to giveaway_entries

The admin dashboard uses the anon key (no auth) to read entries.
The existing SELECT policy only grants access to `authenticated`,
so the dashboard gets zero rows. This migration adds anon to the
SELECT policy so the dashboard can load free entries.

1. Security
   - Drop and re-create the SELECT policy on giveaway_entries to
     include both anon and authenticated roles.
*/

DROP POLICY IF EXISTS "authenticated_select_entries" ON giveaway_entries;
CREATE POLICY "anon_select_entries" ON giveaway_entries
  FOR SELECT TO anon, authenticated USING (true);
