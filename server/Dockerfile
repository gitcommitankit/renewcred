# Stage 1: Install dependencies using pnpm
FROM node:22-alpine AS deps
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config and lockfile from monorepo root
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy only the server package.json so pnpm can resolve deps
COPY server/package.json ./server/

# Install only server dependencies (no --filter to avoid workspace resolution issues)
RUN pnpm install --frozen-lockfile --filter server

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

COPY server/ ./server/
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Generate Prisma client, then build
WORKDIR /app/server
RUN pnpm db:generate && pnpm build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy built dist, prisma client and runtime node_modules
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/package.json ./package.json
COPY --from=builder /app/server/prisma ./prisma

USER expressjs

EXPOSE 4000

CMD ["node", "dist/index.js"]
