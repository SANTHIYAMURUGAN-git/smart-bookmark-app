# Deployment Guide

## Quick Deployment Checklist

### ✅ Before Deployment

- [ ] Supabase project created
- [ ] Database schema executed (from `supabase-schema.sql`)
- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Google OAuth configured in Supabase
- [ ] Code pushed to GitHub

### ✅ Vercel Deployment

1. **Import Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```
   - **Note:** You'll get your Vercel URL after first deployment, so you may need to:
     1. Deploy once without `NEXT_PUBLIC_SITE_URL`
     2. Get your Vercel URL
     3. Add `NEXT_PUBLIC_SITE_URL` environment variable
     4. Redeploy

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

4. **Update OAuth Redirect URIs**
   
   **In Google Cloud Console:**
   - Go to Credentials → Your OAuth Client
   - Add Authorized Redirect URI:
     ```
     https://your-app.vercel.app/auth/callback
     ```
   
   **In Supabase (if necessary):**
   - Go to Authentication → URL Configuration
   - Add Site URL: `https://your-app.vercel.app`
   - Add Redirect URLs: `https://your-app.vercel.app/**`

5. **Enable Realtime**
   - In Supabase Dashboard
   - Go to Database → Replication
   - Enable replication for `bookmarks` table
   - This is crucial for real-time updates!

6. **Test Your Deployment**
   - Visit your Vercel URL
   - Sign in with Google
   - Add a bookmark
   - Open another tab and verify real-time sync

## Common Deployment Issues

### Issue: "Invalid redirect URI"
**Fix:** Double-check that your Google Cloud Console redirect URI exactly matches:
```
https://xxxxx.supabase.co/auth/v1/callback
https://your-app.vercel.app/auth/callback
```

### Issue: "Bookmarks not showing"
**Fix:** 
1. Check Supabase SQL Editor for any errors in table creation
2. Verify RLS policies are enabled
3. Check browser console for errors

### Issue: "Real-time not working"
**Fix:**
1. Enable Replication in Supabase for `bookmarks` table
2. Verify your Supabase anon key has realtime permissions
3. Check browser console for WebSocket connection errors

### Issue: "Environment variables not found"
**Fix:**
1. Verify all environment variables are added in Vercel
2. They must start with `NEXT_PUBLIC_` to be accessible in client components
3. Redeploy after adding environment variables

## Performance Optimization

### Vercel Settings (Optional)
- Enable **Automatically optimize images** in Project Settings
- Use **Edge Functions** region closest to your users
- Enable **Web Analytics** to monitor performance

### Supabase Settings (Optional)
- In Project Settings → Database → Connection pooling
  - Enable if you expect high traffic
- Add indexes for frequently queried fields (already included in schema)

## Monitoring

### Vercel Analytics
- Go to your project → Analytics
- Monitor page views, performance, and errors

### Supabase Logs
- Go to Logs section in Supabase Dashboard
- Monitor auth events and database queries

## Updating Your App

1. Make changes to your code locally
2. Test locally with `npm run dev`
3. Push to GitHub
4. Vercel will automatically deploy the new version

## Rollback

If something goes wrong:
1. Go to Vercel Dashboard → Deployments
2. Find a previous working deployment
3. Click "Promote to Production"

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] `.env.local` is in `.gitignore`
- [ ] RLS policies are enabled on all tables
- [ ] Google OAuth is configured with correct domains
- [ ] HTTPS is enforced (Vercel does this automatically)

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable
5. Update Google OAuth redirect URIs
6. Redeploy

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check browser console for errors
4. Verify all environment variables are correct
5. Ensure database schema was executed successfully

---

**Congratulations! Your Smart Bookmark App is now live! 🎉**
