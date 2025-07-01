/*
  # Create Admin Account Setup

  1. Admin Account Creation
    - Creates a function to set up admin accounts
    - Allows upgrading existing users to admin role
    - Provides initial admin account setup

  2. Security
    - Only allows admin role assignment through this function
    - Maintains user data integrity
    - Secure role-based access control

  3. Usage Instructions
    - Run this migration to create the admin setup function
    - Use the function to create or upgrade admin accounts
*/

-- Function to create or upgrade a user to admin role
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text DEFAULT NULL,
  full_name text DEFAULT 'Admin User'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  result json;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NOT NULL THEN
    -- User exists, upgrade to admin
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'::jsonb
    ),
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{full_name}',
      to_jsonb(full_name)
    )
    WHERE id = user_id;

    result := json_build_object(
      'success', true,
      'message', 'User upgraded to admin successfully',
      'user_id', user_id,
      'action', 'upgraded'
    );
  ELSE
    -- User doesn't exist, create new admin user if password provided
    IF user_password IS NOT NULL THEN
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
        user_email,
        crypt(user_password, gen_salt('bf')),
        now(),
        json_build_object('role', 'admin', 'full_name', full_name)::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      ) RETURNING id INTO user_id;

      result := json_build_object(
        'success', true,
        'message', 'Admin user created successfully',
        'user_id', user_id,
        'action', 'created'
      );
    ELSE
      result := json_build_object(
        'success', false,
        'message', 'User does not exist and no password provided for creation',
        'action', 'failed'
      );
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- Create a default admin account (you can change these credentials)
-- Email: admin@nutriflow.id
-- Password: Admin123!@#
-- You should change these credentials after first login
SELECT create_admin_user(
  'admin@nutriflow.id',
  'Admin123!@#',
  'NutriFlow Administrator'
);

-- Function to check if a user is admin (utility function)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_admin_user(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated, anon;

-- Create a view for admin users (optional, for easier querying)
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';

-- Grant access to the view
GRANT SELECT ON admin_users TO service_role;