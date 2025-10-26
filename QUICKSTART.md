# 🚀 Quick Start - Deploy to Vercel in 5 Minutes

## Step-by-Step Deployment

### 1️⃣ Push to GitHub (if not already done)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2️⃣ Connect to Vercel

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your `midego1/AI-Toolbox` repository
5. Click **"Import"**

### 3️⃣ Configure Project (Auto-detected)

Vercel will automatically detect:
- ✅ Framework: Next.js
- ✅ Build Command: `prisma generate && next build`
- ✅ Output Directory: `.next`

Just click **"Deploy"** or continue to add environment variables first.

### 4️⃣ Add Essential Environment Variables

Click **"Environment Variables"** and add these:

#### Minimum Required (to get started):

```bash
# Database - Use Vercel Postgres (easiest)
DATABASE_URL=          # Auto-filled if you add Vercel Postgres

# Auth
NEXTAUTH_SECRET=       # Generate: openssl rand -base64 32
```

That's it! You can add AI service keys later.

#### Full Environment Variables (for production):

See `.env.example` for complete list including:
- Stripe keys
- OpenAI API key
- Other AI service keys

### 5️⃣ Deploy!

Click **"Deploy"** and wait ~2-3 minutes.

You'll get:
- ✅ Production URL: `https://your-app.vercel.app`
- ✅ Auto-generated SSL certificate
- ✅ Global CDN

---

## 🎉 You're Live!

### What Happens Next?

Every time you push to GitHub:

```bash
# Work on a feature
git checkout -b feature/my-feature
git add .
git commit -m "Add new feature"
git push origin feature/my-feature

# Vercel automatically:
# ✅ Builds your branch
# ✅ Creates preview URL
# ✅ Comments on PR with link
# ✅ You test before merging
```

---

## 📦 Quick Database Setup

### Option A: Vercel Postgres (Easiest)

1. In your Vercel project, go to **"Storage"** tab
2. Click **"Create Database"** → **"Postgres"**
3. Vercel automatically injects `DATABASE_URL`
4. Done! No manual configuration needed.

### Option B: External Database

Use any PostgreSQL database:
- [Neon](https://neon.tech) - Free tier with great performance
- [Supabase](https://supabase.com) - Free tier + additional features
- [Railway](https://railway.app) - Simple setup
- [Heroku Postgres](https://www.heroku.com/postgres) - Classic option

Copy connection string to `DATABASE_URL` in Vercel.

---

## ✅ Post-Deployment Checklist

After first deployment:

- [ ] Visit your production URL
- [ ] Create a test account (signup page)
- [ ] Check if login works
- [ ] Browse dashboard
- [ ] Test at least one AI tool (will need API keys)

---

## 🔑 Adding AI Service Keys (Later)

When ready to enable AI features:

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add keys for services you want to use:

```bash
# OpenAI (for image generation)
OPENAI_API_KEY=sk-...

# Translation
DEEPL_API_KEY=...

# OCR
GOOGLE_CLOUD_VISION_API_KEY=...
```

3. **Redeploy** to apply changes:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

---

## 🐛 Troubleshooting

### Build Failed?

**Check build logs** in Vercel dashboard:
- Click on failed deployment
- View **"Build Logs"**
- Common issues usually related to missing environment variables

### Database Connection Error?

```bash
# Ensure DATABASE_URL is set
# Format: postgresql://user:pass@host:port/db

# For Prisma, run migrations:
# Add to Build Command in Vercel:
prisma migrate deploy && next build
```

### Can't Sign Up?

1. Check `NEXTAUTH_SECRET` is set
2. Check `DATABASE_URL` is accessible
3. View runtime logs in Vercel dashboard

---

## 📊 Monitoring

### View Logs

In Vercel Dashboard:
1. Go to your project
2. Click **"Logs"** tab
3. See real-time application logs

### Performance

Vercel provides:
- ✅ Automatic analytics
- ✅ Web Vitals monitoring
- ✅ Error tracking
- ✅ Build time metrics

---

## 🎯 Next Steps

1. ✅ Deployed? Great!
2. Add AI service API keys
3. Set up Stripe for payments (see `DEPLOYMENT.md`)
4. Configure custom domain (optional)
5. Invite team members to Vercel project
6. Set up production database with backups

---

## 💡 Pro Tips

### Preview Deployments

Every branch gets a preview URL:
```bash
git checkout -b test-feature
git push origin test-feature
# Get instant preview URL - test before merging!
```

### Environment Variable Management

```bash
# Pull production env vars to local
vercel env pull .env.local

# Useful for development
```

### Instant Rollback

Made a mistake?
1. Go to **Deployments**
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**
4. Instant rollback!

---

## 📚 Learn More

- [Full Deployment Guide](./DEPLOYMENT.md) - Detailed instructions
- [Vercel Docs](https://vercel.com/docs) - Official documentation
- [Next.js on Vercel](https://nextjs.org/docs/deployment) - Best practices

---

**Ready to deploy? Let's go!** 🚀

Questions? Check `DEPLOYMENT.md` for detailed troubleshooting.
