# Love & Good Works Club Website

Next.js 16 website for `loveandgoodworks.org` with:

- Password-protected global gate
- Home, Calendar, Studies, Prayer, and Resources pages
- Admin surfaces for content/studies/prayer review
- PostgreSQL (Neon) storage
- Google Calendar sync
- Prayer and login rate limiting
- Study verse-link popup lookups

## Stack

- Next.js (App Router)
- React + TypeScript
- PostgreSQL via `postgres` client
- Vercel deployment compatible

## Environment

Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL`
- `SITE_PASSWORD` (common user password)
- `SITE_PASSWORD_ADMIN` (admin password; use a stronger separate value)
- `SITE_ACCESS_TOKEN_USER` (optional)
- `SITE_ACCESS_TOKEN_ADMIN` (optional)
- `NEXT_PUBLIC_SITE_URL` (for absolute subscription links)
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CALENDAR_API_KEY`
- `GOOGLE_CALENDAR_EMBED_URL` (optional)
- `GOOGLE_CALENDAR_TIMEZONE` (optional)

## Database Setup

```bash
npm run db:init
npm run db:seed
```

Or run both:

```bash
npm run db:setup
```

## Run

```bash
npm run dev
```

## Key Routes

- Public:
  - `/`
  - `/calendar`
  - `/studies`
  - `/studies/[slug]`
  - `/prayer`
  - `/resources`
- Gate/Auth:
  - `/gate`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Data APIs:
  - `POST /api/prayer`
  - `GET /api/verse?reference=John%203:16`
- Admin:
  - `/admin`
  - `/admin/studies`
  - `/admin/prayer`
  - `/admin/content`

## Notes

- The site uses password-based access with user/admin separation.
- Prayer requests are one-way and private; they do not publish publicly.
- The admin prayer page is optimized for weekly review workflow.
