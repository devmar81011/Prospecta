# Supabase Setup Guide for Prospecta

Follow these steps to set up your Supabase backend for the Prospecta Real Estate app.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `Prospecta` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to Philippines (Singapore recommended)
   - **Pricing Plan**: Free tier is fine to start
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

## Step 2: Run the Database Migration

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-setup.sql` from this repository
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this is correct!

## Step 3: Set Up Storage Bucket

1. In Supabase dashboard, click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Fill in:
   - **Name**: `property-images`
   - **Public bucket**: Toggle ON (make it public)
4. Click **"Create bucket"**

## Step 4: Enable Facebook Authentication

1. In Supabase dashboard, click **"Authentication"** in the left sidebar
2. Click **"Providers"** tab
3. Find **"Facebook"** and click to expand
4. Toggle **"Enable Sign in with Facebook"** to ON
5. You'll need to create a Facebook App:

### Create Facebook App:
1. Go to [https://developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Click **"Create App"**
3. Choose **"Consumer"** as the app type
4. Fill in:
   - **App Name**: `Prospecta` (or your preferred name)
   - **App Contact Email**: Your email
5. Click **"Create App"**
6. In the Facebook App dashboard:
   - Go to **Settings** → **Basic**
   - Copy the **App ID**
   - Click **"Show"** next to **App Secret** and copy it
7. Add **"Facebook Login"** product to your app
8. In **Facebook Login** → **Settings**, add these URLs:
   - **Valid OAuth Redirect URIs**: 
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
     (Get this URL from Supabase → Authentication → Providers → Facebook)
   - Save changes
9. Go back to Supabase and paste:
   - **Facebook Client ID**: Your App ID
   - **Facebook Client Secret**: Your App Secret
10. Click **"Save"**

## Step 5: Get Your Supabase Credentials

1. In Supabase dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"**
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (a long string)
4. **Copy both of these** - you'll need them for the next step

## Step 6: Update Environment Variables

### Option A: Update Locally (for testing)
1. Open `.env.local` in your project
2. Replace with your real credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Save the file

### Option B: Update in Vercel (for production)
1. Go to [https://vercel.com](https://vercel.com)
2. Open your **Prospecta** project
3. Go to **Settings** → **Environment Variables**
4. Edit or add:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://YOUR-PROJECT-REF.supabase.co`
   - Click **"Save"**
5. Add another:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your anon key
   - Click **"Save"**
6. Go to **Deployments** tab
7. Click the **"..."** menu on the latest deployment
8. Click **"Redeploy"**

## Step 7: Test Your Setup

1. Go to your live site (or run locally with `npm run dev`)
2. Click **"Login with Facebook"**
3. Authorize the app
4. You should be redirected to the dashboard!
5. Try creating a property with photos
6. Check your Supabase dashboard:
   - **Authentication** → **Users** - you should see your account
   - **Table Editor** → **properties** - you should see your property
   - **Storage** → **property-images** - you should see uploaded images

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` or Vercel environment variables
- Make sure there are no extra spaces or quotes
- Redeploy in Vercel after updating variables

### Facebook login not working
- Make sure Facebook app is in **Development Mode** (or submit for review if going live)
- Add test users in Facebook App → Roles → Test Users
- Verify the OAuth Redirect URI matches exactly

### Images not uploading
- Check that the `property-images` bucket exists in Storage
- Make sure the bucket is set to **Public**
- Verify storage policies were created (check the SQL editor)

### RLS (Row Level Security) errors
- Make sure you ran the complete `supabase-setup.sql`
- Check that all policies are enabled in **Authentication** → **Policies**

## Need Help?

If you encounter any issues, check:
1. Supabase project logs: **Logs** in the left sidebar
2. Browser console for error messages
3. Vercel deployment logs

---

## What's Next?

Once Supabase is working:
- ✅ Demo mode will be replaced with real database
- ✅ Facebook login will work properly
- ✅ Lead temperatures will sync across devices
- ✅ Images will be properly stored
- 🔜 We can add the admin panel and subscription system!
