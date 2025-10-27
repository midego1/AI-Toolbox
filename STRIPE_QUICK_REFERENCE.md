# Stripe Integration Quick Reference

A quick reference guide for the Stripe payment integration in AI-Toolbox.

## 🚀 Quick Start

```bash
# 1. Run the setup script
./setup-stripe.sh

# 2. Start Stripe webhook forwarding (for local dev)
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# 3. Start your app
npm run dev
```

## 🔑 Environment Variables

### Convex (set via Convex CLI or Dashboard)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Next.js (.env.local)
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 💳 Test Cards

| Purpose | Card Number | Details |
|---------|-------------|---------|
| Success | 4242 4242 4242 4242 | Any future date, any CVC |
| Decline | 4000 0000 0000 0002 | Any future date, any CVC |
| 3D Secure | 4000 0025 0000 3155 | Any future date, any CVC |

## 📦 Pricing Plans

### Subscriptions
- **Pro**: $29/month → 1,000 credits
- **Enterprise**: $99/month → 5,000 credits

### One-Time Credits
- **Small**: $10 → 500 credits
- **Medium**: $25 → 1,500 credits
- **Large**: $50 → 3,500 credits

## 📁 File Structure

```
convex/
├── lib/stripe.ts              # Stripe config & helpers
└── payments.ts                # Payment Convex functions

src/app/
├── api/stripe/
│   ├── create-checkout/       # Checkout session API
│   ├── webhook/               # Webhook handler API
│   └── cancel-subscription/   # Cancel subscription API
└── (dashboard)/billing/       # Billing UI
```

## 🔄 Webhook Events

The integration handles these Stripe events:

- ✅ `checkout.session.completed` - Payment completed
- ✅ `customer.subscription.created` - Subscription created
- ✅ `customer.subscription.updated` - Subscription updated
- ✅ `customer.subscription.deleted` - Subscription cancelled
- ✅ `invoice.payment_succeeded` - Monthly payment successful
- ✅ `invoice.payment_failed` - Payment failed

## 🛠️ Common Commands

### Convex Environment Setup
```bash
# Set environment variables
npx convex env set STRIPE_SECRET_KEY sk_test_...
npx convex env set STRIPE_PRO_PRICE_ID price_...
npx convex env set STRIPE_ENTERPRISE_PRICE_ID price_...

# View environment variables
npx convex env list
```

### Stripe CLI
```bash
# Install
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Test a webhook event
stripe trigger checkout.session.completed
```

### Create Products via CLI
```bash
# Create Pro Plan
stripe products create --name="Pro Plan" \
  --description="1,000 AI credits per month"

stripe prices create --product=<PRODUCT_ID> \
  --unit-amount=2900 --currency=usd \
  --recurring[interval]=month

# Create Enterprise Plan
stripe products create --name="Enterprise Plan" \
  --description="5,000 AI credits per month"

stripe prices create --product=<PRODUCT_ID> \
  --unit-amount=9900 --currency=usd \
  --recurring[interval]=month
```

## 🧪 Testing Flow

### Test Subscription Purchase
1. Navigate to `/billing`
2. Click "Select Plan" on Pro or Enterprise
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify:
   - User subscription tier updated
   - Credits added to account
   - Subscription visible in Stripe Dashboard

### Test Credit Purchase
1. Navigate to `/billing`
2. Click "Purchase" on a credit package
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify:
   - Credits added to account
   - Transaction in history
   - Payment visible in Stripe Dashboard

### Test Subscription Cancellation
1. With active subscription, click "Cancel Subscription"
2. Confirm cancellation
3. Verify:
   - Subscription marked for cancellation
   - User retains access until period end
   - Status updated in Stripe Dashboard

## 🐛 Troubleshooting

### Error: "Stripe Price ID not configured"
**Fix**: Set price IDs in Convex environment
```bash
npx convex env set STRIPE_PRO_PRICE_ID price_...
npx convex env set STRIPE_ENTERPRISE_PRICE_ID price_...
```

### Error: "Webhook signature verification failed"
**Fix**: Update webhook secret
```bash
# Get new secret from Stripe CLI
stripe listen --print-secret

# Add to .env.local
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Credits not added after payment
**Check**:
1. Webhook logs in Stripe Dashboard
2. Convex function logs
3. Webhook endpoint accessibility

## 📊 Monitoring

### Stripe Dashboard
- **Payments**: Monitor all transactions
- **Subscriptions**: Track active subscriptions
- **Webhooks**: View webhook delivery logs
- **Customers**: See customer profiles

### Convex Dashboard
- Check function logs for errors
- Monitor database changes
- View real-time function calls

## 🚀 Production Checklist

- [ ] Activate Stripe account (complete verification)
- [ ] Switch to live API keys (pk_live_, sk_live_)
- [ ] Create webhook endpoint in Stripe Dashboard
- [ ] Update all environment variables (Convex + hosting platform)
- [ ] Test with real card (small amount)
- [ ] Monitor webhook deliveries
- [ ] Set up billing alerts
- [ ] Configure email notifications

## 🔐 Security Notes

- ✅ Webhook signatures verified
- ✅ API keys stored in environment variables
- ✅ Never expose secret keys in client-side code
- ✅ HTTPS required for production webhooks
- 🔄 Rotate API keys every 90 days

## 📚 Resources

- [Full Setup Guide](./STRIPE_SETUP_GUIDE.md)
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Convex Documentation](https://docs.convex.dev)

## 💡 Tips

1. **Use test mode** for all development and testing
2. **Monitor webhook logs** - they're your best debugging tool
3. **Test edge cases** - failed payments, cancellations, etc.
4. **Keep Stripe CLI running** during local development
5. **Check both Stripe and Convex logs** when debugging issues



