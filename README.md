# RenewCred CMS

A production-ready Content Management System enabling authenticated administrators to manage all content displayed on the public website dynamically. It features a full administrative panel with rich content editing, drag-and-drop section hierarchy management, and a multi-version workflow for standards.

---

## Features

- **Admin Authentication** — Secure login/logout with JWT access tokens and HttpOnly cookie refresh tokens
- **Standards Management** — Full CRUD for climate standards with publish/draft toggle and sort ordering
- **Version Lifecycle** — `DRAFT → PUBLIC_CONSULTATION → CERTIFIED` workflow with `isLatest` flag per standard
- **Rich Content Editor** — Tiptap-powered editor supporting long-form text, nested lists, tables, and LaTeX mathematical equations (KaTeX)
- **Section Tree with Drag & Drop** — Hierarchical sections with auto-numbering, real-time drag-and-drop reorder, and auto-save
- **Public Website** — ISR-cached server-rendered pages consuming content from the API
- **Docker Ready** — Multi-stage production Dockerfiles with non-root users and a full docker-compose orchestration

---

## Architecture Overview

This project is a **monorepo** with two independently deployable applications:

```
renewcred/
├── client/     # Next.js 16 App Router frontend
└── server/     # Express.js REST API backend
```

### Backend (`/server`)
- **Express.js + TypeScript** — Layered `Routes → Controllers → Services` architecture. Controllers are thin HTTP adapters; all business logic lives in Services.
- **Prisma ORM + PostgreSQL** — Type-safe DB queries. Schema uses `uuid()` PKs, snake_case column names, cascading deletes, and composite unique constraints.
- **Zod Validation** — All mutation endpoints are schema-validated at the middleware layer before reaching controllers.
- **Security** — `helmet`, CORS, `express-rate-limit` on auth endpoints, bcryptjs for password hashing, structured Pino logging.
- **Error Handling** — Global `errorHandler` translates Prisma error codes (P2002, P2025) and `ApiError` instances into a uniform JSON envelope.

### Frontend (`/client`)
- **Next.js App Router** — `(admin)` and `(public)` route groups provide layout isolation. Public pages use Server Components with 60s ISR for performance; admin pages use Client Components with RTK Query.
- **Redux Toolkit (RTK Query)** — All admin API interactions use RTK Query endpoints with tag-based cache invalidation. `authSlice` manages authentication state. `uiSlice` manages sidebar layout state.
- **Tiptap Editor** — Headless ProseMirror-based editor. Content is stored as structured JSON (not raw HTML), making it renderer-agnostic and future-proof.
- **Custom TiptapRenderer** — A pure React renderer (`TiptapRenderer.tsx`) that converts the stored JSON to JSX, supporting all node/mark types including KaTeX math blocks.
- **Authentication** — Next.js Edge Middleware protects `/admin/dashboard/*` routes. The Axios client (`lib/api.ts`) handles concurrent 401 responses with a request queue and silent token refresh, while RTK Query handles all standard data fetching.

---

## Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **HttpOnly cookie for refresh token** | Prevents XSS from reading long-lived tokens. Access token stays in-memory (localStorage fallback) for Authorization headers. |
| **JSON content field for sections** | Schema-agnostic. Rich content evolves without DB migrations. Supports any future block types. |
| **`isLatest` flag + `$transaction`** | Allows a standard to have exactly one "latest" version atomically, without race conditions. |
| **Section ownership validation in reorder** | Prevents privilege escalation where a user reorders sections from another version. |
| **Shallow REST nesting** | `/versions/:id/sections` is preferred over deeply nested URLs for simplicity and cacheability. |
| **ISR on public pages** | `revalidate: 60` gives near-real-time updates without sacrificing Next.js static generation performance. |
| **Drag & Drop with `@dnd-kit`** | Accessible, pointer-based DnD with keyboard fallback, preferred over `react-beautiful-dnd` (deprecated). |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Redux Toolkit (RTK Query), Tailwind CSS |
| Admin Editor | Tiptap, KaTeX, `@dnd-kit` |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Logging | Pino |
| Infrastructure | Docker, Docker Compose |

---

## Setup Instructions

### Prerequisites
- Node.js v22+
- `pnpm` (`corepack enable pnpm`)
- Docker & Docker Compose (recommended)

### Option 1: Docker (Recommended)

```bash
# 1. Clone and copy env file
cp .env.example .env

# 2. Start everything (Postgres + Server + Client)
docker-compose up --build -d

# 3. Seed initial data
docker exec -it renewcred-server pnpm prisma db seed
```

- Client → http://localhost:3000
- Server API → http://localhost:4000/api/v1

### Option 2: Manual Local Setup

```bash
# 1. Copy env file
cp .env.example .env
# Edit DATABASE_URL to point to your local Postgres instance

# 2. Start the backend
cd server
pnpm install
pnpm prisma db push       # Sync schema
pnpm prisma db seed       # Seed data
pnpm dev                  # http://localhost:4000

# 3. Start the frontend (new terminal)
cd client
pnpm install
pnpm dev                  # http://localhost:3000
```

---

## Evaluation Credentials

| Field | Value |
|---|---|
| Admin Login URL | `http://localhost:3000/admin/login` |
| Email | `admin@renewcred.com` |
| Password | `Admin@123` |

The seed script also creates sample standards (Electric Vehicles, Biochar, Renewable Energy) with versions and rich content sections ready to explore.

---

## Assumptions & Scope

- **Generic pages** (`/buyers`, `/suppliers`, `/science`, etc.) are scaffolded with placeholder content. They demonstrate the `Page` data model and admin editing capability but are not the core deliverable — the Standards CMS is.
- **Image uploads** are out of scope. Images can be linked externally in the Tiptap editor. Asset storage (e.g., S3) would be the natural next step.
- **Single admin role** — RBAC is not implemented. The system assumes one admin user type. The seed creates a single admin; additional admins can be created directly in the database.
- **Newsletter** — The newsletter form on the public site is UI-only (no mailing list integration). It demonstrates the SiteSettings model.
