/*
  # Add categories table for income and expense categorization

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, category name)
      - `type` (text, either 'income' or 'expense')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `categories` table
    - Add policies for authenticated users to manage their own categories

  3. Default Categories
    - Create default expense categories for new users
    - Create default income categories for new users
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to add default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default expense categories
  INSERT INTO categories (user_id, name, type) VALUES
    (NEW.id, 'Food & Dining', 'expense'),
    (NEW.id, 'Transportation', 'expense'),
    (NEW.id, 'Shopping', 'expense'),
    (NEW.id, 'Entertainment', 'expense'),
    (NEW.id, 'Bills & Utilities', 'expense'),
    (NEW.id, 'Healthcare', 'expense'),
    (NEW.id, 'Education', 'expense'),
    (NEW.id, 'Travel', 'expense'),
    (NEW.id, 'Personal Care', 'expense'),
    (NEW.id, 'Other', 'expense');

  -- Insert default income categories
  INSERT INTO categories (user_id, name, type) VALUES
    (NEW.id, 'Salary', 'income'),
    (NEW.id, 'Freelance', 'income'),
    (NEW.id, 'Investment', 'income'),
    (NEW.id, 'Business', 'income'),
    (NEW.id, 'Gift', 'income'),
    (NEW.id, 'Other', 'income');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to add default categories when a new user is created
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();