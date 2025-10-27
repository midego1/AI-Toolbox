# 🔴 CRITICAL: Update Clerk Domain from .nl to .com

## The Error

When clicking on tools, you're getting:
```
This site can't be reached
Check if there is a typo in accounts.sinterklaasgpt.nl
```

## The Problem

We changed the domain from `sinterklaasgpt.nl` to `sinterklaasgpt.com` in the code, but **Clerk is still configured with the old `.nl` domain**.

## ✅ Solution: Update Clerk Domain Configuration

### Step 1: Go to Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Login and select your application
3. Look for **"Instances"** or **"Settings"** in the left menu

### Step 2: Update Custom Domain

In your Clerk instance settings, you need to update:

1. **Look for "Custom Domain" or "Frontend API" section**
2. Currently it's set to: `clerk.sinterklaasgpt.nl`
3. Change it to: `clerk.sinterklaasgpt.com`

### Step 3: DNS Configuration

You'll need to update your DNS records:

1. **Remove old DNS record**:
   - Type: CNAME
   - Name: `clerk.sinterklaasgpt.nl`
   
2. **Add new DNS record**:
   - Type: CNAME  
   - Name: `clerk.sinterklaasgpt.com`
   - Value: (provided by Clerk - usually something like `clerk.accounts.dev`)

### Step 4: Alternative Solution (Quicker)

If you want to test quickly without DNS changes:

1. Go to Clerk Dashboard → **Instances** → Your Instance
2. **Disable Custom Domain temporarily**
3. This will use the default Clerk domain (`accounts.clerk.dev`)
4. Update your environment variables to use the default domain

**Note**: The publishable key `pk_live_Y2xlcms...` is likely tied to the custom domain.

---

## 🔧 Quick Workaround (For Testing)

### Option A: Update Clerk to Use Default Domain

1. Disable custom domain in Clerk
2. Your app will work with the default Clerk domain

### Option B: Add Both Domains

1. Add both `.nl` and `.com` domains to Clerk allowed domains
2. This allows transition period

### Option C: Keep Using .nl Temporarily

If DNS hasn't changed yet:
1. Revert code changes back to `.nl`
2. Update DNS when ready
3. Then change code back to `.com`

---

## 🎯 Recommended Action

**For Immediate Fix:**

1. Go to https://dashboard.clerk.com
2. Find **"Allowed Domains"** or **"Frontend API"**
3. Add `sinterklaasgpt.com` to allowed domains
4. Keep `sinterklaasgpt.nl` until DNS is updated

**Or Update DNS Records:**

If you control DNS for sinterklaasgpt.com:

1. Add CNAME: `clerk.sinterklaasgpt.com` → Clerk-provided value
2. Wait for DNS propagation (up to 48 hours)
3. Update Clerk custom domain to `.com`

---

## 📋 Check Current Configuration

To see what's configured, run:

```bash
# Check environment
cat .env.local | grep CLERK
```

You should see:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc2ludGVya2xhYXNncHQubmwk
```

This publishable key is tied to the custom domain configuration.

