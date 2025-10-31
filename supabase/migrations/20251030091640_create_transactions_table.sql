/*
  # Create transactions table for THUNDER ACCOUNTANT

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `date` (date) - Transaction date
      - `description` (text) - Transaction description
      - `amount` (numeric) - Transaction amount
      - `type` (text) - Transaction type: Income, Expense, Asset, Liability
      - `created_at` (timestamptz) - Record creation timestamp
      - `user_id` (uuid) - For future auth implementation
  
  2. Security
    - Enable RLS on `transactions` table
    - Add policy for public access (will be restricted after auth is added)
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('Income', 'Expense', 'Asset', 'Liability')),
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Temporary policy for public access during MVP phase
-- Will be restricted to authenticated users later
CREATE POLICY "Allow public access to transactions"
  ON transactions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);