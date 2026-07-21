# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config and lockfile from monorepo root
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY client/package.json ./client/
# Copy prisma schema so root postinstall hook succeeds
COPY server/prisma/ ./server/prisma/

RUN pnpm install --frozen-lockfile --filter client

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules

COPY client/ ./client/
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

WORKDIR /app/client

# Accept NEXT_PUBLIC_API_URL as a build arg so it's baked into the static bundle
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# Stage 3: Production runner (Next.js standalone output)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/.next/standalone ./
COPY --from=builder /app/client/.next/static ./client/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "client/server.js"]
