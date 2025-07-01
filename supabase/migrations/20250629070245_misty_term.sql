/*
  # Security Update for SEA Catering Authentication

  1. Database Schema Changes
    - Add `user_id` column to `subscriptions` table linking to auth.users
    - Add `user_id` column to `testimonials` table linking to auth.users

  2. Security Policies
    - Update subscription policies to require authentication
    - Users can only access their own subscriptions
    - Admins can access all subscriptions
    - Update testimonial policies for authenticated users
    - Admins can manage meal plans

  3. Access Control
    - Implement role-based access control
    - Secure user data with Row Level Security
*/

-- Add user_id column to subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add user_id column to testimonials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update subscription policies to require authentication
DROP POLICY IF EXISTS "Anyone can create subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Anyone can read subscriptions" ON subscriptions;

CREATE POLICY "Authenticated users can create subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Update testimonial policies
DROP POLICY IF EXISTS "Anyone can create testimonials" ON testimonials;

CREATE POLICY "Authenticated users can create testimonials"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own testimonials"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add admin policies for testimonials
CREATE POLICY "Admins can update testimonials"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can read all testimonials"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Meal plans policies (admins can manage, everyone can read)
DROP POLICY IF EXISTS "Anyone can create meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Anyone can update meal plans" ON meal_plans;

CREATE POLICY "Admins can create meal plans"
  ON meal_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update meal plans"
  ON meal_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete meal plans"
  ON meal_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );