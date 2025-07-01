/*
  # Fix subscription RLS policies

  1. Problem
    - Current RLS policies reference `users` table which causes permission denied errors
    - Policies are trying to access `auth.users` directly which is not allowed in RLS context

  2. Solution
    - Update policies to use only `auth.uid()` for user identification
    - Remove admin-specific policies that require user metadata access
    - Simplify policies to work with basic authentication

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies that work with RLS constraints
    - Ensure users can only access their own subscriptions
*/

-- Drop existing policies that cause permission issues
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- Create new simplified policies
CREATE POLICY "Users can create own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to access all subscriptions (for admin operations)
CREATE POLICY "Service role can access all subscriptions"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);