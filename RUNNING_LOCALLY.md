# Running the AI Toolbox Locally

This guide will help you run the complete application on your local machine.

## Prerequisites

- Node.js 18+ installed
- npm installed
- A Convex account (free - sign up at https://convex.dev)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

**Expected output:** Dependencies installed successfully

---

### 2. Initialize Convex Backend

This is the **MOST IMPORTANT** step - run this FIRST before starting Next.js:

```bash
npx convex dev
```

**What happens:**
1. Prompts you to login/signup to Convex (free account)
2. Creates a new Convex project
3. Deploys your schema (users, sessions, aiJobs, etc.)
4. Deploys all functions (auth, AI tools, file storage)
5. Gives you a development URL like: `https://happy-animal-123.convex.cloud`
6. **Keeps running** - watches for changes to your Convex functions

**IMPORTANT:** Keep this terminal running! It needs to stay active for your backend to work.

**You'll see output like:**
```
✔ Deployment URL: https://happy-animal-123.convex.cloud
✔ Watching for changes...
```

---

### 3. Configure Environment Variables

Copy the Convex URL from step 2:

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your Convex URL
# NEXT_PUBLIC_CONVEX_URL="https://happy-animal-123.convex.cloud"
```

**Your .env.local should have at minimum:**
```env
NEXT_PUBLIC_CONVEX_URL="https://your-actual-url.convex.cloud"
```

---

### 4. Start Next.js Development Server

**Open a NEW terminal** (keep Convex running in the first one):

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

---

### 5. Open Your Browser

Visit: **http://localhost:3000**

You should see the AI Toolbox landing page!

---

## Testing the Application

### 1. Create an Account

1. Click "Get Started" or "Sign Up"
2. Fill in your details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"

**What happens:**
- Account created in Convex
- You get 100 free credits automatically
- Redirected to dashboard

---

### 2. Test AI Tools

All tools work with **mock responses** by default (no API keys needed):

#### Translation Tool
1. Go to Dashboard → Tools → Translation
2. Enter text: "Hello world"
3. Select: English → Spanish
4. Click "Translate"
5. **Mock output:** "[ES] Hello world"
6. Credits deducted: ~1 credit

#### OCR Tool
1. Go to Dashboard → Tools → OCR
2. Upload any image
3. Click "Extract Text"
4. **Mock output:** "This is mock OCR text..."
5. Credits deducted: 5 credits

#### Image Generation
1. Go to Dashboard → Tools → Image Generation
2. Enter prompt: "A sunset over mountains"
3. Click "Generate"
4. **Mock output:** Placeholder image
5. Credits deducted: 10 credits

---

## Troubleshooting

### Error: "Cannot connect to Convex"

**Problem:** Convex backend isn't running

**Solution:**
```bash
# In terminal 1:
npx convex dev

# Wait for "Watching for changes..."
# Then in terminal 2:
npm run dev
```

---

### Error: "NEXT_PUBLIC_CONVEX_URL is not defined"

**Problem:** Environment variable not set

**Solution:**
```bash
# Edit .env.local
NEXT_PUBLIC_CONVEX_URL="https://your-url.convex.cloud"
```

Restart Next.js dev server.

---

### Error: "Invalid or expired session"

**Problem:** LocalStorage cleared or session expired

**Solution:**
- Just log out and log back in
- Sessions last 30 days

---

### Error: Module not found

**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

---

## Adding Real AI API Keys (Optional)

To use REAL AI services instead of mocks:

### 1. OpenAI (Image Generation)

Get key from: https://platform.openai.com/api-keys

```env
OPENAI_API_KEY="sk-proj-..."
```

### 2. Google Cloud Vision (OCR)

Get key from: https://console.cloud.google.com/apis/credentials

```env
GOOGLE_CLOUD_VISION_API_KEY="AIza..."
```

### 3. DeepL (Translation)

Get key from: https://www.deepl.com/pro-api

```env
DEEPL_API_KEY="..."
```

---

## Development Workflow

### Standard Development

**Terminal 1 (Backend):**
```bash
npx convex dev
```
Keep running - auto-reloads when you edit Convex functions

**Terminal 2 (Frontend):**
```bash
npm run dev
```
Keep running - auto-reloads when you edit React components

### Viewing Convex Dashboard

While `convex dev` is running, open:

https://dashboard.convex.dev

You can:
- View all database tables
- See real-time data
- Run queries manually
- View function logs
- Monitor API calls

---

## Project Structure

```
/AI-Toolbox
├── convex/                    # Backend (keep convex dev running!)
│   ├── schema.ts             # Database tables
│   ├── auth.ts               # Login/signup/sessions
│   ├── users.ts              # User & credit management
│   ├── aiJobs.ts             # Job tracking
│   ├── files.ts              # File uploads
│   └── tools/                # AI tool actions
│       ├── translation.ts
│       ├── ocr.ts
│       └── imageGeneration.ts
│
├── src/                       # Frontend
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   └── lib/                  # Utilities
│
├── .env.local                # Your environment variables
└── package.json
```

---

## Next Steps

1. ✅ Get the app running locally (you're here!)
2. 📝 Add real AI API keys to test full functionality
3. 💳 Set up Stripe for payment processing
4. 🚀 Deploy to production (see CONVEX_SETUP.md)
5. 🎨 Customize the UI and branding

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Start backend (Terminal 1 - MUST RUN FIRST!)
npx convex dev

# Start frontend (Terminal 2)
npm run dev

# Open Convex dashboard
npx convex dashboard

# Build for production
npm run build

# Deploy backend to production
npx convex deploy
```

---

## Support

- **Convex Docs:** https://docs.convex.dev
- **Convex Discord:** https://convex.dev/community
- **Next.js Docs:** https://nextjs.org/docs
- **Project Issues:** Open an issue on GitHub

---

**Happy Building! 🚀**
