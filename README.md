# District 1921

A nationwide, community-driven digital business directory. Named for the Greenwood District of Tulsa, Oklahoma — Black Wall Street.

## Stack

- **Frontend:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS + CSS variables
- **Database:** Supabase (Postgres + PostGIS)
- **Auth:** Supabase Auth (magic link only)
- **Payments:** Stripe (subscriptions + one-time)
- **Email:** Resend + React Email
- **Hosting:** Vercel Pro
- **Maps:** Google Maps Platform

## Getting Started

```bash
cp .env.example .env.local
# Fill in all environment variables

npm install
npm run dev
```

## Database

```bash
# Apply migrations via Supabase CLI
npx supabase db push
# Or paste migration files into Supabase Studio SQL editor
```

## Build Phases

| Phase | Timeline | Focus |
|---|---|---|
| Phase 1 | Weeks 1–12 | MVP — directory, auth, payments, maps, community |
| Phase 2 | Weeks 13–20 | Ads, analytics, referrals |
| Phase 3 | Weeks 21–32 | Partner program, B2B |
| Phase 4 | Month 9+ | React Native app |

## Key URLs

- `/` — Homepage with search + spotlight
- `/search` — Map + list search
- `/near-me` — Geolocation search
- `/business/[slug]` — Business page
- `/[category]-[city]-[state]` — SEO city/category pages
- `/dashboard` — Owner dashboard
- `/admin` — Admin panel
- `/login` — Magic link auth
