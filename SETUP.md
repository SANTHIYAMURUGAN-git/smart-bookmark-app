# Step-by-Step Setup Guide

This guide will walk you through setting up the Smart Bookmark App from scratch.

## Part 1: Local Development Setup (15 minutes)

### Step 1: Clone and Install Dependencies (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd smart-bookmark-app

# Install dependencies
npm install
```

### Step 2: Create Supabase Project (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - Name: `smart-bookmarks` (or your choice)
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to you
   - Pricing Plan: Free tier is fine
6. Click "Create new project"
7. Wait 2-3 minutes for project to be ready

### Step 3: Set Up Database Schema (3 minutes)

1. In Supabase Dashboard, click **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Step 4: Enable Realtime (1 minute)

1. Click **Database** in the left sidebar
2. Click **Replication** tab
3. Find the `bookmarks` table
4. Toggle the switch to enable replication
5. Click "Enable replication"

### Step 5: Get Supabase Credentials (2 minutes)

1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. Copy two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 6: Configure Local Environment (2 minutes)

1. In the project root, create `.env.local`:

```bash
touch .env.local
```

2. Open `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Replace the values with your actual Supabase credentials

### Step 7: Test Local Development (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the login page! But Google OAuth won't work yet - we'll set that up next.

---

## Part 2: Google OAuth Setup (10 minutes)

### Step 1: Create Google Cloud Project (3 minutes)

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the project dropdown (top left, next to "Google Cloud")
4. Click "New Project"
5. Name it "Smart Bookmarks" (or your choice)
6. Click "Create"
7. Wait for the project to be created (notification will appear)
8. Make sure your new project is selected

### Step 2: Enable Google+ API (2 minutes)

1. In the search bar at the top, type "Google+ API"
2. Click on "Google+ API" in the results
3. Click "Enable"
4. Wait for it to enable

### Step 3: Create OAuth Credentials (5 minutes)

1. In the left sidebar, click "Credentials"
2. Click "Create Credentials" at the top
3. Select "OAuth client ID"
4. If prompted to configure consent screen:
   - Click "Configure Consent Screen"
   - Choose "External"
   - Click "Create"
   - Fill in:
     - App name: "Smart Bookmarks"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Skip "Test users" (click "Save and Continue")
   - Click "Back to Dashboard"
5. Click "Credentials" in left sidebar again
6. Click "Create Credentials" → "OAuth client ID"
7. Choose "Web application"
8. Name it "Smart Bookmarks Web Client"
9. Under "Authorized redirect URIs", click "Add URI"
10. Add these two URIs:
    ```
    http://localhost:3000/auth/callback
    https://xxxxx.supabase.co/auth/v1/callback
    ```
    (Replace `xxxxx` with your Supabase project reference)
11. Click "Create"
12. **Important:** Copy the **Client ID** and **Client Secret** - you'll need them next!

### Step 4: Configure Supabase with Google OAuth (2 minutes)

1. Go back to your Supabase Dashboard
2. Click **Authentication** in the left sidebar
3. Click **Providers** tab
4. Find "Google" and click to expand
5. Toggle "Enable Sign in with Google" to ON
6. Paste your Google **Client ID**
7. Paste your Google **Client Secret**
8. Click "Save"

### Step 5: Test Authentication Locally (2 minutes)

1. Make sure your dev server is running (`npm run dev`)
2. Open [http://localhost:3000](http://localhost:3000)
3. Click "Sign in with Google"
4. Choose your Google account
5. You should be redirected back and see the app!
6. Try adding a bookmark
7. Open another tab to [http://localhost:3000](http://localhost:3000)
8. Add another bookmark in one tab - it should appear in both!

---

## Part 3: Deploy to Vercel (10 minutes)

### Step 1: Push Code to GitHub (3 minutes)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Smart Bookmark App"

# Create a new repository on GitHub (go to github.com → New Repository)
# Name it "smart-bookmark-app"
# Don't initialize with README (you already have one)

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/smart-bookmark-app.git

# Push
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel (4 minutes)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Find your `smart-bookmark-app` repository
5. Click "Import"
6. Vercel will detect Next.js automatically
7. Click "Environment Variables" to expand
8. Add three environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `NEXT_PUBLIC_SITE_URL`: Leave blank for now (we'll add it after)
9. Click "Deploy"
10. Wait 2-3 minutes for deployment to complete
11. Copy your Vercel URL (looks like `https://smart-bookmark-app-xxx.vercel.app`)

### Step 3: Update Environment Variable (1 minute)

1. In Vercel, go to your project
2. Click "Settings" tab
3. Click "Environment Variables"
4. Find `NEXT_PUBLIC_SITE_URL` (or add it if you skipped it)
5. Set value to your Vercel URL: `https://smart-bookmark-app-xxx.vercel.app`
6. Click "Save"
7. Go to "Deployments" tab
8. Click the three dots on the latest deployment
9. Click "Redeploy"

### Step 4: Update Google OAuth Redirect URI (2 minutes)

1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Credentials
3. Click on your OAuth client
4. Under "Authorized redirect URIs", click "Add URI"
5. Add your Vercel URL callback:
   ```
   https://smart-bookmark-app-xxx.vercel.app/auth/callback
   ```
6. Click "Save"

### Step 5: Test Production Deployment (1 minute)

1. Open your Vercel URL in a browser
2. Click "Sign in with Google"
3. Authorize the app
4. Add a bookmark
5. Open the same URL in another tab (same Google account)
6. Verify real-time updates work

---

## 🎉 Congratulations!

Your Smart Bookmark App is now:
- ✅ Running locally
- ✅ Deployed to production
- ✅ Fully functional with Google OAuth
- ✅ Real-time updates working

## Next Steps

1. **Share Your URLs:**
   - Live URL: `https://your-app.vercel.app`
   - GitHub: `https://github.com/YOUR-USERNAME/smart-bookmark-app`

2. **Add Custom Domain (Optional):**
   - Go to Vercel → Settings → Domains
   - Follow instructions to add your domain

3. **Monitor Your App:**
   - Vercel Analytics: Track visitors and performance
   - Supabase Dashboard: Monitor database usage

## Troubleshooting

### "Google Sign In Failed"
- Check that redirect URIs are exactly correct in Google Console
- Verify Client ID and Secret are correct in Supabase

### "Can't Connect to Supabase"
- Verify environment variables are set correctly in Vercel
- Check that Supabase project is active

### "Real-time Not Working"
- Ensure replication is enabled for `bookmarks` table in Supabase
- Check browser console for WebSocket errors

### "Deployment Failed"
- Check Vercel deployment logs for specific errors
- Ensure all dependencies are in `package.json`

## Need Help?

1. Check the full [README.md](./README.md) for detailed information
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment specifics
3. Open an issue on GitHub
4. Check Supabase documentation: https://supabase.com/docs

---

**Total Setup Time: ~35 minutes**

Enjoy your new Smart Bookmark App! 🚀
