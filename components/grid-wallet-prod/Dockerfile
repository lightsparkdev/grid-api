# Grid wallet production demo — Next 14 standalone server.
#
#   docker build -t grid-wallet-prod .
#   docker run --rm -p 4001:4001 --env-file .env.local grid-wallet-prod
#
# Then http://localhost:4001, and the webhook receiver at /api/webhooks
# (point ngrok or your platform's webhook config at that path).
#
# NOTE ON ENV: NEXT_PUBLIC_* is INLINED AT BUILD TIME, so the sandbox flag is a
# build arg, not a runtime var — a production image must be built WITHOUT it, or
# it will still offer the "simulate funding" affordance. Everything else
# (GRID_CLIENT_ID / GRID_CLIENT_SECRET / GRID_API_BASE_URL / GRID_CUSTOMER_ID /
# GRID_WEBHOOK_PUBKEY) is read per request and belongs at `docker run` time.

# ── deps ──────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
# Playwright is a devDependency used only by the verification scripts; its
# postinstall would otherwise pull ~400MB of browsers into the build.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci

# ── build ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Sandbox keys? Pass --build-arg NEXT_PUBLIC_GRID_SANDBOX=true to bake in the
# simulated-funding button. Omit for a production build.
ARG NEXT_PUBLIC_GRID_SANDBOX
ENV NEXT_PUBLIC_GRID_SANDBOX=$NEXT_PUBLIC_GRID_SANDBOX
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── run ───────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=4001 \
    HOSTNAME=0.0.0.0
# Unprivileged: nothing here needs root.
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs nextjs
# `standalone` traces in only the server files actually reached, and ships its
# own minimal node_modules; static assets and public/ are copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 4001
# The SSE webhook stream is long-lived; give the container a plain HTTP check
# that doesn't hold a connection open.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4001)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
