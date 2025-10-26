# Quick Start: Get Your Convex URL

## 🎯 What You Need

Your `NEXT_PUBLIC_CONVEX_URL` to connect your Next.js app to Convex backend.

---

## ⚡ Fastest Way (2 Minutes)

### Step 1: Run Convex Setup

```bash
# Make sure you're in the project directory
cd /Users/midego/AI-Toolbox

# Run the setup script
./setup-convex.sh
```

This will:
- ✅ Log you into Convex (free account)
- ✅ Create a new backend project
- ✅ Deploy your functions
- ✅ **Show your deployment URL**

**Copy the URL!** It looks like: `https://happy-animal-123.convex.cloud`

### Step 2: Create .env.local

Create a file called `.env.local` in the project root:

```bash
touch .env.local
```

Add this line (replace with YOUR actual URL):

```env
NEXT_PUBLIC_CONVEX_URL="https://your-actual-url.convex.cloud"
```

### Step 3: Start Development

**Terminal 1** (Keep this running):
```bash
npx convex dev
```

**Terminal 2** (New window):
```bash
npm run dev
```

Visit: http://localhost:3000 🎉

---

## 📝 Manual Method

If you prefer manual setup:

```bash
# 1. Initialize Convex
npx convex dev

# 2. Copy the deployment URL that appears
# Example: https://happy-animal-123.convex.cloud

# 3. Create .env.local file
echo 'NEXT_PUBLIC_CONVEX_URL="https://your-url.convex.cloud"' > .env.local

# 4. Replace with your actual URL
```

---

## ✅ Verification

Check that your `.env.local` exists and has the correct URL:

```bash
cat .env.local
```

Should show:
```
NEXT_PUBLIC_CONVEX_URL="https://your-url.convex.cloud"
```

---

## 🚀 Next Steps

Once you have your Convex URL set up:

1. ✅ Run `npx convex dev` (backend)
2. ✅ Run `npm run dev` (frontend)
3. ✅ Visit http://localhost:3000
4. ✅ Sign up for an account
5. ✅ Test the AI tools!

---

## 📚 Full Documentation

- **Setup Guide**: See [GET_CONVEX_URL.md](./GET_CONVEX_URL.md)
- **Local Development**: See [RUNNING_LOCALLY.md](./RUNNING_LOCALLY.md)
- **Convex Guide**: See [CONVEX_SETUP.md](./CONVEX_SETUP.md)

