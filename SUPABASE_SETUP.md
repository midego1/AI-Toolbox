# Supabase + Vercel Setup Guide

Complete guide for deploying your AI SaaS platform with Supabase (database + auth) and Vercel (hosting).

---

## 🎯 Why Supabase + Vercel?

### Benefits:
- ✅ **Quick setup** - Get running in 10 minutes
- ✅ **Great free tiers** - Both have generous free plans
- ✅ **Managed infrastructure** - No server management
- ✅ **Automatic scaling** - Handles traffic spikes
- ✅ **Built-in features** - Auth, DB, Storage all included
- ✅ **Preview deployments** - Test before production

### What You Get:

**From Supabase:**
- PostgreSQL database (500MB free)
- Authentication (unlimited users)
- Storage for files (1GB free)
- Real-time subscriptions
- Auto-generated REST API

**From Vercel:**
- Automatic deployments
- Preview environments
- Global CDN
- SSL certificates
- Analytics

---

## 🚀 Quick Start (10 Minutes)

### Step 1: Create Supabase Project (3 minutes)

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New project"**
5. Fill in:
   - **Name:** `ai-toolbox`
   - **Database Password:** (generate strong password - save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free
6. Click **"Create new project"**
7. Wait ~2 minutes for setup

### Step 2: Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon)
2. Go to **API** section
3. Copy these values:

```bash
# You'll need these:
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (secret, never expose to frontend!)
```

4. Go to **Database** section
5. Scroll to **Connection string**
6. Copy the **URI** (replace `[YOUR-PASSWORD]` with your database password)

```bash
# Database connection string:
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth manages this, but we add our fields)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  credits_balance INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  plan_type TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER,
  type TEXT,
  description TEXT,
  stripe_payment_intent_id TEXT,
  ai_job_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- AI Jobs table
CREATE TABLE public.ai_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_type TEXT,
  status TEXT,
  input_data JSONB,
  output_data JSONB,
  credits_used INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON public.ai_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs"
  ON public.ai_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usage logs table
CREATE TABLE public.usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_type TEXT,
  credits_consumed INTEGER,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, subscription_tier, credits_balance)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    'free',
    100
  );

  -- Create initial credit transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 100, 'monthly_allocation', 'Welcome credits - Free tier');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_ai_jobs_user_id ON public.ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_created_at ON public.ai_jobs(created_at);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_timestamp ON public.usage_logs(timestamp);
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

### Step 4: Configure Supabase Auth

1. In Supabase dashboard, go to **Authentication**
2. Go to **Providers**
3. **Email provider** should be enabled by default

**Optional: Enable OAuth (Google, GitHub, etc.):**

For **Google:**
1. Click **"Google"** provider
2. Enable it
3. Get Client ID & Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Add authorized redirect URL: `https://xxxxx.supabase.co/auth/v1/callback`

For **GitHub:**
1. Click **"GitHub"** provider
2. Enable it
3. Get Client ID & Secret from [GitHub Developer Settings](https://github.com/settings/developers)
4. Add callback URL: `https://xxxxx.supabase.co/auth/v1/callback`

### Step 5: Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Add New Project"**
3. Import your `AI-Toolbox` repository
4. **Configure Environment Variables:**

Click **"Environment Variables"** and add:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)

# Database (for Prisma - alternative to Supabase client)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# NextAuth (optional - if keeping NextAuth alongside Supabase)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_YEARLY=price_...
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_...

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLOUD_VISION_API_KEY=...
DEEPL_API_KEY=...
REPLICATE_API_TOKEN=r8_...
```

5. Click **"Deploy"**
6. Wait ~2-3 minutes
7. Your app is live! 🎉

---

## 🔄 Migration from NextAuth to Supabase Auth

If you want to fully migrate to Supabase Auth:

### Install Supabase Client

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Create Supabase Client

```typescript
// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()
```

```typescript
// src/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
```

### Update Login Page

```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // Optional: Google Sign In
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    // Your UI here with handleLogin and handleGoogleSignIn
  )
}
```

### Update Signup Page

```typescript
// src/app/(auth)/signup/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // This will be available in handle_new_user() function
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // User created! Profile automatically created by trigger
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    // Your UI here with handleSignup
  )
}
```

### Protect Routes

```typescript
// src/app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div>
      {/* Pass profile to children if needed */}
      {children}
    </div>
  )
}
```

### Get Current User

```typescript
// In any server component
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

