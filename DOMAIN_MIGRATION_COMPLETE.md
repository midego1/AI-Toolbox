# ✅ Domain Migration to sinterklaasgpt.com

## Summary

Your domain `sinterklaasgpt.com` is now configured. I've updated the code to use `.com` throughout.

## What Was Changed

✅ Code updated from `.nl` to `.com` in:
- `convex/lib/openrouter.ts` 
- `convex/tools/backgroundRemoval.ts`

## Next Steps Required

### 1. Update Clerk Publishable Key

Your current Clerk key is for `.nl`:
```
pk_live_Y2xlcmsuc2ludGVya2xhYXNncHQubmwk
```

You need to get the NEW key for `.com` domain:

1. Go to https://dashboard.clerk.com
2. Select your application  
3. Go to **API Keys**
4. Copy the new **Publishable Key** (starts with `pk_live_...`)
5. Copy the new **Secret Key** (starts with `sk_live_...`)

### 2. Update Environment Variables

#### In Vercel:
Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Update/Add:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<new key from Clerk for .com>
CLERK_SECRET_KEY=<new secret from Clerk for .com>
NEXT_PUBLIC_APP_URL=https://sinterklaasgpt.com
NEXT_PUBLIC_CONVEX_URL=https://sensible-tiger-956.convex.cloud
```

#### In Convex:
```bash
npx convex env set APP_URL https://sinterklaasgpt.com
```

### 3. Commit and Push Changes

After getting the new Clerk keys:

```bash
# Update .env.local for local development
# Edit .env.local and update CLERK keys with new .com keys

# Then commit code changes
git add convex/
git commit -m "Update domain to sinterklaasgpt.com"
git push
```

### 4. Redeploy on Vercel

After adding the new environment variables to Vercel:
1. Go to Vercel → Deployments
2. Click **"Redeploy"** on the latest deployment

---

## Checklist

- [ ] Got new Clerk publishable key for .com domain
- [ ] Got new Clerk secret key for .com domain  
- [ ] Updated Vercel environment variables
- [ ] Updated Convex environment variables (`APP_URL`)
- [ ] Committed and pushed code changes
- [ ] Redeployed on Vercel
- [ ] Tested sign-in/sign-up pages
- [ ] Tested tool pages (no more spinning)

---

## Troubleshooting

**If Clerk still not working:**
- Verify new Clerk keys are correct
- Make sure `.com` domain is added to Clerk's allowed domains
- Check Clerk Dashboard → Settings → Domains includes `sinterklaasgpt.com`

**If tools still spinning:**
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly in Vercel
- Check browser console for errors
- Make sure Convex deployment is active

