# 🔄 User Migration from Convex Auth to Clerk

## ✅ Migration Strategy: Seamless & Backward Compatible

Your migration is designed to be **non-breaking** - existing users can continue using the old system while new users use Clerk.

## 🎯 How It Works

### 1. **Existing Users Continue Working**
- Old email/password users: ✅ Still work via old auth system
- Sessions: ✅ Still valid
- Data: ✅ All preserved
- No disruption: ✅ Zero downtime

### 2. **New Users Use Clerk**
- Sign-ups: Uses Clerk authentication
- Social login: Enabled automatically  
- User sync: Automatic via webhook

### 3. **Automatic Linking (Migration on Login)**
When an existing user signs in with Clerk using the **same email**:

```
1. User signs in with Clerk (Google, GitHub, etc.)
2. Webhook fires to Convex
3. Convex checks: "Does email exist?"
4. ✅ Yes → Link Clerk ID to existing account
5. ✅ Both auth methods work now!
```

## 📊 Current Status

To check migration progress, you can query:

```typescript
// In Convex dashboard or via API
api.migration.getMigrationStatus
```

Returns:
- Total users
- Users migrated to Clerk
- Legacy users still using old auth
- Migration progress percentage

## 🔄 Migration Flow

### For Existing Users

**Option A: Keep Using Old Auth**
1. Continue logging in at `/login` with email/password
2. Everything works as before
3. No action needed

**Option B: Migrate to Clerk (Recommended)**
1. Go to https://your-app.com/login
2. Click "Sign in with Google" (or any provider)
3. Use the **same email** as your existing account
4. Convex automatically links them
5. Now you can use either auth method!

### For New Users

All new users automatically use Clerk - no migration needed.

## 🔐 What Happens Behind the Scenes

### Webhook Flow

```
Clerk User Signs In
    ↓
Clerk creates/updates user
    ↓
Webhook → Convex syncs user
    ↓
Convex checks by email:
  - Email exists? → Link Clerk ID to existing user
  - New email? → Create new user with Clerk
```

### Database Changes

**Before Migration:**
```typescript
{
  email: "user@example.com",
  passwordHash: "...",
  clerkUserId: undefined
}
```

**After Migration:**
```typescript
{
  email: "user@example.com",
  passwordHash: "...",           // Still works!
  clerkUserId: "clerk_xxx",      // ✅ Linked to Clerk
  oauthProvider: "clerk"         // ✅ Can use social login
}
```

## ✅ Benefits

1. **Non-Breaking**: Old users unaffected
2. **Gradual Migration**: Users migrate at their own pace
3. **Both Auth Methods Work**: Users can use either login
4. **Data Preserved**: All data stays intact
5. **Zero Downtime**: No service interruption

## 🚀 How to Encourage Migration

### For Your Users

Tell them:
1. "You can now sign in with Google/GitHub!"
2. "Use the same email to keep your data"
3. "Faster login, social authentication enabled"

### Migration Message

You can add a banner in your app:

```typescript
// Example: Show to users without Clerk ID
if (!user.clerkUserId) {
  <MigrationBanner>
    "🎉 New! Sign in with Google/GitHub now available. 
     Use your existing email to keep your data."
  </MigrationBanner>
}
```

## 📈 Migration Timeline

### Week 1-2: Gradual Adoption
- New users: All use Clerk ✅
- Existing users: Can migrate by using social login
- Legacy login: Still works ✅

### Week 3+: Encourage Migration
- Add prompts for users to migrate
- Show benefits (social login, faster)
- Eventually mark legacy auth as "deprecated" (still works)

### Long Term: Optional Cleanup
- Keep both systems for backward compatibility
- Or phase out legacy auth (after months of migration window)

## 🎯 What You Need to Do

### Nothing! ✅

The system is already set up for automatic migration:

1. ✅ Webhook creates/links users automatically
2. ✅ Existing users can still log in
3. ✅ New users use Clerk automatically
4. ✅ Data migration happens on first social login

### Optional: Monitor Migration

You can check progress in Convex Dashboard:

1. Go to **Data** tab
2. Look at `users` table
3. Count users with `clerkUserId` field populated
4. Calculate: `(clerkUsers / totalUsers) * 100`

## 🔍 Testing Migration

### Test Scenario 1: Existing User
1. Create user with old auth system (email/password)
2. Log out
3. Sign in with Clerk using same email
4. ✅ Should link accounts automatically
5. ✅ Can now use social login

### Test Scenario 2: New User
1. Sign up with Clerk (Google, etc.)
2. ✅ User created in Convex
3. ✅ `clerkUserId` populated
4. ✅ Can access all features

## 📊 Expected Results

**After migration:**
- Old users: Keep credentials, gain Clerk access
- New users: Only Clerk
- Data: 100% preserved
- Features: All work normally

## ⚠️ Important Notes

1. **Don't force migration** - let users choose when to migrate
2. **Keep legacy auth working** - don't disable old system yet
3. **Monitor webhook deliveries** - ensure sync is working
4. **Check Convex logs** - watch for any sync errors

## 🎉 Summary

**Your migration is automatic and seamless:**

- ✅ Existing users unaffected
- ✅ New users use Clerk  
- ✅ Automatic linking by email
- ✅ Both auth methods work
- ✅ Zero data loss
- ✅ Zero downtime

**Users are being migrated automatically as they sign in with Clerk!** 🚀

