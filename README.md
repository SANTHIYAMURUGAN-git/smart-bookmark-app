# Smart Bookmark App

A real-time bookmark manager built with Next.js 15, Supabase, and Tailwind CSS. Features Google OAuth authentication and live synchronization across multiple browser tabs.

## 🚀 Live Demo

**Deployed URL:** [Add your Vercel URL here after deployment]

**GitHub Repository:** [Add your repo URL here]

## ✨ Features

- ✅ Google OAuth authentication (no email/password)
- ✅ Add bookmarks with title and URL
- ✅ Private bookmarks per user (Row Level Security)
- ✅ Real-time updates across all tabs
- ✅ Delete bookmarks
- ✅ Clean, responsive UI with Tailwind CSS
- ✅ Deployed on Vercel

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Auth:** Supabase Auth with Google OAuth
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 📁 Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page (login + dashboard)
├── components/
│   ├── AddBookmark.tsx           # Form to add bookmarks
│   └── BookmarkList.tsx          # List with real-time updates
├── lib/
│   ├── supabase-browser.ts       # Client-side Supabase client
│   └── supabase-server.ts        # Server-side Supabase client
├── middleware.ts                 # Auth middleware
├── schema.sql                    # Database schema with RLS
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🚦 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Cloud Console account
- Vercel account (for deployment)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-bookmark-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `schema.sql`
3. Go to **Database** → **Replication** and enable replication for the `bookmarks` table
4. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (for local dev)
     - `https://[your-project].supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

6. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable Google
   - Paste Client ID and Client Secret
   - Save

### 4. Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Update `NEXT_PUBLIC_SITE_URL` with your Vercel URL
6. Add Vercel callback URL to Google OAuth: `https://your-app.vercel.app/auth/callback`

## 🐛 Problems Encountered & Solutions

### Problem 1: Realtime Subscription Not Triggering

**Issue:** When adding a bookmark in one tab, it wouldn't appear in another tab automatically.

**Root Cause:** Supabase Realtime was not enabled for the `bookmarks` table.

**Solution:**
1. In Supabase Dashboard, navigate to **Database** → **Replication**
2. Find the `bookmarks` table in the list
3. Toggle the switch to enable replication
4. The subscription now works with this code:

```typescript
channel = supabase
  .channel('bookmarks-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookmarks',
    filter: `user_id=eq.${user.id}`,
  }, handleChange)
  .subscribe()
```

### Problem 2: Google OAuth Redirect Loop

**Issue:** After clicking "Sign in with Google", the app would redirect infinitely without logging in.

**Root Cause:** Mismatch between the callback URL in Google Cloud Console and the actual redirect URI.

**Solution:**
- Ensured the callback route exists at `/app/auth/callback/route.ts`
- Added exact redirect URIs in Google Console:
  - `http://localhost:3000/auth/callback`
  - `https://[project-ref].supabase.co/auth/v1/callback`
- Set `redirectTo` in `signInWithOAuth`:

```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
})
```

### Problem 3: Row Level Security Blocking Own Bookmarks

**Issue:** Users couldn't see their own bookmarks after adding them, getting permission errors.

**Root Cause:** RLS policies were too restrictive or incorrectly configured.

**Solution:**
Created specific policies for SELECT, INSERT, and DELETE operations:

```sql
-- View own bookmarks
CREATE POLICY "Users can view own bookmarks" 
ON bookmarks FOR SELECT 
USING (auth.uid() = user_id);

-- Insert own bookmarks
CREATE POLICY "Users can insert own bookmarks" 
ON bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Delete own bookmarks
CREATE POLICY "Users can delete own bookmarks" 
ON bookmarks FOR DELETE 
USING (auth.uid() = user_id);
```

### Problem 4: Session Not Persisting Across Page Refreshes

**Issue:** Users were logged out every time they refreshed the page.

**Root Cause:** Missing middleware to refresh the session on each request.

**Solution:**
Implemented `middleware.ts` to handle session refresh:

```typescript
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */)
  await supabase.auth.getUser() // Refreshes session
  return response
}
```

### Problem 5: Environment Variables Not Working in Production

**Issue:** App deployed successfully but couldn't connect to Supabase in production.

**Root Cause:** Environment variables were not set in Vercel.

**Solution:**
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add all variables from `.env.local`
3. Redeploy the application
4. Verified variables start with `NEXT_PUBLIC_` for client-side access

### Problem 6: TypeScript Errors with Supabase Types

**Issue:** TypeScript complained about missing types for Supabase responses.

**Root Cause:** Not handling the shape of Supabase responses properly.

**Solution:**
- Defined explicit types for bookmarks:

```typescript
type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}
```

- Used proper type assertions when handling realtime payloads

### Problem 7: Bookmark List Not Updating After Manual Deletion

**Issue:** When deleting a bookmark using the UI, it remained visible until page refresh.

**Root Cause:** Not removing the item from local state after successful deletion.

**Solution:**
The realtime subscription handles this automatically - when a DELETE event occurs, it filters the bookmark from the list:

```typescript
if (payload.eventType === 'DELETE') {
  setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
}
```

## 🧪 Testing the App

### Test Realtime Updates

1. Open the app in two browser tabs
2. Sign in with the same Google account
3. In Tab 1: Add a bookmark
4. **Expected:** Bookmark appears in Tab 2 instantly (within 500ms)
5. In Tab 2: Delete the bookmark
6. **Expected:** Bookmark disappears from Tab 1 instantly

### Test Privacy

1. Sign in with Google Account A
2. Add a bookmark "Private A"
3. Sign out
4. Sign in with Google Account B
5. **Expected:** "Private A" bookmark is NOT visible
6. Add bookmark "Private B"
7. Sign out and sign in with Account A
8. **Expected:** Only "Private A" is visible

## 📊 Performance Considerations

- Database queries use indexes on `user_id` and `created_at`
- Realtime subscriptions are filtered by user_id to reduce bandwidth
- Components use React's state management efficiently
- Server Components reduce client-side JavaScript

## 🔒 Security Features

- **Row Level Security (RLS):** Database-level access control
- **Google OAuth:** No password storage required
- **Environment Variables:** Sensitive data not in codebase
- **HTTPS:** Enforced in production (Vercel)
- **User Isolation:** Users can only access their own data

## 🚀 Future Enhancements

- Add tags/categories to bookmarks
- Search and filter functionality
- Export bookmarks to JSON/CSV
- Bookmark folders
- Shared bookmark collections
- Chrome extension

## 📄 License

MIT License - Feel free to use this project for learning or building your own bookmark manager.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**
