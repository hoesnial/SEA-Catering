/*
  # Add Subscription Management Features

  1. New Columns
    - `subscriptions` table:
      - `status` (active, paused, cancelled)
      - `pause_start_date` (when pause begins)
      - `pause_end_date` (when pause ends)
      - `cancelled_at` (when subscription was cancelled)
      - `reactivated_at` (when subscription was reactivated after cancellation)

  2. Security
    - Update existing policies to handle new status fields
    - Add policies for subscription management operations

  3. Indexes
    - Add indexes for better query performance on dashboard analytics
*/

-- Add subscription management columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'status'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'pause_start_date'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN pause_start_date timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'pause_end_date'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN pause_end_date timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN cancelled_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'reactivated_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN reactivated_at timestamptz;
  END IF;
END $$;

-- Add policies for subscription updates (users can update their own subscriptions)
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policy for admins to update any subscription
CREATE POLICY "Admins can update all subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for better dashboard performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_created_at ON subscriptions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);