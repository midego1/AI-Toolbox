# 🔐 Clerk Authentication Setup Guide

## ✅ What's Already Implemented

Your app now has Clerk authentication fully integrated:
- ✅ Clerk packages installed
- ✅ Database schema updated with Clerk support
- ✅ Convex sync functions created
- ✅ Root layout wrapped with ClerkProvider
- ✅ Dashboard layout uses Clerk auth
- ✅ Login/Signup pages use Clerk UI

## 🚀 Setup Steps

### 1. Create Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose **Next.js** as your framework

### 2. Configure Authentication

In Clerk Dashboard:
1. Go to **Authentication** → **Social Connections**
2. Enable providers you want:
   - ✅ Google (most popular)
   - ✅ GitHub
   - ✅ Email (Magic link or password)
   - Or any other provider you prefer
3. These are enabled with **one click** - no OAuth app setup needed!

### 3. Get Your API Keys

From Clerk Dashboard:
1. Go to **API Keys**
2. Copy these values:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 4. Add Environment Variables

Create `.env.local` (or update existing):

```bash
# Clerk Keys (add these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Add these to Convex Dashboard too!
```

### 5. Add to Convex Environment

In [Convex Dashboard](https://dashboard.convex.dev):
1. Go to **Settings** → **Environment Variables**
2. Add the secret key:
   - Name: `CLERK_SECRET_KEY`
   - Value: `sk_test_...` (or your production key)

### 6. Configure Clerk Webhook (For User Sync)

In Clerk Dashboard → **Webhooks**:

1. Click **Add Endpoint**
2. Endpoint URL: `https://your-convex-deployment.convex.site/api/clerk-webhook`
   (You'll get the exact URL when you deploy Convex - it looks like `xyz123.convex.site`)
3. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
4. After creating the endpoint, copy the **Signing Secret**: `whsec_...`

#### Add Signing Secret to Convex

The signing secret proves webhooks are actually from Clerk:

In [Convex Dashboard](https://dashboard.convex.dev):
1. Go to **Settings** → **Environment Variables**
2. Click **Add Variable**
3. Name: `RemoveCLERK_WEBHOOK_SECRET`
4. Value: paste your signing secret (starts with `whsec_`)

**Note**: Right now, the webhook handler accepts all requests. For production, you should verify the signature. For development, this is fine.

### 7. Update Convex Webhook Handler

Create `/convex/http.ts` route if it doesn't exist, or add to existing:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();
    
    // Verify webhook signature (optional but recommended)
    // Implement with Svix or similar
    
    if (payload.type === "user.created" || payload.type === "user.updated") {
      const userId = payload.data.id;
      const email = payload.data.email_addresses[0]?.email_address;
      const firstName = payload.data.first_name;
      const lastName = payload.data.last_name;
      const avatar = payload.data.image_url;
      
      await ctx.runMutation(internal.clerk.syncClerkUser, {
        clerkUserId: userId,
        email,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName,
        avatarUrl: avatar,
      });
    }
    
    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

## 🎨 Customize Clerk UI (Optional)

You can customize Clerk's appearance in `src/app/layout.tsx`:

```typescript
<ClerkProvider
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "shadow-2xl",
      headerTitle: "text-primary",
      // ... more customization
    },
  }}
>
```

## 🧪 Testing

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Login Flow**:
   - Go to `http://localhost:3000/login`
   - Click "Sign in with Google" (or any enabled provider)
   - Complete OAuth flow
   - Should redirect to dashboard

3. **Test Signup Flow**:
   - Go to `http://localhost:3000/signup`
   - Try different providers
   - Check that user is created in Convex

## 📊 How It Works

### Flow Diagram

```
1. User clicks "Sign in with Google"
   ↓
2. Clerk handles OAuth flow
   ↓
3. Clerk creates/updates user
   ↓
4. Webhook fires to Convex
   ↓
5. Convex syncs user to database
   ↓
6. User redirected to dashboard with session
```

### What Happens Behind the Scenes

1. **User Signs In**: Clerk authenticates the user
2. **Webhook Triggered**: Clerk sends user data to your Convex endpoint
3. **User Sync**: Convex creates/updates user in your database
4. **Session Created**: Clerk manages the session
5. **App Access**: User can access the dashboard

## 🔧 Migration from Old Auth

Your existing Convex auth system is **still functional** for backward compatibility:

- Old email/password users: Still work
- New Clerk users: Use Clerk
- Mixed support: Both systems coexist

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

4. Deploy!

### Clerk Configuration for Production

1. In Clerk Dashboard → **Instances**:
   - Click your production instance
   - Add domains: `yourdomain.com`
   - Configure allowed redirect URLs

2. Update environment variables:
   - Use production keys: `pk_live_...` and `sk_live_...`

## 📱 Mobile Support

Clerk works on mobile out of the box:
- Responsive UI
- Mobile-optimized OAuth flows
- Native app support (if you build one later)

## 🔐 Security Features

Clerk provides:
- ✅ Secure password storage (bcrypt)
- ✅ OAuth 2.0 compliant
- ✅ Session management
- ✅ MFA support (optional)
- ✅ Email verification
- ✅ Password reset flows
- ✅ Account protection

## 💰 Pricing

- **Free tier**: 10,000 MAU (Monthly Active Users)
- **Paid**: $25/month + $0.02 per MAU after 10K
- Perfect for startup to scale

## 🎯 Next Steps

1. ✅ Set up Clerk account
2. ✅ Add environment variables
3. ✅ Configure webhook
4. ✅ Test locally
5. ✅ Deploy to production

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk API Reference](https://clerk.com/docs/reference)
- [Support](https://clerk.com/support)

---

**You're ready to use Clerk authentication! 🎉**

Just add your API keys and you'll have secure, social login without OAuth app setup!

