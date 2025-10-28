# 🔐 Environment Variables - Complete List

This document lists all environment variables required to run the AI Toolbox locally or in production.

## 📋 Quick Reference

### Required for Local Development (Minimal)

```env
# Convex Backend URL (from npx convex dev)
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"
```

### Required for Production (Full Setup)

```env
# Convex
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"

# Convex Environment Variables (set via: npx convex env set KEY VALUE)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."
OPENROUTER_API_KEY="sk-or-v1-..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."
APP_URL="https://sinterklaasgpt.com"

# Optional AI Services
ELEVENLABS_API_KEY="..."  # For voicemail generation
OPENAI_API_KEY="sk-proj-..."  # For transcription/whisper
GOOGLE_CLOUD_VISION_API_KEY="AIza..."  # For OCR
```

---

## 🎯 Required Environment Variables

### 1. **NEXT_PUBLIC_CONVEX_URL** (Required for Frontend)
- **Purpose**: Connect Next.js frontend to Convex backend
- **Location**: `.env.local` file
- **Format**: `https://your-project.convex.cloud`
- **How to get**: Run `npx convex dev` and copy the URL
- **Used in**: `src/app/layout.tsx`, all Convex queries

```env
NEXT_PUBLIC_CONVEX_URL="https://happy-animal-123.convex.cloud"
```

---

## 🔧 Convex Environment Variables (Backend)

These are set in the Convex project (not in `.env.local`):
- Via Dashboard: https://dashboard.convex.dev
- Via CLI: `npx convex env set KEY VALUE`

### 2. **STRIPE_SECRET_KEY** (Required for Payments)
- **Purpose**: Stripe payment processing
- **Location**: Convex environment variables
- **Format**: `sk_live_...` (production) or `sk_test_...` (development)
- **Get from**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Used in**: `convex/lib/stripe.ts`, `convex/payments.ts`

```bash
npx convex env set STRIPE_SECRET_KEY sk_live_YOUR_KEY
```

