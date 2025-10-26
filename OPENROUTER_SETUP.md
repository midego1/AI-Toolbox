# OpenRouter Integration Guide

## 🚀 What is OpenRouter?

OpenRouter is a **unified API gateway** that provides access to **400+ AI models** through a single API key. Instead of managing multiple API keys and integrations, you use one API for everything.

### Why OpenRouter?

✅ **One API key** for 400+ models (GPT-4, Claude, Gemini, Llama, etc.)
✅ **Cheaper** than individual APIs (especially Gemini 2.5 Flash Lite)
✅ **Simple** - OpenAI-compatible API
✅ **Flexible** - Switch models without code changes
✅ **Transparent** - See real-time costs and usage

---

## 💰 Pricing Comparison

### Translation (1M tokens)

| Service | Cost | Model |
|---------|------|-------|
| **OpenRouter (Gemini Flash Lite)** | **$0.50** | 🏆 **CHEAPEST** |
| DeepL | $25.00 | - |
| Google Translate | $20.00 | - |
| OpenAI GPT-4 | $30.00 | GPT-4 |

### Content Generation (1M tokens)

| Service | Cost | Model |
|---------|------|-------|
| **OpenRouter (Gemini Flash)** | **$3.00** | 🏆 **BEST VALUE** |
| OpenAI GPT-4o | $15.00 | GPT-4o |
| Anthropic Claude Sonnet | $15.00 | Claude 3.5 Sonnet |

### Image Generation (1K images)

| Service | Cost | Model |
|---------|------|-------|
| **OpenRouter (Gemini Flash Image)** | **$30.00** | Gemini 2.5 Flash Image |
| OpenAI DALL-E 3 | $40.00 | DALL-E 3 |
| Midjourney | $30.00 | - |

---

## 🎯 Models We Use

### 1. Gemini 2.5 Flash Lite (`google/gemini-2.5-flash-lite-preview-09-2025`)

**Best for:** Translation, fast text processing

**Pricing:**
- Input: $0.10 / 1M tokens
- Output: $0.40 / 1M tokens

**Features:**
- Ultra-fast response times
- Optimized for speed
- Great for simple tasks

**Used in:**
- ✅ Translation tool
- ✅ Text cleanup
- ✅ Simple content tasks

---

### 2. Gemini 2.5 Flash (`google/gemini-2.5-flash`)

**Best for:** Complex reasoning, content generation, coding

**Pricing:**
- Input: $0.30 / 1M tokens
- Output: $2.50 / 1M tokens

**Features:**
- Advanced reasoning capabilities
- "Thinking" mode for complex tasks
- 1.05M context window
- Great for math, coding, science

**Used in:**
- ✅ LinkedIn content generation
- ✅ Image prompt enhancement
- ✅ Complex text processing

---

### 3. Gemini 2.5 Flash Image (`google/gemini-2.5-flash-image-preview`)

**Best for:** AI image generation

**Pricing:**
- Input: $0.30 / 1M tokens
- Output images: $0.03 / 1K images

**Features:**
- Contextual understanding
- Multi-turn conversations
- Image edits
- High-quality generation

**Used in:**
- ⏳ Image generation (coming soon)
- ⏳ Image editing

---

## 📝 Setup Instructions

### Step 1: Get Your API Key

1. Go to https://openrouter.ai
2. Sign up for free (no credit card required for testing)
3. Go to https://openrouter.ai/keys
4. Click "Create Key"
5. Copy your API key (starts with `sk-or-v1-...`)

**Free Tier:**
- $5 free credits on signup
- Perfect for testing
- No expiration

---

### Step 2: Add to Environment Variables

Edit your `.env.local` file:

```env
# OpenRouter API Key
OPENROUTER_API_KEY="sk-or-v1-your-actual-key-here"
```

**For Convex (Production):**

```bash
# Set in Convex dashboard or via CLI
npx convex env set OPENROUTER_API_KEY sk-or-v1-your-actual-key-here
```

---

### Step 3: Restart Your App

```bash
# Terminal 1 - Restart Convex
npx convex dev

# Terminal 2 - Restart Next.js
npm run dev
```

---

### Step 4: Test It!

1. Go to http://localhost:3000/tools/translation
2. Enter some text to translate
3. Click "Translate"
4. See real translation using Gemini 2.5 Flash Lite! 🎉

---

## 🔧 How It Works

### Translation Flow

```
User Input
   ↓
Frontend (React)
   ↓
Convex Action (convex/tools/translation.ts)
   ↓
OpenRouter Helper (convex/lib/openrouter.ts)
   ↓
OpenRouter API → Gemini 2.5 Flash Lite
   ↓
Translated Text
   ↓
User sees result + credits deducted
```

### Code Example

```typescript
// convex/lib/openrouter.ts
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const messages = [
    {
      role: "system",
      content: `Translate from ${sourceLang} to ${targetLang}.`,
    },
    {
      role: "user",
      content: text,
    },
  ];

  return await callOpenRouter(messages, {
    model: MODELS.GEMINI_FLASH_LITE, // Ultra-fast, cheap
    temperature: 0.3, // Low for accuracy
  });
}
```

---

## 🎨 Models Available on OpenRouter

### Top Models by Category

