# Dashboard History and Activities Fix

## Issue Identified
The dashboard activities and history were experiencing loading issues because the `history.ts` queries were still using the old session-based authentication pattern, while the app has migrated to Clerk authentication.

## Root Cause
The `convex/history.ts` file was checking for `sessions` table directly:
```typescript
const session = await ctx.db
  .query("sessions")
  .withIndex("by_token", (q) => q.eq("token", args.token))
  .first();

if (!session || session.expiresAt < Date.now()) {
  return null;
}
```

This fails for Clerk-authenticated users because:
1. Clerk users don't have entries in the `sessions` table
2. The token passed is a Convex user ID, not a session token
3. Other queries (like `users.getDashboardStats`) were already using `verifySession()` helper

## Solution Applied
Updated all history queries in `convex/history.ts` to use the `verifySession` helper function from `convex/auth.ts`:

### Changed Queries:
1. `getUserHistory` - Get user's AI job history
2. `getJobById` - Get specific job details
3. `getUsageByTool` - Usage statistics by tool type
4. `getCreditSpendingOverTime` - Credit spending over time
5. `getRecentActivity` - Recent activity feed
6. `searchHistory` - Search through job history

### Pattern Used:
```typescript
// Verify session (supports both Clerk and legacy auth)
let userId;
try {
  userId = await verifySession(ctx, args.token);
} catch (e) {
  return null;
}

// Then use userId in queries
const jobs = await ctx.db
  .query("aiJobs")
  .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
  // ...
```

## How verifySession Works
The `verifySession` helper in `convex/auth.ts` supports both authentication methods:

1. **Clerk Authentication**: Uses token directly as Convex user ID
2. **Legacy Authentication**: Checks sessions table for backwards compatibility

```typescript
export async function verifySession(ctx: any, token: string): Promise<Id<"users">> {
  // Try to use token directly as a Convex user ID (for Clerk)
  if (/^[a-z][a-z0-9]*$/.test(token)) {
    const user = await ctx.db.get(token as Id<"users">);
    if (user) {
      return token as Id<"users">;
    }
  }

  // Legacy: Check for session token
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();

  if (session) {
    if (session.expiresAt < Date.now()) {
      await ctx.db.delete(session._id);
      throw new Error("Session expired");
    }
    return session.userId;
  }

  throw new Error("Invalid token or user not found");
}
```

## Verification
All queries now properly:
- ✅ Load dashboard activities
- ✅ Display history correctly
- ✅ Show usage statistics
- ✅ Display credit spending
- ✅ Support both Clerk and legacy authentication

## Files Modified
- `convex/history.ts` - Updated all 6 query functions

## Testing Checklist
- [x] Dashboard loads without infinite spinner
- [x] Recent activity displays correctly
- [x] Usage statistics show properly
- [x] Credit spending charts work
- [x] No authentication errors
- [x] Loading states work correctly
- [x] Empty states show when no data

## Notes
- The `aiJobs.ts` file was already using `verifySession` correctly
- No frontend changes were needed
- Backwards compatible with legacy authentication
- All queries now consistent across the app

