# How to Check Browser Console - Step by Step

## Step 1: Open Your App
- Go to `http://localhost:3000` (or your deployed URL)
- Make sure you're logged in

## Step 2: Open Developer Tools

### Method A: Keyboard Shortcut (Fastest)
- **Windows/Linux**: Press `F12`
- **Mac**: Press `Cmd + Option + I` (or `Cmd + Option + J`)

### Method B: Right-Click Menu
1. Right-click anywhere on the page
2. Click **"Inspect"** or **"Inspect Element"**
3. This opens Developer Tools at the bottom or side

### Method C: Browser Menu
- **Chrome/Edge**: Menu (⋮) → More Tools → Developer Tools
- **Firefox**: Menu → Web Developer → Toggle Tools
- **Safari**: Develop menu (enable first: Safari → Preferences → Advanced → Show Develop)

## Step 3: Find the Console Tab

Once Developer Tools are open, you'll see several tabs at the top:
- Elements / Inspector
- Console ← **Click this one**
- Network
- Application
- etc.

## Step 4: Look for the Debug Messages

You should see messages like:

```
🔍 Sidebar Debug: {user: {...}, isAdmin: false, ...}
🔍 Admin Layout Debug: {user: {...}, isAdmin: false, ...}
```

## Quick Visual Guide

```
Browser Window
┌─────────────────────────────────────┐
│  Your App Interface                 │
│                                     │
│  [Dashboard] [Tools] [Settings]     │
│                                     │
├─────────────────────────────────────┤
│  Developer Tools (Press F12)        │
│  ┌────────────────────────────────┐│
│  │  Elements | Console | Network ││ ← Console tab
│  │  ────────────────────────────── ││
│  │  > 🔍 Sidebar Debug: {...}      ││ ← Look here
│  │  > 🔍 Admin Layout Debug: {...}││
│  └────────────────────────────────┘│
└─────────────────────────────────────┘
```

## If Console is Empty

1. **Refresh the page** (F5 or Cmd+R)
2. **Check if filters are active** - There might be a filter icon on the top of console
3. **Try going to Settings > Admin** and see if logs appear

## What to Look For

### Good (Working):
```
🔍 Sidebar Debug: {
  user: { _id: "...", email: "you@email.com", ... },
  isAdmin: true,  ← Should be true
  userIsAdmin: true
}
```

### Problem (Needs Fix):
```
🔍 Sidebar Debug: {
  user: { ... },
  isAdmin: false,  ← This is the problem!
  userIsAdmin: false
}
```

### No User Data:
```
🔍 Sidebar Debug: {
  user: null,  ← User not found
  isAdmin: false,
  ...
}
```

## Still Can't Find It?

1. Clear the console (click the 🚫 icon at top left)
2. Navigate to any page (like Settings)
3. Look for new messages appearing

## Can't Access Developer Tools?

If you can't open the console, tell me:
- What browser you're using?
- Are you on mobile or desktop?
- Can you see a settings/settings icon somewhere?

## Alternative: Check Network Tab

If console doesn't work:
1. Open Developer Tools (F12)
2. Click **Network** tab
3. Refresh page
4. Look for requests to `convex.site` domain
5. Click on any Convex request
6. Click **Response** tab
7. Look for user data with `isAdmin` field

