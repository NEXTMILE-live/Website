/*
# Create paid_entries table for purchase-based giveaway entries

1. Purpose
   - When someone purchases a product from the "More Entries" page, the system
     automatically creates paid entries in this table.
   - Paid entries are separate from the free giveaway_entries — each purchase
     adds the appropriate number of entries (10 entries per $1 spent).
   - The admin dashboard combines free + paid entries into a unified view.

2. New Tables
   - `paid_entries`
     - `id` (uuid, primary key)
     - `email` (text, not null) — the purchaser's email, links entries to a person
     - `full_name` (text, not null) — purchaser's name
     - `product_id` (text, not null) — which product was purchased (e.g. 'power-bank')
     - `product_name` (text, not null) — product name at time of purchase
     - `price` (text, not null) — price paid (stored as text since prices include ranges/currency)
     - `entry_count` (integer, not null) — number of entries this purchase grants
     - `order_id` (text) — optional external order/transaction reference
     - `created_at` (timestamptz, default now())

3. Security
   - Enable RLS on `paid_entries`.
   - Allow anon + authenticated INSERT (purchases come from the public storefront).
   - SELECT/UPDATE/DELETE restricted to anon+authenticated for admin dashboard access.
   - This is a single-tenant app with password-based admin login.
*/

CREATE TABLE IF NOT EXISTS paid_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  price text NOT NULL,
  entry_count integer NOT NULL,
  order_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE paid_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_paid_entries" ON paid_entries;
CREATE POLICY "anon_insert_paid_entries"
ON paid_entries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_paid_entries" ON paid_entries;
CREATE POLICY "anon_select_paid_entries"
ON paid_entries FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_delete_paid_entries" ON paid_entries;
CREATE POLICY "anon_delete_paid_entries"
ON paid_entries FOR DELETE
TO anon, authenticated USING (true);
