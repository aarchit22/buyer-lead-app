# Buyer Lead Intake App

A Next.js application for managing buyer leads, built to fulfil## Authentication & Ownership

**Multi-User Demo System:**
- Demo users: `sales1/sales123`, `sales2/sales456`, `manager/manager123`
- Each user can only edit/delete leads they created (ownership enforcement)

**Admin Privileges:**
- The `admin` user has special privileges and can edit/delete ALL leads regardless of ownership
# Buyer Lead Intake App

A Next.js application for managing buyer leads, built to fulfill the internship task requirements (see `task.md`). The app includes features for CRUD operations, server-side search/filtering, CSV import/export, and change history tracking.

---

## Live Demo

* **Live App**: [https://buyer-lead-29z0r7rlv-aarchit22s-projects.vercel.app/login]
* **Username**: `sales1`  
* **Password**: `sales123`  

---

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Database: PostgreSQL with Prisma ORM
- Validation: Zod (shared client/server schemas)
- Auth: Lightweight session-based demo auth (cookie JWT)
- Styling: Custom CSS using CSS variables
- Tests: Jest for unit tests

---

## Getting Started (local)

Prerequisites

- Node.js v18+
- A running PostgreSQL instance (local or hosted)

1) Create a `.env.local` in the project root and provide the required variables. Example (DO NOT commit `.env.local`):

```env
# Postgres
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Demo admin password (set this locally and in production secrets)
DEMO_PASSWORD="your-demo-admin-password"

# JWT signing secret for sessions
NEXTAUTH_SECRET="replace-with-a-random-secret"

# App URL
NEXTAUTH_URL="http://localhost:3000"
```

2) Install dependencies and prepare the database

```powershell
# from repository root
npm install
npx prisma generate
# apply migrations (or `npx prisma migrate dev` during development)
npx prisma migrate deploy
```

3) Run the app

```powershell
npm run dev
```

Open http://localhost:3000

---

## Demo Users / Admin

- The app includes a simple demo login flow for local testing. Passwords must be configured via environment variables (see `DEMO_PASSWORD`).
- The `admin` username (configured via demo auth) is treated as an administrator and can edit/delete all records. Regular users can only edit/delete records where `ownerId` matches their username.
- Do not commit real credentials to source control. Use your platform's secret manager when deploying.

---

## Features Implemented

- Full CRUD for buyer leads with server-side validation (Zod) and history tracking
- Server-side pagination (10 per page) and URL-synced filters: `city`, `propertyType`, `status`, `timeline`
- Debounced search (fullName/phone/email)
- CSV import (200-row limit) with per-row validation and export of filtered lists
- Ownership enforcement on server actions; optional admin override
- Optimistic concurrency check using `updatedAt`
- Rate limiting on create/update (in-memory)
- Accessibility improvements and error boundary handling

---

## Tests

Run unit tests:

```powershell
npm run test
```

There is at least one unit test covering validation logic.

---

## Design Notes

- Validation: `src/lib/schemas.ts` contains the Zod schema used on both client and server. `csv-schema.ts` is a more permissive variant for imports.
- Ownership & Auth: Enforced server-side in `src/lib/actions.ts`. `canEditRecord()` centralizes ownership + admin checks.
- CSV import/export: Import validates rows and writes valid rows; export respects current filters.
- Concurrency: `updatedAt` timestamp sent as hidden input; server rejects stale edits.

---

## What's Done vs Skipped

Done:
- All required features in `task.md` and quality-bar items.

Skipped / Deferred:
- Tag typeahead UI and optimistic edit rollback (low-risk omissions to prioritize correctness and stability).


