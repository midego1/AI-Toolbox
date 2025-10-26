# How to Get Your NEXT_PUBLIC_CONVEX_URL

This guide will help you get your Convex deployment URL, which is required to run the application.

## Quick Method (Recommended)

Run this command in your terminal:

```bash
npx convex dev
```

**What happens:**
1. First time: You'll be asked to login/signup to Convex (it's free)
2. Creates a new Convex project
3. Deploys your backend functions
4. **Provides your deployment URL** like: `https://happy-animal-123.convex.cloud`

**Keep this terminal running!** It watches for changes to your Convex functions.

---

## Where to Put the URL

After running `npx convex dev`, you'll get a URL like:
```
https://happy-animal-123.convex.cloud
```

### Create `.env.local` file:

1. Create a file called `.env.local` in the project root (same folder as `package.json`)
2. Add your Convex URL:

```env
NEXT_PUBLIC_CONVEX_URL="https://your-actual-url.convex.cloud"
```

**Example:**
```env
NEXT_PUBLIC_CONVEX_URL="https://happy-animal-123.convex.cloud"
```

---

## Step-by-Step Instructions

### Step 1: Open Terminal

In your project directory:
```bash
cd /Users/midego/AI-Toolbox
```

### Step 2: Run Convex Setup

```bash
npx convex dev
```

**First time?** You'll see:
```
✔ Welcome to Convex! Let's set up your project.
✔ Logged in as your@email.com
✔ Select team: Your Team
✔ Project name: AI-Toolbox (or create new)
✔ Deployment URL: https://happy-animal-123.convex.cloud
```

**Copy the deployment URL!**

### Step 3: Create Environment File

Create `.env.local` file in the project root:

```bash
# Create the file
touch .env.local

# Add your Convex URL
echo 'NEXT_PUBLIC_CONVEX_URL="https://your-actual-url.convex.cloud"' >> .env.local
```

Or manually create `.env.local` with:
```env
NEXT_PUBLIC_CONVEX_URL="https://your-actual-url.convex.cloud"
```

### Step 4: Verify

Your `.env.local` should contain:
```env
NEXT_PUBLIC_CONVEX_URL="https://happy-animal-123.convex.cloud"
```

---

## Alternative: If You Already Have a Convex Project

If you already have a Convex project:

### Method 1: Check Convex Dashboard

1. Go to [convex.dev](https://convex.dev)
2. Login to your account
3. Select your project
4. Go to **Settings** → **General**
5. Copy the **Deployment URL**

### Method 2: Check Convex Config

Look for `convex.json` or `.convexrc` in your project:

```bash
# Check for config files
cat .convexrc
# or
cat convex.json
```

---

## Optional: Additional Environment Variables

If you want to use AI features (translation, OCR, image generation), you can add these later:

```env
# Required: Convex URL
NEXT_PUBLIC_CONVEX_URL="https://your-url.convex.cloud"

# Optional: AI Service Keys
# OPENAI_API_KEY="sk-..."
# GOOGLE_CLOUD_VISION_API_KEY="AIza..."
# DEEPL_API_KEY="..."
```

**Note:** The application works without AI keys - it will use mock responses for development.

---

## Troubleshooting

### "No active Convex deployment found"

**Solution:** Run `npx convex dev` first to create a deployment.

### "Command not found: convex"

**Solution:** Install dependencies first:
```bash
npm install
```

### Already have a deployment but forgot the URL?

Check your Convex dashboard at [dashboard.convex.dev](https://dashboard.convex.dev)

---

## After Getting Your URL

Once you have `NEXT_PUBLIC_CONVEX_URL` in `.env.local`:

1. **Start Convex** (in one terminal):
   ```bash
   npx convex dev
   ```

2. **Start Next.js** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Open browser:**
   ```
   http://localhost:3000
   ```

You're all set! 🎉

---

## Production Deployment

For production (e.g., on Vercel):

1. Use the **production** Convex URL from your dashboard
2. Add to Vercel environment variables:
   - Key: `NEXT_PUBLIC_CONVEX_URL`
   - Value: Your production Convex URL

**Get production URL:**
```bash
npx convex deploy --prod
```

