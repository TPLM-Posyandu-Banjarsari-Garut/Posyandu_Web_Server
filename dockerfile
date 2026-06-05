FROM oven/bun:1.3-slim AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM deps AS development
WORKDIR /app
COPY . .

FROM development AS builder
RUN bun run build

FROM oven/bun:1.3-slim AS prod
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 bunapp && \
    useradd --system --uid 1001 --gid bunapp bunapp

ENV NODE_ENV=production

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=builder /app/dist ./dist

USER bunapp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD bun --eval \
    "fetch('http://localhost:3000/health') \
    .then(r => process.exit(r.ok ? 0 : 1)) \
    .catch(() => process.exit(1))"

CMD ["bun", "run", "dist/server.js"]