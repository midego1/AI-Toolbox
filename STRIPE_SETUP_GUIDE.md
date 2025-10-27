# Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payments for your AI-Toolbox application, including subscriptions and one-time credit purchases.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Create Products and Prices](#create-products-and-prices)
4. [Environment Variables](#environment-variables)
5. [Webhook Configuration](#webhook-configuration)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Convex account with your project deployed
- Next.js application running

---

## Stripe Account Setup

### 1. Create a Stripe Account

1. Go to https://stripe.com and sign up for an account
2. Complete the account verification process
3. Navigate to the Dashboard

### 2. Get API Keys

1. In the Stripe Dashboard, go to **Developers** → **API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)
3. Keep these keys handy - you'll need them for environment variables

---

## Create Products and Prices

You need to create two subscription products in Stripe for the Pro and Enterprise plans.

### Method 1: Using Stripe Dashboard (Recommended)

#### Pro Plan

1. Go to **Products** → **Add Product**
2. Fill in the details:
   - **Name**: Pro Plan
   - **Description**: 1,000 AI credits per month
   - **Pricing**: $29.00 USD / month
   - **Billing period**: Monthly
   - **Recurring**: Yes
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`) - you'll need this for `STRIPE_PRO_PRICE_ID`

#### Enterprise Plan

1. Go to **Products** → **Add Product**
2. Fill in the details:
   - **Name**: Enterprise Plan
   - **Description**: 5,000 AI credits per month
   - **Pricing**: $99.00 USD / month
   - **Billing period**: Monthly
   - **Recurring**: Yes
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`) - you'll need this for `STRIPE_ENTERPRISE_PRICE_ID`

### Method 2: Using Stripe CLI

If you prefer to use the CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Create Pro Plan Product and Price
stripe products create \
  --name="Pro Plan" \
  --description="1,000 AI credits per month"

stripe prices create \
  --product=<PRODUCT_ID_FROM_ABOVE> \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month

# Create Enterprise Plan Product and Price
stripe products create \
  --name="Enterprise Plan" \
  --description="5,000 AI credits per month"

stripe prices create \
  --product=<PRODUCT_ID_FROM_ABOVE> \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month
```

---

## Environment Variables

You need to set up environment variables in three places:

### 1. Convex Environment Variables

Set these in your Convex dashboard (Dashboard → Settings → Environment Variables):

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id_here
```

**To set Convex environment variables:**

```bash
# Using Convex CLI
npx convex env set STRIPE_SECRET_KEY sk_test_your_secret_key_here
npx convex env set STRIPE_PRO_PRICE_ID price_your_pro_price_id_here
npx convex env set STRIPE_ENTERPRISE_PRICE_ID price_your_enterprise_price_id_here
```

### 2. Next.js Environment Variables (Local)

Create or update `.env.local` in your project root:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id_here

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Convex URL (already should be set)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 3. Production Environment Variables

For production deployment (e.g., Vercel):

1. Go to your project settings → Environment Variables
2. Add all the variables from `.env.local` above
3. Update `NEXT_PUBLIC_APP_URL` to your production URL (e.g., `https://yourapp.com`)
4. Use production Stripe keys (starting with `pk_live_` and `sk_live_`)

---

## Webhook Configuration

Webhooks are essential for handling subscription events and payment notifications.

### Local Development with Stripe CLI

For local testing, use the Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI if not already installed
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret (starts with `whsec_`). Add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_cli
```

### Production Webhook Setup

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourapp.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your production environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Testing

### Test Cards

Use these test card numbers in test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

For all test cards:
- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC
- Use any ZIP code

### Testing Subscriptions

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Start Stripe CLI webhook forwarding:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

3. Log in to your application
4. Go to the Billing page
5. Click on a subscription plan (Pro or Enterprise)
6. Use test card `4242 4242 4242 4242` to complete checkout
7. Verify:
   - Subscription is created in Stripe Dashboard
   - User's subscription tier is updated in your app
   - Credits are added to user's account
   - Webhook events are received (check Stripe CLI output)

### Testing One-Time Credit Purchases

1. Go to the Billing page
2. Click on a credit package
3. Use test card to complete checkout
4. Verify:
   - Payment is successful in Stripe Dashboard
   - Credits are added to user's account
   - Transaction appears in transaction history

### Testing Subscription Cancellation

1. With an active subscription, click "Cancel Subscription"
2. Confirm the cancellation
3. Verify:
   - Subscription is marked for cancellation in Stripe
   - User still has access until period end
   - Subscription status is updated in your app

---

## Production Deployment

### Checklist

- [ ] **Stripe Account Activated**
  - Complete business verification
  - Activate live mode in Stripe Dashboard

- [ ] **Production API Keys**
  - Update all environment variables with live keys (`pk_live_` and `sk_live_`)
  - Set in both Convex and hosting platform (Vercel, etc.)

- [ ] **Production Webhook**
  - Create webhook endpoint in Stripe Dashboard
  - Point to production URL: `https://yourapp.com/api/stripe/webhook`
  - Add webhook secret to production environment variables

