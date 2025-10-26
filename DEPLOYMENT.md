# Deployment Guide - Vercel Auto-Deploy Setup

This guide will help you set up automatic deployments to Vercel, where every commit creates a new preview environment.

## 🚀 How Vercel Auto-Deploy Works

When connected to your GitHub repository, Vercel automatically:

1. **Production Deployments** - Deploys from your `main` branch to production URL
2. **Preview Deployments** - Creates unique preview URLs for every branch/commit
3. **Automatic Builds** - Rebuilds on every push
4. **Environment Isolation** - Each preview has its own URL and can have separate environment variables

## 📋 One-Time Setup

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in/sign up
2. Click **"Add New Project"**
3. Import your GitHub repository (`midego1/AI-Toolbox`)
4. Vercel will automatically detect Next.js

### Step 2: Configure Build Settings

Vercel should auto-detect these settings (already configured in `vercel.json`):

```
Framework Preset: Next.js
Build Command: prisma generate && next build
Install Command: npm install --legacy-peer-deps
Output Directory: .next (default)
```

### Step 3: Set Environment Variables

Add these environment variables in Vercel Dashboard:

#### Required for All Environments

```bash
# Database (use different databases for production/preview)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-app.vercel.app"  # Auto-set by Vercel

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs
STRIPE_PRICE_ID_PRO_MONTHLY="price_..."
STRIPE_PRICE_ID_PRO_YEARLY="price_..."
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY="price_..."
STRIPE_PRICE_ID_ENTERPRISE_YEARLY="price_..."

# AI Service API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_CLOUD_VISION_API_KEY="..."
DEEPL_API_KEY="..."
REPLICATE_API_TOKEN="r8_..."

# File Storage (Optional)
STORAGE_BUCKET_NAME="ai-toolbox-storage"
STORAGE_ACCESS_KEY="..."
STORAGE_SECRET_KEY="..."
STORAGE_REGION="auto"
STORAGE_ENDPOINT="..."
```

#### Setting Environment Variables

In Vercel Dashboard:
1. Go to **Project Settings** → **Environment Variables**
2. Add each variable
3. Select which environments to apply to:
   - ✅ Production (main branch)
   - ✅ Preview (all other branches)
   - ✅ Development (local)

### Step 4: Database Setup for Preview Deployments

**Option A: Shared Database (Simpler)**
- Use the same database for production and preview
- Good for testing, but be careful with data

**Option B: Separate Databases (Recommended)**
- Use different DATABASE_URL for preview environments
- Vercel allows environment-specific variables
- Set "Production" DATABASE_URL separately from "Preview" DATABASE_URL

**Option C: Vercel Postgres (Easiest)**
```bash
# In your Vercel project
1. Go to Storage tab
2. Create Postgres Database
3. Vercel auto-injects DATABASE_URL
```

### Step 5: Deploy!

1. Click **"Deploy"** in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Visit your production URL: `https://your-app.vercel.app`

## 🔄 Automatic Preview Deployments

### How It Works

Every time you push to GitHub:

```bash
# Example workflow
git checkout -b feature/new-tool
git add .
git commit -m "Add new AI tool"
git push origin feature/new-tool

# Vercel automatically:
# 1. Detects the push
# 2. Creates a new preview deployment
# 3. Generates unique URL: https://ai-toolbox-abc123-user.vercel.app
# 4. Comments on PR with preview link (if PR exists)
```

### Preview URLs

Each preview deployment gets:
- Unique URL: `https://your-app-git-[branch]-user.vercel.app`
- Same environment as production
- Separate from production data (if using separate databases)

### Where to Find Preview Links

1. **GitHub PR Comments** - Vercel bot automatically comments
2. **Vercel Dashboard** - Lists all deployments
3. **Vercel CLI** - Run `vercel ls` to see all deployments
4. **Email/Slack Notifications** - Configure in Vercel settings

## 🌿 Branch-Based Deployment Strategy

### Recommended Git Workflow

```
main (production)
  └── develop (staging)
       ├── feature/translation-improvements
       ├── feature/new-ai-tool
       └── bugfix/credit-calculation
```

**Deployment Behavior:**
- `main` → Production: `https://your-app.vercel.app`
- `develop` → Staging: `https://your-app-git-develop.vercel.app`
- Feature branches → Preview: `https://your-app-git-feature-*.vercel.app`

