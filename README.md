# AI Toolbox - All-in-One AI SaaS Platform

A comprehensive AI platform where users can access multiple AI-powered tools including translation, OCR, image generation, professional headshots, and LinkedIn content generation. Built with Next.js 16, TypeScript, and Tailwind CSS.

## ⚡ Quick Deploy (Recommended)

**Deploy in 10 minutes with Supabase + Vercel:**

1. **[Create Supabase Project](https://supabase.com)** - Database + Auth (Free tier)
2. **[Deploy to Vercel](https://vercel.com)** - Hosting + Auto-deployments (Free tier)
3. **Done!** Your AI SaaS is live 🎉

→ **[Follow the 10-Minute Guide](./QUICK_DEPLOY.md)**

### Alternative Deployment Options:
- **Full Control:** [Self-Hosting Guide](./SELF_HOSTING.md) - Host on your own servers ($10-100/month)
- **Just Vercel:** [Vercel + External DB](./DEPLOYMENT.md) - Use Vercel with any database

---

## 🚀 Features

- ✅ **Supabase + Vercel** setup (recommended)
- ✅ Automatic deployments on every commit
- ✅ Preview environments for all branches

## Features

### 🎯 Core Features
- **User Authentication** - Secure signup/login with NextAuth.js
- **Multiple AI Tools**
  - 🌐 Translation - Translate text between 100+ languages
  - 📄 OCR - Extract text from images and documents
  - 🎨 Image Generation - Create AI-generated images
  - 📸 Professional Headshots - Transform photos into professional headshots
  - 💼 LinkedIn Content - Generate professional recommendations and content
- **Flexible Pricing**
  - Monthly subscription plans (Free, Pro, Enterprise)
  - Pay-per-use credit system
  - Additional credit packages
- **Credit Management** - Track usage and purchase credits
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

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
- **Authentication:** NextAuth.js v5
- **Database:** PostgreSQL with Prisma ORM
- **Payment Processing:** Stripe
- **State Management:** Zustand
- **AI Services:**
  - OpenAI (Image generation, GPT)
  - Anthropic Claude (Text generation)
  - Google Cloud Vision (OCR)
  - DeepL (Translation)
  - Replicate (Headshots)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- AI service API keys (OpenAI, Anthropic, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Toolbox
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - AI service API keys (OpenAI, Anthropic, etc.)

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/AI-Toolbox
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
│   │   ├── /api               # API routes
│   │   │   ├── /auth
│   │   │   └── /tools
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css
│   ├── /components
│   │   ├── /ui                # Shadcn UI components
│   │   ├── /layout            # Layout components
│   │   └── /providers         # Context providers
│   ├── /lib
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client
│   │   └── utils.ts
│   └── /types                 # TypeScript types
├── /prisma
│   └── schema.prisma          # Database schema
├── .env.example               # Environment variables template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Database Schema

The platform uses PostgreSQL with the following main tables:

- **Users** - User accounts and authentication
- **Subscriptions** - Stripe subscription management
- **CreditTransactions** - Credit purchases and usage tracking
- **AIJobs** - AI tool job history and results
- **UsageLogs** - Detailed usage analytics

See `prisma/schema.prisma` for the complete schema.

## Pricing Plans

### Subscription Tiers
- **Free:** $0/month - 100 credits
- **Pro:** $29/month - 1,000 credits
- **Enterprise:** $99/month - 5,000 credits

### Credit Costs per Tool
- Translation: 1 credit per 1,000 characters
- OCR: 2 credits per image
- Image Generation: 10 credits per image
- Headshot: 20 credits per photo
- LinkedIn Content: 5 credits per generation

### Additional Credits
- 500 credits - $10
- 1,500 credits - $25 (20% bonus)
- 3,500 credits - $50 (40% bonus)

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New AI Tools

1. Create a new page in `/src/app/(dashboard)/tools/[tool-name]/page.tsx`
2. Add the tool to sidebar navigation in `/src/components/layout/sidebar.tsx`
3. Create API route in `/src/app/api/tools/[tool-name]/route.ts`
4. Update the database schema if needed

## Deployment

### Vercel (Recommended) - Auto-Deploy Enabled ✅

This project is pre-configured for Vercel with automatic deployments:

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your `midego1/AI-Toolbox` repository
   - Vercel auto-detects Next.js configuration

2. **Add Environment Variables**
   - See `.env.example` for required variables
   - Add to Vercel Dashboard → Settings → Environment Variables

3. **Deploy Automatically**
   - Every push to `main` → Production
   - Every push to other branches → Preview environment
   - Get unique URLs for each deployment

4. **Complete Guide**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
   - Database setup, Stripe webhooks, troubleshooting, and more

### Build Configuration

The project includes `vercel.json` with optimized settings:
- Build command includes Prisma generation
- Automatic preview deployments
- Environment variable injection
- Regional deployment configuration

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Railway
- Render
- DigitalOcean App Platform
- Netlify

**Note:** You may need to adjust build commands for non-Vercel platforms:
```bash
npm install --legacy-peer-deps && prisma generate && next build
```

## Stripe Integration

### Setup

1. Create a Stripe account
2. Create products and prices for each subscription tier
3. Add price IDs to environment variables
4. Set up webhooks for subscription events
5. Configure Stripe webhook endpoint at `/api/webhooks/stripe`

### Webhook Events Handled
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## AI Service Integration

The platform is designed to integrate with multiple AI services:

- **Translation:** DeepL API or Google Translate API
- **OCR:** Google Cloud Vision API
- **Image Generation:** OpenAI DALL-E or Stable Diffusion via Replicate
- **Headshots:** Replicate with specialized models
- **Content Generation:** OpenAI GPT or Anthropic Claude

See `.env.example` for required API keys.

## Security

- All passwords are hashed with bcrypt
- NextAuth.js handles authentication
- Environment variables for sensitive data
- CSRF protection enabled
- Rate limiting on API routes (recommended to add)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For questions or issues:
- Open an issue on GitHub
- Contact support (coming soon)

## Roadmap

- [ ] Complete AI service integrations
- [ ] Add usage analytics dashboard
- [ ] Implement API access for Pro/Enterprise users
- [ ] Add more AI tools
- [ ] Mobile app (React Native)
- [ ] White-label options for Enterprise

---

Built with ❤️ using Next.js 16 and modern web technologies.