- [ ] **App URL Updated**
  - Set `NEXT_PUBLIC_APP_URL` to production domain

- [ ] **Test in Production**
  - Create a test subscription with real card
  - Cancel immediately (you won't be charged)
  - Verify all webhooks are received

### Monitoring

1. **Stripe Dashboard**
   - Monitor payments in **Payments** section
   - Check subscriptions in **Subscriptions** section
   - View webhook logs in **Developers** → **Webhooks**

2. **Convex Dashboard**
   - Check function logs for errors
   - Monitor database for subscription records

3. **Application Logs**
   - Check Next.js logs for API route errors
   - Monitor webhook processing

---

## Pricing Structure

### Subscriptions

| Plan | Price | Credits | Price ID Variable |
|------|-------|---------|-------------------|
| Free | $0/month | 100 | N/A |
| Pro | $29/month | 1,000 | `STRIPE_PRO_PRICE_ID` |
| Enterprise | $99/month | 5,000 | `STRIPE_ENTERPRISE_PRICE_ID` |

### One-Time Credit Purchases

| Package | Credits | Price |
|---------|---------|-------|
| Small | 500 | $10 |
| Medium | 1,500 | $25 |
| Large | 3,500 | $50 |

---

## Troubleshooting

### Common Issues

#### 1. "Stripe Price ID not configured" Error

**Problem**: Price IDs are not set in Convex environment.

**Solution**: 
```bash
npx convex env set STRIPE_PRO_PRICE_ID price_your_id_here
npx convex env set STRIPE_ENTERPRISE_PRICE_ID price_your_id_here
```

#### 2. Webhook Signature Verification Failed

**Problem**: Webhook secret is incorrect or not set.

**Solution**:
- For local development: Make sure Stripe CLI is running and `STRIPE_WEBHOOK_SECRET` is set
- For production: Verify webhook secret in Stripe Dashboard matches environment variable

#### 3. Checkout Session Not Redirecting

**Problem**: `NEXT_PUBLIC_APP_URL` is not set correctly.

**Solution**: Set the correct URL in environment variables and restart the server.

#### 4. Credits Not Added After Payment

**Problem**: Webhook not processed or database update failed.

**Solution**:
- Check webhook logs in Stripe Dashboard
- Check Convex function logs
- Verify webhook endpoint is accessible

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Validate webhook signatures** (already implemented)
4. **Use HTTPS** in production
5. **Monitor for suspicious activity** in Stripe Dashboard
6. **Set up fraud detection** in Stripe settings
7. **Regularly rotate API keys** (every 90 days recommended)

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe API Reference**: https://stripe.com/docs/api
- **Convex Documentation**: https://docs.convex.dev
- **Support Email**: support@yourapp.com

---

## Next Steps

After completing the Stripe setup:

1. Test thoroughly in development mode
2. Deploy to staging environment (if available)
3. Test with real cards (small amounts)
4. Switch to production mode
5. Monitor transactions and webhooks
6. Set up email notifications for payments
7. Consider adding invoice generation
8. Implement usage analytics

---

## File Structure

Here's where the Stripe-related files are located:

```
/Users/midego/AI-Toolbox/
├── convex/
│   ├── lib/
│   │   └── stripe.ts              # Stripe configuration and helpers
│   └── payments.ts                # Payment-related Convex functions
├── src/
│   └── app/
│       ├── api/
│       │   └── stripe/
│       │       ├── create-checkout/
│       │       │   └── route.ts   # Checkout session API
│       │       ├── webhook/
│       │       │   └── route.ts   # Webhook handler API
│       │       └── cancel-subscription/
│       │           └── route.ts   # Subscription cancellation API
│       └── (dashboard)/
│           └── billing/
│               └── page.tsx       # Billing UI
└── STRIPE_SETUP_GUIDE.md          # This file
```

---

## Changelog

- **2025-10-26**: Initial Stripe integration documentation created



