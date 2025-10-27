# AI Toolbox - All-in-One AI SaaS Platform

A comprehensive AI platform where users can access multiple AI-powered tools including translation, OCR, image generation, professional headshots, and LinkedIn content generation. Built with Next.js 16, TypeScript, Tailwind CSS, and **Convex**.

## ⚡ Quick Start

**Get your Convex URL in 2 minutes:**

### Fastest Method (Recommended)
```bash
# Option 1: Use the setup script
./setup-convex.sh

# Option 2: Manual setup
npx convex dev
```

This will:
- ✅ Create your Convex backend (free)
- ✅ Deploy your database schema  
- ✅ **Give you your `NEXT_PUBLIC_CONVEX_URL`**

### Then Create .env.local

```bash
# Create the file
touch .env.local

# Add your Convex URL
echo 'NEXT_PUBLIC_CONVEX_URL="https://your-url.convex.cloud"' >> .env.local
```

Replace `https://your-url.convex.cloud` with the actual URL from the previous step.

### Start Development

```bash
# Terminal 1: Keep running
npx convex dev

# Terminal 2: Frontend
npm run dev

# Visit http://localhost:3000
```

→ **[Full Quick Start Guide](./QUICK_START.md)**
→ **[Complete Setup Guide](./CONVEX_SETUP.md)**

---

## 🚀 Features

### 🎯 Core Features
- **User Authentication** - Secure signup/login with Convex Auth
- **Multiple AI Tools**
  - 🌐 Translation - Translate text between 100+ languages (DeepL)
  - 📄 OCR - Extract text from images (Google Cloud Vision)
  - 🎨 Image Generation - Create AI-generated images (DALL-E 3)
  - 📸 Professional Headshots - Transform photos (Coming soon)
  - 💼 LinkedIn Content - Generate recommendations (Coming soon)
- **Flexible Pricing**
  - Monthly subscription plans (Free, Pro, Enterprise)
  - Pay-per-use credit system
  - Additional credit packages
- **Credit Management** - Real-time credit tracking and transactions
- **File Storage** - Built-in file upload/storage for OCR and images
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Instant UI updates powered by Convex

### 🎨 UI/UX Features
- Modern, clean interface built with Shadcn/ui
- Responsive sidebar navigation
- Mobile-friendly drawer menu
- Dark mode ready (Tailwind CSS theming)
- Real-time credit balance display
- Usage statistics and analytics

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui (Radix UI primitives)
- **Backend:** Convex (Database + Auth + Storage + Actions)
- **Payment Processing:** Stripe
- **State Management:** Zustand
- **AI Services:**
  - OpenAI (Image generation with DALL-E 3)
  - Google Cloud Vision (OCR)
  - DeepL (Translation)
  - Replicate (Headshots - coming soon)

## Why Convex?

Convex is the perfect backend for AI SaaS platforms:

- ✅ **Built for AI Workloads** - Actions designed for external API calls
- ✅ **Real-time by Default** - Credits update instantly across all devices
- ✅ **TypeScript-First** - End-to-end type safety
- ✅ **Built-in File Storage** - 5GB free for images and documents
- ✅ **Scheduled Functions** - Cron jobs for subscriptions and credits
- ✅ **Serverless** - Scales automatically, pay only for what you use
- ✅ **Free Tier** - Generous free tier for development

## Project Structure

```
/AI-Toolbox
├── /convex                     # Convex backend
│   ├── schema.ts              # Database schema
│   ├── auth.ts                # Authentication functions
│   ├── users.ts               # User & credit management
│   ├── aiJobs.ts              # Job tracking
│   ├── files.ts               # File storage functions
│   └── /tools                 # AI tool actions
│       ├── translation.ts
│       ├── ocr.ts
│       └── imageGeneration.ts
├── /src
│   ├── /app                    # Next.js app directory
│   │   ├── /(auth)            # Authentication pages
│   │   │   ├── /login
│   │   │   └── /signup
│   │   ├── /(dashboard)       # Protected dashboard routes
│   │   │   ├── /dashboard
│   │   │   ├── /tools
│   │   │   │   ├── /translation
│   │   │   │   ├── /ocr
│   │   │   │   ├── /image-generation
│   │   │   │   ├── /headshot
│   │   │   │   └── /linkedin
│   │   │   ├── /billing
│   │   │   ├── /usage
│   │   │   └── /settings
│   │   ├── layout.tsx         # Root layout with ConvexProvider
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css
│   ├── /components
│   │   ├── /ui                # Shadcn UI components
│   │   ├── /layout            # Layout components
│   │   └── /providers         # ConvexProvider
│   ├── /lib
│   │   ├── auth-client.ts     # Client-side auth utilities
│   │   └── utils.ts
│   └── /types                 # TypeScript types
├── .env.example               # Environment variables template
├── convex.json                # Convex configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Database Schema

The platform uses Convex with the following tables:

- **users** - User accounts, credits, subscriptions
- **sessions** - Authentication sessions
- **subscriptions** - Stripe subscription management
- **creditTransactions** - Credit purchases and usage tracking
- **aiJobs** - AI tool job history and results with file references
- **usageLogs** - Detailed usage analytics

All tables include file storage references via Convex's built-in `_storage` system.

See `convex/schema.ts` for the complete schema.

## Pricing Plans

### Subscription Tiers
- **Free:** $0/month - 100 credits
- **Pro:** $29/month - 1,000 credits
- **Enterprise:** $99/month - 5,000 credits

### Credit Costs per Tool
- Translation: 1 credit per 100 characters
- OCR: 5 credits per image
- Image Generation: 10-20 credits per image (based on size/quality)
- Headshot: 20 credits per photo
- LinkedIn Content: 5 credits per generation

### Additional Credits
- 500 credits - $10
- 1,500 credits - $25 (20% bonus)
- 3,500 credits - $50 (40% bonus)

## Development

### Available Scripts

```bash
npm run dev      # Start Next.js dev server (run after convex dev)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint

