# SEA Catering - Healthy Meal Delivery Service

![SEA Catering Logo](https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop)

**SEA Catering** is Indonesia's premier customizable healthy meal delivery service. Our mission is to make nutritious eating accessible, convenient, and delicious for everyone across the archipelago.

**Slogan**: "Healthy Meals, Anytime, Anywhere"

## 🌟 Features

### Level 1: Landing Page
- **Modern Design**: Beautiful, responsive landing page with hero section
- **About Section**: Company story and mission
- **Features Showcase**: Key service benefits and features
- **Testimonials**: Customer reviews and ratings
- **Contact Information**: Easy ways to get in touch

### Level 2: Menu & Meal Plans
- **Comprehensive Menu**: Detailed meal plans with pricing
- **Plan Details**: Nutritional information, sample meals, and features
- **Interactive Modals**: Detailed view of each meal plan
- **Plan Selection Integration**: Seamless flow from menu to subscription
- **Responsive Design**: Optimized for all device sizes

### Level 3: Subscription System
- **Subscription Form**: Complete meal plan customization
- **Plan Selection**: Diet Plan (Rp30,000), Protein Plan (Rp40,000), Royal Plan (Rp60,000)
- **Meal Types**: Breakfast, Lunch, Dinner options
- **Delivery Days**: Flexible weekly scheduling
- **Price Calculator**: Real-time pricing based on selections
- **Pre-filled Forms**: Auto-populate from selected meal plans
- **Database Integration**: Secure data storage with Supabase

### Level 4: Security & Authentication
- **User Authentication**: Secure sign-up and sign-in system
- **Password Security**: Strong password requirements with validation
- **Password Reset**: Secure password recovery via email
- **Input Sanitization**: Protection against XSS and injection attacks
- **CSRF Protection**: Cross-site request forgery prevention
- **Role-based Access**: Admin and user permissions
- **Data Encryption**: Secure data transmission and storage
- **Rate Limiting**: Protection against brute force attacks

### Level 5: User & Admin Dashboard
- **User Dashboard**: 
  - View active subscriptions
  - Pause/resume subscriptions with date ranges
  - Cancel subscriptions with confirmation
  - Subscription history and details
  - Edit subscription preferences
- **Admin Dashboard**:
  - Business analytics and metrics
  - Subscription growth tracking
  - New subscriptions monitoring
  - Monthly Recurring Revenue (MRR)
  - Customer reactivation tracking
  - Date range filtering
  - Data export functionality
  - Testimonial management
  - User subscription management

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Netlify (recommended)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** for cloning the repository
- A **Supabase account** (free tier available)

## 🛠️ Complete Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/sea-catering.git
cd sea-catering
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Supabase Setup

#### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `sea-catering` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your location
5. Click "Create new project"
6. Wait for the project to be set up (2-3 minutes)

#### 3.2 Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

#### 3.3 Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the following SQL commands one by one:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL,
  image_url text,
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  phone text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('diet', 'protein', 'royal')),
  meal_types text[] NOT NULL,
  delivery_days text[] NOT NULL,
  allergies text,
  total_price numeric NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  user_id uuid REFERENCES auth.users(id),
  pause_start_date timestamptz,
  pause_end_date timestamptz,
  cancelled_at timestamptz,
  reactivated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  message text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  location text DEFAULT 'Indonesia',
  approved boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);

-- RLS Policies for meal_plans
CREATE POLICY "Anyone can read meal plans" ON meal_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage meal plans" ON meal_plans FOR ALL TO authenticated USING (
  (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
);

-- RLS Policies for subscriptions
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
);
CREATE POLICY "Users can create own subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
) WITH CHECK (
  auth.uid() = user_id OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
);

