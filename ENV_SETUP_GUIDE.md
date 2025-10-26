# Environment Variables Setup Guide

Complete guide to getting actual values for all environment variables needed for deployment.

## 🎯 Quick Reference

| Variable | How to Get It | Time | Cost |
|----------|--------------|------|------|
| `DATABASE_URL` | Create database (see below) | 2 min | Free |
| `NEXTAUTH_SECRET` | Generate random string | 10 sec | Free |
| `STRIPE_SECRET_KEY` | Sign up at Stripe | 5 min | Free |
| AI API Keys | Sign up at each service | 5 min each | Pay-as-you-go |

---

## 1. DATABASE_URL

You need a PostgreSQL database. Here are your options:

### Option A: Vercel Postgres (Easiest, Recommended for Vercel deployments)

**Steps:**
1. Go to your Vercel project dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Click **"Continue"**
6. Choose a name (e.g., "ai-toolbox-db")
7. Select region (closest to your users)
8. Click **"Create"**

**Result:**
- ✅ `DATABASE_URL` is automatically injected into your environment
- ✅ No manual configuration needed
- ✅ Connection pooling built-in
- ✅ Automatic backups

**Cost:** Free tier includes 256 MB, then $0.50/GB/month

**You don't need to copy anything** - Vercel automatically adds it!

---

### Option B: Neon (Great free tier, recommended for development)

