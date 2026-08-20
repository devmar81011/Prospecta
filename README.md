# Real Estate Lead App - MVP

A simple, mobile-first PWA for real estate agents who primarily get buyers through Facebook.

## Core Workflow

1. Add Property
2. Generate Professional Property Post
3. Share on Facebook
4. Buyer Opens Property Link
5. ❤️ I'm Interested
6. Lead Automatically Created
7. Agent Contacts Buyer
8. 📅 Schedule Site Viewing
9. Update Lead Status
10. Reserved / Sold

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Approach

Building one feature at a time following the MVP plan:

1. ✅ Project setup
2. ⏳ Supabase configuration
3. ⏳ Authentication
4. ⏳ Agent profile
5. ⏳ Property management
6. ... and more

## Product Principle

> Make it easy enough that an agent can create a professional property listing and manage an interested buyer using mostly their phone.
