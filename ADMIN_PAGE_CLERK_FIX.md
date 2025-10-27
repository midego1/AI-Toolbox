# Admin Page Clerk Auth Fix

## Problem
One admin user is authenticated via Clerk and marked as admin in Convex, but doesn't see the admin page.

## Root Cause
The admin layout and related components were using the old authentication method (`getAuthToken()` from localStorage) instead of the new Clerk authentication method.

## Files Fixed

### 1. `src/app/(dashboard)/settings/admin/layout.tsx`
**Before:**
- Used `getAuthToken()` from `@/lib/auth-client`
- Called `api.auth.getCurrentUser` which looks for session tokens
- Didn't work with Clerk auth

**After:**
- Uses `useConvexUser()` hook
- Directly gets the user profile from Convex
- Includes `isAdmin` status in the profile

### 2. `src/app/(dashboard)/settings/admin/page.tsx`
**Before:**
- Used `getAuthToken()` from `@/lib/auth-client`

**After:**
- Uses `useAuthToken()` hook (returns Convex user ID as token)

### 3. `src/components/layout/sidebar.tsx`
**Before:**
- Used `getAuthToken()` to get token
- Called `api.auth.getCurrentUser` to check admin status

**After:**
- Uses `useConvexUser()` hook
- Directly reads `user.isAdmin`

## Changes Made

### Admin Layout (`src/app/(dashboard)/settings/admin/layout.tsx`)
```typescript
// Before
const token = getAuthToken();
const user = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");

// After
const { convexUser: user, isCreating } = useConvexUser();
```

### Admin Page (`src/app/(dashboard)/settings/admin/page.tsx`)
```typescript
// Before
import { getAuthToken } from "@/lib/auth-client";
const token = getAuthToken();

// After
import { useAuthToken } from "@/hooks/useAuthToken";
const token = useAuthToken();
```

### Sidebar (`src/components/layout/sidebar.tsx`)
```typescript
// Before
const token = getAuthToken();
const user = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
const isAdmin = user ? (user as any).isAdmin : false;

// After
const { convexUser: user } = useConvexUser();
const isAdmin = user?.isAdmin || false;
```

## How It Works Now

1. **User Signs In via Clerk**
   - Clerk authenticates the user
   - Clerk user ID is available

2. **Convex User Lookup**
   - `useConvexUser()` hook gets the Clerk user ID
   - Queries Convex to find the user by `clerkUserId`
   - Returns full user profile including `isAdmin`

## Requirements

For the admin to work correctly, the user must have:

1. **Clerk Account** ✅
   - User is authenticated via Clerk
   - Clerk user ID exists

2. **Convex User Record** ✅
   - Convex user record exists
   - Has `clerkUserId` field populated
   - Has `isAdmin: true` set

## How to Grant Admin Access

If the user doesn't have admin access yet, you can grant it by:

### Option 1: Via Convex Dashboard
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to the Data tab
4. Find the `users` table
5. Find the user record
6. Set `isAdmin: true`

### Option 2: Via SQL Query
```typescript
// In Convex Dashboard → SQL Editor
UPDATE users
SET isAdmin = true
WHERE clerkUserId = 'user_xxxxx'
```

### Option 3: Via Existing Admin Panel
If you have another admin user:
1. Login as the existing admin
2. Go to `/settings/admin`
3. Find the user in the Users tab
4. Click "Make Admin" button

## Testing

To verify the fix works:

1. **Login** with the admin user
2. **Check sidebar** - Should see "Admin Settings" link
3. **Click Admin Settings** - Should see the admin page
4. **Verify access** - All admin functions should work

## What to Check If Still Not Working

1. **Check Clerk Authentication**
   - User is signed in to Clerk
   - Clerk user ID exists

2. **Check Convex User Exists**
   ```typescript
   // In Convex Dashboard → Functions
   // Query: convex/clerk.getUserIdByClerkId
   // Args: { clerkUserId: "user_xxxxx" }
   // Should return a user ID
   ```

3. **Check Admin Status**
   ```typescript
   // Query: convex/clerk.getUserProfileById
   // Args: { userId: "xxxx" }
   // Should return user with isAdmin: true
   ```

4. **Check User Link**
   - The Convex user record should have `clerkUserId` field
   - Should match the Clerk user ID

## Expected Behavior

After the fix:
- ✅ Admin user can access admin page
- ✅ Admin user sees "Admin Settings" in sidebar
- ✅ Admin functions work correctly
- ✅ Non-admin users are redirected
- ✅ Loading states work properly

## Implementation Details

### `useConvexUser()` Hook
- Gets Clerk user from `useUser()` hook
- Queries `api.clerk.getUserIdByClerkId` to get Convex user ID
- Queries `api.clerk.getUserProfileById` to get full profile
- Automatically creates user if doesn't exist
- Returns `convexUser` with all fields including `isAdmin`

### `useAuthToken()` Hook
- Gets Clerk user ID
- Converts to Convex user ID
- Returns as "token" for backward compatibility
- Works with existing Convex API functions

## Summary

The issue was that admin components were using the old session-based authentication instead of the new Clerk-based authentication. The fix updates all three files to use the proper Clerk authentication hooks that work with the current setup.

