# Architectural Decisions & Assumptions

Notes on key design choices, technical trade-offs, and assumptions made during the development of RenewCred CMS.

---

## 1. System Structure & Monorepo

We opted for a **pnpm monorepo** containing two main packages: `client` (Next.js 16 / React 19) and `server` (Express / TypeScript).

- **Why a monorepo?** It allows us to manage both frontend and backend in a single repository without splitting commit histories. Root scripts allow running both services in parallel during local development (`pnpm dev`) and simplified Docker Compose orchestration.
- **Dependencies & Workspace:** Using `pnpm` workspace keeping shared configurations, TypeScript types, and root-level dev tooling consistent across both services.

---

## 2. Backend Architecture: 3-Layer Pattern

The Express backend follows a clear **Routes → Controllers → Services** structure.

- **Controllers** act strictly as HTTP adapters (parsing request params/query/body, setting status codes, formatting JSON responses).
- **Services** encapsulate all business logic, database queries, and transaction management.
- **Validation:** Request body and parameter schema validation is handled at the route level using **Zod** middleware. Controller code can safely assume incoming data matches expected types.
- **Why not NestJS?** Given the scope of 3 core entities (Standards, Versions, Sections), NestJS's dependency injection and decorator overhead felt like unnecessary complexity. A clean 3-layer Express architecture provides clear separation of concerns without framework bloat.

---

## 3. Auth Strategy & Token Security

We implemented a **JWT dual-token auth model** (15-minute Access Token, 7-day Refresh Token).

- **Token Storage Strategy:**
  - **Access Token:** Stored in memory / `localStorage` for quick API access, and mirrored into a standard cookie so Next.js edge middleware can check auth status without hitting backend APIs.
  - **Refresh Token:** Stored exclusively in an `httpOnly`, `SameSite=Lax` cookie. This prevents client-side JavaScript access, mitigating XSS risks for long-lived credentials.
- **Silent Refresh Flow:**
  - Front-end RTK Query base queries intercept `401 Unauthorized` responses and automatically attempt a refresh call (`POST /auth/refresh`). If successful, the original request retries transparently; if it fails, user session state is cleared and redirected to `/admin/login`.
- **Timing Attack Mitigation:** Login endpoint runs password comparison (`bcrypt.compare`) against a pre-computed dummy hash even when the admin email isn't found in the database. This keeps login response times uniform regardless of email existence.

---

## 4. Rich Content Storage (Tiptap / ProseMirror AST)

Handling structured documentation with nested lists, tables, and mathematical equations (KaTeX) required a robust content storage approach.

- **Why Tiptap JSON AST over HTML or Markdown?**
  - **Raw HTML** is risky to store and render directly due to XSS vectors, and hard to manipulate programmatically.
  - **Markdown** lacks native support for complex formatted elements like tables, nested callouts, or LaTeX math without custom extensions.
  - **ProseMirror/Tiptap JSON** stores content as a clean tree AST in a Postgres `jsonb` column. It is schema-agnostic, safe, and allows future schema migrations without database schema changes.
- **Public Rendering:** Public pages render standard content using a lightweight, recursive renderer component (`TiptapRenderer.tsx`) and client-side KaTeX rendering. This avoids bundling the full Tiptap editor engine on public-facing reader pages.

---

## 5. Data Modeling & Versioning Logic

- **Version Lifecycle:** Standards have a 1:N relationship with Versions (`DRAFT` → `PUBLIC_CONSULTATION` → `CERTIFIED`).
- **`isLatest` Atomic Flag:**
  - To avoid expensive `ORDER BY certifiedAt DESC LIMIT 1` database queries on every public request, we maintain an explicit `isLatest` boolean flag on the `Version` table.
  - Updates that flip `isLatest` are executed inside a **Prisma `$transaction`** block. This guarantees that unsetting previous latest flags and assigning the new one happens atomically, eliminating race conditions.
- **Hierarchical Section Tree:**
  - Sections use a self-referencing `parentId` column on the `Section` table. This allows arbitrarily deep section hierarchies (e.g., `1.0` → `1.1` → `1.1.1`).
  - Section reordering (drag-and-drop) issues a batch update inside a transaction to update `parentId`, `sortOrder`, and display number strings atomically.

---

## 6. Rendering & Cache Optimization

- **Public Site ISR (Incremental Static Regeneration):**
  - Public pages use Next.js ISR with a 1-hour (`revalidate: 3600`) background revalidation as a safety net.
  - Every successful admin write (create/update/delete on standards, versions, or sections) also calls `/api/revalidate` immediately, busting the cache for the specific affected paths rather than waiting for the hourly window. This is fire-and-forget — a revalidation failure is non-fatal and the ISR period covers it.
- **Auto-Save vs. Manual Save Distinction:**
  - The Tiptap editor debounces keystrokes and fires a dedicated `autoSaveSection` mutation after 1.5s idle. This mutation **does not** trigger ISR revalidation — hammering the cache on every debounced keystroke would be wasteful and the content isn't ready for public consumption mid-edit.
  - A separate `updateSection` mutation (triggered by the manual Save button) does invalidate the ISR cache for the relevant public paths.
- **Granular RTK Query Cache Invalidation:**
  - `autoSaveSection` / `updateSection` only invalidate `Section/id` in the RTK Query cache, leaving the parent `Version` cache intact. Editing paragraph content doesn't change the sidebar tree structure, so a full version refetch on every keystroke would cause unnecessary flickering.

---

## 7. Assumptions & Trade-offs

1. **Single Admin Role:** Auth and access control assume a single admin user persona. Enterprise RBAC (roles/permissions) was omitted to keep focus on CMS workflow quality.
2. **Public Access Visibility:** Only versions with status `PUBLIC_CONSULTATION` or `CERTIFIED` belonging to published standards (`isPublished = true`) are visible to public readers. `DRAFT` versions are strictly isolated to the admin panel.
3. **Scoped Slugs:** Slugs are uniquely constrained within their parent entity scope. Version slugs (e.g. `v1-0`) are unique per standard (`@@unique([standardId, slug])`), and section slugs are unique per version (`@@unique([versionId, slug])`).
4. **Environment-Based API URLs:** Next.js bakes `NEXT_PUBLIC_` variables into client JS bundles during build time. For Docker deployments, `NEXT_PUBLIC_API_URL` is passed as a build `ARG` rather than a runtime container `ENV`.
