# Multi-stage build: Nx production build + pruned app deps, then minimal runtime.
# Use: docker compose build url-shortener-service

FROM docker.io/node:22-bookworm AS builder

WORKDIR /app

ENV NX_DAEMON=false \
    CI=true

# Workspace manifest + Nx + TypeScript toolchain
COPY package.json package-lock.json nx.json tsconfig.base.json tsconfig.json ./

# App source and workspace libs
COPY apps/url-shortener-service ./apps/url-shortener-service
COPY libs ./libs

RUN npm ci

# Production bundle + pruned lockfile + workspace_modules (matches Nx docker:build deps)
RUN npx nx run url-shortener-service:build:production --skip-nx-cache \
    && npx nx run url-shortener-service:prune --skip-nx-cache


FROM docker.io/node:22-bookworm-slim AS runner

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=80

WORKDIR /app

COPY --from=builder /app/apps/url-shortener-service/dist ./

RUN npm --omit=dev -f install

CMD ["node", "main.js"]
