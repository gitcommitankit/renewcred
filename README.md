# RenewCred CMS

A production-ready Content Management System for authoring and publishing climate certification standards. Authenticated administrators manage all content through a rich admin panel, while the public-facing website serves it with ISR-cached server-rendered pages.

---

## Features

- **Admin Authentication** — JWT access tokens + HttpOnly cookie refresh tokens with silent refresh
- **Standards Management** — CRUD for climate standards with publish/draft toggle and sort ordering
- **Version Lifecycle** — `DRAFT → PUBLIC_CONSULTATION → CERTIFIED` workflow with `isLatest` flag
- **Rich Content Editor** — Tiptap editor with nested lists, tables, code blocks, and LaTeX math (KaTeX)
- **Hierarchical Sections** — Auto-numbered section tree with drag-and-drop reorder and auto-save
- **Public Website** — ISR-cached server-rendered pages (60s revalidation)
- **Docker Ready** — Multi-stage production Dockerfiles with non-root users and full compose orchestration

---

## Architecture

Pnpm monorepo with two independently deployable apps:

```
renewcred/
├── client/   # Next.js 16 (App Router)
└── server/   # Express.js REST API
```

### Backend (`/server`)

| Layer | Detail |
|---|---|
| Framework | Express.js + TypeScript |
| ORM | Prisma + PostgreSQL |
| Validation | Zod (schema-validated at middleware layer) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Logging | Pino |
| Security | helmet, CORS, express-rate-limit |

Architecture: `Routes → Controllers → Services`. Controllers are thin HTTP adapters; all business logic lives in Service classes.

### Frontend (`/client`)

| Layer | Detail |
|---|---|
| Framework | Next.js 16, React 19 |
| State/Data | Redux Toolkit + RTK Query |
| Styling | Tailwind CSS v4 (CSS-variable theme) |
| Editor | Tiptap (content stored as structured JSON) |
| DnD | @dnd-kit |

Route groups provide layout isolation:
- `(admin)` — Client Components, RTK Query, protected by Next.js Middleware
- `(public)` — Server Components, ISR-cached

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, RTK Query, Tailwind CSS v4 |
| Editor | Tiptap, KaTeX, @dnd-kit |
| Backend | Express.js 5, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | JWT, bcryptjs |
| Logging | Pino |
| Infrastructure | Docker, Docker Compose, pnpm workspaces |

---

## Local Development

### Prerequisites

- Node.js v22+
- pnpm v10+ (`corepack enable`)
- Docker & Docker Compose (recommended) or a local PostgreSQL instance

### Option 1: Docker (Recommended)

```bash
# 1. Copy and fill the env file
cp .env.example .env
# Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to strong random strings

# 2. Build and start all services (Postgres + Server + Client)
docker compose up --build -d

# 3. Run migrations and seed initial data
docker compose exec server npx prisma migrate deploy
docker compose exec server node -e "require('./dist/index.js')" # ensure server is up
docker compose exec server npx prisma db seed
```

| Service | URL |
|---|---|
| Public site | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin/login |
| API | http://localhost:4000/api/v1 |
| API health | http://localhost:4000/health |

### Option 2: Manual Setup

```bash
# 1. Install all workspace dependencies from root
cp .env.example .env
pnpm install

# 2. Run migrations and seed data
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed sample data

# 3. Start the full application
pnpm dev           # Starts both backend (4000) and frontend (3000)
```

### Root-level Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Start client + server in parallel |
| `pnpm build` | Build server then client |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:migrate:prod` | Deploy migrations (production) |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:reset` | Reset and re-migrate |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# Server
SERVER_PORT=4000
NODE_ENV=development

# JWT (use long random strings in production)
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:3000

# Client (Next.js public)
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Admin seed credentials
SEED_ADMIN_EMAIL=admin@renewcred.com
SEED_ADMIN_PASSWORD=Admin@123
SEED_ADMIN_NAME=Admin User
```

### For Neon DB (serverless Postgres)

Neon requires two connection strings — a pooled URL for the running app and a direct URL for migrations:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.pooler.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
```

Update `server/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Deployment

### Client → Vercel

Set the following environment variable in your Vercel project settings:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com/api/v1` |

### Server → Render / Railway / Fly.io

Set all server-side environment variables in your hosting platform's dashboard. Ensure `CORS_ORIGIN` includes your Vercel deployment URL:

```env
CORS_ORIGIN=http://localhost:3000,https://your-app.vercel.app
NODE_ENV=production
DATABASE_URL=<neon or other postgres url>
JWT_ACCESS_SECRET=<strong secret>
JWT_REFRESH_SECRET=<strong secret>
```

### Seeding a Production / Neon Database

Once your server backend has deployed and the environment variables (especially `DATABASE_URL` and `DIRECT_URL`) are configured:

```bash
# From your local machine, pointing at the production DATABASE URL:
cd server
DATABASE_URL="<your-neon-direct-url>" pnpm db:seed
```

Or if your hosting platform supports one-off commands (e.g. Render Shell, Railway CLI, Fly SSH):

```bash
# On the deployed server container
npx prisma db seed
```

---

## Admin Credentials (Seed)

| Field | Value |
|---|---|
| Login URL | `/admin/login` |
| Email | `admin@renewcred.com` |
| Password | `Admin@123` |

The seed script creates sample standards (Electric Vehicles, Biochar, Renewable Energy) with versions and rich content sections.

---

## Key Decisions

| Decision | Rationale |
|---|---|
| HttpOnly cookie for refresh token | Prevents XSS from reading long-lived tokens |
| JSON content field for sections | Schema-agnostic — rich content evolves without DB migrations |
| `isLatest` flag + `$transaction` | Ensures exactly one latest version per standard atomically |
| ISR on public pages | Near-real-time updates without sacrificing static generation performance |
| `@dnd-kit` for drag-and-drop | Accessible, pointer-based DnD with keyboard fallback |
| Tiptap JSON storage | Renderer-agnostic — same content can be rendered in web, email, or PDF |
