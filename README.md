# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can save and organize their bookmarks with Google authentication.

## Live Demo

**URL:** https://smart-bookmark-app-krxz.vercel.app

## GitHub Repository

**Repo:** https://github.com/SANTHIYAMURUGAN-git/smart-bookmark-app

## Features

- Google OAuth authentication
- Add bookmarks with title and URL
- Delete bookmarks
- Private bookmarks (each user sees only their own)
- Real-time updates (with some limitations - see below)
- Responsive design

## Tech Stack

- Next.js 15 (App Router)
- Supabase (Auth, PostgreSQL, Realtime)
- Tailwind CSS
- TypeScript
- Vercel

## Setup Instructions

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Supabase Setup

Create a Supabase project and run this SQL:
```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" 
ON bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" 
ON bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
ON bookmarks FOR DELETE 
USING (auth.uid() = user_id);

ALTER TABLE bookmarks REPLICA IDENTITY FULL;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;
```

### 3. Google OAuth Setup

1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth credentials
4. Add redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://your-app.vercel.app/auth/callback`

### 4. Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run Locally
```bash
npm run dev
```

## Problems I Actually Faced (Real Talk)

### Problem 1: Real-time Sync Needs Page Refresh

**What happened:** This was the biggest issue. When I open the app in 2 tabs, adding a bookmark in Tab 1 doesn't immediately show in Tab 2. I have to manually refresh Tab 2 to see it.

**What I tried:**
- Spent hours debugging the Supabase Realtime subscription
- Tried different channel names
- Checked if the publication was added correctly
- Verified replica identity was set to FULL
- Looked at browser console - the subscription shows as "SUBSCRIBED" but events don't trigger

**Current status:** Still not working perfectly. The sync happens only after refreshing. I think the issue is either:
- The WebSocket connection isn't staying open properly
- The event listener isn't catching the postgres_changes events
- Something with how the state updates in React

**What works:** If you refresh the page, you'll see the new bookmarks. So the database and RLS are working fine, just the real-time part needs a refresh.

**Honest note:** I tried fixing this for a long time but couldn't get it to work without refresh. The data syncs correctly, just not instantly like it should.

### Problem 2: React 19 and Next.js 15 Compatibility Hell

**What happened:** When deploying to Vercel, got this error:
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react@"^18.2.0 || 19.0.0-rc-66855b96-20241106" from next@15.0.3
```

**The issue:** I originally had React 19 in package.json, but Next.js 15.0.3 only works with React 18. The versions didn't match.

**How I fixed it:**
1. Changed React and React-DOM to version 18.3.1 in package.json
2. Deleted `node_modules` folder and `package-lock.json`
3. Ran `npm install --legacy-peer-deps`
4. Added `.npmrc` file with `legacy-peer-deps=true` so Vercel builds would work

**Time wasted:** About 2 hours trying different versions and reading error logs.

### Problem 3: Google OAuth Kept Redirecting Forever

**What happened:** Clicked "Sign in with Google" → redirected to Google → authorized → redirected back → redirected to Google → loop forever.

**Why it happened:** The redirect URIs in Google Cloud Console didn't match exactly. I had:
- ❌ `http://localhost:3000/` (with trailing slash)
- ❌ Wrong Supabase callback URL

**How I fixed it:**
- Removed all URIs and added them again carefully:
  - `http://localhost:3000` (no trailing slash!)
  - `https://mrtffxinwjhnwepedxa.supabase.co/auth/v1/callback` (exact format)
- Made sure the callback route existed at `/app/auth/callback/route.ts`
- Set `NEXT_PUBLIC_SITE_URL` in both local and Vercel

**Lesson learned:** Every character matters in OAuth redirect URIs.

### Problem 4: "Permission Denied" When Viewing My Own Bookmarks

**What happened:** After adding RLS policies, I couldn't even see my own bookmarks. Got permission errors.

**Why it happened:** I enabled RLS but didn't create the SELECT policy correctly. First tried:
```sql
CREATE POLICY "Users can view bookmarks" 
ON bookmarks FOR SELECT 
USING (true);  -- This let everyone see everything!
```

