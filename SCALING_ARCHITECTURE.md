# Scaling Architecture for Multi-Tool AI Platform

Complete guide for scaling to 50+ AI tools with self-hosted database.

---

## 🎯 Architecture Overview

Your current setup is **perfect** for scaling. Here's the recommended architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - Dynamic tool pages                                        │
│  - Tool registry/catalog                                     │
│  - Unified UI components                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                 API LAYER (Next.js API Routes)               │
│  - Tool execution engine                                     │
│  - Credit management                                         │
│  - Rate limiting                                             │
│  - Job queue                                                 │
└──┬──────────┬──────────┬──────────┬─────────┬──────────────┘
   │          │          │          │         │
   ▼          ▼          ▼          ▼         ▼
┌──────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌──────────┐
│ AI   │ │ AI     │ │ AI     │ │Credit│ │PostgreSQL│
│ API  │ │ API    │ │ API    │ │System│ │(Self-    │
│ #1   │ │ #2     │ │ #3...  │ │      │ │hosted)   │
└──────┘ └────────┘ └────────┘ └──────┘ └──────────┘
```

---

## 📊 Database Schema for Scalable Tools

Your current schema is good! Here's how to extend it:

### Current Schema (Perfect Foundation)
```prisma
model AIJob {
  id         String   @id @default(cuid())
  userId     String
  jobType    String   // ✅ Key field for scaling!
  status     String
  inputData  Json     // ✅ Flexible for any tool
  outputData Json?    // ✅ Flexible for any tool
  creditsUsed Int
  // ...
}
```

### Add: Tool Configuration Table
```prisma
model Tool {
  id          String   @id @default(cuid())
  slug        String   @unique  // "translation", "ocr", etc.
  name        String               // "Translation"
  description String
  category    String               // "text", "image", "audio", etc.

  // Pricing
  creditCost     Int              // Base cost
  creditPerUnit  Int?             // Cost per 1000 chars, per image, etc.

  // Configuration
  enabled        Boolean @default(true)
  apiProvider    String          // "openai", "deepl", "google", etc.
  config         Json            // Provider-specific config

  // Limits
  maxInputSize   Int?            // Max file size, text length, etc.
  rateLimit      Int?            // Requests per hour

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("tools")
}
```

### Add: Tool Categories
```prisma
model ToolCategory {
  id          String @id @default(cuid())
  slug        String @unique
  name        String
  icon        String
  description String
  sortOrder   Int    @default(0)

  @@map("tool_categories")
}
```

### Add: Usage Analytics
```prisma
model ToolUsageStats {
  id          String   @id @default(cuid())
  toolSlug    String
  date        DateTime // Daily stats

  totalJobs      Int @default(0)
  successfulJobs Int @default(0)
  failedJobs     Int @default(0)
  totalCredits   Int @default(0)
  avgDuration    Int @default(0) // milliseconds

  @@unique([toolSlug, date])
  @@map("tool_usage_stats")
}
```

---

## 🏗️ Modular Tool Architecture

### 1. Tool Registry Pattern

Create a centralized tool registry:

```typescript
// src/lib/tools/registry.ts
export interface ToolConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'text' | 'image' | 'audio' | 'video' | 'data';
  icon: string;

  // Pricing
  creditCost: number;
  creditPer?: 'character' | 'image' | 'second' | 'request';

  // Limits
  maxInputSize?: number;
  rateLimit?: number;

  // Provider
  provider: string;
  enabled: boolean;
}

export const TOOL_REGISTRY: Record<string, ToolConfig> = {
  translation: {
    id: 'translation',
    name: 'Translation',
    slug: 'translation',
    description: 'Translate text between 100+ languages',
    category: 'text',
    icon: 'Languages',
    creditCost: 1,
    creditPer: 'character',
    maxInputSize: 50000,
    rateLimit: 100,
    provider: 'deepl',
    enabled: true,
  },

  ocr: {
    id: 'ocr',
    name: 'OCR',
    slug: 'ocr',
    description: 'Extract text from images',
    category: 'image',
    icon: 'FileText',
    creditCost: 2,
    creditPer: 'image',
    maxInputSize: 10485760, // 10MB
    rateLimit: 50,
    provider: 'google-vision',
    enabled: true,
  },

  // Easy to add more!
  'image-generation': { /* ... */ },
  'text-to-speech': { /* ... */ },
  'speech-to-text': { /* ... */ },
  'sentiment-analysis': { /* ... */ },
  'content-moderation': { /* ... */ },
  // ... 50+ more tools
};

// Helper functions
export function getToolBySlug(slug: string) {
  return TOOL_REGISTRY[slug];
}

export function getAllTools() {
  return Object.values(TOOL_REGISTRY);
}

export function getToolsByCategory(category: string) {
  return getAllTools().filter(t => t.category === category);
}
```

---

## 🔧 Universal Tool Executor

Create a generic tool execution engine:

```typescript
// src/lib/tools/executor.ts
import { ToolConfig } from './registry';
import { db } from '@/lib/db';

