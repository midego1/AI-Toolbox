# 🌿 Branch Strategy Guide for Vercel

Best practices for managing development, test, and production environments with automatic deployments.

---

## 🎯 Recommended Branch Strategy

```
main (production)
  └── staging (test environment)
       └── develop (development)
            └── feature/xyz (feature branches)
```

### Branch Roles

- **`develop`** - Development branch for ongoing work
- **`staging`** - Test/pre-production environment for QA
- **`main`** - Production branch (live site)

---

## 🚀 Setup in Vercel

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel automatically detects the `main` branch as production

### Step 2: Configure Production Branch

In Vercel Dashboard → **Settings** → **Git**:

- **Production Branch**: `main`
- **Auto-deploy from**: `main` only

This ensures only merges to `main` deploy to production.

### Step 3: Enable Preview Deployments

Vercel automatically creates preview URLs for:
- `develop` branch
- `staging` branch
- Any feature branch (`feature/*`)
- Any pull request

Each gets its own URL like:
- `https://your-app-git-develop.vercel.app`
- `https://your-app-git-staging.vercel.app`
- `https://your-app-git-feature-xyz.vercel.app`

---

## ⚙️ Environment Variables Strategy

### Production Only (Main Branch)

These are used ONLY for production:

```bash
NEXT_PUBLIC_CONVEX_URL=https://production-url.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**How to set in Vercel:**
- Go to **Settings** → **Environment Variables**
- Add variable
- Select **Production Only** ✅

### Preview Environment (Staging & Develop)

Use test/development keys for preview environments:

```bash
NEXT_PUBLIC_CONVEX_URL=https://dev-url.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=https://your-app-git-staging.vercel.app
```

**How to set in Vercel:**
- Add variable
- Select **Preview** ✅
- Apply to all preview deployments

### Development Environment (Optional)

For local development:

```bash
# In .env.local (not in Vercel)
NEXT_PUBLIC_CONVEX_URL=https://dev-url.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# etc.
```

---

## 📋 Typical Workflow

### Day-to-Day Development

```bash
# 1. Create feature branch
git checkout -b feature/new-ai-tool

# 2. Make changes
git add .
git commit -m "Add new AI tool"

# 3. Push to GitHub
git push origin feature/new-ai-tool

# 4. Vercel automatically creates preview deployment
# URL: https://your-app-git-feature-new-ai-tool.vercel.app

# 5. Test on preview URL
# Share with team for testing

# 6. Merge to develop when ready
git checkout develop
git merge feature/new-ai-tool
git push origin develop
```

### Moving to Test Environment

```bash
# 1. From develop branch
git checkout develop
git pull origin develop

# 2. Merge to staging
git checkout staging
git merge develop
git push origin staging

# 3. Vercel automatically deploys to staging URL
# Test thoroughly on staging

# 4. If issues found, fix in develop and repeat
git checkout develop
# ... make fixes ...
git push origin develop
git checkout staging
git merge develop
git push origin staging
```

### Deploying to Production

```bash
# 1. From staging (after thorough testing)
git checkout staging
git pull origin staging

# 2. Merge to main (triggers production deployment)
git checkout main
git merge staging
git push origin main

# 3. Vercel automatically deploys to production!
# Production URL: https://your-app.vercel.app

# 4. Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 🔧 Branch Protection Rules (GitHub)

### Production Branch (`main`)

**Settings** → **Branches** → **Add rule for `main`**:

- ✅ **Require pull request reviews**
- ✅ **Require status checks to pass** (Vercel builds)
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow force pushes**
- ✅ **Do not allow deletions**

**Allowed to merge:**
- Branch must be up to date with main
- Vercel build must pass

### Staging Branch

**Settings** → **Branches** → **Add rule for `staging`**:

- ✅ **Require pull request reviews**
- ✅ **Require status checks**
- ❌ **Allow force pushes** (for quick fixes)

### Develop Branch

**Settings** → **Branches** → **Add rule for `develop`**:

- ❌ **No restrictions** (for fast iteration)
- ⚠️ **Allow merges** from feature branches

---

## 🌐 Environment URLs

After setup, you'll have:

| Branch | URL | Environment | Status |
|--------|-----|-------------|--------|
| `main` | `https://your-app.vercel.app` | Production | Live |
| `staging` | `https://your-app-git-staging.vercel.app` | Test | QA |
| `develop` | `https://your-app-git-develop.vercel.app` | Dev | Active |

All branches deploy automatically on push!

---

## 🔗 Setting Up Multiple Convex Environments

### Development Convex Deployment

```bash
# Deploy to development Convex project
npx convex dev

# Or deploy to named project
CONVEX_DEPLOY_KEY=dev_key npx convex deploy --prod --prod-url dev
```

### Production Convex Deployment

```bash
# Deploy to production Convex project
npx convex deploy --prod

# Or deploy to named project
CONVEX_DEPLOY_KEY=prod_key npx convex deploy --prod --prod-url production
```