**Steps:**
1. Go to **[neon.tech](https://neon.tech)**
2. Click **"Sign Up"** (use GitHub)
3. Click **"Create a project"**
4. Choose:
   - Name: `ai-toolbox`
   - Region: (closest to you)
   - Postgres version: 15 (default)
5. Click **"Create project"**
6. Copy the connection string shown

**Result - Your DATABASE_URL looks like:**
```bash
DATABASE_URL="postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Cost:** Free tier includes:
- 0.5 GB storage
- 1 database
- Auto-suspend after inactivity

**Where to use it:**
- In Vercel: Dashboard → Settings → Environment Variables
- Locally: Copy to `.env.local`

---

### Option C: Supabase (Free tier + bonus features)

**Steps:**
1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign in with GitHub
4. Click **"New project"**
5. Fill in:
   - Name: `ai-toolbox`
   - Database Password: (generate strong password)
   - Region: (closest to you)
6. Click **"Create new project"** (takes ~2 minutes)
7. Go to **Settings** → **Database**
8. Scroll to **Connection string**
9. Select **"URI"**
10. Copy the connection string
11. Replace `[YOUR-PASSWORD]` with your actual password

**Result - Your DATABASE_URL looks like:**
```bash
DATABASE_URL="postgresql://postgres:your-password@db.abcdefgh.supabase.co:5432/postgres"
```

**Bonus:** Supabase also gives you:
- Authentication (alternative to NextAuth)
- Storage buckets
- Real-time subscriptions
- REST API

**Cost:** Free tier includes:
- 500 MB database
- 1 GB storage
- 50,000 monthly active users

---

### Option D: Railway (Simple, one-click)

**Steps:**
1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. Click **"Provision PostgreSQL"**
5. Click on the database
6. Go to **"Connect"** tab
7. Copy **"Postgres Connection URL"**

**Result - Your DATABASE_URL looks like:**
```bash
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"
```

**Cost:** $5 credit free, then pay-as-you-go

---

### Format Explanation

All PostgreSQL connection strings follow this format:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?options
```

Example:
```bash
postgresql://myuser:mypassword@localhost:5432/ai_toolbox?schema=public
```

**For Vercel/Serverless, add connection pooling:**
```bash
postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1
```

---

## 2. NEXTAUTH_SECRET

This is a random secret key for encrypting JWT tokens.

### How to Generate

**Option A: Using OpenSSL (Mac/Linux)**

```bash
openssl rand -base64 32
```

**Example output:**
```
Jk7xY9mP3nQ2rT8sU4vW6xZ1aB5cD0eF7gH9iJ2kL4mN6oP8qR0sT
```

**Option B: Using Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C: Online Generator**

1. Go to **[generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)**
2. Copy the generated string

**Option D: Manual (not recommended)**

Just create a long random string:
```
my-super-secret-key-that-is-very-long-and-random-12345
```

### Your NEXTAUTH_SECRET value:

```bash
NEXTAUTH_SECRET="Jk7xY9mP3nQ2rT8sU4vW6xZ1aB5cD0eF7gH9iJ2kL4mN6oP8qR0sT"
```

**Important:**
- ✅ Use different secrets for production vs preview
- ✅ Never commit to Git
- ✅ Store securely in Vercel dashboard

---

## 3. NEXTAUTH_URL

This is your application's URL.

### How to Set

**For Vercel (Automatic):**
Vercel automatically sets this to your deployment URL. You can skip this!

**For Local Development:**
```bash
NEXTAUTH_URL="http://localhost:3000"
```

**For Production (if not using Vercel):**
```bash
NEXTAUTH_URL="https://your-domain.com"
```

**Examples:**
```bash
# Vercel production
NEXTAUTH_URL="https://ai-toolbox.vercel.app"

# Custom domain
NEXTAUTH_URL="https://aitoolbox.com"

# Local development
NEXTAUTH_URL="http://localhost:3000"
```

---

## 4. Stripe Keys (For Payments)

### Steps to Get Stripe Keys:

1. Go to **[stripe.com](https://stripe.com)**
2. Click **"Sign in"** or **"Start now"**
3. Create account (use business email)
4. Complete verification (can skip and use test mode)
5. Go to **Developers** → **API keys**

### You'll see 4 keys:

#### A. Test Keys (for development)
```bash
# Publishable key (public, safe to expose)
STRIPE_PUBLISHABLE_KEY="pk_test_51Abc...xyz"

# Secret key (private, never expose)
STRIPE_SECRET_KEY="sk_test_51Abc...xyz"
```

#### B. Webhook Secret (for receiving events)

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy **"Signing secret"** (starts with `whsec_`)

```bash
STRIPE_WEBHOOK_SECRET="whsec_abc123..."
```

#### C. Price IDs (for subscription plans)

**Create Products in Stripe:**

1. Go to **Products** → **Add product**
2. Create 3 products:

**Pro Plan - Monthly:**
- Name: "Pro Plan - Monthly"
- Price: $29.00
- Billing period: Monthly
- Copy the Price ID: `price_1Abc...`

**Pro Plan - Yearly:**
- Name: "Pro Plan - Yearly"
- Price: $290.00 (or your yearly price)
- Billing period: Yearly
- Copy the Price ID: `price_1Def...`

**Enterprise Plan - Monthly:**
- Name: "Enterprise Plan - Monthly"
- Price: $99.00
- Billing period: Monthly
- Copy the Price ID: `price_1Ghi...`

**Enterprise Plan - Yearly:**
- Name: "Enterprise Plan - Yearly"
- Price: $990.00
- Billing period: Yearly
- Copy the Price ID: `price_1Jkl...`

**Add to environment variables:**
```bash
STRIPE_PRICE_ID_PRO_MONTHLY="price_1Abc..."
STRIPE_PRICE_ID_PRO_YEARLY="price_1Def..."
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY="price_1Ghi..."
STRIPE_PRICE_ID_ENTERPRISE_YEARLY="price_1Jkl..."
```

### Complete Stripe Configuration:

```bash
# Test mode (for development)
STRIPE_SECRET_KEY="sk_test_51Abc..."
STRIPE_PUBLISHABLE_KEY="pk_test_51Abc..."
STRIPE_WEBHOOK_SECRET="whsec_abc123..."

# Price IDs
STRIPE_PRICE_ID_PRO_MONTHLY="price_1Abc..."
STRIPE_PRICE_ID_PRO_YEARLY="price_1Def..."
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY="price_1Ghi..."
STRIPE_PRICE_ID_ENTERPRISE_YEARLY="price_1Jkl..."
```

**When going to production:**
- Activate your Stripe account
- Switch to live keys (`pk_live_...` and `sk_live_...`)
- Create live webhook endpoint
- Create live products and copy new price IDs

---

## 5. AI Service API Keys

### OpenAI (for image generation, GPT)

1. Go to **[platform.openai.com](https://platform.openai.com)**
2. Sign up / Log in
3. Go to **API keys** (left sidebar)
4. Click **"Create new secret key"**
5. Name it: "AI Toolbox"
6. Copy the key (starts with `sk-`)

```bash
OPENAI_API_KEY="sk-abc123..."
```

**Cost:** Pay-as-you-go
- GPT-4: ~$0.03 per 1K tokens
- DALL-E 3: ~$0.04 per image

---

### Anthropic Claude (for text generation, recommendations)

1. Go to **[console.anthropic.com](https://console.anthropic.com)**
2. Sign up / Log in
3. Go to **API Keys**
4. Click **"Create Key"**
5. Name it: "AI Toolbox"
6. Copy the key (starts with `sk-ant-`)

```bash
ANTHROPIC_API_KEY="sk-ant-abc123..."
```

**Cost:** Pay-as-you-go
- Claude 3.5 Sonnet: ~$3 per 1M input tokens

---

### Google Cloud Vision (for OCR)

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. Create a new project or select existing
3. Enable **Cloud Vision API**:
   - Search for "Vision API"
   - Click **"Enable"**
4. Go to **APIs & Services** → **Credentials**
5. Click **"Create Credentials"** → **"API Key"**
6. Copy the API key

```bash
GOOGLE_CLOUD_VISION_API_KEY="AIza..."
```

**Cost:** Free tier includes:
- 1,000 OCR requests/month free
- Then $1.50 per 1,000 requests

---

### DeepL (for translation)

1. Go to **[deepl.com/pro-api](https://www.deepl.com/pro-api)**
2. Click **"Sign up for free"**
3. Choose **"DeepL API Free"** plan
4. Verify email
5. Go to **Account** → **API Key**
6. Copy the API key

```bash
DEEPL_API_KEY="abc123-..."
```

**Cost:** Free tier includes:
- 500,000 characters/month free
- Then ~$5 per 1M characters

---

### Replicate (for AI models like headshots)

1. Go to **[replicate.com](https://replicate.com)**
2. Sign up with GitHub
3. Go to **Account** → **API tokens**
4. Copy your API token (starts with `r8_`)

```bash
REPLICATE_API_TOKEN="r8_abc123..."
```

**Cost:** Pay-as-you-go
- Varies by model
- ~$0.0002 - $0.01 per run

---

## 📝 Complete Example .env File

Here's what your complete `.env` file should look like:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="Jk7xY9mP3nQ2rT8sU4vW6xZ1aB5cD0eF7gH9iJ2kL4mN6oP8qR0sT"

# Stripe (Test Mode)
STRIPE_SECRET_KEY="sk_test_51Abc...xyz"
STRIPE_PUBLISHABLE_KEY="pk_test_51Abc...xyz"
STRIPE_WEBHOOK_SECRET="whsec_abc123..."

# Stripe Price IDs
STRIPE_PRICE_ID_PRO_MONTHLY="price_1Abc..."
STRIPE_PRICE_ID_PRO_YEARLY="price_1Def..."
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY="price_1Ghi..."
STRIPE_PRICE_ID_ENTERPRISE_YEARLY="price_1Jkl..."

# AI Services
OPENAI_API_KEY="sk-abc123..."
ANTHROPIC_API_KEY="sk-ant-abc123..."
GOOGLE_CLOUD_VISION_API_KEY="AIza..."
DEEPL_API_KEY="abc123-..."
REPLICATE_API_TOKEN="r8_abc123..."

# File Storage (Optional)
STORAGE_BUCKET_NAME="ai-toolbox-storage"
STORAGE_ACCESS_KEY="..."
STORAGE_SECRET_KEY="..."
STORAGE_REGION="auto"
STORAGE_ENDPOINT="..."
```

---

## 🚀 Adding to Vercel

Once you have all values:

### Method 1: Vercel Dashboard (Recommended)

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Click **"Add"**
   - Key: `DATABASE_URL`
   - Value: `postgresql://...`
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**
4. Repeat for all variables

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Add variables one by one
vercel env add DATABASE_URL
# Paste the value when prompted

vercel env add NEXTAUTH_SECRET
# Paste the value when prompted

# ... repeat for all variables
```

### Method 3: Import from .env file

```bash
# Create .env.production file locally
# Add all variables

# Use Vercel CLI to bulk import
vercel env pull .env.vercel
# Then manually add to dashboard
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use different keys for development/production
- Store secrets only in Vercel dashboard (encrypted)
- Use `.env.local` for local development (not committed)
- Rotate keys periodically
- Use test keys for preview deployments

### ❌ DON'T:
- Commit `.env` files to Git
- Share keys in Slack/email
- Use production keys in development
- Hardcode secrets in code
- Expose secret keys in frontend

---

## 🎯 Minimum Viable Setup

Want to deploy quickly? Start with just these:

```bash
# Minimum for deployment
DATABASE_URL="postgresql://..."        # From Vercel Postgres or Neon
NEXTAUTH_SECRET="Jk7x..."             # Generate with openssl
```

That's enough to:
- ✅ Deploy to Vercel
- ✅ Create accounts
- ✅ Login/logout
- ✅ View dashboard

Add AI keys later when ready to enable those features!

---

## 📞 Getting Help

### If you're stuck:

**Database issues:**
- Neon: [docs.neon.tech](https://neon.tech/docs)
- Vercel Postgres: [vercel.com/docs/storage](https://vercel.com/docs/storage/vercel-postgres)

**Stripe issues:**
- Stripe Docs: [stripe.com/docs](https://stripe.com/docs)
- Test mode: Use test cards like `4242 4242 4242 4242`

**AI API issues:**
- OpenAI: [platform.openai.com/docs](https://platform.openai.com/docs)
- Anthropic: [docs.anthropic.com](https://docs.anthropic.com)

---

## ✅ Quick Checklist

Before deploying, make sure you have:

- [ ] Database URL (from Vercel, Neon, or other)
- [ ] NEXTAUTH_SECRET (generated with openssl)
- [ ] Stripe keys (test mode is fine to start)
- [ ] At least one AI API key (if you want to test AI features)

**All set?** Head to Vercel and deploy! 🚀
