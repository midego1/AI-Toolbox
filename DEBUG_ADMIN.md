# Debug Admin Access

## Quick Check in Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project
3. Go to **Data** tab
4. Click on the **users** table
5. Find your user record

## What to Check

### Find Your User
- Look for your email address in the `email` field
- Or look for your Clerk user ID in the `clerkUserId` field

### Check These Fields

1. **`clerkUserId`** - Should match your Clerk user ID (starts with `user_`)
2. **`isAdmin`** - Should be `true` (not `false`, not `undefined`, not `null`)

### Common Issues

#### Issue 1: No Clerk User ID
If `clerkUserId` is `null` or empty:
- Your Clerk account isn't linked to Convex
- The user needs to log out and log back in
- Or manually set the `clerkUserId` field

#### Issue 2: isAdmin is false
If `isAdmin` is `false`:
- Set it to `true` in the Convex dashboard
- Click on the field
- Change `false` to `true`
- Save

#### Issue 3: Multiple User Records
If there are two user records:
- One from old auth (with passwordHash)
- One from Clerk (with clerkUserId)
- You need to delete the old one or merge them

## How to Grant Admin Access

### Option 1: Via Convex Dashboard (Easiest)
1. Go to Data → users table
2. Find your user
3. Click on the `isAdmin` field
4. Change from `false` to `true` (or add the field if it doesn't exist)
5. Save

### Option 2: Via SQL
```sql
UPDATE users
SET isAdmin = true
WHERE email = 'your-email@example.com'
```

### Option 3: Via Functions (If you have access)
In Convex Dashboard → Functions, run:
- Function: `convex/auth` → `getCurrentUser`
- With token from localStorage

## After Changing isAdmin

1. Wait 1-2 seconds (Convex syncs automatically)
2. Refresh your browser page
3. Check console for "Sidebar Debug" logs
4. Look for "Admin Settings" link in sidebar

## Still Not Working?

Check these things in the browser console:

```javascript
// In browser console
console.log("User data:", window.convexUser) // If available
```

Or check the debug logs we added:
- Look for "🔍 Admin Layout Debug"
- Look for "🔍 Sidebar Debug"

## Manual Verification

1. Get your Clerk user ID:
   - Check the auth object in the browser
   - Or look in Clerk Dashboard → Users

2. Get your Convex user ID:
   - Check the Convex Dashboard data
   - Look for the user with matching Clerk ID

3. Verify link:
   - Clerk user ID should match `clerkUserId` field
   - If not, manually set it

4. Check isAdmin:
   - Should be exactly `true` (boolean, not string)
   - Not `"true"` (string)
   - Not `1` (number)

## Expected Console Output

When working correctly, you should see:

```
🔍 Sidebar Debug: {
  user: {
    _id: "k123abc...",
    email: "your@email.com",
    isAdmin: true,  // ← This should be true
    ...
  },
  isAdmin: true,
  userIsAdmin: true
}

🔍 Admin Layout Debug: {
  user: { ... },
  isAdmin: true,  // ← This should be true
  hasUser: true
}
```

## If isAdmin Shows as undefined

This means the field doesn't exist in the database. You need to:
1. Go to Convex Dashboard → Data → users
2. Click "Add Field"
3. Field name: `isAdmin`
4. Field type: `boolean`
5. Value: `true`
6. Save

