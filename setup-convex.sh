#!/bin/bash

# Convex Setup Script
# This script helps you get your NEXT_PUBLIC_CONVEX_URL

echo "🚀 Setting up Convex for AI-Toolbox"
echo ""

# Check if convex is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js first."
    exit 1
fi

echo "📦 Starting Convex setup..."
echo ""

# Run convex dev to get the URL
echo "👉 This will:"
echo "   1. Log you into Convex (or create free account)"
echo "   2. Create a new project"
echo "   3. Deploy your backend"
echo "   4. Show you your deployment URL"
echo ""
echo "Keep this window open - it will watch for changes!"
echo ""

npx convex dev

# The above command will output the URL
# User needs to copy it manually

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy the deployment URL shown above"
echo "   2. Create a file called .env.local in this directory"
echo "   3. Add this line (replace with your actual URL):"
echo "      NEXT_PUBLIC_CONVEX_URL=\"https://your-url.convex.cloud\""
echo ""
echo "   4. In a NEW terminal, run: npm run dev"
echo ""
echo "🎉 Then visit http://localhost:3000"

