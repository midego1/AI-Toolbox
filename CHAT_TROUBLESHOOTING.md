# Chat Troubleshooting Guide

## Issue: Cannot Start a Chat

### Step 1: Check Console Logs

Open your browser console (F12 or Right-click → Inspect → Console) and look for these messages:

```
Chat state: { chatSessions: 0, currentSessionId: null, token: true, ... }
```

**What to check:**
- `token: true` → Good! You're authenticated ✅
- `token: false` → Problem! You need to log in ❌
- `chatSessions: 0` → No sessions yet (expected on first visit)
- `currentSessionId: null` → No session selected

### Step 2: Try Manual Creation

If auto-creation didn't work, try these steps:

1. Look at the top-right of the chat page
2. Find the **"New Chat"** button (blue button with sparkles icon)
3. Click it
4. Watch the console for messages

**Expected behavior:**
- Button says "Creating..."
- Console shows: "Auto-creating first session"
- Sidebar shows: "Creating your first chat..."
- Session appears in sidebar
- Input becomes enabled ✅

### Step 3: Check for Errors

Look for red error messages in console like:
- "Invalid or expired session"
- "Insufficient credits"
- "Session not found"
- Any other errors

### Step 4: Verify You're Logged In

1. Check top-right corner - do you see your user info?
2. Open browser console and type:
   ```javascript
   localStorage.getItem('authToken')
   ```
3. Should return a token string (not null)

### Step 5: Check Convex Connection

1. Open browser console
2. Look for Convex connection messages
3. Should see something about Convex being connected

### Step 6: Test Direct Session Creation

In the browser console, paste this:

```javascript
// Get your token
const token = localStorage.getItem('authToken');
console.log('Token:', token ? 'Found' : 'Missing');

// Try to get sessions
// This will fail if Convex queries aren't working
```

## Common Issues & Solutions

### Issue: "Click 'New Chat' to start..."

**Solution:** The auto-creation didn't work. Simply click the "New Chat" button manually.

### Issue: Button is disabled/greyed out

**Causes:**
1. Not logged in → Go to `/login`
2. No auth token → Clear cache and log in again
3. Convex not connected → Check network tab for errors

### Issue: "Invalid or expired session"

**Solution:**
1. Log out
2. Clear browser cache
3. Log in again
4. Try creating chat

### Issue: Nothing happens when clicking "New Chat"

**Possible causes:**
1. Convex backend not running → Run `npx convex dev`
2. Network error → Check browser Network tab
3. JavaScript error → Check console for errors

## Manual Override

If nothing else works, try this in the browser console:

```javascript
// Force a page reload with cache clear
window.location.reload(true);

// Or clear everything and start fresh
localStorage.clear();
window.location.href = '/login';
```

## What Information to Share

If still stuck, please share:

1. **Console logs** - Everything in the console tab
2. **Network errors** - Check Network tab for failed requests
3. **Token status** - Result of `localStorage.getItem('authToken')`
4. **Screenshot** - What you see on the chat page
5. **Browser** - Chrome/Firefox/Safari/etc and version

## Quick Checklist

- [ ] Logged in (see user info in top-right)
- [ ] Auth token exists (check localStorage)
- [ ] Convex dev server running (`npx convex dev`)
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Browser console open (F12)
- [ ] No red errors in console
- [ ] Can see "New Chat" button
- [ ] Button is clickable (not disabled)
- [ ] Tried clicking "New Chat"
- [ ] Checked console after clicking

## Contact Support

Share:
- All console logs
- Screenshots
- Steps you tried
- What happens vs. what you expect

