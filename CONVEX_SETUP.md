# Convex + Vercel Setup - Perfect for AI Tools

Complete guide for deploying your AI SaaS platform with Convex (backend + database + auth + storage) and Vercel (hosting).

**Why Convex for AI?** Built-in Actions for external API calls, real-time updates, TypeScript-first, file storage, and job queuing - everything AI tools need!

---

## 🎯 Why Convex is PERFECT for AI Tools

### Built for AI Workloads:

1. **Actions** - Designed for calling external APIs
   ```typescript
   // Perfect for AI APIs!
   export const generateImage = action(async (ctx, { prompt }) => {
     const response = await openai.createImage({ prompt });
     return response.data;
   });
   ```

2. **Real-time by Default** - Users see AI processing live
   ```typescript
   // Job status updates automatically in UI
   const job = useQuery(api.jobs.get, { jobId });
   // User sees: "processing..." → "completed!" in real-time
   ```

3. **TypeScript Everything** - Type-safe AI tool definitions
   ```typescript
   // Full type safety from backend to frontend
   const result = await runMutation(api.tools.translation.execute, {
     text: "Hello",
     targetLang: "es", // TypeScript knows these types!
   });
   ```

4. **File Storage Built-in** - For OCR, images, uploads
   ```typescript
   // Upload images for OCR directly to Convex
   const storageId = await generateUploadUrl();
   ```

5. **Scheduled Functions** - Auto credit allocation
   ```typescript
   // Reset monthly credits automatically
   export default crons.monthly("resetCredits", ...);
   ```

6. **Built-in Job Queue** - Long-running AI tasks
   ```typescript
   // Convex handles queuing automatically
   export const processVideo = action(async (ctx) => {
     // Can run for minutes, Convex handles it
   });
   ```

---

## 🚀 Quick Start (15 Minutes)

### Step 1: Install Convex (2 minutes)

```bash
# In your project root
npm install convex

# Initialize Convex
npx convex dev

# This will:
# 1. Create convex/ folder
# 2. Create a new Convex project
# 3. Give you a deployment URL
# 4. Start development server
```

Save the URL shown: `https://your-project.convex.cloud`

### Step 2: Set Up Convex Schema (3 minutes)

Create the schema for your AI platform:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    subscriptionTier: v.string(), // "free", "pro", "enterprise"
    creditsBalance: v.number(),
    stripeCustomerId: v.optional(v.string()),
  }).index("by_email", ["email"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    planType: v.string(), // "monthly", "yearly"
    status: v.string(), // "active", "canceled", "past_due"
    currentPeriodStart: v.number(), // timestamp
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  }).index("by_user", ["userId"])
    .index("by_stripe_id", ["stripeSubscriptionId"]),

  creditTransactions: defineTable({
    userId: v.id("users"),
    amount: v.number(), // positive for add, negative for deduct
    type: v.string(), // "purchase", "usage", "refund", "monthly_allocation"
    description: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    aiJobId: v.optional(v.id("aiJobs")),
  }).index("by_user", ["userId"])
    .index("by_created", ["_creationTime"]),

  aiJobs: defineTable({
    userId: v.id("users"),
    jobType: v.string(), // "translation", "ocr", "image_generation", etc.
    status: v.string(), // "pending", "processing", "completed", "failed"
    inputData: v.any(), // Store any input data
    outputData: v.optional(v.any()), // Store results
    creditsUsed: v.number(),
    errorMessage: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created", ["_creationTime"]),

  usageLogs: defineTable({
    userId: v.id("users"),
    toolType: v.string(),
    creditsConsumed: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_user", ["userId"])
    .index("by_timestamp", ["_creationTime"]),
});
```

### Step 3: Create Core Functions (5 minutes)

```typescript
// convex/users.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user profile
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Create user on signup
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { email, name }) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("User already exists");
    }

    // Create user with free tier and 100 credits
    const userId = await ctx.db.insert("users", {
      email,
      name,
      subscriptionTier: "free",
      creditsBalance: 100,
    });

    // Log initial credits
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: 100,
      type: "monthly_allocation",
      description: "Welcome credits - Free tier",
    });

    return userId;
  },
});

// Deduct credits
export const deductCredits = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, { userId, amount, description }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.creditsBalance < amount) {
      throw new Error("Insufficient credits");
    }

    // Update balance
    await ctx.db.patch(userId, {
      creditsBalance: user.creditsBalance - amount,
    });

    // Log transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: -amount,
      type: "usage",
      description,
    });

    return user.creditsBalance - amount;
  },
});
```

### Step 4: Create AI Tool Actions (5 minutes)

Actions are perfect for calling AI APIs!

```typescript
// convex/tools/translation.ts
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