**💬 Chat & Content:**
- GPT-4 Turbo
- Claude 3.5 Sonnet
- **Gemini 2.5 Flash** ⭐
- Llama 3.3 70B
- Mistral Large

**⚡ Fast & Cheap:**
- **Gemini 2.5 Flash Lite** ⭐ (Cheapest!)
- GPT-4o Mini
- Claude 3 Haiku
- Llama 3.1 8B

**🖼️ Vision & Images:**
- GPT-4 Vision
- **Gemini 2.5 Flash Image** ⭐
- Claude 3.5 Sonnet (vision)

**🎯 Specialized:**
- Perplexity (research)
- Cohere Command (RAG)
- Mistral (coding)

---

## 📊 Monitoring Usage

### View Usage in Dashboard

1. Go to https://openrouter.ai/activity
2. See real-time requests
3. View costs per model
4. Track total spending

### Check Costs in Code

```typescript
import { estimateCost, MODELS } from "../lib/openrouter";

// Estimate cost before calling
const cost = estimateCost(
  1000, // input tokens
  500,  // output tokens
  MODELS.GEMINI_FLASH_LITE
);

console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

---

## 🔄 Switching Models

Want to use a different model? Just change the model identifier!

```typescript
// Use GPT-4o Mini instead
const result = await callOpenRouter(messages, {
  model: "openai/gpt-4o-mini", // Change here!
  temperature: 0.7,
});

// Use Claude 3.5 Sonnet
const result = await callOpenRouter(messages, {
  model: "anthropic/claude-3.5-sonnet",
  temperature: 0.8,
});
```

**No code changes needed** - just update the model string!

---

## 🆘 Troubleshooting

### Error: "OPENROUTER_API_KEY not configured"

**Solution:** Add your API key to `.env.local`:

```env
OPENROUTER_API_KEY="sk-or-v1-..."
```

Then restart both terminals.

---

### Error: "Insufficient credits"

**Problem:** Your OpenRouter account is out of credits

**Solution:**
1. Go to https://openrouter.ai/credits
2. Add credits ($5 minimum)
3. Or use free tier ($5 free on signup)

---

### Error: "Model not found"

**Problem:** Model identifier is wrong

**Solution:** Check available models at https://openrouter.ai/models

Common models:
- `google/gemini-2.5-flash`
- `google/gemini-2.5-flash-lite-preview-09-2025`
- `openai/gpt-4o-mini`
- `anthropic/claude-3.5-sonnet`

---

### Mock Responses Instead of Real AI

**Problem:** No API key configured

**Solution:** This is intentional! The app works with mock responses for development. Add your OpenRouter API key when you're ready for real AI.

---

## 🎓 Best Practices

### 1. Choose the Right Model

**Fast & Cheap tasks:**
- Use **Gemini 2.5 Flash Lite**
- Translation, simple processing
- $0.10/M input tokens

**Complex reasoning:**
- Use **Gemini 2.5 Flash**
- Content generation, coding
- $0.30/M input tokens

**Maximum quality:**
- Use **GPT-4 Turbo** or **Claude 3.5 Sonnet**
- Critical content, complex analysis
- $10-30/M tokens

---

### 2. Optimize Token Usage

```typescript
// ❌ Bad: Verbose system prompt
const messages = [
  {
    role: "system",
    content: "You are a helpful assistant that translates text. You should translate accurately and preserve meaning. Make sure to...", // 100+ tokens
  },
];

// ✅ Good: Concise system prompt
const messages = [
  {
    role: "system",
    content: "Translate from English to Spanish.", // 8 tokens
  },
];
```

---

### 3. Set Appropriate Temperature

```typescript
// Translation, factual tasks
temperature: 0.2-0.3 // Low creativity, high accuracy

// Content generation, creative tasks
temperature: 0.7-0.9 // Higher creativity

// Brainstorming, diverse ideas
temperature: 1.0-1.2 // Maximum creativity
```

---

### 4. Monitor Costs

Check costs regularly:
- https://openrouter.ai/activity
- Set budget alerts
- Review usage patterns

---

## 🔐 Security

### Environment Variables

✅ **DO:** Store API key in environment variables
❌ **DON'T:** Commit API keys to Git
❌ **DON'T:** Expose keys in frontend code

### Convex Functions

✅ **DO:** Call OpenRouter from Convex actions (server-side)
❌ **DON'T:** Call OpenRouter directly from React components
✅ **DO:** Verify user authentication before API calls

---

## 📚 Additional Resources

- **OpenRouter Docs:** https://openrouter.ai/docs
- **Available Models:** https://openrouter.ai/models
- **Pricing:** https://openrouter.ai/models (click any model)
- **API Keys:** https://openrouter.ai/keys
- **Usage Dashboard:** https://openrouter.ai/activity

---

## 🎉 Summary

**You've integrated OpenRouter!**

✅ Single API for 400+ models
✅ Gemini 2.5 Flash Lite for ultra-cheap translation
✅ Gemini 2.5 Flash for quality content
✅ Works with mock responses without API key
✅ Easy to switch models
✅ Transparent pricing

**Next steps:**
1. Get API key from https://openrouter.ai/keys
2. Add to `.env.local`
3. Test translation tool
4. Explore other models!

---

**Questions?** Check https://openrouter.ai/docs or open an issue on GitHub!
