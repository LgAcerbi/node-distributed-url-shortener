# Multi-stage build: Nx production build + pruned app deps, then minimal runtime.
# Use: docker compose build url-usage-service
#
# Build context must be the workspace root (see docker-compose.yml).

FROM docker.io/node:22-bookworm AS builder

WORKDIR /app

ENV NX_DAEMON=false \
    CI=true

COPY package.json package-lock.json nx.json tsconfig.base.json tsconfig.json ./
COPY apps/url-usage-service ./apps/url-usage-service
COPY libs ./libs

RUN npm ci

RUN npx nx run url-usage-service:build:production --skip-nx-cache \
    && npx nx run url-usage-service:prune --skip-nx-cache

FROM docker.io/node:22-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/apps/url-usage-service/dist ./
RUN npm --omit=dev -f install

CMD ["node", "main.js"]
