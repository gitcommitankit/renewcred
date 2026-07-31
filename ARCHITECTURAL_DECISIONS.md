# Architectural Decisions & Assumptions

Notes on key design choices, technical trade-offs, and assumptions made during the development of RenewCred CMS.

---

## 1. System Structure & Monorepo

We opted for a **pnpm monorepo** containing two main packages: `client` (Next.js 16 / React 19) and `server` (Express 5 / TypeScript).

- **Why a monorepo?** It allows us to manage both frontend and backend in a single repository without splitting commit histories. Root scripts allow running both services in parallel during local development (`pnpm dev`) and simplified Docker Compose orchestration.
- **Dependencies & Workspace:** Using `pnpm` workspaces keeps shared configurations, TypeScript types, and root-level dev tooling consistent across both services.
- **Known gap:** TypeScript types are currently duplicated — `types/index.ts` on the client mirrors Zod-inferred types on the server. The long-term improvement is a third `packages/types/` workspace shared by both packages.

---

## 2. Backend Architecture: 3-Layer Pattern

The Express backend follows a clear **Routes → Controllers → Services** structure.

- **Controllers** act strictly as HTTP adapters (parsing request params/query/body, setting status codes, formatting JSON responses). No business logic leaks into controllers.
- **Services** encapsulate all business logic, database queries, and transaction management.
- **Validation:** Request body and parameter schema validation is handled at the route level using **Zod** middleware. The Zod middleware mutates `req.body` with the parsed, coerced value — controllers can safely assume incoming data is type-safe downstream.
- **Environment validation:** The server uses a Zod schema in `config/env.ts` to validate all environment variables at startup. Any missing or malformed variable causes `process.exit(1)` with a descriptive error, preventing the server from booting in an invalid state.

---

## 3. Auth Strategy & Token Security

We implemented a **JWT dual-token auth model** (15-minute Access Token, 7-day Refresh Token).

- **Token Storage Strategy:**
  - **Access Token:** Stored in Redux in-memory for API header injection. Also mirrored as a client-accessible cookie (set via `document.cookie` in `useAuth.ts`) so the Next.js Edge proxy can detect the active session without hitting the backend.
  - **Refresh Token:** Stored exclusively in an `httpOnly`, `SameSite` cookie. This prevents client-side JavaScript access, mitigating XSS risks for long-lived credentials.
- **Silent Refresh Flow:**
  - Front-end RTK Query base queries intercept `401 Unauthorized` responses and automatically attempt a refresh call (`POST /auth/refresh`). If successful, the original request retries transparently. If refresh also fails, `clearCredentials()` is explicitly dispatched and the client-side cookie is cleared — ensuring clean logout rather than silently falling through.
- **Timing Attack Mitigation:** Login endpoint runs password comparison (`bcrypt.compare`) against a pre-computed `DUMMY_HASH` even when the admin email isn't found in the database. This keeps login response times uniform regardless of email existence, preventing email enumeration attacks.
- **SameSite cross-origin config:** In production, cookies use `SameSite: 'none', Secure: true`. This is required because the Next.js client and Express server are on different origins (Vercel vs Render/Vercel). The origin guard middleware in `app.ts` compensates by blocking unexpected cross-site mutation requests.

---

## 4. Rich Content Storage (Tiptap / ProseMirror AST)

Handling structured documentation with nested lists, tables, and mathematical equations (KaTeX) required a robust content storage approach.

- **Why Tiptap JSON AST over HTML or Markdown?**
  - **Raw HTML** is risky to store and render directly due to XSS vectors, and hard to manipulate programmatically.
  - **Markdown** lacks native support for complex formatted elements like tables, nested callouts, or LaTeX math without custom extensions.
  - **ProseMirror/Tiptap JSON** stores content as a clean tree AST in a Postgres `jsonb` column. It is schema-agnostic, safe, and allows future schema migrations without database schema changes.
- **Editor vs Renderer Split:** The heavy `TiptapEditor` component is only ever loaded in the admin bundle. Public pages use a lightweight, recursive `TiptapRenderer` component that does not import the Tiptap editor engine — keeping public page bundles small and fast.
- **KaTeX rendering:** Math nodes in the AST are rendered via `katex.renderToString()` using `dangerouslySetInnerHTML`. This is safe because KaTeX only accepts valid LaTeX syntax, rejects script tags, and the content originates from authenticated admin input, not public user input.

---

## 5. Data Modeling & Versioning Logic

- **Version Lifecycle:** Standards have a 1:N relationship with Versions (`DRAFT` → `PUBLIC_CONSULTATION` → `CERTIFIED`).
- **`isLatest` Atomic Flag:**
  - To avoid expensive `ORDER BY certifiedAt DESC LIMIT 1` database queries on every public request, we maintain an explicit `isLatest` boolean flag on the `Version` table.
  - Updates that flip `isLatest` are executed inside a **Prisma `$transaction`** block. This guarantees that unsetting previous latest flags and assigning the new one happens atomically, eliminating race conditions that could leave zero or two "latest" versions.