**How I fixed it:**
```sql
CREATE POLICY "Users can view own bookmarks" 
ON bookmarks FOR SELECT 
USING (auth.uid() = user_id);  -- Only your own bookmarks
```

Had to create separate policies for SELECT, INSERT, and DELETE.

### Problem 5: Logged Out Every Time I Refreshed

**What happened:** Sign in with Google → works → refresh page → logged out again.

**Why it happened:** No middleware to refresh the session on each request.

**How I fixed it:**
- Created `middleware.ts` file
- Used `@supabase/ssr` package
- Added `await supabase.auth.getUser()` to refresh session automatically
- Configured cookie handling properly

### Problem 6: Date Format Causing Hydration Errors

**What happened:** Red error in console:
```
Hydration failed because the server rendered HTML didn't match the client.
```

**Why it happened:** Used `toLocaleDateString()` which gives different results on server vs client. Server uses UTC, client uses local timezone.

**How I fixed it:**
- Created custom `formatDate` function that always uses UTC
- Added `mounted` state to only show dates after client loads:
```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
{mounted && <p>{formatDate(date)}</p>}
```

### Problem 7: "npm: command not found" on Windows

**What happened:** Tried to run `npm install` but got "command not found".

**Why it happened:** Node.js wasn't installed on my computer.

**How I fixed it:**
- Downloaded Node.js from nodejs.org
- Installed it
- Restarted terminal
- Then `npm` commands worked

### Problem 8: PowerShell Blocking npm Commands

**What happened:** Node.js installed but PowerShell showed:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

**How I fixed it:** Used Command Prompt (cmd) instead of PowerShell. Just opened cmd and everything worked.

### Problem 9: Vercel Environment Variables Missing

**What happened:** App deployed successfully but couldn't connect to Supabase in production.

**Why it happened:** Environment variables were only in my local `.env.local` file, not in Vercel.

**How I fixed it:**
1. Went to Vercel dashboard → Settings → Environment Variables
2. Added all three variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_SITE_URL (had to redeploy after adding this one)
3. Redeployed

### Problem 10: Git Push Asking for Password That Doesn't Work

**What happened:** Ran `git push` → asked for username and password → my GitHub password didn't work.

**Why it happened:** GitHub doesn't allow password authentication anymore, needs a token.

**How I fixed it:**
1. Went to GitHub → Settings → Developer settings → Personal access tokens
2. Generated new token with "repo" scope
3. Used that token as password when pushing
4. Worked!

## Known Issues / Limitations

1. **Real-time sync requires manual page refresh** - This is the main issue. Bookmarks sync to the database correctly but don't appear in other tabs until you refresh. I tried many fixes but couldn't get the WebSocket events to trigger properly.

2. **No loading states** - When adding/deleting bookmarks, there's no loading indicator. It just happens.

3. **No error handling for network issues** - If internet disconnects, the app doesn't show a nice error message.

4. **No bookmark editing** - Can only add and delete, not edit existing bookmarks.

5. **No search or filter** - If you have 100 bookmarks, good luck finding one.

## What I Learned

- OAuth is tricky - exact URLs matter
- Supabase Realtime is powerful but complex to debug
- Row Level Security is actually really cool for privacy
- Next.js App Router is different from Pages Router
- Reading error logs carefully saves time
- Sometimes you need `--legacy-peer-deps` and that's okay

## Future Improvements (If I Had More Time)

- [ ] Fix the real-time sync to work without refresh
- [ ] Add bookmark editing
- [ ] Add search and filtering
- [ ] Add tags/categories
- [ ] Add bookmark folders
- [ ] Export bookmarks to JSON/CSV
- [ ] Better error messages
- [ ] Loading indicators
- [ ] Offline support

## Time Spent

- Initial setup: 1 hour
- Fighting with dependencies: 2 hours
- Google OAuth debugging: 1.5 hours
- Supabase RLS policies: 1 hour
- Real-time sync attempts: 3+ hours (still not perfect)
- Deployment issues: 1 hour
- Total: ~10 hours



The app works and does everything required except perfect real-time sync. Users can log in with Google, add bookmarks, delete them, and everything is private. The only issue is you need to refresh to see updates from other tabs. If I had more time, I'd keep debugging the Realtime subscription, but for now, it's functional even if not perfect.

