# AI Toolbox - All-in-One AI SaaS Platform

A comprehensive AI platform where users can access multiple AI-powered tools including translation, OCR, image generation, professional headshots, and LinkedIn content generation. Built with Next.js 16, TypeScript, Tailwind CSS, and **Convex**.

## ⚡ Quick Start

**Deploy in 15 minutes with Convex + Vercel:**

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd AI-Toolbox
   npm install
   ```

2. **Set up Convex Backend**
   ```bash
   npx convex dev
   ```
   - Creates your Convex backend
   - Generates your database schema
   - Provides your `NEXT_PUBLIC_CONVEX_URL`

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   - Add your `NEXT_PUBLIC_CONVEX_URL` from step 2
   - Add Stripe keys (optional for dev)
   - Add AI service API keys (optional for dev - uses mocks)

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Deploy to Production**
   ```bash
   npx convex deploy    # Deploy backend
   npm run build        # Build frontend
   # Deploy to Vercel or any hosting platform
   ```

→ **[See Complete Setup Guide](./CONVEX_SETUP.md)**

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

## Deployment

### Production Deployment

1. **Deploy Convex Backend**
   ```bash
   npx convex deploy
   ```
   - Note the production URL provided

2. **Deploy to Vercel**
   - Connect your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_CONVEX_URL` (from step 1)
     - Stripe keys
     - AI service API keys
   - Deploy!

3. **Configure Stripe Webhooks**
   - Point webhook to `https://your-app.vercel.app/api/webhooks/stripe`

### Environment Variables

Required for production:
- `NEXT_PUBLIC_CONVEX_URL` - From `npx convex deploy`
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `OPENAI_API_KEY` - OpenAI API key (for image generation)
- `GOOGLE_CLOUD_VISION_API_KEY` - Google Vision API key (for OCR)
- `DEEPL_API_KEY` - DeepL API key (for translation)

Optional:
- `REPLICATE_API_TOKEN` - Replicate API token (for headshots)

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

## Stripe Integration

### Setup

1. Create a Stripe account
2. Create products and prices for each subscription tier
3. Add price IDs to environment variables
4. Set up webhooks for subscription events
5. Create webhook handler at `/api/webhooks/stripe`

### Webhook Events to Handle
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

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
- [ ] Headshot generation (Replicate)
- [ ] LinkedIn content generation
- [ ] Stripe integration
- [ ] Usage analytics dashboard
- [ ] API access for Pro/Enterprise users
- [ ] Mobile app (React Native with Convex)
- [ ] White-label options for Enterprise

---

Built with Next.js 16, Convex, and modern web technologies.
