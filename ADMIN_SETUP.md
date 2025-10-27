# Admin Settings Setup Guide

## Quick Setup (5 Minutes)

This guide walks you through setting up the admin functionality on your AI Toolbox installation.

## Prerequisites

- AI Toolbox deployed and running
- Convex project configured
- At least one user account created

## Step-by-Step Setup

### Step 1: Deploy Schema Changes

The schema has been updated to include the `isAdmin` field. Deploy the changes:

```bash
cd /Users/midego/AI-Toolbox
npx convex deploy
```

Expected output:
```
✓ Deploying...
✓ Schema updated
✓ Functions deployed
```

### Step 2: Create Your First Admin User

You have three options to create an admin user:

#### Option A: Using Convex Dashboard (Recommended)

1. Go to your Convex Dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to "Data" tab
4. Click on "users" table
5. Find your user account
6. Click "Edit"
7. Add field: `isAdmin` with value `true`
8. Save changes

#### Option B: Using Convex CLI

```bash
# In your project directory
npx convex run adminTools:makeAdmin --args '{"email": "your-email@example.com"}'
```

Note: You'll need to add this helper function first (see Option C).

#### Option C: Add a Helper Function (Temporary)

Create a temporary file: `convex/setup-admin.ts`

```typescript
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

    return { success: true, email: user.email };
  },
});
```

Deploy and run:
```bash
npx convex deploy
npx convex run setup-admin:makeAdmin '{"email": "your-email@example.com"}'
```

Delete the file after use:
```bash
rm convex/setup-admin.ts
npx convex deploy
```

### Step 3: Verify Admin Access

1. Log in to your AI Toolbox account
2. Look for the "Admin Settings" link in the sidebar (at the bottom, in red)
3. Click it to access the admin panel

If you see the admin panel, congratulations! Setup is complete. 🎉

### Step 4: Explore Admin Features

Now that you're an admin, explore these features:

1. **Overview Tab**: Get familiar with system statistics
2. **Users Tab**: Search for users and view details
3. **Jobs Tab**: Monitor AI jobs
4. **System Health Tab**: Check system status

## Verification Checklist

Use this checklist to ensure everything is working:

- [ ] Schema deployed successfully
- [ ] At least one user has `isAdmin: true`
- [ ] Admin Settings link visible in sidebar
- [ ] Can access `/settings/admin` route
- [ ] Overview tab loads with statistics
- [ ] Users tab shows user list
- [ ] Can search for users
- [ ] System Health tab loads

## Troubleshooting

### Problem: Admin Settings Link Not Visible

**Diagnosis:**
```bash
# Check if user is admin in database
# Use Convex dashboard or run query
```

**Solution:**
- Verify `isAdmin` field is set to `true` (not string "true")
- Refresh the page / clear browser cache
- Log out and log back in

### Problem: "Unauthorized: Admin access required"

**Cause:** Database check failing

**Solution:**
```typescript
// In Convex dashboard, verify user document:
{
  _id: "...",
  email: "your-email@example.com",
  isAdmin: true, // Must be boolean true, not undefined
  // ... other fields
}
```

### Problem: Schema Deployment Failed

**Error:** `Schema validation failed`

**Solution:**
```bash
# Check for existing data conflicts
# May need to update existing users
# Run this in Convex dashboard:

// Get all users without isAdmin field
const users = await ctx.db.query("users").collect();
for (const user of users) {
  if (user.isAdmin === undefined) {
    await ctx.db.patch(user._id, { isAdmin: false });
  }
}
```

### Problem: Functions Not Deploying

**Check:**
```bash
# Verify no syntax errors
npx convex dev --once

# Check logs
cat .convex/logs
```

## Security Best Practices

### Immediate Actions

1. **Limit Admin Users**: Only make trusted users admins
2. **Use Strong Passwords**: Ensure admin accounts have strong passwords
3. **Log Admin Actions**: Review transaction history regularly
4. **Enable Monitoring**: Check System Health daily

### Production Considerations

```typescript
// Consider adding additional security layers:

// 1. IP Whitelist (if applicable)
// 2. Two-Factor Authentication
// 3. Admin Action Logging
// 4. Session Timeout
// 5. Failed Login Tracking
```

## Advanced Configuration

### Multiple Admin Users

To add more admins after initial setup:

1. Log in as an existing admin
2. Go to Admin Settings → Users tab
3. Search for the user
4. Click "Make Admin"

Or use Convex dashboard to set `isAdmin: true`.