export interface ToolInput {
  userId: string;
  toolSlug: string;
  inputData: any;
}

export interface ToolOutput {
  success: boolean;
  data?: any;
  error?: string;
  creditsUsed: number;
  duration: number;
}

export async function executeToolJob(input: ToolInput): Promise<ToolOutput> {
  const startTime = Date.now();
  const tool = getToolBySlug(input.toolSlug);

  if (!tool || !tool.enabled) {
    throw new Error('Tool not found or disabled');
  }

  // 1. Check user credits
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { creditsBalance: true },
  });

  if (!user || user.creditsBalance < tool.creditCost) {
    throw new Error('Insufficient credits');
  }

  // 2. Create job record
  const job = await db.aIJob.create({
    data: {
      userId: input.userId,
      jobType: input.toolSlug,
      status: 'processing',
      inputData: input.inputData,
      creditsUsed: tool.creditCost,
    },
  });

  try {
    // 3. Execute the tool
    const result = await executeTool(tool, input.inputData);

    // 4. Update job with results
    await db.aIJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        outputData: result,
        completedAt: new Date(),
      },
    });

    // 5. Deduct credits
    await db.$transaction([
      db.user.update({
        where: { id: input.userId },
        data: { creditsBalance: { decrement: tool.creditCost } },
      }),
      db.creditTransaction.create({
        data: {
          userId: input.userId,
          amount: -tool.creditCost,
          type: 'usage',
          description: `Used ${tool.name}`,
          aiJobId: job.id,
        },
      }),
    ]);

    return {
      success: true,
      data: result,
      creditsUsed: tool.creditCost,
      duration: Date.now() - startTime,
    };

  } catch (error) {
    // Update job as failed
    await db.aIJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });

    throw error;
  }
}

// Tool-specific execution logic
async function executeTool(tool: ToolConfig, inputData: any) {
  // Import tool-specific handler
  const handler = await import(`./handlers/${tool.slug}`);
  return handler.execute(inputData);
}
```

---

## 📦 Tool Handler Pattern

Each tool has its own handler:

```typescript
// src/lib/tools/handlers/translation.ts
export async function execute(input: any) {
  const { text, sourceLang, targetLang } = input;

  // Call DeepL API
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });

  const data = await response.json();
  return {
    translatedText: data.translations[0].text,
    detectedSourceLang: data.translations[0].detected_source_language,
  };
}

export function validateInput(input: any) {
  // Validation logic
  if (!input.text || input.text.length === 0) {
    throw new Error('Text is required');
  }
  if (input.text.length > 50000) {
    throw new Error('Text too long');
  }
  return true;
}
```

```typescript
// src/lib/tools/handlers/ocr.ts
export async function execute(input: any) {
  const { imageUrl } = input;

  // Call Google Vision API
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [{ type: 'TEXT_DETECTION' }],
        }],
      }),
    }
  );

  const data = await response.json();
  return {
    extractedText: data.responses[0].textAnnotations[0].description,
  };
}
```

**Add new tools easily:**
```typescript
// src/lib/tools/handlers/sentiment-analysis.ts
export async function execute(input: any) {
  // Your implementation
}

// src/lib/tools/handlers/text-to-speech.ts
export async function execute(input: any) {
  // Your implementation
}

// ... 50+ more tools, just add files!
```

---

## 🎨 Dynamic Frontend

### 1. Dynamic Tool Pages

Instead of creating a page for each tool, create one dynamic page:

```typescript
// src/app/(dashboard)/tools/[slug]/page.tsx
import { getToolBySlug } from '@/lib/tools/registry';
import { ToolInterface } from '@/components/tools/tool-interface';

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);

  if (!tool || !tool.enabled) {
    return <div>Tool not found</div>;
  }

  return <ToolInterface tool={tool} />;
}
```

### 2. Universal Tool Interface Component

```typescript
// src/components/tools/tool-interface.tsx
'use client';

import { ToolConfig } from '@/lib/tools/registry';
import { getToolComponent } from './tool-components';

export function ToolInterface({ tool }: { tool: ToolConfig }) {
  // Load tool-specific component
  const ToolComponent = getToolComponent(tool.slug);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{tool.name}</h1>
        <p className="text-muted-foreground">{tool.description}</p>
      </div>

      {/* Tool-specific interface */}
      <ToolComponent tool={tool} />

      {/* Common credit cost display */}
      <div className="mt-4 text-sm text-muted-foreground">
        Cost: {tool.creditCost} credit{tool.creditCost > 1 ? 's' : ''}
        {tool.creditPer && ` per ${tool.creditPer}`}
      </div>
    </div>
  );
}
```

### 3. Tool Catalog/Marketplace

```typescript
// src/app/(dashboard)/tools/page.tsx
import { getAllTools, getToolsByCategory } from '@/lib/tools/registry';
import { ToolCard } from '@/components/tools/tool-card';