export const execute = action({
  args: {
    userId: v.id("users"),
    text: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, { userId, text, sourceLang, targetLang }) => {
    // 1. Check user has credits
    const user = await ctx.runQuery(api.users.get, { userId });
    if (!user || user.creditsBalance < 1) {
      throw new Error("Insufficient credits");
    }

    // 2. Create AI job
    const jobId = await ctx.runMutation(api.aiJobs.create, {
      userId,
      jobType: "translation",
      inputData: { text, sourceLang, targetLang },
      creditsUsed: 1,
    });

    try {
      // 3. Call AI API (DeepL, Google Translate, etc.)
      const response = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: {
          "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [text],
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
      });

      const data = await response.json();
      const translatedText = data.translations[0].text;

      // 4. Update job with results
      await ctx.runMutation(api.aiJobs.complete, {
        jobId,
        outputData: { translatedText },
      });

      // 5. Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        userId,
        amount: 1,
        description: "Translation",
      });

      return { translatedText, jobId };
    } catch (error) {
      // Mark job as failed
      await ctx.runMutation(api.aiJobs.fail, {
        jobId,
        errorMessage: error.message,
      });
      throw error;
    }
  },
});
```

```typescript
// convex/tools/imageGeneration.ts
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

export const execute = action({
  args: {
    userId: v.id("users"),
    prompt: v.string(),
    size: v.string(),
  },
  handler: async (ctx, { userId, prompt, size }) => {
    // Check credits (image generation costs 10 credits)
    const user = await ctx.runQuery(api.users.get, { userId });
    if (!user || user.creditsBalance < 10) {
      throw new Error("Insufficient credits (need 10)");
    }

    // Create job
    const jobId = await ctx.runMutation(api.aiJobs.create, {
      userId,
      jobType: "image_generation",
      inputData: { prompt, size },
      creditsUsed: 10,
    });

    try {
      // Call OpenAI DALL-E
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          size,
          n: 1,
        }),
      });

      const data = await response.json();
      const imageUrl = data.data[0].url;

      // Complete job
      await ctx.runMutation(api.aiJobs.complete, {
        jobId,
        outputData: { imageUrl },
      });

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        userId,
        amount: 10,
        description: "Image Generation",
      });

      return { imageUrl, jobId };
    } catch (error) {
      await ctx.runMutation(api.aiJobs.fail, {
        jobId,
        errorMessage: error.message,
      });
      throw error;
    }
  },
});
```

### Step 5: Add Real-time Job Tracking

```typescript
// convex/aiJobs.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    jobType: v.string(),
    inputData: v.any(),
    creditsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiJobs", {
      ...args,
      status: "processing",
    });
  },
});

export const complete = mutation({
  args: {
    jobId: v.id("aiJobs"),
    outputData: v.any(),
  },
  handler: async (ctx, { jobId, outputData }) => {
    await ctx.db.patch(jobId, {
      status: "completed",
      outputData,
      completedAt: Date.now(),
    });
  },
});

export const fail = mutation({
  args: {
    jobId: v.id("aiJobs"),
    errorMessage: v.string(),
  },
  handler: async (ctx, { jobId, errorMessage }) => {
    await ctx.db.patch(jobId, {
      status: "failed",
      errorMessage,
      completedAt: Date.now(),
    });
  },
});

// Real-time job status query
export const get = query({
  args: { jobId: v.id("aiJobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get(jobId);
  },
});

// Get user's recent jobs
export const getUserJobs = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 10 }) => {
    return await ctx.db
      .query("aiJobs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});
```

### Step 6: Use in Frontend (React)

Convex provides React hooks that are real-time by default!

```typescript
// src/app/(dashboard)/tools/translation/page.tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function TranslationPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [jobId, setJobId] = useState(null);

  // Get current user (from Convex Auth)
  const user = useQuery(api.users.getCurrentUser);

  // Execute translation action
  const translate = useMutation(api.tools.translation.execute);

  // Watch job status in real-time!
  const job = useQuery(api.aiJobs.get, jobId ? { jobId } : "skip");

  const handleTranslate = async () => {
    const result = await translate({
      userId: user._id,
      text,
      sourceLang: "en",
      targetLang: "es",
    });

    setJobId(result.jobId);
    // Job status updates automatically via useQuery!
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleTranslate}>Translate (1 credit)</button>

      {/* Real-time job status */}
      {job && (
        <div>
          Status: {job.status}
          {job.status === "completed" && (
            <div>Result: {job.outputData.translatedText}</div>
          )}
          {job.status === "failed" && (
            <div>Error: {job.errorMessage}</div>
          )}
        </div>
      )}

      {/* User's credits update in real-time too! */}
      <div>Credits: {user?.creditsBalance}</div>
    </div>
  );
}
```

---

## 🎨 Convex File Storage (For OCR, Images)

Perfect for uploading images for OCR or storing generated images!

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  // Generate a short-lived upload URL
  return await ctx.storage.generateUploadUrl();
});

// Frontend usage
const generateUploadUrl = useMutation(api.files.generateUploadUrl);
const storageId = await generateUploadUrl();

// Upload file
const result = await fetch(storageId, {
  method: "POST",
  body: file,
});

// Store reference in database
await ctx.db.insert("aiJobs", {
  userId,
  jobType: "ocr",
  inputData: { imageStorageId: storageId },
  ...
});

// Later, get the file
const url = await ctx.storage.getUrl(storageId);
```