// Get user profile with credits
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

console.log(profile.credits_balance) // 450
```

```typescript
// In any client component
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const supabase = createClient()
const [user, setUser] = useState(null)

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user)
  })
}, [])
```

---

## 💾 Database Access

You have two options for database access:

### Option 1: Supabase Client (Recommended)

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Create AI job
const { data: job } = await supabase
  .from('ai_jobs')
  .insert({
    user_id: userId,
    job_type: 'translation',
    status: 'processing',
    input_data: { text: 'Hello' },
    credits_used: 1,
  })
  .select()
  .single()

// Update credits
const { data } = await supabase
  .from('profiles')
  .update({ credits_balance: newBalance })
  .eq('id', userId)
```

### Option 2: Keep Prisma (If you prefer)

Update `prisma/schema.prisma` to use Supabase:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Rest of your schema stays the same
// But use table names: profiles, ai_jobs, etc.
```

Then use Prisma as before:
```typescript
import { db } from '@/lib/db'

const user = await db.profiles.findUnique({
  where: { id: userId }
})
```

---

## 🎨 Supabase Storage (Bonus!)

Use Supabase Storage for file uploads (OCR images, generated images, etc.):

### Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **"New bucket"**
3. Name: `ai-uploads`
4. Make it **public** or **private** (your choice)
5. Click **"Create bucket"**

### Upload Files

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Upload file
async function uploadFile(file: File) {
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('ai-uploads')
    .upload(`user-uploads/${fileName}`, file)

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('ai-uploads')
    .getPublicUrl(`user-uploads/${fileName}`)

  return publicUrl
}
```

Perfect for OCR tool, image generation, headshot uploads!

---

## 📊 Cost Breakdown

### Free Tier (Perfect for MVP):
- **Supabase Free:**
  - 500 MB database
  - 1 GB storage
  - 2 GB bandwidth/month
  - Unlimited API requests
  - 50,000 monthly active users

- **Vercel Free:**
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS

**Total: $0/month for starting out!**

### As You Grow:
- **Supabase Pro:** $25/month
  - 8 GB database
  - 100 GB storage
  - 50 GB bandwidth
  - Daily backups

- **Vercel Pro:** $20/month
  - 1 TB bandwidth
  - Advanced analytics

**Total: $45/month for 10k-50k users**

Much cheaper than self-hosting at small scale, but you keep the option to migrate data out later if needed!

---

## ✅ Why This Setup is Great

### 1. **Quick to Launch**
- 10 minutes setup
- No server management
- Automatic scaling

### 2. **Generous Free Tiers**
- Start free
- Scale as you grow
- Predictable pricing

### 3. **All-in-One Backend**
- Database
- Authentication
- Storage
- Real-time
- REST API

### 4. **Easy Development**
- Supabase Studio (SQL editor, table editor)
- Vercel preview deployments
- Great DX (developer experience)

### 5. **Future Flexibility**
- Own your data (can export anytime)
- Standard PostgreSQL (not proprietary)
- Can migrate to self-hosting later if needed

---

## 🚀 Next Steps

1. **Create Supabase project** (3 min)
2. **Run SQL schema** (2 min)
3. **Deploy to Vercel** (5 min)
4. **Test signup/login**
5. **Add AI tools** as you go

---

## 🆘 Troubleshooting

### "Invalid API key"
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon** key (not service role)

### "Database connection failed"
- Check `DATABASE_URL` has correct password
- Password should be URL-encoded if it contains special characters

### "User not found after signup"
- Check the `handle_new_user()` trigger ran successfully
- Go to Supabase → Database → Triggers
- Should see `on_auth_user_created`

### "Permission denied"
- Check Row Level Security policies
- Make sure user is authenticated
- Verify policy logic in Supabase → Authentication → Policies

---

**Ready to deploy?** Let's do it! 🎉
