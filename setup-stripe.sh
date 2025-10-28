#!/bin/bash

# Stripe Setup Script
# This script helps you set up Stripe environment variables for AI-Toolbox

echo "============================================"
echo "  AI-Toolbox Stripe Setup Script"
echo "============================================"
echo ""

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js first."
    exit 1
fi

echo "This script will help you configure Stripe for your AI-Toolbox application."
echo ""
echo "Before continuing, make sure you have:"
echo "  1. A Stripe account (https://stripe.com)"
echo "  2. Created Pro and Enterprise subscription products in Stripe"
echo "  3. Your Stripe API keys ready"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Get Stripe Secret Key
echo "Step 1: Stripe Secret Key"
echo "-------------------------"
echo "Get your secret key from: Stripe Dashboard → Developers → API keys"
echo "For testing, use the key starting with 'sk_test_'"
echo "For production, use the key starting with 'sk_live_'"
echo ""
read -p "Enter your Stripe Secret Key: " STRIPE_SECRET_KEY

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ Error: Stripe Secret Key is required"
    exit 1
fi

# Get Pro Price ID
echo ""
echo "Step 2: Pro Plan Price ID"
echo "-------------------------"
echo "Get this from: Stripe Dashboard → Products → Pro Plan → Pricing"
echo "It should start with 'price_'"
echo ""
read -p "Enter your Pro Plan Price ID: " STRIPE_PRO_PRICE_ID

if [ -z "$STRIPE_PRO_PRICE_ID" ]; then
    echo "❌ Error: Pro Plan Price ID is required"
    exit 1
fi

# Get Enterprise Price ID
echo ""
echo "Step 3: Enterprise Plan Price ID"
echo "-------------------------"
echo "Get this from: Stripe Dashboard → Products → Enterprise Plan → Pricing"
echo "It should start with 'price_'"
echo ""
read -p "Enter your Enterprise Plan Price ID: " STRIPE_ENTERPRISE_PRICE_ID

if [ -z "$STRIPE_ENTERPRISE_PRICE_ID" ]; then
    echo "❌ Error: Enterprise Plan Price ID is required"
    exit 1
fi

# Get Publishable Key
echo ""
echo "Step 4: Stripe Publishable Key"
echo "-------------------------"
echo "Get your publishable key from: Stripe Dashboard → Developers → API keys"
echo "It should start with 'pk_test_' or 'pk_live_'"
echo ""
read -p "Enter your Stripe Publishable Key: " STRIPE_PUBLISHABLE_KEY

if [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo "❌ Error: Stripe Publishable Key is required"
    exit 1
fi

# Get Webhook Secret (optional for now)
echo ""
echo "Step 5: Webhook Secret (Optional)"
echo "-------------------------"
echo "For local development, you can leave this empty and use Stripe CLI later."
echo "For production, get this from: Stripe Dashboard → Developers → Webhooks"
echo "It should start with 'whsec_'"
echo ""
read -p "Enter your Webhook Secret (or press Enter to skip): " STRIPE_WEBHOOK_SECRET

# Get App URL
echo ""
echo "Step 6: Application URL"
echo "-------------------------"
echo "For local development, this is usually: http://localhost:3000"
echo "For production, enter your production domain"
echo ""
read -p "Enter your App URL (default: http://localhost:3000): " APP_URL
APP_URL=${APP_URL:-http://localhost:3000}

echo ""
echo "============================================"
echo "  Configuration Summary"
echo "============================================"
echo "Stripe Secret Key: ${STRIPE_SECRET_KEY:0:20}..."
echo "Pro Price ID: $STRIPE_PRO_PRICE_ID"
echo "Enterprise Price ID: $STRIPE_ENTERPRISE_PRICE_ID"
echo "Publishable Key: ${STRIPE_PUBLISHABLE_KEY:0:20}..."
echo "Webhook Secret: ${STRIPE_WEBHOOK_SECRET:0:20}${STRIPE_WEBHOOK_SECRET:+...}"
echo "App URL: $APP_URL"
echo ""
read -p "Does this look correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "Setting up environment variables..."
echo ""

# Set Convex environment variables
echo "📝 Setting Convex environment variables..."
npx convex env set STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
npx convex env set STRIPE_PRO_PRICE_ID "$STRIPE_PRO_PRICE_ID"
npx convex env set STRIPE_ENTERPRISE_PRICE_ID "$STRIPE_ENTERPRISE_PRICE_ID"

# Create or update .env.local
echo ""
echo "📝 Updating .env.local file..."

# Backup existing .env.local if it exists
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "✅ Backed up existing .env.local to .env.local.backup"
fi

# Update or create .env.local
cat > .env.local.tmp << EOF
# Stripe Configuration
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
EOF

if [ ! -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" >> .env.local.tmp
fi

cat >> .env.local.tmp << EOF
STRIPE_PRO_PRICE_ID=$STRIPE_PRO_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=$STRIPE_ENTERPRISE_PRICE_ID

# App Configuration
NEXT_PUBLIC_APP_URL=$APP_URL
EOF

# Preserve existing CONVEX_URL if it exists
if [ -f .env.local ]; then
    CONVEX_URL=$(grep "NEXT_PUBLIC_CONVEX_URL=" .env.local | cut -d '=' -f2-)
    if [ ! -z "$CONVEX_URL" ]; then
        echo "" >> .env.local.tmp
        echo "# Convex Configuration" >> .env.local.tmp
        echo "NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL" >> .env.local.tmp
    fi
fi

mv .env.local.tmp .env.local

echo ""
echo "============================================"
echo "  ✅ Setup Complete!"
echo "============================================"
echo ""
echo "Environment variables have been configured:"
echo "  ✅ Convex environment variables set"
echo "  ✅ .env.local file updated"
echo ""
echo "Next steps:"
echo ""
echo "1. If using local development:"
echo "   - Install Stripe CLI: brew install stripe/stripe-cli/stripe"
echo "   - Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook"
echo "   - Add the webhook secret to .env.local"
echo ""
echo "2. Start your development server:"
echo "   npm run dev"
echo ""
echo "3. Test the integration:"
echo "   - Go to http://localhost:3000/billing"
echo "   - Try purchasing a subscription or credits"
echo "   - Use test card: 4242 4242 4242 4242"
echo ""
echo "4. For production deployment:"
echo "   - Set up webhook in Stripe Dashboard"
echo "   - Use production API keys"
echo "   - Update environment variables in your hosting platform"
echo ""
echo "📚 For detailed instructions, see STRIPE_SETUP_GUIDE.md"
echo ""




