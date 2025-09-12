# Multi-tenant Notes SaaS (Vercel-ready)

## Overview
This project implements a multi-tenant Notes SaaS with:
- Multi-tenancy (shared schema with tenantId)
- JWT-based auth
- Roles (ADMIN, MEMBER)
- Subscription gating (FREE -> 3 notes, PRO -> unlimited)
- Endpoints for notes CRUD, tenant upgrade, and health.
- Minimal frontend to login and manage notes.
- Both backend and frontend deployable to Vercel.

## Predefined test accounts (all password: password)
- admin@acme.test (Admin, tenant: acme)
- user@acme.test (Member, tenant: acme)
- admin@globex.test (Admin, tenant: globex)
- user@globex.test (Member, tenant: globex)

## Multi-tenant approach
**Shared schema with `tenantId` column.** All tenant data is stored in the same tables; every request is filtered by `tenantId` with enforcement in the API middleware.

## Env variables (set in Vercel or local `.env`)
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — secret for signing JWT
- `BCRYPT_SALT_ROUNDS` (optional, default 10)
- `NEXT_PUBLIC_API_BASE` (optional) — used by frontend if needed

## Run locally
1. Install deps:
   ```
   npm install
   ```
2. Set env vars in a `.env` file (see `.env.example`)
3. Migrate and seed:
   ```
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```
4. Run:
   ```
   npm run dev
   ```
App runs at `http://localhost:3000`.

## Deploy to Vercel
- Create a Vercel project from this repo.
- Set environment variables in Vercel (DATABASE_URL, JWT_SECRET).
- Deploy. Vercel will host API routes and frontend.
- Run `node prisma/seed.js` against your production DB once (or seed via your DB provider).

## API endpoints (under `/api`)
- `POST /api/auth/login` — login; returns JWT + tenant info
- `GET /api/health` — { "status": "ok" }
- `GET /api/notes` — list notes (requires JWT)
- `POST /api/notes` — create note (requires JWT; enforces Free plan limit)
- `GET /api/notes/:id` — get note
- `PUT /api/notes/:id` — update
- `DELETE /api/notes/:id` — delete
- `POST /api/tenants/:slug/upgrade` — Admin only; upgrade tenant to PRO

