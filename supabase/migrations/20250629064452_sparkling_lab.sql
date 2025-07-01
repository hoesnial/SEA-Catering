/*
  # SEA Catering Database Schema

  1. New Tables
    - `subscriptions`
      - `id` (bigint, primary key)
      - `name` (text, required)
      - `phone` (text, required)
      - `plan` (text, required - diet/protein/royal)
      - `meal_types` (text array, required)
      - `delivery_days` (text array, required)
      - `allergies` (text, optional)
      - `total_price` (numeric, required)
      - `created_at` (timestamp)

    - `meal_plans`
      - `id` (bigint, primary key)
      - `name` (text, required)
      - `price` (numeric, required)
      - `description` (text, required)
      - `image_url` (text, optional)
      - `features` (text array, required)
      - `created_at` (timestamp)

    - `testimonials`
      - `id` (bigint, primary key)
      - `name` (text, required)
      - `message` (text, required)
      - `rating` (integer, required, 1-5)
      - `location` (text, optional)
      - `approved` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access and authenticated write access
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('diet', 'protein', 'royal')),
  meal_types text[] NOT NULL,
  delivery_days text[] NOT NULL,
  allergies text,
  total_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL,
  image_url text,
  features text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  message text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  location text DEFAULT 'Indonesia',
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Anyone can create subscriptions"
  ON subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read subscriptions"
  ON subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for meal_plans
CREATE POLICY "Anyone can read meal plans"
  ON meal_plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create meal plans"
  ON meal_plans
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update meal plans"
  ON meal_plans
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Create policies for testimonials
CREATE POLICY "Anyone can create testimonials"
  ON testimonials
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read approved testimonials"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Anyone can read all testimonials"
  ON testimonials
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert sample meal plans
INSERT INTO meal_plans (name, price, description, features) VALUES
('Diet Plan', 30000, 'Perfect for weight management with balanced, low-calorie meals', ARRAY['Low calorie', 'Balanced nutrition', 'Weight management', 'Fresh ingredients']),
('Protein Plan', 40000, 'High-protein meals designed for fitness enthusiasts and active lifestyles', ARRAY['High protein', 'Muscle building', 'Post-workout recovery', 'Athletic performance']),
('Royal Plan', 60000, 'Premium meals with the finest ingredients and gourmet preparation', ARRAY['Premium ingredients', 'Gourmet preparation', 'Luxury dining', 'Chef-crafted meals']);

-- Insert sample testimonials (approved)
INSERT INTO testimonials (name, message, rating, location, approved) VALUES
('Sarah Wijaya', 'SEA Catering has completely transformed my eating habits! The meals are not only delicious but also perfectly portioned. I''ve lost 8kg in 3 months while feeling more energetic than ever.', 5, 'Jakarta', true),
('Ahmad Rahman', 'As a busy professional, SEA Catering has been a lifesaver. The Premium Wellness Plan fits perfectly with my schedule, and the nutritionist consultation helped me understand my dietary needs better.', 5, 'Surabaya', true),
('Maria Santos', 'The Family Feast Plan has made healthy eating so much easier for our household. My kids actually love the meals, which is a miracle! The portions are generous and the flavors are authentic.', 4, 'Bali', true),
('David Tanaka', 'I''m an athlete and the Performance Plan has significantly improved my training results. The high-protein meals and pre/post workout options are perfectly timed.', 5, 'Medan', true),
('Rina Sari', 'The Plant-Based Power Plan exceeded my expectations! As a vegan, it''s hard to find varied and nutritious meal options, but SEA Catering delivers amazing plant-based meals.', 5, 'Bandung', true),
('Kevin Lim', 'Great service and quality meals. The Weight Management Plan helped me reach my goals without feeling deprived. The customer service team is also very responsive.', 4, 'Yogyakarta', true);