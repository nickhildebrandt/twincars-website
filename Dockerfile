# syntax=docker/dockerfile:1.7

# ─── Build stage ──────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Build-time placeholders. Runtime values are supplied via website.env
# inside the pod; these defaults exist only so `vite build` and the
# SvelteKit `analyse` step can complete.
ARG PUBLIC_SITE_URL=https://tc.ts13.de
ARG TC_MANAGER_API_URL=http://localhost:3000
ARG TC_MANAGER_API_TOKEN=placeholder-build-token
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
ENV TC_MANAGER_API_URL=$TC_MANAGER_API_URL
ENV TC_MANAGER_API_TOKEN=$TC_MANAGER_API_TOKEN

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ─── Runtime stage ────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3001

CMD ["node", "build"]