export default function ToolsPage() {
  const categories = ['text', 'image', 'audio', 'video', 'data'];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">All AI Tools</h1>

      {categories.map(category => {
        const tools = getToolsByCategory(category);

        return (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-4 capitalize">
              {category} Tools
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tools.map(tool => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## 🚦 API Route Pattern

Single universal API route:

```typescript
// src/app/api/tools/execute/route.ts
import { executeToolJob } from '@/lib/tools/executor';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { toolSlug, inputData } = await req.json();

  try {
    const result = await executeToolJob({
      userId: session.user.id,
      toolSlug,
      inputData,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

---

## 📈 Scaling to 50+ Tools

### Adding a New Tool (5 minutes):

**1. Add to registry:**
```typescript
// src/lib/tools/registry.ts
export const TOOL_REGISTRY = {
  // ... existing tools

  'sentiment-analysis': {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    slug: 'sentiment-analysis',
    description: 'Analyze text sentiment',
    category: 'text',
    icon: 'BarChart',
    creditCost: 1,
    provider: 'openai',
    enabled: true,
  },
};
```

**2. Create handler:**
```typescript
// src/lib/tools/handlers/sentiment-analysis.ts
export async function execute(input: any) {
  const { text } = input;

  // Call AI API
  const response = await fetch('https://api.openai.com/v1/...');

  return { sentiment: 'positive', score: 0.85 };
}
```

**3. Create UI component (optional):**
```typescript
// src/components/tools/sentiment-analysis.tsx
export function SentimentAnalysisTool({ tool }) {
  // Tool-specific UI
}
```

**Done!** Tool is automatically:
- ✅ Listed in tool catalog
- ✅ Accessible via `/tools/sentiment-analysis`
- ✅ Integrated with credit system
- ✅ Tracked in analytics
- ✅ Available in API

---

## 💾 Database Hosting Recommendations

Since you're self-hosting, here are the best options:

### For Production (Recommended)

**1. Managed PostgreSQL:**
- **Neon** - $19/month for 10GB
- **DigitalOcean Managed** - $15/month for 1GB
- **AWS RDS** - Pay-as-you-go
- **Render** - $7/month for 1GB

**2. Self-Managed on VPS:**
- **Hetzner** - €4.50/month (2GB RAM)
- **DigitalOcean Droplet** - $6/month (1GB RAM)
- **Linode** - $5/month (1GB RAM)

Install PostgreSQL yourself, full control.

### Scaling Strategy

**0-10k users:** Single PostgreSQL instance ($15-20/month)

**10k-100k users:**
- Add read replicas
- Connection pooling (PgBouncer)
- Cost: $50-100/month

**100k+ users:**
- Multiple read replicas
- Caching layer (Redis)
- Cost: $200-500/month

**Still way cheaper than Clerk at scale!**

---

## 🔥 Performance Optimizations

### 1. Background Job Queue

For heavy tools (image generation, video processing):

```typescript
// Use Vercel Queue, BullMQ, or Inngest
import { Queue } from 'bullmq';

const toolQueue = new Queue('ai-tools');

// Add job to queue
await toolQueue.add('execute-tool', {
  userId,
  toolSlug,
  inputData,
});

// Process in background
```

### 2. Caching Layer

```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCached(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCached(key: string, value: any, ttl = 3600) {
  await redis.setex(key, ttl, JSON.stringify(value));
}
```

### 3. Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId);
  return success;
}
```

---

## 📊 Admin Dashboard

Create an admin panel to manage tools:

```typescript
// src/app/(admin)/admin/tools/page.tsx
import { getAllTools } from '@/lib/tools/registry';

export default function AdminToolsPage() {
  const tools = getAllTools();

  return (
    <div>
      <h1>Manage Tools</h1>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Enabled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tools.map(tool => (
            <tr key={tool.id}>
              <td>{tool.name}</td>
              <td>{tool.category}</td>
              <td>{tool.creditCost} credits</td>
              <td>{tool.enabled ? 'Yes' : 'No'}</td>
              <td>
                <button>Edit</button>
                <button>Toggle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🎯 Summary

### Your Current Setup is Perfect For:
- ✅ Scaling to 50+ AI tools easily
- ✅ Self-hosted database (predictable costs)
- ✅ Full control and customization
- ✅ No per-user pricing
- ✅ Unlimited tool additions

### Architecture Pattern:
1. **Tool Registry** - Central configuration
2. **Universal Executor** - Generic execution engine
3. **Modular Handlers** - Tool-specific logic
4. **Dynamic Frontend** - One page for all tools
5. **Single API Route** - Universal tool endpoint

### Adding a New Tool:
1. Add to registry (1 minute)
2. Create handler file (3 minutes)
3. Optional: Create UI component (5 minutes)
4. **Total: ~5-10 minutes per tool**

### Cost at Scale:
- **Database:** $50-200/month (10k-100k users)
- **Auth:** $0 (NextAuth is free)
- **Vercel:** $20/month (Pro plan)
- **Total:** $70-220/month

Compare to Clerk: $2,250/month for 100k users!

---

**Your setup is PERFECT! Don't switch!** 🚀

Just follow the patterns in this guide to scale to unlimited tools.
