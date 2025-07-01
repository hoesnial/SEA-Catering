/*
  # Admin Dashboard and Authentication Setup

  1. Admin User Management
    - Create or update admin user with proper metadata
    - Set admin role and full name

  2. Admin Policies
    - Enhanced RLS policies for admin access
    - Admin can read/update all subscriptions and testimonials

  3. Admin Dashboard Functions
    - Helper function to check admin status
    - Dashboard metrics view for analytics

  4. Security
    - Proper role-based access control
    - Secure admin functions
*/

-- Ensure admin user exists with correct metadata
DO $$
DECLARE
  admin_user_id uuid;
  current_metadata jsonb;
BEGIN
  -- Check if admin user exists
  SELECT id, raw_user_meta_data INTO admin_user_id, current_metadata
  FROM auth.users
  WHERE email = 'admin@nutriflow.id';

  IF admin_user_id IS NULL THEN
    -- Create admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@nutriflow.id',
      crypt('Admin123!@#', gen_salt('bf')),
      now(),
      '{"role": "admin", "full_name": "NutriFlow Administrator"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- Update existing user to ensure admin role (fix: single assignment)
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'::jsonb
      ),
      '{full_name}',
      '"NutriFlow Administrator"'::jsonb
    )
    WHERE id = admin_user_id;
  END IF;
END $$;

-- Create function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- Create admin policies for subscriptions
DROP POLICY IF EXISTS "Admins can read all subscriptions" ON subscriptions;
CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;
CREATE POLICY "Admins can update all subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    is_admin() OR auth.uid() = user_id
  )
  WITH CHECK (
    is_admin() OR auth.uid() = user_id
  );

-- Create admin policies for testimonials
DROP POLICY IF EXISTS "Admins can read all testimonials" ON testimonials;
CREATE POLICY "Admins can read all testimonials"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR auth.uid() = user_id OR approved = true
  );

DROP POLICY IF EXISTS "Admins can update testimonials" ON testimonials;
CREATE POLICY "Admins can update testimonials"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Create admin dashboard view for better performance
CREATE OR REPLACE VIEW admin_dashboard_metrics AS
SELECT 
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_subscriptions_30d,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
  COUNT(*) FILTER (WHERE status = 'paused') as paused_subscriptions,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_subscriptions,
  COALESCE(SUM(total_price) FILTER (WHERE status = 'active'), 0) as monthly_recurring_revenue,
  COUNT(*) FILTER (WHERE reactivated_at >= CURRENT_DATE - INTERVAL '30 days') as reactivations_30d,
  COALESCE(AVG(total_price) FILTER (WHERE status = 'active'), 0) as avg_subscription_value,
  COUNT(*) as total_subscriptions
FROM subscriptions;

-- Grant access to admin view
GRANT SELECT ON admin_dashboard_metrics TO authenticated;

-- Create subscription analytics function for date range filtering
CREATE OR REPLACE FUNCTION get_subscription_analytics(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  new_subscriptions bigint,
  active_subscriptions bigint,
  paused_subscriptions bigint,
  cancelled_subscriptions bigint,
  monthly_recurring_revenue numeric,
  reactivations bigint,
  avg_subscription_value numeric,
  total_subscriptions bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE created_at::date BETWEEN start_date AND end_date) as new_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COUNT(*) FILTER (WHERE status = 'paused') as paused_subscriptions,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_subscriptions,
    COALESCE(SUM(total_price) FILTER (WHERE status = 'active'), 0) as monthly_recurring_revenue,
    COUNT(*) FILTER (WHERE reactivated_at::date BETWEEN start_date AND end_date) as reactivations,
    COALESCE(AVG(total_price) FILTER (WHERE status = 'active'), 0) as avg_subscription_value,
    COUNT(*) as total_subscriptions
  FROM subscriptions;
$$;

-- Grant execute permission for analytics function
GRANT EXECUTE ON FUNCTION get_subscription_analytics(date, date) TO authenticated;

-- Create RLS policy for analytics function (only admins can use it)
CREATE OR REPLACE FUNCTION check_admin_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_admin_access() TO authenticated;

-- Create subscription status update function for admins
CREATE OR REPLACE FUNCTION admin_update_subscription_status(
  subscription_id bigint,
  new_status text
)
RETURNS subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result subscriptions;
BEGIN
  -- Check admin access
  PERFORM check_admin_access();
  
  -- Validate status
  IF new_status NOT IN ('active', 'paused', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status. Must be: active, paused, or cancelled';
  END IF;
  
  -- Update subscription
  UPDATE subscriptions 
  SET 
    status = new_status,
    cancelled_at = CASE WHEN new_status = 'cancelled' THEN now() ELSE cancelled_at END,
    reactivated_at = CASE WHEN new_status = 'active' AND status = 'cancelled' THEN now() ELSE reactivated_at END
  WHERE id = subscription_id
  RETURNING * INTO result;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_update_subscription_status(bigint, text) TO authenticated;