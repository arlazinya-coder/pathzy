# PATHZY

PATHZY is an AI career and life-roadmap product for young people aged 16-30.

The product mission is to help every user answer one question: **What should I do next?**

## Stack

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase and PostgreSQL
- Supabase Auth
- OpenAI API
- Stripe
- PostHog
- Vercel

## Routes

- `/` Landing page
- `/login`
- `/register`
- `/onboarding`
- `/dashboard`
- `/roadmap`
- `/missions`
- `/mentor`
- `/cv-builder`
- `/progress`
- `/pricing`
- `/settings`
- `/opportunities`

## Environment

Copy `.env.example` to `.env.local` and add keys before enabling live integrations.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
POSTHOG_KEY=
```

## Supabase Authentication Setup

1. Create a Supabase project at https://supabase.com.
2. In Supabase, open **Project Settings > API**.
3. Copy **Project URL** into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy **anon public** key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Create `.env.local` in the project root and paste those values there.
6. In Supabase, open **SQL Editor** and run these migrations in order:
   - `supabase/migrations/20260703130000_create_user_profiles.sql`
   - `supabase/migrations/20260703143000_create_discovery_responses.sql`
7. In Supabase, open **Authentication > URL Configuration**.
8. Set **Site URL** to `http://localhost:3000` for local development.
9. Add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/update-password`
10. For Google Sign In, open **Authentication > Providers > Google**, enable it, and paste your Google OAuth client ID and secret.

After changing `.env.local`, restart the development server.

## Development

```bash
npm install
npm run dev
```
