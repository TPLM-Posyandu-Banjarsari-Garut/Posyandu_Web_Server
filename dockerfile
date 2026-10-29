FROM docker.io/oven/bun:1.4.4-slim AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

FROM deps AS development
WORKDIR /app
COPY tsconfig.json ./
COPY src ./src

FROM development AS builder
RUN bun run build

FROM docker.io/oven/bun:1.4.4-slim AS prod
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 bunapp && \
    useradd --system --uid 1001 --gid bunapp bunapp

ENV NODE_ENV=production

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=builder /app/dist ./dist

USER bunapp

EXPOSE 3000

CMD ["bun", "run", "dist/server.js"]
