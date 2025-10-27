# 🚀 Complete Vercel Deployment Guide

This guide will help you deploy your AI Toolbox application to Vercel with automatic builds after pushing to GitHub.

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ GitHub account with your repository
2. ✅ [Convex](https://convex.dev) account (free)
3. ✅ [Clerk](https://clerk.com) account (free tier: 10,000 MAU)
4. ✅ [Stripe](https://stripe.com) account (for payments)
5. ✅ [Vercel](https://vercel.com) account (free)

---

## 🌿 Multi-Branch Strategy

For managing development, staging, and production environments:

📖 **[See Branch Strategy Guide](./BRANCH_STRATEGY_GUIDE.md)** for:
- Setting up develop/staging/main branches
- Separate environment variables per branch
- Testing workflow
- Deploy to production safely

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   GitHub    │  (Code Repository)
└──────┬──────┘
       │ push
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │ ──▶ │   Convex    │     │    Clerk   │
│ (Frontend)  │     │  (Backend)  │     │   (Auth)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   Stripe    │  (Payments)
└─────────────┘
```

---

## 📦 Part 1: Convex Setup (Backend)

### Step 1: Create Convex Deployment

1. **Install Convex CLI** (if not installed):
   ```bash
   npm install -g convex
   ```

2. **Deploy Convex to Production**:
   ```bash
   npx convex deploy --prod
   ```
   
   This will:
   - Prompt you to login/signup
   - Create a production deployment
   - Deploy your schema and functions
   - Give you a URL like: `https://abc123xyz.convex.cloud`

3. **Save your Convex URL**:
   - Copy the deployment URL
   - You'll need it in Part 2

### Step 2: Set Convex Environment Variables

In your Convex dashboard at [dashboard.convex.dev](https://dashboard.convex.dev):

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```bash
# Required for Stripe
STRIPE_SECRET_KEY=sk_test_...  # Get from Stripe Dashboard
STRIPE_PRO_PRICE_ID=price_...   # Create in Stripe
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Required for Clerk webhook (optional)
CLERK_SECRET_KEY=sk_test_...    # Get from Clerk Dashboard
```

**To add via CLI**:
```bash
npx convex env set STRIPE_SECRET_KEY sk_test_your_key_here
```

---

## 🔐 Part 2: Clerk Setup (Authentication)

### Step 1: Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up
2. Click **"Add Application"**
3. Fill in details:
   - **Name**: AI Toolbox
   - **Authentication**: Email, Google (or other providers)
4. Click **"Create"**

### Step 2: Get Clerk Keys

From Clerk Dashboard → **API Keys**:

1. Copy these two keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)

### Step 3: Configure Allowed Domains

In Clerk Dashboard → **Instances**:

1. Add your production domain:
   - For Vercel: `your-app.vercel.app`
   - For custom domain: `yourdomain.com`

### Step 4: Set Up Clerk Webhook (Optional but Recommended)

In Clerk Dashboard → **Webhooks**:

1. Click **"Add Endpoint"**
2. Set the endpoint URL:
   ```
   https://your-convex-deployment.convex.site/api/clerk-webhook
   ```
   (Replace with your actual Convex URL)
3. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
4. Copy the **Signing Secret**: `whsec_...`

---

## 💳 Part 3: Stripe Setup (Payments)

### Step 1: Create Products & Prices

In [Stripe Dashboard](https://dashboard.stripe.com/test/products):

1. **Create Pro Plan**:
   - Name: "Pro Plan"
   - Price: $29/month
   - Recurring: Monthly
   - Copy the `price_id` (starts with `price_`)

2. **Create Enterprise Plan**:
   - Name: "Enterprise Plan"
   - Price: $99/month
   - Recurring: Monthly
   - Copy the `price_id`

### Step 2: Get Stripe Keys

From Stripe Dashboard → **Developers** → **API keys**:

1. Copy these keys:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)

### Step 3: Set Up Stripe Webhook

In Stripe Dashboard → **Developers** → **Webhooks**:

1. Click **"Add endpoint"**
2. Endpoint URL:
   ```
   https://your-app.vercel.app/api/stripe/webhook
   ```
   (Update after deployment)
3. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
4. Copy the **Signing Secret**: `whsec_...`

---

## 🚀 Part 4: Deploy to Vercel

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository (`midego1/AI-Toolbox`)
4. Vercel will auto-detect Next.js

### Step 2: Configure Build Settings

Vercel will auto-detect these from `vercel.json`:

- **Framework**: Next.js
- **Build Command**: `next build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel Dashboard → **Environment Variables**:

**Add these required variables:**

```bash
# Convex (from Part 1)
NEXT_PUBLIC_CONVEX_URL=https://abc123xyz.convex.cloud

# Clerk (from Part 2)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (from Part 3)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (from Part 3)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# App URL (auto-set by Vercel, or custom domain)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**How to add each variable:**

1. Click **"Add Variable"**
2. Enter the key (e.g., `NEXT_PUBLIC_CONVEX_URL`)
3. Enter the value (paste your key)
4. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

---

## 🔄 Automatic Deployments

### How It Works

After the initial setup, **every push to GitHub triggers a deployment**:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# ✅ Detects the push
# ✅ Builds your app
# ✅ Deploys to production
# ✅ Sends you notification
```

### Branch-Based Deployments

- **`main` branch** → Production: `https://your-app.vercel.app`
- **`develop` branch** → Preview: `https://your-app-git-develop.vercel.app`
- **`staging` branch** → Preview: `https://your-app-git-staging.vercel.app`
- **`feature/xyz` branch** → Preview: `https://your-app-git-feature-xyz.vercel.app`

Each branch gets its own URL for testing!

### Recommended Branch Strategy

For a professional setup with multiple environments:

```
main (production) → https://your-app.vercel.app
  ↓
staging (test) → https://your-app-git-staging.vercel.app
  ↓
develop (development) → https://your-app-git-develop.vercel.app
  ↓
feature/xyz (feature branches)
```

**See [Branch Strategy Guide](./BRANCH_STRATEGY_GUIDE.md) for detailed workflow.**

---

## 🔧 Part 5: Post-Deployment Configuration

### Update Stripe Webhook URL

1. Go to Stripe Dashboard → **Webhooks**
2. Click on your webhook endpoint
3. Update the URL to your production URL:
   ```
   https://your-app.vercel.app/api/stripe/webhook
   ```
4. Save

### Update Clerk Webhook URL

1. Go to Clerk Dashboard → **Webhooks**
2. Click on your webhook
3. Update the URL:
   ```
   https://your-convex-deployment.convex.site/api/clerk-webhook
   ```
4. Save

### Test the Application

1. Visit: `https://your-app.vercel.app`
2. Click "Sign Up"
3. Complete authentication
4. You should be redirected to dashboard
5. Test a feature (e.g., Image Generation)
6. Test billing (create checkout session)

---

## 🎯 Environment Variables Summary

### Vercel Environment Variables:

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRO_PRICE_ID=...
STRIPE_ENTERPRISE_PRICE_ID=...

# App Configuration
NEXT_PUBLIC_APP_URL=...
```

### Convex Environment Variables:

```bash
# Stripe
STRIPE_SECRET_KEY=...
STRIPE_PRO_PRICE_ID=...
STRIPE_ENTERPRISE_PRICE_ID=...

# Clerk (optional)
CLERK_SECRET_KEY=...
```

---

## 🐛 Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Check package.json dependencies
# Make sure you have "convex" installed
npm install
```

**Error: "Environment variable missing"**
```bash
# Solution: Add all required env vars in Vercel
# Check that all NEXT_PUBLIC_* variables are set
```

### Database Connection Issues

**Error: "Can't connect to Convex"**
```bash
# Solution: 
# 1. Verify NEXT_PUBLIC_CONVEX_URL is correct
# 2. Check Convex deployment is active
# 3. Ensure Convex environment variables are set
```

### Authentication Issues

**Error: "Clerk keys invalid"**
```bash
# Solution:
# 1. Verify Clerk keys are correct
# 2. Check domain is added to Clerk allowed domains
# 3. Use production keys for production deployment
```

### Payment Issues

**Error: "Stripe checkout not working"**
```bash
# Solution:
# 1. Verify Stripe keys are correct
# 2. Check webhook URL is updated in Stripe
# 3. Use test mode keys for testing
```

---

## 📊 Monitoring Deployments

### Vercel Dashboard

View:
- Build logs and errors
- Runtime logs
- Performance metrics
- Function executions
- Bandwidth usage

### Vercel CLI (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View deployments
vercel ls

# View logs
vercel logs your-app.vercel.app

# Add environment variable
vercel env add NEXT_PUBLIC_CONVEX_URL
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Application loads at production URL
- [ ] Sign up works (creates user in Convex)
- [ ] Login works (redirects to dashboard)
- [ ] Dashboard loads user data
- [ ] AI tools work (test one feature)
- [ ] Billing page loads
- [ ] Stripe checkout flow works
- [ ] Webhooks are delivering successfully

---

## 🔗 Quick Reference

### Dashboard Links

- **Vercel**: https://vercel.com/dashboard
- **Convex**: https://dashboard.convex.dev
- **Clerk**: https://dashboard.clerk.com
- **Stripe**: https://dashboard.stripe.com

### API Documentation

- **Convex**: https://docs.convex.dev
- **Clerk**: https://clerk.com/docs
- **Stripe**: https://stripe.com/docs
- **Next.js**: https://nextjs.org/docs

---

## 💡 Tips

1. **Use Preview Deployments**: Test features on preview URLs before merging to main
2. **Monitor Logs**: Check Vercel logs regularly for errors
3. **Test Webhooks**: Use Stripe CLI to test webhooks locally
4. **Use Environment-Specific Keys**: Different keys for production vs preview
5. **Enable Analytics**: Vercel Analytics provides great insights

---

## 🚀 You're All Set!

Your app is now deployed and will automatically rebuild on every push to GitHub!

**What happens next:**
- Every `git push` → New deployment
- Preview URLs for every branch
- Production URL for `main` branch
- Automatic HTTPS
- Global CDN
- Serverless functions

**Questions?** Check the monitoring dashboards or review the logs! 🎯

