# 🚀 Vercel Deployment Guide

Complete guide for deploying the AI Toolbox to Vercel.

## 📋 Deployment Configuration

**Platform**: Vercel  
**Config File**: `vercel.json`  
**Domain**: `sinterklaasgpt.com`  
**Build**: Automatic via Vercel CLI or GitHub integration

---

## 🎯 Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel
- Vercel will **auto-deploy** if connected to GitHub
- Or manually deploy via Vercel dashboard

### 3. Set Environment Variables
Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add all variables from the list below.

### 4. Update Clerk Domain
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Navigate to: **Frontend API → Paths**
- Add: `https://sinterklaasgpt.com`

---

## 🔧 Required Environment Variables for Vercel

### Frontend Variables (NEXT_PUBLIC_*)
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_APP_URL=https://sinterklaasgpt.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Backend Variables (Set in Convex)
```bash
# Set these via: npx convex env set KEY VALUE
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
OPENROUTER_API_KEY=sk-or-v1-...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
APP_URL=https://sinterklaasgpt.com
```

### Optional AI Service Keys
```bash
ELEVENLABS_API_KEY=...  # For voicemail generation
OPENAI_API_KEY=sk-proj-...  # For transcription
GOOGLE_CLOUD_VISION_API_KEY=AIza...  # For OCR
```

---

## 📝 Pre-Deployment Checklist

Before deploying, ensure:

1. ✅ **Convex Backend Deployed**
   ```bash
   npx convex deploy --prod
   ```

2. ✅ **Environment Variables Set**
   - Vercel: Dashboard → Settings → Environment Variables
   - Convex: Set via `npx convex env set` or Dashboard

3. ✅ **Domain Added to Clerk**
   - Clerk Dashboard → Paths
   - Add: `https://sinterklaasgpt.com`

4. ✅ **DNS Records Configured**
   - Point `sinterklaasgpt.com` to Vercel
   - SSL certificate is automatic on Vercel

---

## 🆘 Troubleshooting

### Spinning Icon/Infinite Load
- **Issue**: Clerk domain not added
- **Fix**: Add `https://sinterklaasgpt.com` to Clerk Dashboard → Paths

### Build Errors
- **Issue**: Missing environment variables
- **Fix**: Check all required variables are set in Vercel Dashboard

### Environment Variable Not Working
- **Issue**: Variable not set or wrong naming
- **Fix**: Check variable name (case-sensitive, NEXT_PUBLIC_* for frontend)

### Domain Not Accessible
- **Issue**: DNS not propagated
- **Fix**: Wait 24-48 hours for DNS propagation, check DNS records

---

## 📚 Additional Resources

- **Environment Variables**: See `ENVIRONMENT_VARIABLES.md`
- **Vercel Setup**: See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Convex Setup**: See `CONVEX_SETUP.md`
- **Clerk Setup**: See `CLERK_SETUP_GUIDE.md`

---

## 🚀 Current Status

✅ **Ready for Vercel Deployment**
- Code is clean and committed
- `vercel.json` configured
- Domain: `sinterklaasgpt.com`
- All configurations ready

**Next Step**: Push to GitHub and Vercel will auto-deploy!