- **Hierarchical Section Tree:**
  - Sections use a self-referencing `parentId` column on the `Section` table (adjacency list pattern). This allows arbitrarily deep section hierarchies (e.g., `1.0` → `1.1` → `1.1.1`).
  - `onDelete: Cascade` is configured at every parent → child relationship level, ensuring deleting a version removes all its sections, and deleting a section removes all its nested children.
  - Section reordering (drag-and-drop) issues a batch update inside a transaction to atomically update `parentId`, `sortOrder`, and display number strings.
- **Visibility Rules:** Only `PUBLIC_CONSULTATION` and `CERTIFIED` versions belonging to `isPublished = true` standards are exposed by the public API. `DRAFT` versions are strictly admin-only.
- **Scoped Unique Slugs:** Version slugs are unique per standard (`@@unique([standardId, slug])`), and section slugs are unique per version (`@@unique([versionId, slug])`).

---

## 6. Rendering & Cache Optimization

- **Public Site ISR (Incremental Static Regeneration):**
  - Public pages use `generateStaticParams` to pre-build all published standards and their public versions to static HTML at deploy time. This means the first request for any public standard page has zero server latency.
  - ISR with `revalidate: 3600` (1 hour) acts as a safety net, serving stale pages and triggering background re-fetches if on-demand revalidation fails.
  - Every successful admin write (create/update/delete on standards, versions, or sections) immediately calls `/api/revalidate`, busting the cache for affected paths. This is fire-and-forget — a revalidation failure is non-fatal and the ISR period covers it.
- **Auto-Save vs. Manual Save Distinction:**
  - The Tiptap editor debounces keystrokes and fires a dedicated `autoSaveSection` mutation after 1.5s idle. This mutation **does not** trigger ISR revalidation — hammering the cache on every debounced keystroke would be wasteful and the content isn't ready for public consumption mid-edit.
  - A separate `updateSection` mutation (triggered by the manual Save button) does invalidate the ISR cache for the relevant public paths.
- **Granular RTK Query Cache Invalidation:**
  - `autoSaveSection` / `updateSection` only invalidate `Section/id` in the RTK Query cache, leaving the parent `Version` cache intact. Editing paragraph content doesn't change the sidebar tree structure, so a full version refetch on every keystroke would cause unnecessary sidebar flickering.
  - Creating, deleting, or reordering sections invalidates the full `Version` cache to refresh the sidebar tree.

---

## 7. Two-Track Frontend Architecture

The Next.js frontend is split into two isolated rendering tracks via route groups:

- **Admin track `(admin)`:** Uses Client Components and RTK Query (CSR). The Redux `<Provider>` lives in the `(admin)` group layout only — public pages pay zero Redux bundle cost. The admin track requires interactivity for the rich text editor, drag-and-drop section reordering, and real-time form feedback.
- **Public track `(public)`:** Uses React Server Components with ISR. Fetches data server-side via `lib/publicApi.ts` fetch wrappers. The Tiptap editor is never loaded. Optimized for SEO and performance.

---

## 8. Edge Proxy & Route Protection

Admin routes are protected by two layered guards:

1. **Edge Proxy (`proxy.ts`):** Runs at the Next.js Edge before any page HTML is generated. Checks for the presence of the `accessToken` cookie and redirects unauthenticated requests to `/admin/login?from=<path>` before serving any content. This is a fast, pre-render guard that requires no backend call.

2. **AdminShell (Client-Side):** A client component that wraps all dashboard pages. On mount, it calls `GET /auth/me` to validate the actual JWT via the backend. If the session is invalid, it dispatches `clearCredentials()` and redirects to login. This is the definitive auth check — the Edge proxy is a performance optimization, not the security boundary.

> **Current Production Note:** The Edge proxy is temporarily muted via an early return in `proxy.ts` because the client and server are hosted on different Vercel origins. The `accessToken` cookie set by the server origin is not sent to the client origin, so the proxy always sees an empty cookie. `AdminShell` handles session validation in this deployment configuration.

---

## 9. Assumptions & Trade-offs

1. **Single Admin Role:** Auth and access control assume a single admin user persona. Enterprise RBAC (roles/permissions) was omitted to keep focus on CMS workflow quality. All authenticated admins have full read/write access.

2. **Public Access Visibility:** Only versions with status `PUBLIC_CONSULTATION` or `CERTIFIED` belonging to published standards (`isPublished = true`) are visible to public readers. `DRAFT` versions are strictly isolated to the admin panel.

3. **Scoped Slugs:** Slugs are uniquely constrained within their parent entity scope. Version slugs (e.g., `v1-0`) are unique per standard (`@@unique([standardId, slug])`), and section slugs are unique per version (`@@unique([versionId, slug])`).

4. **Environment-Based API URLs:** Next.js bakes `NEXT_PUBLIC_` variables into client JS bundles during build time. For Docker deployments, `NEXT_PUBLIC_API_URL` is passed as a build `ARG` rather than a runtime container `ENV`.

5. **Fire-and-Forget Revalidation:** ISR cache revalidation after admin saves is intentionally fire-and-forget. A revalidation failure never blocks a content save operation. The 1-hour ISR safety net ensures stale public content is never served for more than an hour even in failure cases.

6. **Section Tree Scale:** The flat-fetch + client-side tree reconstruction approach is appropriate for the expected scale (20–50 sections per version). At 1,000+ nodes per level, lazy loading, virtualization, and server-side recursive CTEs would be required.
