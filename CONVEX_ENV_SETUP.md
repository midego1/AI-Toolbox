# 🔧 Convex Environment Variables Setup Guide

## Required Environment Variables for Convex

These environment variables need to be added to your Convex project for all features to work properly.

### 📋 Quick Setup Checklist

Add these variables in **Convex Dashboard** → **Settings** → **Environment Variables**

---

## ✅ **Required Variables**

### 1. **STRIPE_SECRET_KEY** (REQUIRED)
- **Purpose**: Stripe payment processing
- **Format**: `sk_live_...` or `sk_test_...`
- **Get it from**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Used in**: `convex/lib/stripe.ts`, `convex/payments.ts`

```bash
# Add to Convex
npx convex env set STRIPE_SECRET_KEY sk_live_YOUR_KEY
```

### 2. **STRIPE_PRO_PRICE_ID** (REQUIRED)
- **Purpose**: Stripe Pro subscription plan price ID
- **Format**: `price_...`
- **Get it from**: [Stripe Products Dashboard](https://dashboard.stripe.com/products)
- **Used in**: `convex/lib/stripe.ts`

```bash
# Add to Convex
npx convex env set STRIPE_PRO_PRICE_ID price_YOUR_PRICE_ID
```

### 3. **STRIPE_ENTERPRISE_PRICE_ID** (REQUIRED)
- **Purpose**: Stripe Enterprise subscription plan price ID
- **Format**: `price_...`
- **Get it from**: [Stripe Products Dashboard](https://dashboard.stripe.com/products)
- **Used in**: `convex/lib/stripe.ts`

```bash
# Add to Convex
npx convex env set STRIPE_ENTERPRISE_PRICE_ID price_YOUR_PRICE_ID
```

### 4. **OPENROUTER_API_KEY** (REQUIRED for AI features)
- **Purpose**: AI text generation, image generation, translations, etc.
- **Format**: API key string
- **Get it from**: [OpenRouter Dashboard](https://openrouter.ai/keys)
- **Used in**: `convex/lib/openrouter.ts`, `convex/http.ts`

```bash
# Add to Convex
npx convex env set OPENROUTER_API_KEY YOUR_API_KEY
```

### 5. **CLERK_SECRET_KEY** (REQUIRED for authentication)
- **Purpose**: Clerk authentication backend
- **Format**: `sk_live_...` or `sk_test_...`
- **Get it from**: [Clerk Dashboard](https://dashboard.clerk.com)
- **Used in**: `convex/clerk.ts`, `convex/http.ts`

```bash
# Add to Convex
npx convex env set CLERK_SECRET_KEY sk_live_YOUR_KEY
```

### 6. **APP_URL** (REQUIRED)
- **Purpose**: Base URL for Stripe redirect URLs
- **Format**: `https://your-domain.com` or `https://your-app.vercel.app`
- **Used in**: `convex/payments.ts`
- **Your domain**: `https://sinterklaasgpt.com`

```bash
# Add to Convex
npx convex env set APP_URL https://sinterklaasgpt.com
```

---

## ⚙️ **Optional Variables** (for specific features)

### 7. **ELEVENLABS_API_KEY** (Optional)
- **Purpose**: Voicemail generation feature
- **Format**: API key string
- **Get it from**: [ElevenLabs Dashboard](https://elevenlabs.io/)
- **Used in**: `convex/tools/sinterklaasVoicemail.ts`
- **Note**: Only needed if you use the voicemail feature

```bash
# Add to Convex
npx convex env set ELEVENLABS_API_KEY YOUR_API_KEY
```

### 8. **OPENAI_API_KEY** (Optional)
- **Purpose**: Transcription feature (alternative to OpenRouter)
- **Format**: `sk-...`
- **Get it from**: [OpenAI Dashboard](https://platform.openai.com/api-keys)
- **Used in**: `convex/tools/transcription.ts`
- **Note**: OpenRouter can handle transcriptions, this is optional

```bash
# Add to Convex
npx convex env set OPENAI_API_KEY sk-YOUR_KEY
```

### 9. **GOOGLE_CLOUD_VISION_API_KEY** (Optional)
- **Purpose**: OCR (text extraction from images)
- **Format**: API key string
- **Get it from**: [Google Cloud Console](https://console.cloud.google.com/)
- **Used in**: `convex/tools/ocr.ts`
- **Note**: Only needed if you use the OCR feature

```bash
# Add to Convex
npx convex env set GOOGLE_CLOUD_VISION_API_KEY YOUR_API_KEY
```

### 10. **CLERK_WEBHOOK_SECRET** (Optional)
- **Purpose**: Secure Clerk webhook verification
- **Format**: `whsec_...`
- **Get it from**: [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks → Add Endpoint
- **Used in**: `convex/http.ts`
- **Note**: For production, you should verify webhook signatures

```bash
# Add to Convex
npx convex env set CLERK_WEBHOOK_SECRET whsec_YOUR_SECRET
```

---

## 🚀 How to Add Environment Variables

### Method 1: Via Convex Dashboard (Recommended)

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Click **Add Variable**
5. Enter the name and value
6. Click **Save**

### Method 2: Via CLI

```bash
# Set one variable
npx convex env set VARIABLE_NAME your_value

# Example
npx convex env set OPENROUTER_API_KEY sk_or_xyz...

# Set multiple variables
npx convex env set STRIPE_SECRET_KEY sk_live_... && \
npx convex env set OPENROUTER_API_KEY sk_or_... && \
npx convex env set CLERK_SECRET_KEY sk_live_...
```

---

## 📊 Summary of Environment Variables

| Variable | Required | Used For | Source |
|----------|----------|----------|--------|
| `STRIPE_SECRET_KEY` | ✅ Yes | Payments | Stripe Dashboard |
| `STRIPE_PRO_PRICE_ID` | ✅ Yes | Subscriptions | Stripe Dashboard |
| `STRIPE_ENTERPRISE_PRICE_ID` | ✅ Yes | Subscriptions | Stripe Dashboard |
| `OPENROUTER_API_KEY` | ✅ Yes | AI Features | OpenRouter Dashboard |
| `CLERK_SECRET_KEY` | ✅ Yes | Authentication | Clerk Dashboard |
| `APP_URL` | ✅ Yes | Redirects | https://sinterklaasgpt.com |
| `ELEVENLABS_API_KEY` | ⚠️ Optional | Voicemail | ElevenLabs Dashboard |
| `OPENAI_API_KEY` | ⚙️ Optional | Transcription | OpenAI Dashboard |
| `GOOGLE_CLOUD_VISION_API_KEY` | ⚙️ Optional | OCR | Google Cloud Console |
| `CLERK_WEBHOOK_SECRET` | ⚙️ Optional | Webhooks | Clerk Dashboard |

---

## 🔍 Verify Environment Variables

After adding variables, verify they're set:

```bash
# List all environment variables
npx convex env list

# Check specific variable
npx convex env get STRIPE_SECRET_KEY
```

---

## ❗ Important Notes

1. **Never commit secrets to Git** - Only add to Convex Dashboard or via CLI
2. **Use production keys for production** - Don't use `sk_test_` in production
3. **Get API keys from respective dashboards** - All providers have free tiers to start
4. **Re-deploy after adding variables** - Convex will pick up new variables automatically
5. **Test locally first** - Use `.env.local` for local development

---

## 🧪 Testing After Adding Variables

1. **Test Payments**:
   ```bash
   # Try to upgrade to Pro plan
   ```

2. **Test AI Features**:
   ```bash
   # Try generating text or images
   ```

3. **Test Authentication**:
   ```bash
   # Try signing in with Clerk
   ```

4. **Check Logs**:
   ```bash
   npx convex logs
   ```

---

## 🆘 Troubleshooting

### Error: "OPENROUTER_API_KEY not configured"
- Solution: Add `OPENROUTER_API_KEY` to Convex environment variables

### Error: "STRIPE_SECRET_KEY is not configured"
- Solution: Add `STRIPE_SECRET_KEY` to Convex environment variables

### Webhook not working
- Solution: Verify `CLERK_WEBHOOK_SECRET` is set correctly in Convex

### Check environment variables in code:
- Convex variables are available via `process.env.VARIABLE_NAME`
- Make sure variable names match exactly (case-sensitive)

---

## 📚 Getting API Keys

### OpenRouter (AI Features)
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create account
3. Generate API key
4. Free tier: $5 credit + pay per use

### Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com)
2. Create account
3. Create application
4. Copy keys from Dashboard

### Stripe (Payments)
1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get API keys from Dashboard → Developers → API keys
4. Create products for subscriptions

### ElevenLabs (Voicemail - Optional)
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Create account
3. Get API key from dashboard
4. Free tier available

### OpenAI (Transcription - Optional)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account
3. Get API key from API keys section
4. Pay as you go

### Google Cloud Vision (OCR - Optional)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable Vision API
3. Create credentials
4. Get API key

---

**That's it! Your Convex backend should now work with all features.** 🎉

