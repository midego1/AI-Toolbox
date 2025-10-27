# ✅ Vercel Deployment Checklist

Use this checklist to ensure everything is configured correctly before and after deployment.

---

## 🔧 Pre-Deployment

### Convex Backend

- [ ] Convex account created at [convex.dev](https://convex.dev)
- [ ] Production deployment created: `npx convex deploy --prod`
- [ ] Convex URL copied: `https://...convex.cloud`
- [ ] Convex environment variables set:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PRO_PRICE_ID`
  - [ ] `STRIPE_ENTERPRISE_PRICE_ID`
  - [ ] `CLERK_SECRET_KEY` (optional)

### Clerk Authentication

- [ ] Clerk account created at [clerk.com](https://clerk.com)
- [ ] Application created in Clerk dashboard
- [ ] API keys obtained:
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_test_...)
  - [ ] `CLERK_SECRET_KEY` (sk_test_...)
- [ ] Social providers configured (Google, GitHub, etc.)
- [ ] Allowed domains configured

### Stripe Payments

- [ ] Stripe account created at [stripe.com](https://stripe.com)
- [ ] Test mode enabled
- [ ] API keys obtained:
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
  - [ ] `STRIPE_SECRET_KEY` (sk_test_...)
- [ ] Products created:
  - [ ] Pro Plan ($29/month) - price_id saved
  - [ ] Enterprise Plan ($99/month) - price_id saved
- [ ] Webhook endpoint planned: `https://your-app.vercel.app/api/stripe/webhook`

### Vercel Setup

- [ ] Vercel account created at [vercel.com](https://vercel.com)
- [ ] GitHub repository connected to Vercel
- [ ] Project imported in Vercel dashboard

---

## ⚙️ Configuration

### Vercel Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

**Required Variables:**

- [ ] `NEXT_PUBLIC_CONVEX_URL` (Production: your Convex URL)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET` (get after first deploy)
- [ ] `STRIPE_PRO_PRICE_ID`
- [ ] `STRIPE_ENTERPRISE_PRICE_ID`
- [ ] `NEXT_PUBLIC_APP_URL` (auto-set by Vercel)

**Optional AI Service Keys:**

- [ ] `OPENAI_API_KEY` (for image generation)
- [ ] `GOOGLE_CLOUD_VISION_API_KEY` (for OCR)
- [ ] `DEEPL_API_KEY` (for translation)
- [ ] `REPLICATE_API_TOKEN` (for headshots)

**For each variable:**
- [ ] Select environments: Production, Preview, Development

---

## 🚀 Deployment

### Initial Deployment

- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for build to complete
- [ ] Note the production URL: `https://your-app.vercel.app`
- [ ] Build succeeded without errors
- [ ] Check Vercel logs for any warnings

---

## 🔗 Post-Deployment Configuration

### Stripe Webhook

- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Create new endpoint: `https://your-app.vercel.app/api/stripe/webhook`
- [ ] Subscribe to events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
- [ ] Copy webhook signing secret: `whsec_...`
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
- [ ] Redeploy to apply webhook secret

### Clerk Webhook (Optional)

- [ ] Go to Clerk Dashboard → Webhooks
- [ ] Create new endpoint: `https://your-convex-url.convex.site/api/clerk-webhook`
- [ ] Subscribe to events:
  - [ ] `user.created`
  - [ ] `user.updated`
- [ ] Copy webhook signing secret

### Clerk Allowed Domains

- [ ] Go to Clerk Dashboard → Instances
- [ ] Add production domain: `your-app.vercel.app`
- [ ] Add custom domain (if applicable)

---

## 🧪 Testing

### Authentication

- [ ] Visit production URL
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Social login (Google, GitHub) works
- [ ] Redirect to dashboard after sign-in
- [ ] Sign out works
- [ ] Protected routes redirect to login

### Dashboard

- [ ] Dashboard loads user data
- [ ] Credit balance displays correctly
- [ ] Sidebar navigation works
- [ ] Mobile menu works

### AI Tools

- [ ] Translation tool works
- [ ] OCR tool works
- [ ] Image generation works
- [ ] Other tools accessible

### Billing

- [ ] Billing page loads
- [ ] Subscription plans display
- [ ] Credit packages display
- [ ] Checkout session creation works
- [ ] Redirects to Stripe checkout
- [ ] Payment webhook receives events
- [ ] Credits added after payment
- [ ] Subscription active after payment

---

## 🔍 Monitoring

### Vercel

- [ ] Monitor build logs
- [ ] Check function execution logs
- [ ] Review error logs
- [ ] Check bandwidth usage
- [ ] Enable Analytics (optional)

### Convex

- [ ] Check deployment status
- [ ] Review function logs
- [ ] Monitor database queries
- [ ] Check file storage usage

### Clerk

- [ ] Monitor user sign-ups
- [ ] Check authentication logs
- [ ] Review webhook deliveries

### Stripe

- [ ] Monitor payment events
- [ ] Check webhook deliveries
- [ ] Review customer subscriptions
- [ ] Check test payments

---

## 🎯 Success Criteria

All of these should work:

- [x] Application loads without errors
- [x] Users can sign up
- [x] Users can sign in
- [x] Dashboard shows user data
- [x] AI tools function correctly
- [x] Credits system works
- [x] Stripe checkout works
- [x] Payments process successfully
- [x] Webhooks deliver properly
- [x] Real-time updates work
- [x] Mobile responsive

---

## 🚨 Troubleshooting

### Build Failures

**Check:**
- [ ] All environment variables are set
- [ ] No typos in environment variable names
- [ ] Build command is correct: `next build`
- [ ] Check Vercel build logs

### Authentication Issues

**Check:**
- [ ] Clerk keys are correct
- [ ] Domain is added to Clerk allowed domains
- [ ] Webhook URL is correct (if using)

### Payment Issues

**Check:**
- [ ] Stripe keys are correct
- [ ] Webhook URL is correct
- [ ] Price IDs are correct
- [ ] Check Stripe webhook logs

### Database Issues

**Check:**
- [ ] Convex URL is correct
- [ ] Convex deployment is active
- [ ] Environment variables are set in Convex
- [ ] Check Convex logs

---

## 📚 Documentation

- [x] README updated with deployment section
- [x] Quick start guide created
- [x] Complete deployment guide created
- [x] Checklist created (this file)

---

## 🎉 Going Live!

Once all items are checked:

1. Switch to production API keys:
   - Stripe: Live keys from [dashboard.stripe.com](https://dashboard.stripe.com)
   - Clerk: Live keys from [dashboard.clerk.com](https://dashboard.clerk.com)
   
2. Update environment variables in Vercel

3. Redeploy to apply production keys

4. Test with production keys

5. Monitor for 24-48 hours

6. Announce launch! 🚀

---

## 📞 Support

Need help?

- [Vercel Documentation](https://vercel.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

