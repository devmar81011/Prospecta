# Real Estate Lead App - Setup Guide

This guide will help you set up and deploy the Real Estate Lead App MVP.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works for MVP)
- Git installed
- A Vercel account (optional, for deployment)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-name>

# Install dependencies
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: real-estate-lead-app
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"
6. Wait for the project to be created (~2 minutes)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy the following:
   - Project URL
   - anon/public key

### 2.3 Run Database Migrations

1. In your Supabase project, go to SQL Editor
2. Run each migration file in order (found in `supabase/migrations/`):
   - `001_create_profiles.sql`
   - `002_create_properties.sql`
   - `003_create_property_images.sql`
   - `004_create_property_attributes.sql`
   - `005_create_leads.sql`
   - `006_create_viewings.sql`
   - `007_create_storage.sql`

Copy and paste each file's contents into the SQL Editor and click "Run".

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Step 5: Test the Application

### Test Authentication
1. Go to `/auth/signup`
2. Create a test account
3. Verify you're redirected to the dashboard

### Test Profile Setup
1. Go to `/dashboard/profile`
2. Fill in your agent information
3. Save the profile

### Test Property Creation
1. Click "Create Property Post"
2. Fill in property details
3. Add dynamic attributes based on property type
4. Save the property

### Test Public Property Page
1. Set a property status to "Active"
2. Visit the public URL: `/p/[property-slug]`
3. Test the "I'm Interested" form
4. Verify lead is created

### Test Lead Management
1. Go to `/dashboard/leads`
2. View the lead you created
3. Update the lead status
4. Schedule a site viewing

## Step 6: Deploy to Vercel (Optional)

### 6.1 Deploy from GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### 6.2 Configure Domain (Optional)

1. In Vercel project settings, go to Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Common Issues and Solutions

### Issue: "Not authenticated" error

**Solution:** Check that:
- Supabase credentials in `.env.local` are correct
- You've run all database migrations
- You're logged in

### Issue: Leads not being created

**Solution:** 
- Verify the property status is "ACTIVE"
- Check Supabase RLS policies are correctly set up
- Look at browser console for errors

### Issue: Can't see properties on dashboard

**Solution:**
- Ensure you're logged in as the user who created them
- Check that RLS policies were created correctly
- Verify the property has an agent_id matching your user ID

## Security Checklist

Before deploying to production:

- [ ] All database migrations are run
- [ ] RLS (Row Level Security) is enabled on all tables
- [ ] Storage policies are configured correctly
- [ ] Environment variables are set in production
- [ ] NEVER commit `.env.local` to Git
- [ ] Test that users can only see their own data
- [ ] Test that public can only see active properties
- [ ] Test that public cannot create arbitrary leads

## Next Steps

Now that your MVP is running:

1. **Test with Real Users**: Invite 2-3 real estate agents to test
2. **Gather Feedback**: What features do they need most?
3. **Add Image Upload**: Implement property image uploads (TODO #8)
4. **Create Post Templates**: Build social media post generators (TODO #16)
5. **Add PWA Features**: Make it installable on mobile (TODO #17)

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review the [MVP Development Plan](./docs/mvp-plan.md)
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)

## Development Tips

### Running Supabase Locally (Advanced)

If you want to run Supabase locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase
supabase start

# Link to your project
supabase link --project-ref your-project-ref
```

### Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture Overview

```
Next.js App
    │
    ├── Authentication (Supabase Auth)
    ├── Database (Supabase PostgreSQL + RLS)
    ├── Storage (Supabase Storage)
    └── Hosting (Vercel)

Key Features:
- Server-side rendering for public pages
- Client-side state management for forms
- Automatic lead capture without user accounts
- Real-time dashboard statistics
- Mobile-first responsive design
```

## Database Schema

See `supabase/migrations/README.md` for detailed schema documentation.

Key tables:
- `profiles` - Agent information
- `properties` - Property listings
- `property_attributes` - Dynamic property fields
- `property_images` - Property photos
- `leads` - Interested buyers
- `viewings` - Scheduled site visits

All tables have RLS enabled with appropriate policies.