## 🔧 Advanced Configuration

### Custom Domains

In Vercel Dashboard:
1. Go to **Project Settings** → **Domains**
2. Add custom domain (e.g., `ai-toolbox.com`)
3. Update DNS records as instructed
4. Production deployments use custom domain
5. Preview deployments still use Vercel URLs

### Environment-Specific Variables

```bash
# Set different values per environment
# Production
DATABASE_URL="postgresql://prod-server/db"

# Preview
DATABASE_URL="postgresql://preview-server/db"

# Development
DATABASE_URL="postgresql://localhost/db"
```

### Build Performance

The project is configured for optimal Vercel builds:

```json
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "regions": ["iad1"]  // US East (change based on your users)
}
```

### Database Migrations on Deploy

**Option 1: Automatic (in vercel.json)**
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

**Option 2: Manual (safer for production)**
```bash
# Run migrations separately before deploy
npx prisma migrate deploy
```

## 🔒 Security Best Practices

### Environment Variables

- ✅ Never commit `.env` to Git
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate secrets regularly
- ✅ Use different API keys for production/preview

### Database Security

- ✅ Use connection pooling (Prisma Data Proxy or PgBouncer)
- ✅ Enable SSL for database connections
- ✅ Use separate databases for preview deployments
- ✅ Limit database user permissions

### Stripe Webhooks

Update your Stripe webhook URLs:

**Production:**
```
https://your-app.vercel.app/api/webhooks/stripe
```

**Preview (optional, for testing):**
```
https://your-app-git-develop.vercel.app/api/webhooks/stripe
```

## 🐛 Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Check package.json dependencies
npm install --legacy-peer-deps
```

**Error: "Prisma Client not generated"**
```bash
# Solution: Ensure build command includes prisma generate
# Already configured in vercel.json
```

### Database Connection Issues

**Error: "Can't reach database server"**
```bash
# Solution: Check DATABASE_URL format
# PostgreSQL format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# Add connection pooling for Vercel:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&connection_limit=5&pool_timeout=10
```

### Environment Variables Not Working

1. Check spelling and casing
2. Redeploy after adding variables
3. Ensure correct environment is selected (Production/Preview/Development)

## 📊 Monitoring Deployments

### Vercel Dashboard

View:
- Build logs
- Runtime logs
- Error tracking
- Performance metrics
- Build duration

### Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# List deployments
vercel ls

# View logs
vercel logs [deployment-url]

# Set environment variables
vercel env add DATABASE_URL

# Pull environment variables locally
vercel env pull .env.local
```

## 🎯 Testing Preview Deployments

### Before Merging to Main

1. Push feature branch
2. Wait for preview deployment
3. Click preview URL from GitHub PR
4. Test thoroughly on preview environment
5. Merge to main only if preview works

### Preview Checklist

- [ ] UI renders correctly
- [ ] Authentication works
- [ ] Database queries succeed
- [ ] API routes respond
- [ ] Responsive design on mobile
- [ ] No console errors
- [ ] Credits system functional

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] Production database set up
- [ ] All environment variables configured
- [ ] Custom domain added (optional)
- [ ] Stripe production keys added
- [ ] AI service production API keys
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Error monitoring configured
- [ ] Stripe webhooks configured
- [ ] Test all features on production

### Launch Steps

1. Merge to `main` branch
2. Vercel auto-deploys to production
3. Test production URL
4. Update DNS if using custom domain
5. Monitor for errors

## 📈 Post-Deployment

### Monitoring

- **Vercel Analytics** - Built-in performance tracking
- **Error Tracking** - Sentry or Vercel's error tracking
- **Database Monitoring** - Check connection pool usage
- **Stripe Dashboard** - Monitor payments

### Scaling

Vercel automatically scales:
- ✅ Serverless functions auto-scale
- ✅ Edge network CDN
- ✅ No server management needed

For high traffic:
- Consider Vercel Pro plan
- Use Redis for caching
- Implement database connection pooling
- Optimize images with next/image

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

## 🎉 Summary

After initial setup, your workflow becomes:

```bash
# 1. Make changes
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push origin your-branch

# 3. Vercel automatically deploys
# → Get instant preview URL
# → Test on real environment
# → Merge when ready
```

**Every push = automatic deployment!** 🚀
