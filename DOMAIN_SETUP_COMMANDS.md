# 🌐 Domain Setup for SinterklaasGPT

## Recommended Domain

**Use**: `https://sinterklaasgpt.com` (without www)

## Setup Instructions

### 1. Add to Vercel Environment Variables

```
NEXT_PUBLIC_APP_URL=https://sinterklaasgpt.com
```

### 2. Add to Convex Environment Variables

```bash
npx convex env set APP_URL https://sinterklaasgpt.com
```

### 3. Configure Domain Redirect in Vercel

If you add both domains to Vercel:
- Primary: `sinterklaasgpt.com`
- Alias: `www.sinterklaasgpt.com`

Vercel will automatically redirect `www` → non-www

## Quick Setup Commands

```bash
# Set in Convex
npx convex env set APP_URL https://sinterklaasgpt.com

# Verify it's set
npx convex env get APP_URL
```

## Domain Configuration Checklist

- [ ] `sinterklaasgpt.com` added to Vercel
- [ ] `www.sinterklaasgpt.com` redirects to non-www (automatic in Vercel)
- [ ] `APP_URL` set in Convex to `https://sinterklaasgpt.com`
- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel to `https://sinterklaasgpt.com`
- [ ] Clerk allowed domains include `sinterklaasgpt.com`
- [ ] Stripe redirect URLs use `https://sinterklaasgpt.com`

## Benefits of Non-WWW

✅ Modern, clean, shorter
✅ Better SEO
✅ Easier to remember
✅ Faster typing in browsers
✅ 2024 best practice

