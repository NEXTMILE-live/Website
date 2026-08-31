/*
# Add anon DELETE/UPDATE policies to giveaway_entries

The admin dashboard uses the anon key to delete entries.
Existing DELETE and UPDATE policies only grant access to `authenticated`.
This adds anon role to both policies.

1. Security
   - Re-create DELETE policy on giveaway_entries for anon + authenticated.
   - Re-create UPDATE policy on giveaway_entries for anon + authenticated.
*/

DROP POLICY IF EXISTS "authenticated_delete_entries" ON giveaway_entries;
CREATE POLICY "anon_delete_entries" ON giveaway_entries
  FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_update_entries" ON giveaway_entries;
CREATE POLICY "anon_update_entries" ON giveaway_entries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