### Revoking Admin Access

To remove admin privileges:

1. Admin Settings → Users tab
2. Search for the user
3. Click "Remove Admin"

Or in Convex dashboard, set `isAdmin: false`.

### Admin Permissions

Current admin permissions include:
- View all users and their data
- Manage credits for any user
- View all jobs and transactions
- Retry failed jobs
- System maintenance operations
- Grant/revoke admin status

### Future Enhancement: Role-Based Access

Consider implementing granular permissions:

```typescript
// Future schema addition
type AdminRole = "super_admin" | "user_admin" | "support_admin";

users: {
  isAdmin: boolean,
  adminRole?: AdminRole,
  adminPermissions?: {
    canManageUsers: boolean,
    canManageCredits: boolean,
    canViewAnalytics: boolean,
    canPerformMaintenance: boolean,
  }
}
```

## Backup Procedures

### Before Making Admin Changes

```bash
# Backup current database state
# Use Convex dashboard export feature
# Or create snapshot

# Document admin changes
echo "$(date): Made user@example.com admin" >> admin-changes.log
```

### Emergency Admin Access

If you lose admin access:

1. Access Convex dashboard directly
2. Manually set `isAdmin: true` on your account
3. Redeploy if needed
4. Clear browser cache and re-login

## Testing Your Setup

### Basic Tests

Run these tests to verify functionality:

```typescript
// Test 1: Access Admin Page
// Navigate to /settings/admin
// Expected: Admin dashboard loads

// Test 2: View Users
// Go to Users tab
// Expected: List of users displayed

// Test 3: Add Credits
// Select a user, add 100 credits
// Expected: Balance updated, transaction recorded

// Test 4: System Health
// Go to System Health tab
// Expected: Health metrics displayed
```

### Integration Tests

```typescript
// Test admin API functions
const testAdminAccess = async () => {
  const stats = await getSystemStats({ token });
  console.log("Stats:", stats);
  
  const users = await getAllUsers({ token, limit: 10 });
  console.log("Users:", users.length);
  
  const health = await getSystemHealth({ token });
  console.log("Health:", health.overallHealth);
};
```

## Rollback Procedure

If you need to rollback the admin changes:

```bash
# 1. Remove admin functionality from code
git revert <commit-hash>

# 2. Redeploy
npx convex deploy

# 3. Optional: Remove isAdmin field from users
# (In Convex dashboard, run a data migration)
```

## Monitoring

### What to Monitor

1. **Admin Actions**: Track all admin-initiated changes
2. **Access Patterns**: Monitor who accesses admin panel
3. **System Changes**: Log maintenance operations
4. **Error Rates**: Watch for unusual activity

### Logging Example

```typescript
// Add logging to admin actions
const logAdminAction = async (action: string, details: any) => {
  await ctx.db.insert("adminLogs", {
    action,
    details,
    performedBy: userId,
    timestamp: Date.now(),
  });
};
```

## Support

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't access admin panel | Check `isAdmin` in database |
| Functions not working | Redeploy Convex functions |
| Data not loading | Check browser console |
| Unauthorized errors | Verify admin status |

### Getting Help

1. Check documentation: `ADMIN_SETTINGS_GUIDE.md`
2. Review quick reference: `ADMIN_QUICK_REFERENCE.md`
3. Check Convex logs
4. Inspect browser console
5. Review network requests

## Next Steps

After successful setup:

1. ✅ Explore all admin tabs
2. ✅ Add more admin users if needed
3. ✅ Set up monitoring and alerts
4. ✅ Review security settings
5. ✅ Test all admin functions
6. ✅ Document your admin procedures
7. ✅ Train other admin users

## Maintenance Schedule

### Daily
- Check System Health tab
- Review recent failures

### Weekly  
- Review analytics
- Cleanup expired sessions
- Check for stuck jobs

### Monthly
- Audit admin actions
- Review user accounts
- Analyze usage trends
- Update documentation

## Resources

- **Full Guide**: `ADMIN_SETTINGS_GUIDE.md`
- **Quick Reference**: `ADMIN_QUICK_REFERENCE.md`
- **Schema**: `convex/schema.ts`
- **Admin API**: `convex/adminTools.ts`
- **Admin UI**: `src/app/(dashboard)/settings/admin/page.tsx`

---

**Setup Version**: 1.0.0  
**Last Updated**: 2025-10-26

🎉 **You're all set!** Enjoy your new admin powers responsibly.