# Convex commands
npx convex dev      # Start Convex backend (run first!)
npx convex deploy   # Deploy Convex backend to production
npx convex dashboard # Open Convex dashboard
```

### Development Workflow

1. **Start Convex backend** (do this first!)
   ```bash
   npx convex dev
   ```

2. **In a new terminal, start Next.js**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Convex Dashboard: https://dashboard.convex.dev

### Adding New AI Tools

1. Create action in `/convex/tools/[tool-name].ts`
   ```typescript
   import { action } from "../_generated/server";
   import { api } from "../_generated/api";

   export const myTool = action({
     args: { token: v.string(), /* your args */ },
     handler: async (ctx, args) => {
       // Call external AI API
       // Deduct credits
       // Store results
     }
   });
   ```

2. Create UI in `/src/app/(dashboard)/tools/[tool-name]/page.tsx`
   ```typescript
   import { useAction } from "convex/react";
   import { api } from "../../../../convex/_generated/api";

   const myTool = useAction(api.tools.myTool.myTool);
   ```

3. Add to sidebar in `/src/components/layout/sidebar.tsx`

## 🚀 Deployment

### Vercel Deployment (Recommended)

Deploy to Vercel with automatic builds after every GitHub push:

📚 **[Quick Start Guide](./VERCEL_QUICK_START.md)** - Deploy in 15 minutes  
📖 **[Complete Guide](./VERCEL_DEPLOYMENT_GUIDE.md)** - Full deployment instructions  
🌿 **[Branch Strategy](./BRANCH_STRATEGY_GUIDE.md)** - Multi-environment workflow (dev/staging/prod)  
⚡ **[Git Workflow](./GIT_WORKFLOW_QUICK_REFERENCE.md)** - Daily commands & workflow

**Quick Overview:**
1. Deploy Convex backend: `npx convex deploy --prod`
2. Get API keys from [Clerk](https://clerk.com) and [Stripe](https://stripe.com)
3. Connect GitHub repo to [Vercel](https://vercel.com)
4. Add environment variables
5. Deploy!

### Environment Variables Required

**Vercel Environment Variables:**

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-url.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Convex Environment Variables** (set in Convex dashboard):

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### AI Service API Keys (Optional)

- `OPENAI_API_KEY` - For image generation (DALL-E 3)
- `GOOGLE_CLOUD_VISION_API_KEY` - For OCR
- `DEEPL_API_KEY` - For translation
- `REPLICATE_API_TOKEN` - For headshots

## Security

- Passwords hashed with SHA-256 (upgrade to bcrypt in production via Convex actions)
- Token-based authentication with Convex sessions
- Environment variables for sensitive data
- Row-level security via Convex queries
- CORS protection enabled
- Automatic XSS protection

## Scaling Architecture

The platform is designed to scale to 50+ AI tools using the **Tool Registry Pattern**.

See `SCALING_ARCHITECTURE.md` for details on:
- Universal Tool Executor
- Dynamic tool loading
- Modular handler pattern
- Database optimization strategies

## 💳 Stripe Payment Integration

**Status**: ✅ **Complete and Ready to Use**

The platform includes a full-featured Stripe payment integration supporting:
- 💰 Subscription plans (Pro $29/month, Enterprise $99/month)
- 🎫 One-time credit purchases ($10, $25, $50 packages)
- 🔄 Automatic credit allocation and renewal
- 📊 Transaction history and subscription management
- 🎣 Complete webhook handling for all payment events

### Quick Setup

```bash
# Run the interactive setup script
./setup-stripe.sh

# Or follow the detailed guide
open STRIPE_SETUP_GUIDE.md
```

### Documentation
- **[Complete Setup Guide](./STRIPE_SETUP_GUIDE.md)** - Step-by-step Stripe configuration
- **[Quick Reference](./STRIPE_QUICK_REFERENCE.md)** - Commands, test cards, troubleshooting
- **[Integration Summary](./STRIPE_INTEGRATION_SUMMARY.md)** - Architecture and implementation details

### Features Implemented
- ✅ Subscription checkout with Stripe Checkout
- ✅ One-time payment processing
- ✅ Webhook signature verification
- ✅ Automatic subscription management
- ✅ Credit allocation on payment success
- ✅ Subscription cancellation (with grace period)
- ✅ Transaction history tracking
- ✅ Real-time balance updates

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npx convex dev` + `npm run dev`
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For questions or issues:
- Open an issue on GitHub
- Check Convex docs: https://docs.convex.dev
- Join Convex Discord: https://convex.dev/community

## Roadmap

- [x] Complete Convex migration
- [x] Authentication with Convex
- [x] File storage integration
- [x] Translation tool (DeepL)
- [x] OCR tool (Google Vision)
- [x] Image generation (DALL-E 3)
- [x] **Stripe payment integration** (subscriptions + one-time purchases)
- [ ] Headshot generation (Replicate)
- [ ] LinkedIn content generation
- [ ] Usage analytics dashboard
- [ ] API access for Pro/Enterprise users
- [ ] Email notifications for payments
- [ ] Invoice generation
- [ ] Mobile app (React Native with Convex)
- [ ] White-label options for Enterprise

---

Built with Next.js 16, Convex, and modern web technologies.
