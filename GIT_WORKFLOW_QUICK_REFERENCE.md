# ⚡ Git Workflow Quick Reference

Quick commands for your 3-branch workflow (develop, staging, production).

---

## 🌿 Branch Structure

```
main (production)
  └── staging (test)
       └── develop (development)
            └── feature/xyz (feature branches)
```

---

## 🚀 Daily Workflow

### 1. Starting New Work

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature

# Or use the shorthand:
git checkout -b feature/my-new-feature develop
```

### 2. Working on Feature

```bash
# Make changes
git add .
git commit -m "feat: Add new translation feature"

# Push to GitHub (triggers preview deployment)
git push -u origin feature/my-new-feature
```

**Result:** Vercel creates preview at `https://your-app-git-feature-my-new-feature.vercel.app`

### 3. Merge to Develop

```bash
# When feature is done, merge to develop
git checkout develop
git pull origin develop
git merge feature/my-new-feature
git push origin develop
```

**Result:** Deploys to `https://your-app-git-develop.vercel.app`

### 4. Move to Staging (QA)

```bash
# Merge develop to staging for testing
git checkout staging
git pull origin staging
git merge develop
git push origin staging
```

**Result:** Deploys to `https://your-app-git-staging.vercel.app`

### 5. Deploy to Production

```bash
# After thorough testing on staging
git checkout main
git pull origin main
git merge staging
git push origin main
```

**Result:** Deploys to production `https://your-app.vercel.app`

---

## 🔄 Quick Commands

### Check Current Branch

```bash
git branch
```

### Switch Branches

```bash
git checkout main
git checkout staging
git checkout develop
git checkout feature/my-feature
```

### Create & Switch

```bash
git checkout -b feature/new-feature
```

### Push with Tracking

```bash
git push -u origin branch-name
```

---

## 🔧 Environment-Specific URLs

After first push to each branch:

| Branch | URL |
|--------|-----|
| `main` | `https://your-app.vercel.app` |
| `staging` | `https://your-app-git-staging.vercel.app` |
| `develop` | `https://your-app-git-develop.vercel.app` |
| `feature/xyz` | `https://your-app-git-feature-xyz.vercel.app` |

---

## 🚨 Hotfix Workflow

For urgent production fixes:

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/fix-payment-bug

# 2. Make the fix
git add .
git commit -m "fix: Resolve payment processing error"
git push origin hotfix/fix-payment-bug

# 3. Merge directly to main (skip staging for urgent fixes)
git checkout main
git merge hotfix/fix-payment-bug
git push origin main

# 4. Also merge back to develop and staging to keep them in sync
git checkout develop
git merge hotfix/fix-payment-bug
git push origin develop

git checkout staging
git merge hotfix/fix-payment-bug
git push origin staging
```

---

## 📝 Commit Message Conventions

### Format

```
type: Short description

Optional longer explanation of what and why
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples

```bash
git commit -m "feat: Add AI image generation tool"
git commit -m "fix: Resolve credit calculation issue"
git commit -m "docs: Update deployment guide"
git commit -m "chore: Update dependencies"
```

---

## 🌊 Branch Sync Workflow

### Keep Branches in Sync

When staging is ahead of develop:

```bash
# Merge develop into staging to sync them
git checkout staging
git merge develop
git push origin staging
```

When develop is ahead of staging:

```bash
# Merge staging into develop
git checkout develop
git merge staging
git push origin develop
```

---

## 🔍 Useful Git Commands

### View Commit History

```bash
git log --oneline --graph --all
```

### View Changes in Working Directory

```bash
git status
git diff
```

### Stash Changes (Temporary Save)

```bash
# Save changes temporarily
git stash

# Apply stashed changes
git stash pop

# View stash list
git stash list
```

### View Branches

```bash
# List all branches
git branch -a

# List remote branches
git branch -r
```

### Delete Branches

```bash
# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

---

## 🎯 Pull Request Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/new-tool
# Make changes
git push origin feature/new-tool
```

### 2. Create Pull Request

- Go to GitHub
- Click "Compare & pull request"
- Select: `feature/new-tool` → `develop`
- Add description
- Request reviews
- Create PR

### 3. Review & Merge

- Reviewers approve
- CI checks pass (Vercel build)
- Merge to develop
- Delete feature branch

### 4. Repeat with Staging

```bash
# Create PR from develop → staging
# Test on staging deployment
# Merge to staging
```

### 5. Deploy to Production

```bash
# Create PR from staging → main
# Final review
# Merge to main
```

---

## 📊 Vercel Integration

### Automatic Deployments

```bash
git push origin develop    # → Deploys to develop URL
git push origin staging    # → Deploys to staging URL
git push origin main       # → Deploys to production URL
```

### Deployment Status

```bash
# Install Vercel CLI
npm i -g vercel

# View all deployments
vercel ls

# View specific deployment logs
vercel logs [deployment-url]
```

---

## 🚨 Rollback on Production

### Quick Rollback (Git)

```bash
# Find the last good commit
git log --oneline

# Revert the last commit
git checkout main
git revert HEAD
git push origin main
```

### Rollback in Vercel

1. Go to Vercel Dashboard
2. Click **"Deployments"**
3. Find the last working deployment
4. Click **"Promote to Production"**
5. Production instantly switches to that version

---

## 🎓 Branch Strategy Summary

### Typical Flow

```
feature → develop → staging → main
```

### Timeline

1. **Feature Development** (1-3 days)
   - Work on `feature/xyz`
   - Deploy to preview URL
   - Share for feedback

2. **Develop Integration** (1 day)
   - Merge to `develop`
   - Deploy to develop URL
   - Integration testing

3. **Staging QA** (1-2 days)
   - Merge to `staging`
   - Deploy to staging URL
   - Full QA testing
   - UAT (User Acceptance Testing)

4. **Production Release** (Day 1)
   - Merge to `main`
   - Deploy to production
   - Monitor for 24-48 hours

---

## 💡 Tips

### Work on One Feature Per Branch

```bash
❌ Bad: feature/multiple-changes
✅ Good: feature/add-ocr-tool
✅ Good: feature/improve-auth-flow
✅ Good: feature/update-billing-ui
```

### Keep Branches Short-Lived

- Feature branches: 1-3 days
- Don't let branches get too far behind main
- Rebase regularly to keep up with main

### Test Before Merging

```bash
# Test locally before pushing
npm run dev

# Test on preview deployment before merging to develop
# Test on staging before merging to main
```

---

## 📚 Related Documentation

- **[Branch Strategy Guide](./BRANCH_STRATEGY_GUIDE.md)** - Detailed multi-environment setup
- **[Vercel Deployment](./VERCEL_DEPLOYMENT_GUIDE.md)** - Deployment configuration
- **[Quick Start](./VERCEL_QUICK_START.md)** - Fast deployment setup

---

**Remember:** Every push deploys automatically! 🚀

