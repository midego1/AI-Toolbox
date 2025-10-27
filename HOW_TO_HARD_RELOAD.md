# How to Empty Cache and Hard Reload

## Method 1: Chrome/Edge/Opera

### Step-by-Step:
1. Open your browser
2. Press **F12** (or **Cmd + Option + I** on Mac)
3. DevTools will open
4. Find the **reload button** in your browser (circular arrow icon at top-left)
5. **Right-click** on the reload button
6. Select **"Empty Cache and Hard Reload"** from the menu

### Visual Guide:
```
Browser Window
┌─────────────────────────────────────┐
│ [←→] [⟳]  ← Click this button      │
│            (refresh icon)           │
├─────────────────────────────────────┤
│ After right-click you'll see:       │
│ - Normal Reload                      │
│ - Hard Reload                       │
│ - Empty Cache and Hard Reload  ← This one!
└─────────────────────────────────────┘
```

## Method 2: Safari

1. Press **Cmd + Option + E** (clears cache)
2. Then press **Cmd + R** (reloads)

Or:
1. Safari menu → **Develop** → **Empty Caches**
2. Press **Cmd + R**

## Method 3: Firefox

1. Press **Ctrl + Shift + Delete** (Windows) or **Cmd + Shift + Delete** (Mac)
2. Select "Cache"
3. Click "Clear Now"
4. Press **Cmd + R**

## Method 4: Easiest (Works in Chrome/Edge)

1. Press **F12** to open DevTools
2. You'll see a **gear icon** or **three dots** (⋮) at the top-right of DevTools
3. Click it
4. Check "**Disable cache**"
5. Close DevTools (F12 again)
6. Press **Ctrl + R** (Windows) or **Cmd + R** (Mac) multiple times

## Method 5: Nuclear Option (100% Works)

1. Close ALL browser tabs for `localhost:3000`
2. Open a **new Incognito/Private window**:
   - Chrome: **Ctrl + Shift + N** (Windows) or **Cmd + Shift + N** (Mac)
   - Firefox: **Ctrl + Shift + P** (Windows) or **Cmd + Shift + P** (Mac)
   - Safari: **Cmd + Shift + N**
3. Go to: `http://localhost:3000/settings/admin`

## Quick Keyboard Shortcuts

| Browser | Clear Cache + Reload |
|---------|----------------------|
| Chrome/Edge | **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac) |
| Firefox | **Ctrl + Shift + Delete**, then select Cache |
| Safari | **Cmd + Option + E**, then **Cmd + R** |

---

## Still Not Working?

If you still see the old content after hard reload:

1. Close the browser completely
2. Open it again
3. Go to: `http://localhost:3000/settings/admin`

Or restart the Next.js server:
```bash
# Kill the server
pkill -f "next dev"

# Start it again
npm run dev
```

