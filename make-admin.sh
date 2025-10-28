#!/bin/bash

# Make Admin User Script
# This script helps you grant admin privileges to a user

echo "🛡️  Make Admin User"
echo "===================="
echo ""

if [ -z "$1" ]; then
    echo "Usage: ./make-admin.sh <email>"
    echo ""
    echo "Example:"
    echo "  ./make-admin.sh user@example.com"
    echo ""
    exit 1
fi

EMAIL="$1"

echo "Making user admin: $EMAIL"
echo ""

# Create temporary admin setup file
cat > convex/makeAdmin.ts << 'EOF'
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const makeAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error(`User not found: ${args.email}`);
    }

    await ctx.db.patch(user._id, {
      isAdmin: true,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      email: user.email,
      isAdmin: true,
    };
  },
});
EOF

echo "✓ Created temporary admin function"

# Deploy the function
echo ""
echo "Deploying function..."
npx convex deploy --yes

# Run the function
echo ""
echo "Granting admin privileges..."
npx convex run makeAdmin:makeAdmin "{\"email\": \"$EMAIL\"}"

# Clean up
echo ""
echo "Cleaning up..."
rm convex/makeAdmin.ts
npx convex deploy --yes

echo ""
echo "✅ Done! $EMAIL is now an admin."
echo ""
echo "Next steps:"
echo "1. Refresh your browser"
echo "2. Look for 'Admin Settings' in the sidebar (red shield icon)"
echo "3. Navigate to /settings/admin"
echo ""




