# ⚡ Vercel Quick Start Guide

Get your AI Toolbox deployed to Vercel in 15 minutes!

---

## 🎯 Prerequisites

You need accounts for:
- ✅ [Convex](https://convex.dev) (free)
- ✅ [Clerk](https://clerk.com) (free tier: 10K MAU)
- ✅ [Stripe](https://stripe.com) (free)
- ✅ [Vercel](https://vercel.com) (free)

### 📖 Related Guides

- **[Branch Strategy](./BRANCH_STRATEGY_GUIDE.md)** - Managing dev/staging/production branches

---

## 🚀 5-Minute Setup

### Step 1: Deploy Convex (Backend)

```bash
# Deploy your Convex backend to production
npx convex deploy --prod

# Copy the URL you get (e.g., https://abc123.convex.cloud)
```

### Step 2: Get Your API Keys

**Clerk Dashboard** ([dashboard.clerk.com](https://dashboard.clerk.com)):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

**Stripe Dashboard** ([dashboard.stripe.com](https://dashboard.stripe.com)):
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- Create products and copy `price_id` for each

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Add these environment variables:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-url.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

5. Click **"Deploy"**

### Step 4: Configure Webhooks

**Stripe Webhook** ([dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)):
- URL: `https://your-app.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

**Clerk Webhook** ([dashboard.clerk.com/webhooks](https://dashboard.clerk.com/webhooks)):
- URL: `https://your-convex-url.convex.site/api/clerk-webhook`
- Events: `user.created`, `user.updated`

---

## ✅ Done!

Your app is live at: `https://your-app.vercel.app`

**Every push to GitHub = automatic deployment!** 🎉

---

## 📚 Full Documentation

For detailed instructions, see:
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Complete setup guide
- **[BRANCH_STRATEGY_GUIDE.md](./BRANCH_STRATEGY_GUIDE.md)** - Multi-branch workflow (dev/staging/production)
- **[CLERK_SETUP_GUIDE.md](./CLERK_SETUP_GUIDE.md)** - Clerk auth setup
- **[STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)** - Stripe integration
- **[CONVEX_SETUP.md](./CONVEX_SETUP.md)** - Convex backend setup

---

## 🆘 Troubleshooting

**Build failing?** Check environment variables are all set

**Auth not working?** Verify Clerk keys are correct

**Payments not working?** Check Stripe webhook URL is correct

**Need help?** Check the monitoring dashboards:
- Vercel: https://vercel.com/dashboard
- Convex: https://dashboard.convex.dev
- Clerk: https://dashboard.clerk.com
- Stripe: https://dashboard.stripe.com

