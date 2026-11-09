# Tollab Nation

**News for the youngsters.** Tollab Nation is a student-focused news site covering Lebanon and the region in Arabic and English. It includes a live desk for breaking updates and a newsroom dashboard for publishing.

## What's inside

**Public site**
- **Front page.** Lead story, live desk, latest stories, most read, and section blocks. On phones, the section blocks become swipeable rails.
- **Article pages.** Bilingual headlines, verified author bylines, reading progress, sharing, and three ad placements.
- **Other pages.** Section pages, author profiles, search, and a live updates timeline.
- **App-style mobile experience:**
  - bottom tab bar (Home, Live, Saved, Search, Menu);
  - *Save for later*, stored on the device;
  - safe-area support for notched phones;
  - touch feedback.
- **Installable as an app (PWA).** "Add to Home Screen" opens it full-screen with its own icon and shortcuts.
- **Light and dark themes.** The black masthead stays the same in both. Motion uses CSS scroll-driven animations and respects reduced-motion settings.

**Newsroom (`/admin`)**
- Articles: a rich-text editor with a live preview, an author picker, featured stories and drafts.
- Authors: create, edit, verify and delete. Article counts are shown per author.
- Live updates (breaking items also feed the ticker) and ads (manual or AdSense, three placements).
- A dashboard for articles, views and ad clicks over time.

## Stack

- **App:** Next.js 16 (App Router, ISR) · React 19 · TypeScript · Tailwind CSS 4
- **Data:** Prisma 6 on PostgreSQL (Neon)
- **Auth:** Auth.js v5, using a single admin login from environment variables
- **Editor:** TipTap
- **Images:** Cloudinary for uploads. Remote images are resized through a free proxy (wsrv.nl) by a custom `next/image` loader.

## Getting started

```bash
npm install
cp .env.example .env        # then fill in the values
npx prisma migrate deploy   # apply migrations
npm run db:seed:demo        # optional: demo content
npm run dev                 # http://localhost:3000
```

Sign in at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### Environment variables

See [`.env.example`](.env.example).

- **Required:** `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- **Optional:**
  - `CLOUDINARY_*`: image uploads from the admin. Without it, paste image URLs instead.
  - `RESEND_API_KEY`: contact form email.
  - `CRON_SECRET`: protects the cron routes.

### Database migrations

- **Always use `prisma migrate deploy`.** Avoid `prisma migrate dev` against a shared or production database, because it can reset data when it detects drift.
- **Neon's pooled connection** can leave Prisma's migration lock held. If `migrate deploy` hangs on an advisory lock, either run it with `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1` or point it at the direct (non-pooled) URL.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:seed:demo` | Load demo articles and updates |
| `npm run db:studio` | Browse the database |

To run a production build next to a running `next dev` without clobbering it, use `NEXT_DIST_DIR=.next-verify npm run build`.

## Project layout

```
app/(public)/     public site: home, sections, articles, authors, live, search, saved
app/admin/        newsroom dashboard (auth-protected)
app/api/          upload, tracking, cron and contact endpoints
components/       UI, grouped by area (brand, layout, article, admin, ui)
server/           data access: queries (read) and actions (write)
prisma/           schema, migrations, seeds
public/assets/    logo artwork (source of truth for the Cap mark and wordmark)
```

## Brand

- **Logo:** the Cap mark, with a stacked TOLLAB / NATION wordmark in Big Shoulders Display Black.
- **Palette:** Ink `#0A0A0A` · Red `#ED1C24` · Paper `#F4F2EE`.
- **Source of truth:** the logo files in `public/assets/logos/`. The site draws its mark and wordmark from these files.

---

© Tollab Nation. Follow the channel on [WhatsApp](https://whatsapp.com/channel/0029VaDyADbHgZWhuhqMcf3S) and [Instagram](https://www.instagram.com/tollabn).