### 3. **STRIPE_PRO_PRICE_ID** (Required for Subscriptions)
- **Purpose**: Stripe Pro plan price ID
- **Location**: Convex environment variables
- **Format**: `price_...`
- **Get from**: [Stripe Products](https://dashboard.stripe.com/products)
- **Used in**: `convex/lib/stripe.ts`

```bash
npx convex env set STRIPE_PRO_PRICE_ID price_YOUR_ID
```

### 4. **STRIPE_ENTERPRISE_PRICE_ID** (Required for Subscriptions)
- **Purpose**: Stripe Enterprise plan price ID
- **Location**: Convex environment variables
- **Format**: `price_...`
- **Get from**: [Stripe Products](https://dashboard.stripe.com/products)
- **Used in**: `convex/lib/stripe.ts`

```bash
npx convex env set STRIPE_ENTERPRISE_PRICE_ID price_YOUR_ID
```

### 5. **OPENROUTER_API_KEY** (Required for AI Features)
- **Purpose**: AI text generation, image generation, translations
- **Location**: Convex environment variables
- **Format**: API key string
- **Get from**: [OpenRouter Dashboard](https://openrouter.ai/keys)
- **Used in**: `convex/lib/openrouter.ts`, all AI tools

```bash
npx convex env set OPENROUTER_API_KEY sk-or-v1-YOUR_KEY
```

### 6. **CLERK_SECRET_KEY** (Required for Authentication)
- **Purpose**: Clerk authentication backend
- **Location**: Convex environment variables
- **Format**: `sk_live_...` or `sk_test_...`
- **Get from**: [Clerk Dashboard](https://dashboard.clerk.com) → API Keys
- **Used in**: `convex/clerk.ts`, `convex/http.ts`

```bash
npx convex env set CLERK_SECRET_KEY sk_live_YOUR_KEY
```

### 7. **CLERK_WEBHOOK_SECRET** (Optional - for Webhooks)
- **Purpose**: Verify Clerk webhook signatures
- **Location**: Convex environment variables
- **Format**: `whsec_...`
- **Get from**: [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks
- **Used in**: `convex/http.ts` for user sync

```bash
npx convex env set CLERK_WEBHOOK_SECRET whsec_YOUR_SECRET
```

### 8. **APP_URL** (Required for Redirects)
- **Purpose**: Base URL for redirects and webhooks
- **Location**: Convex environment variables
- **Format**: Your production URL
- **Used in**: `convex/payments.ts` for Stripe callbacks

```bash
npx convex env set APP_URL https://sinterklaasgpt.com
```

---

## ⚙️ Optional Environment Variables

### 9. **ELEVENLABS_API_KEY** (Optional - For Voicemail)
- **Purpose**: Generate Sinterklaas voicemail messages
- **Location**: Convex environment variables
- **Get from**: [ElevenLabs](https://elevenlabs.io)
- **Used in**: `convex/tools/sinterklaasVoicemail.ts`

```bash
npx convex env set ELEVENLABS_API_KEY YOUR_API_KEY
```

### 10. **OPENAI_API_KEY** (Optional - For Transcription)
- **Purpose**: Whisper API for audio transcription
- **Location**: Convex environment variables
- **Get from**: [OpenAI Dashboard](https://platform.openai.com/api-keys)
- **Used in**: `convex/tools/transcription.ts`

```bash
npx convex env set OPENAI_API_KEY sk-proj-YOUR_KEY
```

### 11. **GOOGLE_CLOUD_VISION_API_KEY** (Optional - For OCR)
- **Purpose**: Extract text from images
- **Location**: Convex environment variables
- **Get from**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Used in**: `convex/tools/ocr.ts`

```bash
npx convex env set GOOGLE_CLOUD_VISION_API_KEY AIzaYOUR_KEY
```

---

## 🚀 Vercel Environment Variables (Production)

### For Next.js API Routes
Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# Required
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Optional
NODE_ENV="production"
```

---

## 📝 Summary Table

| Variable | Location | Required | Purpose |
|----------|----------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local` | ✅ Yes | Connect frontend to Convex |
| `STRIPE_SECRET_KEY` | Convex | ✅ Yes | Payment processing |
| `STRIPE_PRO_PRICE_ID` | Convex | ✅ Yes | Pro subscriptions |
| `STRIPE_ENTERPRISE_PRICE_ID` | Convex | ✅ Yes | Enterprise subscriptions |
| `OPENROUTER_API_KEY` | Convex | ✅ Yes | AI features |
| `CLERK_SECRET_KEY` | Convex | ✅ Yes | Authentication |
| `CLERK_WEBHOOK_SECRET` | Convex | ⚠️ Optional | User sync webhooks |
| `APP_URL` | Convex | ✅ Yes | Redirects & callbacks |
| `ELEVENLABS_API_KEY` | Convex | ❌ Optional | Voicemail generation |
| `OPENAI_API_KEY` | Convex | ❌ Optional | Audio transcription |
| `GOOGLE_CLOUD_VISION_API_KEY` | Convex | ❌ Optional | OCR text extraction |

---

## 🔧 Setup Commands

### Local Development (Minimum Required)

```bash
# 1. Get Convex URL
npx convex dev

# 2. Create .env.local
echo 'NEXT_PUBLIC_CONVEX_URL="https://your-url.convex.cloud"' > .env.local

# 3. Start development
npm run dev
```

### Production Setup (Full Configuration)

```bash
# Set Convex environment variables
npx convex env set STRIPE_SECRET_KEY sk_live_YOUR_KEY
npx convex env set STRIPE_PRO_PRICE_ID price_YOUR_ID
npx convex env set STRIPE_ENTERPRISE_PRICE_ID price_YOUR_ID
npx convex env set OPENROUTER_API_KEY sk-or-v1-YOUR_KEY
npx convex env set CLERK_SECRET_KEY sk_live_YOUR_KEY
npx convex env set CLERK_WEBHOOK_SECRET whsec_YOUR_SECRET
npx convex env set APP_URL https://sinterklaasgpt.com

# Set Vercel environment variables (via dashboard)
# NEXT_PUBLIC_CONVEX_URL
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
# STRIPE_PUBLISHABLE_KEY
```

---

## ✅ Verification

### Check Convex Environment Variables

```bash
# List all variables
npx convex env list

# Get specific variable
npx convex env get STRIPE_SECRET_KEY

# Delete variable
npx convex env delete STRIPE_SECRET_KEY
```

### Check Local Environment Variables

```bash
# View .env.local
cat .env.local

# Check if variable is set
echo $NEXT_PUBLIC_CONVEX_URL
```

---

## 🛠️ Where Variables Are Used

### Frontend (Next.js)
- `NEXT_PUBLIC_CONVEX_URL` - Used in all Convex queries
- `NODE_ENV` - Used for conditional rendering

### Backend (Convex)
- All other variables are used in `convex/` directory
- Checked via `process.env.VARIABLE_NAME`

### Stripe API Routes
- `STRIPE_SECRET_KEY` - Used in `/api/stripe/webhook/route.ts`
- `STRIPE_WEBHOOK_SECRET` - Used for webhook verification
- `NEXT_PUBLIC_CONVEX_URL` - For Convex client initialization

---

## ⚠️ Important Notes

1. **Never commit secrets to Git** - Only store in Convex Dashboard or `.env.local` (gitignored)
2. **Use production keys for production** - Don't use `sk_test_` in production
3. **All providers have free tiers** - Start with free tier for development
4. **Convex env variables** - Set via CLI or Dashboard, not in `.env.local`
5. **NEXT_PUBLIC_** prefix - Only frontend variables need this prefix (they're exposed to browser)

---

## 🔗 Quick Links

- [Convex Dashboard](https://dashboard.convex.dev)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [OpenRouter Dashboard](https://openrouter.ai/keys)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [ElevenLabs](https://elevenlabs.io)
- [OpenAI Dashboard](https://platform.openai.com/api-keys)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