**Set in Vercel:**
- Production: `NEXT_PUBLIC_CONVEX_URL=https://prod.convex.cloud`
- Preview: `NEXT_PUBLIC_CONVEX_URL=https://dev.convex.cloud`

---

## 🔐 Setting Up Multiple Clerk Instances

### Development Clerk Instance

1. Create "Development" instance in Clerk
2. Use test keys: `pk_test_...`
3. Add development domains:
   - `localhost:3000`
   - `your-app-git-develop.vercel.app`

### Production Clerk Instance

1. Create "Production" instance in Clerk
2. Use live keys: `pk_live_...`
3. Add production domains:
   - `your-app.vercel.app`
   - `your-custom-domain.com`

**Set in Vercel:**
- Production: Production Clerk keys
- Preview: Development Clerk keys

---

## 💳 Setting Up Multiple Stripe Modes

### Test Mode (Preview Environments)

Use Stripe test mode for all preview deployments:

```bash
# Stripe Dashboard → Test Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Live Mode (Production)

Use Stripe live mode only for production:

```bash
# Stripe Dashboard → Live Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

**Set in Vercel:**
- Production environment: Live Stripe keys
- Preview environment: Test Stripe keys

---

## 📊 Branch Monitoring

### Vercel Dashboard

View deployments by branch:
- **Deployments** tab shows all branches
- **Production** shows main branch deployments
- **Preview** shows all other branches

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deployment Status

on:
  push:
    branches: [main, staging, develop]

jobs:
  status:
    runs-on: ubuntu-latest
    steps:
      - name: Deployment Status
        run: |
          echo "Branch: ${{ github.ref_name }}"
          echo "Deployment will be available at Vercel"
```

---

## 🧪 Testing Strategy

### Develop Branch

- Run all unit tests
- Manual testing of new features
- Share with dev team for feedback

### Staging Branch

- Full end-to-end testing
- UAT (User Acceptance Testing)
- Test all integrations (Clerk, Stripe, Convex)
- Performance testing
- Mobile device testing

### Main Branch

- Smoke testing only
- Monitor error logs
- Monitor user feedback
- Quick rollback if issues

---

## 🚨 Rollback Strategy

### Quick Rollback to Previous Version

```bash
# Find the last good commit
git log

# Rollback main to previous commit
git checkout main
git revert HEAD
git push origin main

# Vercel automatically redeploys the previous version
```

### Vercel Rollback

1. Go to Vercel Dashboard → **Deployments**
2. Find the last working deployment
3. Click **"Promote to Production"**

This instantly switches production to that deployment.

---

## 📝 Best Practices

### Commit Messages

```bash
# Feature
feat: Add new AI translation tool

# Fix
fix: Resolve credit calculation bug

# Update production only
docs: Update README
chore: Bump dependencies
```

### Branch Naming

```bash
# Features
feature/translation-improvements
feature/add-ocr-tool

# Fixes
bugfix/credit-calculation
bugfix/auth-redirect

# Hotfixes (for production issues)
hotfix/stripe-webhook-error
```

### Release Process

```bash
# 1. Work on develop
git checkout develop
git merge feature/new-feature
git push origin develop

# 2. Test on develop deployment
# 3. Move to staging
git checkout staging
git merge develop
git push origin staging

# 4. Test on staging deployment
# 5. Deploy to production
git checkout main
git merge staging
git push origin main

# 6. Tag the release
git tag v1.2.0
git push origin v1.2.0
```

---

## 🎯 Quick Reference

### Daily Commands

```bash
# Create feature branch
git checkout -b feature/my-feature
git push -u origin feature/my-feature

# Merge to develop
git checkout develop
git merge feature/my-feature
git push origin develop

# Move to staging
git checkout staging
git merge develop
git push origin staging

# Deploy to production
git checkout main
git merge staging
git push origin main
```

### Check Deployment Status

```bash
# Install Vercel CLI
npm i -g vercel

# View deployments
vercel ls

# View logs
vercel logs
```

### Environment URLs

After setup:
- **Production**: `https://your-app.vercel.app`
- **Staging**: `https://your-app-git-staging.vercel.app`
- **Develop**: `https://your-app-git-develop.vercel.app`

---

## 📚 Summary

### Benefits of This Strategy

1. ✅ **Isolated Environments** - Each branch has its own URL
2. ✅ **Safe Testing** - Test on staging before production
3. ✅ **Fast Iteration** - Develop branch for ongoing work
4. ✅ **Easy Rollbacks** - Promote previous deployment if needed
5. ✅ **Automatic Deployments** - Every push deploys automatically
6. ✅ **Preview URLs** - Share with team for feedback

### Recommended Flow

```
feature/xyz → develop → staging → main
   ↓           ↓         ↓        ↓
preview    preview   preview   production
```

Start with this strategy and adapt as your team grows! 🚀

