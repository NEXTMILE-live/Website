/*
# Convert giveaway entries to daily-entry system with 24-hour rolling cooldown

1. Schema Changes
   - Drop the unique email index so the same email can have multiple entries.
   - Add an index on (lower(email), created_at DESC) so eligibility lookups are fast.

2. New Functions
   - `check_entry_eligibility(p_email text)` — returns whether the email can enter now,
     and if not, the timestamp when they become eligible again. Called by the frontend
     before/after showing the form.
   - `submit_daily_entry(...)` — atomically checks the 24-hour window and inserts
     a new entry. Returns success/cooldown status. This is the ONLY way new free
     entries should be created — the direct table INSERT policy will be removed
     so the client cannot bypass the cooldown by inserting directly.

3. Security Changes
   - Remove the anon INSERT policy on giveaway_entries (inserts now go through
     the SECURITY DEFINER function).
   - Add an anon EXECUTE grant on both functions.

4. Important Notes
   - The 24-hour window is ROLLING per person (not calendar-day). Each person's
     clock starts at their last accepted entry timestamp.
   - The database is the source of truth — no client-side timers or cookies.
   - The submit function is SECURITY DEFINER so it can INSERT even though the
     anon role no longer has a direct INSERT policy.
*/

-- 1. Drop the old unique-email constraint
DROP INDEX IF EXISTS giveaway_entries_email_key;

-- 2. Add index for fast eligibility lookups
CREATE INDEX IF NOT EXISTS idx_giveaway_entries_email_created
  ON giveaway_entries (lower(email), created_at DESC);

-- 3. Remove anon direct INSERT policy (inserts go through the function now)
DROP POLICY IF EXISTS "anon_insert_entries" ON giveaway_entries;

-- 4. Eligibility check function
CREATE OR REPLACE FUNCTION check_entry_eligibility(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_entry timestamptz;
  v_next_eligible timestamptz;
  v_now timestamptz := now();
BEGIN
  SELECT created_at INTO v_last_entry
  FROM giveaway_entries
  WHERE lower(email) = lower(p_email)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_entry IS NULL THEN
    RETURN jsonb_build_object(
      'eligible', true,
      'last_entry', null,
      'next_eligible', null,
      'total_entries', 0
    );
  END IF;

  v_next_eligible := v_last_entry + interval '24 hours';

  RETURN jsonb_build_object(
    'eligible', v_now >= v_next_eligible,
    'last_entry', v_last_entry,
    'next_eligible', v_next_eligible,
    'total_entries', (
      SELECT count(*) FROM giveaway_entries WHERE lower(email) = lower(p_email)
    )
  );
END;
$$;

-- 5. Atomic daily entry submission function
CREATE OR REPLACE FUNCTION submit_daily_entry(
  p_full_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_story text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_entry timestamptz;
  v_next_eligible timestamptz;
  v_now timestamptz := now();
  v_new_id uuid;
BEGIN
  -- Lock: prevent race conditions for the same email
  PERFORM pg_advisory_xact_lock(hashtext(lower(p_email)));

  SELECT created_at INTO v_last_entry
  FROM giveaway_entries
  WHERE lower(email) = lower(p_email)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_entry IS NOT NULL THEN
    v_next_eligible := v_last_entry + interval '24 hours';
    IF v_now < v_next_eligible THEN
      RETURN jsonb_build_object(
        'success', false,
        'reason', 'cooldown',
        'next_eligible', v_next_eligible,
        'total_entries', (
          SELECT count(*) FROM giveaway_entries WHERE lower(email) = lower(p_email)
        )
      );
    END IF;
  END IF;

  INSERT INTO giveaway_entries (full_name, email, phone, city, state, story)
  VALUES (p_full_name, lower(p_email), p_phone, p_city, p_state, p_story)
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', true,
    'entry_id', v_new_id,
    'next_eligible', v_now + interval '24 hours',
    'total_entries', (
      SELECT count(*) FROM giveaway_entries WHERE lower(email) = lower(p_email)
    )
  );
END;
$$;

-- 6. Grant execute to anon + authenticated
GRANT EXECUTE ON FUNCTION check_entry_eligibility(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_daily_entry(text, text, text, text, text, text) TO anon, authenticated;
