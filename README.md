# PinkPulse AI — Backend

Node.js + Express + TypeScript + Prisma backend for the PinkPulse AI breast cancer
detection web app. See `PINKPULSE_BACKEND_ARCHITECTURE.md` (shared separately) for the
full architecture, database design, and API plan.

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values (see below)
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Visit `http://localhost:5000/api/v1/health` — you should see:
```json
{ "success": true, "message": "OK", "data": { "uptime": ..., "timestamp": ... } }
```

## Environment variables you need to fill in

- `DATABASE_URL` — a free Postgres connection string from **Neon** (neon.tech) or
  **Supabase** (supabase.com). Both have a free tier and a one-click "copy connection
  string" button.
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your
  Cloudinary dashboard (free tier, cloudinary.com).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — any long random strings. You can generate
  one with `openssl rand -base64 32`.
- `ML_SERVICE_URL` — the URL of M3's FastAPI inference service (e.g.
  `http://localhost:8000` while developing).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the server with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (production) |
| `npm run typecheck` | Type-check without emitting files |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Regenerate the Prisma client after editing `schema.prisma` |
| `npm run prisma:migrate` | Create/apply a database migration |
| `npm run prisma:studio` | Open Prisma's GUI to browse your database |

## Project status

Milestone 1 (project setup) complete: scaffold, config loading, Prisma schema, error
handling, logging, security middleware baseline, and a working `/health` endpoint.

Next: Milestone 2 — authentication (register/login/refresh/logout).
