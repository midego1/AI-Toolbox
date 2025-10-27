# 🚀 Convex Production Setup Guide

## Current Status

**Deployment Type**: `dev` (Development)
**Deployment ID**: `sensible-tiger-956`
**URL**: `https://sensible-tiger-956.convex.cloud`

## ⚠️ Important: Dev vs Production

Your current Convex setup is using a **dev deployment**. For production:

1. **Dev deployments** (what you have now):
   - Auto-created when running `npx convex dev`
   - Great for development
   - **Not recommended for production apps**
   - URL shows as: `dev:sensible-tiger-956`

2. **Production deployments**:
   - Separate deployment for production
   - More stable and production-ready
   - Better for your live app

## 🔧 How to Set Up Production Deployment

### Option 1: Promote Current Deployment (Recommended)

If this dev deployment IS your production deployment (you're not developing locally):

```bash
# Your current deployment is already being used for production
# Just ensure NEXT_PUBLIC_CONVEX_URL points to it in Vercel
```

### Option 2: Create Separate Production Deployment

If you need separate dev and production:

1. **For Local Development** (keep using dev):
   ```bash
   npx convex dev
   ```
   This uses: `dev:sensible-tiger-956`

2. **For Production** (your live app on Vercel):
   - In Vercel environment variables, set:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://sensible-tiger-956.convex.cloud
   ```

3. **Deploy Schema Changes**:
   ```bash
   # Deploy functions to your deployment
   npx convex deploy
   ```

## 📊 Current Environment Variables (Already Set)

These are already configured in your deployment:

```bash
✅ APP_URL=https://sinterklaasgpt.com
✅ CLERK_SECRET_KEY=sk_live_...
✅ STRIPE_SECRET_KEY=sk_live_...
✅ STRIPE_PRO_PRICE_ID=price_...
✅ STRIPE_ENTERPRISE_PRICE_ID=price_...
✅ OPENROUTER_API_KEY=sk-or-v1-...
```

## 🔍 Verify Your Setup

1. **Check Convex Dashboard**:
   ```bash
   npx convex dashboard
   ```
   - Go to your project
   - Check which deployment is marked as "Production"

2. **Verify Production URL in Vercel**:
   - Go to Vercel → Settings → Environment Variables
   - Check `NEXT_PUBLIC_CONVEX_URL` matches your deployment
   - Should be: `https://sensible-tiger-956.convex.cloud`

3. **Deploy Code Changes**:
   ```bash
   npx convex deploy
   ```
   This deploys to whatever is configured (usually production)

## 🎯 Recommended Setup

### For Your Current Situation:

Since you're deploying to Vercel (production), use this deployment for both:

1. **Vercel Environment Variables** (already set):
   ```
   NEXT_PUBLIC_CONVEX_URL=https://sensible-tiger-956.convex.cloud
   ```

2. **Local Development** (when needed):
   - Keep using the same deployment or create a separate dev deployment
   - Local changes won't affect production until you deploy

3. **Deploy Changes**:
   ```bash
   npx convex deploy
   ```
   This deploys your code to the production deployment

## ⚡ Quick Actions

### Deploy Latest Code to Production:
```bash
npx convex deploy
```

### View Environment Variables:
```bash
npx convex env list
```

### Update Environment Variable:
```bash
npx convex env set VARIABLE_NAME value
```

### Open Convex Dashboard:
```bash
npx convex dashboard
```

## 📝 Important Notes

1. **When you deploy with `npx convex deploy`**, it deploys to production by default
2. **The dev deployment** (what `npx convex dev` uses) is separate
3. **Your app on Vercel** uses whatever `NEXT_PUBLIC_CONVEX_URL` is set to in Vercel
4. **Environment variables** are deployment-specific

## 🎉 Summary

✅ Your code has been deployed to: `https://sensible-tiger-956.convex.cloud`
✅ All environment variables are configured
✅ Your app uses this deployment via `NEXT_PUBLIC_CONVEX_URL` in Vercel

**You're good to go!** Your production deployment is up to date. 🚀

