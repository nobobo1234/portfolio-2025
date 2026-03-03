# Portfolio

Personal portfolio built with SvelteKit 2 and Svelte 5, including:

- animated landing page with smooth scrolling and View Transition API effects
- project and writing detail routes
- protected admin area for editing homepage content
- Prisma + SQLite persistence

## Stack

- SvelteKit (`@sveltejs/adapter-node`)
- Svelte 5 runes
- TypeScript
- Prisma 7 + `@prisma/adapter-better-sqlite3`
- GSAP + ScrollTrigger + Lenis
- Tipex (TipTap wrapper) for rich-text editing in admin
- Docker (Node runtime image)

## Features

- Homepage content is DB-backed (`HomeContent`):
  - Start quote (rich text with italic marks)
  - Hero subtitle
  - About section
- Admin authentication:
  - Argon2 password hashing
  - Session tokens stored as SHA-256 hashes
  - Sliding 30-day sessions
  - Login rate limiting by IP
- Security hardening:
  - CSRF origin checks enabled
  - nonce CSP in SvelteKit config
  - `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` headers

## Prerequisites

- Node.js 20+
- npm

## Quick Start

1. Install dependencies:

```bash
npm ci
```

2. Create `.env`:

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="choose-a-temporary-strong-password"
```

3. Run migrations (and seed admin + default homepage content):

```bash
npm run migrate
```

4. Start development server:

```bash
npm run dev
```

5. Open:

- Site: `http://localhost:5173`
- Admin login: `http://localhost:5173/login`

After first successful seed, remove `ADMIN_PASSWORD` from `.env` unless you intentionally want to reseed credentials.

## Environment Variables

- `DATABASE_URL` (required): Prisma SQLite connection string (for example `file:./dev.db`)
- `ADMIN_PASSWORD` (required for seed only): password used by `prisma/seed.ts` to create/update the `admin` user
- `NODE_ENV` (optional): affects secure cookie behavior (`production` enables `secure` cookies)

## Available Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run check` - Svelte type checks
- `npm run lint` - Prettier check + ESLint
- `npm run format` - format code with Prettier
- `npm run generate` - regenerate Prisma client
- `npm run migrate` - run Prisma dev migrations
- `npm run db:smoke` - lightweight DB connectivity and write/read check

## Project Structure

```txt
src/
  routes/
    +page.svelte                # Homepage
    login/                      # Admin login
    admin/                      # Admin editor for homepage content
    logout/                     # Session invalidation
    project/[slug]/             # Project detail pages
    blog/[slug]/                # Writing detail pages
    view-transitions.css/       # Dynamic transition CSS endpoint
  lib/
    server/
      prisma.ts                 # Prisma client bootstrap
      home-content.ts           # Normalized home content loader
    content/                    # Home content schema/normalization/render helpers
prisma/
  schema.prisma
  migrations/
  seed.ts                       # Seeds admin + default home content
scripts/
  db-smoke-test.ts
```

## Admin Notes

- `prisma/seed.ts` upserts user `admin`.
- To rotate admin password later:
  1. set `ADMIN_PASSWORD` in `.env`
  2. run `npx prisma db seed`
  3. remove `ADMIN_PASSWORD` again

## Docker

Run with Docker Compose:

```bash
docker compose up --build -d
```

The app listens on port `4800` in the container and is published to `127.0.0.1:4800`.

## CI

GitHub Actions runs:

- `npm ci`
- `npm run db:smoke` (with `DATABASE_URL=file:./ci.db`)
- `npm run build`
- `docker build`

## Production Build

This project uses `@sveltejs/adapter-node`; build output is in `build/` and starts with:

```bash
node build/index.js
```
