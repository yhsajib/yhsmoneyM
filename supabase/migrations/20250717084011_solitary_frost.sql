/*
  # Add Give/Take (Debt Management) Table

  1. New Tables
    - `give_take`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, person's name)
      - `amount` (numeric, amount given or taken)
      - `date` (date, transaction date)
      - `type` (text, 'give' or 'take')
      - `status` (text, 'pending' or 'settled')
      - `description` (text, optional description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `give_take` table
    - Add policies for authenticated users to manage their own records
*/

CREATE TABLE IF NOT EXISTS give_take (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('give', 'take')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'settled')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE give_take ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own give_take records"
  ON give_take
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own give_take records"
  ON give_take
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own give_take records"
  ON give_take
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own give_take records"
  ON give_take
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_give_take_updated_at
  BEFORE UPDATE ON give_take
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX give_take_user_id_idx ON give_take(user_id);
CREATE INDEX give_take_date_idx ON give_take(date);
CREATE INDEX give_take_status_idx ON give_take(status);