---

## ⏰ Scheduled Functions (Auto Credit Allocation)

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Reset monthly credits on 1st of each month
crons.monthly(
  "reset monthly credits",
  { day: 1 },
  internal.users.allocateMonthlyCredits
);

// Cleanup old jobs after 30 days
crons.daily(
  "cleanup old jobs",
  { hourUTC: 2 }, // 2 AM UTC
  internal.aiJobs.cleanup
);

export default crons;
```

---

## 🔐 Convex Auth

Convex has built-in auth with Clerk or custom providers:

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: "https://your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

Or use custom auth (email/password):

```typescript
// convex/auth.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { hashPassword, verifyPassword } from "./utils/crypto";

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { email, password, name }) => {
    const hashedPassword = await hashPassword(password);

    const userId = await ctx.db.insert("users", {
      email,
      name,
      passwordHash: hashedPassword,
      subscriptionTier: "free",
      creditsBalance: 100,
    });

    return userId;
  },
});
```

---

## 🚀 Deploy to Production

### 1. Deploy Convex Backend

```bash
npx convex deploy
```

This gives you a production deployment URL: `https://your-project.convex.cloud`

### 2. Set Environment Variables

```bash
# In Convex dashboard, add:
OPENAI_API_KEY=sk-...
DEEPL_API_KEY=...
STRIPE_SECRET_KEY=sk_live_...
```

### 3. Deploy Frontend to Vercel

```bash
# Add to Vercel environment variables:
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

Deploy normally to Vercel!

---

## 💰 Pricing

### Convex Free Tier (VERY Generous):
- 1 GB database storage
- 5 GB file storage
- 1M function calls/month
- 1M database rows read/month
- Unlimited realtime connections
- Free SSL
- No credit card required

**Perfect for MVP and early growth!**

### As You Scale:
- **Pro:** $25/month (includes 5GB storage, 10M calls)
- **Custom:** For enterprise needs

---

## 🎯 Why Convex Beats Supabase for AI

| Feature | Convex | Supabase |
|---------|--------|----------|
| **AI API Calls** | Actions (built-in) | Edge Functions |
| **Real-time** | Default, everywhere | Needs setup per table |
| **Type Safety** | Full TypeScript | Generated types |
| **File Storage** | Built-in | Built-in |
| **Job Queue** | Automatic | Need external service |
| **Scheduled Tasks** | Built-in crons | Need external service |
| **Code Organization** | All in one place | Scattered |
| **Learning Curve** | Lower | Moderate |
| **AI Tool Development** | **Faster** | Slower |

**For your AI platform: Convex is the winner! 🏆**

---

## 📊 Architecture with Convex

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js/Vercel)       │
│  - useQuery (auto real-time)            │
│  - useMutation (optimistic updates)     │
│  - useAction (AI API calls)             │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│           Convex Backend                │
│  ┌─────────────────────────────────┐   │
│  │ Queries (real-time)             │   │
│  │ Mutations (transactions)        │   │
│  │ Actions (external APIs)   ──────┼───┼──→ OpenAI
│  │ Crons (scheduled)               │   │──→ DeepL
│  │ File Storage                    │   │──→ Google
│  └─────────────────────────────────┘   │──→ Stripe
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Database (automatic)       │   │
│  │  - users                        │   │
│  │  - aiJobs (with indexes)        │   │
│  │  - creditTransactions           │   │
│  │  - subscriptions                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## ✅ Summary: Why Choose Convex

### Perfect for AI SaaS:
1. ✅ **Actions** - Built for AI API calls
2. ✅ **Real-time** - Job status updates live
3. ✅ **TypeScript** - Full type safety
4. ✅ **File Storage** - Built-in for images/uploads
5. ✅ **Crons** - Auto credit allocation
6. ✅ **Simpler** - All backend in one place
7. ✅ **Generous Free Tier** - 1GB DB, 5GB storage
8. ✅ **Great DX** - Fast development

### Add New AI Tools Easily:
```typescript
// Just create new action file!
// convex/tools/sentiment-analysis.ts
export const execute = action({...});

// Use immediately in frontend
const analyze = useAction(api.tools.sentimentAnalysis.execute);
```

### Real-time by Default:
```typescript
// User sees updates instantly, no polling!
const job = useQuery(api.aiJobs.get, { jobId });
// Automatically updates: processing → completed
```

**Convex + Vercel = Perfect AI SaaS Stack! 🚀**

---

## 🚀 Next Steps

1. **Install Convex:** `npx convex dev`
2. **Copy schema** from this guide
3. **Create AI tool actions**
4. **Deploy:** `npx convex deploy`
5. **Deploy to Vercel** with `NEXT_PUBLIC_CONVEX_URL`

**Ready to build with Convex?** It's the best choice for your AI platform! 🎉
