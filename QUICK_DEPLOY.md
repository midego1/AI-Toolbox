# 10-Minute Deployment - Supabase + Vercel

Get your AI SaaS platform live in 10 minutes with Supabase and Vercel.

---

## ⚡ 3 Simple Steps

### 1️⃣ Set Up Supabase (3 minutes)

**Create Project:**
1. Go to [supabase.com](https://supabase.com) → Sign in with GitHub
2. Click **"New project"**
3. Name: `ai-toolbox`
4. Create strong database password (save it!)
5. Choose region (closest to your users)
6. Click **"Create new project"** → Wait 2 minutes

**Get Credentials:**
1. Go to **Settings** → **API**
2. Copy these three values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (secret!)
   ```

**Set Up Database:**
1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire SQL from `SUPABASE_SETUP.md` (Step 3)
4. Click **"Run"**
5. Done! ✅

---

### 2️⃣ Deploy to Vercel (5 minutes)

**Deploy:**
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Import your `AI-Toolbox` repository
4. **Before deploying**, add Environment Variables:

```bash
# Supabase (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database Connection (for Prisma)
DATABASE_URL=postgresql://postgres:[YOUR-DB-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# NextAuth Secret
NEXTAUTH_SECRET=run: openssl rand -base64 32
NEXTAUTH_URL=https://your-app.vercel.app

# Stripe (optional - add later)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. Your app is LIVE! 🎉

---

### 3️⃣ Test It (2 minutes)

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Click **"Sign Up"**
3. Create an account
4. You should:
   - Get 100 free credits
   - See the dashboard
   - Access all tools

**Done!** Your AI SaaS platform is live! 🚀

---

## 🎯 What You Get

- ✅ Full authentication (email/password)
- ✅ PostgreSQL database (500MB free)
- ✅ 100 free credits per user on signup
- ✅ All AI tool pages (Translation, OCR, etc.)
- ✅ Billing page (Stripe ready)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## 📋 Optional: Enable Google/GitHub Login

**In Supabase:**
1. Go to **Authentication** → **Providers**
2. Enable **Google** or **GitHub**
3. Add OAuth credentials from their developer portals
4. Users can now sign in with social accounts! ✅

---

## 💳 Optional: Enable Stripe Payments

1. Get Stripe keys from [stripe.com](https://stripe.com)
2. Add to Vercel environment variables
3. Create products in Stripe
4. Add price IDs to environment variables
5. Payments work! ✅

See `ENV_SETUP_GUIDE.md` for detailed Stripe setup.

---

## 🔄 Deploy Updates

Every time you push to GitHub:
1. **Main branch** → Automatic production deployment
2. **Other branches** → Preview deployments with unique URLs
3. Test on preview, then merge to main

**That's it!** Deployments are automatic! 🎉

---

## 📊 Free Tier Limits

**Supabase Free:**
- 500MB database
- Unlimited API requests
- 50,000 monthly active users

**Vercel Free:**
- 100GB bandwidth/month
- Unlimited deployments

**You can serve 1,000s of users for free!**

---

## 🆘 Need Help?

- **Supabase not working?** Check `SUPABASE_SETUP.md`
- **Vercel build fails?** Check environment variables
- **Database error?** Check `DATABASE_URL` has correct password

---

## 🚀 Next Steps

1. Add AI service API keys (OpenAI, DeepL, etc.)
2. Set up Stripe for payments
3. Customize your branding
4. Add more AI tools
5. Launch! 🎉

**Total Time: ~10 minutes**
**Total Cost: $0 to start**

You're ready to scale! 🚀