-- RLS Policies for testimonials
CREATE POLICY "Anyone can read approved testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (
  approved = true OR auth.uid() = user_id OR (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
);
CREATE POLICY "Users can create testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Admins can update testimonials" ON testimonials FOR UPDATE TO authenticated USING (
  (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
);
```

#### 3.4 Insert Sample Data

```sql
-- Insert sample meal plans
INSERT INTO meal_plans (name, price, description, features) VALUES
('Diet Plan', 30000, 'Perfect for weight management with balanced, nutritious meals.', ARRAY['Low calorie meals', 'Balanced nutrition', 'Weight management', 'Fresh ingredients']),
('Protein Plan', 40000, 'High-protein meals designed for fitness enthusiasts.', ARRAY['High protein content', 'Muscle building', 'Post-workout meals', 'Premium ingredients']),
('Royal Plan', 60000, 'Premium gourmet meals with the finest ingredients.', ARRAY['Gourmet ingredients', 'Chef-prepared', 'Premium quality', 'Luxury dining']);

-- Insert sample testimonials
INSERT INTO testimonials (name, message, rating, location, approved) VALUES
('Sarah Wijaya', 'SEA Catering has completely transformed my eating habits! The meals are delicious and perfectly portioned.', 5, 'Jakarta', true),
('Ahmad Rahman', 'As a busy professional, SEA Catering has been a lifesaver. The delivery is always on time.', 5, 'Surabaya', true),
('Maria Santos', 'Love the variety of meals and the quality is outstanding. Highly recommended!', 4, 'Bali', true);
```

### Step 4: Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following environment variables (replace with your actual Supabase credentials):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: 
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-anon-key-here` with your actual anon key from Step 3.2
- Never commit the `.env` file to version control

### Step 5: Create Admin Account

#### Option 1: Using the Application (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:5173`

3. Click "Sign Up" and create an account with these credentials:
   - **Email**: `admin@seacatering.id`
   - **Password**: `Admin123!@#`
   - **Full Name**: `SEA Catering Admin`

4. After creating the account, go to your Supabase dashboard:
   - Navigate to **Authentication** > **Users**
   - Find the user you just created
   - Click on the user to edit
   - In the **User Metadata** section, add:
     ```json
     {
       "role": "admin",
       "full_name": "SEA Catering Admin"
     }
     ```
   - Click **Save**

#### Option 2: Direct Database Method

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert admin user directly (replace with your preferred email/password)
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
  'admin@seacatering.id',
  crypt('Admin123!@#', gen_salt('bf')),
  now(),
  '{"role": "admin", "full_name": "SEA Catering Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

### Step 6: Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Default Admin Credentials

**Email**: `admin@seacatering.id`  
**Password**: `Admin123!@#`

**Important Security Notes**:
- Change the default admin password immediately after first login
- Use a strong, unique password for production
- Consider enabling two-factor authentication in Supabase

## 📞 Contact Information

- **Manager**: Brian
- **Phone**: 08123456789
- **Email**: hello@seacatering.id
- **Service Area**: Major Cities Across Indonesia

## 🎯 Testing the Application

### User Features
1. **Sign Up/Sign In**: Create a regular user account
2. **Browse Menu**: View meal plans and their details
3. **Create Subscription**: Select a plan and create a subscription
4. **Dashboard**: Manage your subscriptions (pause, resume, cancel)
5. **Testimonials**: Leave reviews and ratings

### Admin Features
1. **Sign In**: Use the admin credentials above
2. **Admin Dashboard**: Access via the user menu or `/admin` route
3. **Analytics**: View business metrics and subscription growth
4. **Manage Subscriptions**: View and update all user subscriptions
5. **Testimonial Management**: Approve or reject customer testimonials
6. **Data Export**: Export analytics data to CSV

## 🚀 Production Deployment

### Netlify Deployment (Recommended)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Configure Supabase for Production:**
   - In Supabase dashboard, go to **Authentication** > **Settings**
   - Add your production domain to **Site URL**
   - Add your domain to **Redirect URLs**

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📊 Database Schema

### Users (Supabase Auth)
- Managed by Supabase Auth
- Custom metadata: `role`, `full_name`

### Subscriptions Table
```sql
- id (bigint, primary key)
- name (text, required)
- phone (text, required)
- plan (text, required) - 'diet', 'protein', or 'royal'
- meal_types (text[], required)
- delivery_days (text[], required)
- allergies (text, optional)
- total_price (numeric, required)
- status (text, default 'active')
- user_id (uuid, foreign key)
- created_at (timestamp)
- pause_start_date (timestamp, optional)
- pause_end_date (timestamp, optional)
- cancelled_at (timestamp, optional)
- reactivated_at (timestamp, optional)
```

### Testimonials Table
```sql
- id (bigint, primary key)
- name (text, required)
- message (text, required)
- rating (integer, 1-5)
- location (text, default 'Indonesia')
- approved (boolean, default false)
- user_id (uuid, foreign key)
- created_at (timestamp)
```

### Meal Plans Table
```sql
- id (bigint, primary key)
- name (text, required)
- price (numeric, required)
- description (text, required)
- image_url (text, optional)
- features (text[], required)
- created_at (timestamp)
```

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: HTML content is sanitized to prevent script injection
- **CSRF Protection**: Forms include CSRF tokens for security
- **SQL Injection Prevention**: Parameterized queries through Supabase
- **Authentication**: Secure user authentication with Supabase Auth
- **Authorization**: Role-based access control for admin features
- **Rate Limiting**: Client-side rate limiting for form submissions
- **Password Security**: Strong password requirements with validation

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## 🐛 Troubleshooting

### Common Issues

1. **"Auth session missing!" Error**
   - This is normal when not logged in
   - The app handles this gracefully

2. **Environment Variables Not Working**
   - Ensure `.env` file is in the root directory
   - Restart the development server after adding variables
   - Check that variable names start with `VITE_`

3. **Database Connection Issues**
   - Verify Supabase URL and keys are correct
   - Check that RLS policies are properly set up
   - Ensure your IP is not blocked by Supabase

4. **Admin Access Not Working**
   - Verify the user metadata includes `"role": "admin"`
   - Check that the user is properly authenticated
   - Clear browser cache and try again

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase database schema is properly set up
4. Check that RLS policies allow the required operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Manager**: Brian
- **Phone**: 08123456789
- **Email**: hello@seacatering.id

## 🙏 Acknowledgments

- **Pexels** for providing high-quality stock photos
- **Lucide** for beautiful icons
- **Tailwind CSS** for the utility-first CSS framework
- **Supabase** for the backend infrastructure
- **React** and **Vite** for the development framework

---

**SEA Catering** - Healthy Meals, Anytime, Anywhere 🥗✨

## 📋 Quick Start Checklist

- [ ] Clone the repository
- [ ] Install dependencies (`npm install`)
- [ ] Create Supabase project
- [ ] Set up database schema
- [ ] Create `.env` file with Supabase credentials
- [ ] Create admin account
- [ ] Run the application (`npm run dev`)
- [ ] Test user and admin features
- [ ] Deploy to production (optional)

**Estimated Setup Time**: 15-20 minutes