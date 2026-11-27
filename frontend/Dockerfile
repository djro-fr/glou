# Build context: repo root (docker-compose.prod.yml)

# --- Build: design tokens + type check + Vite build ---
FROM node:24-alpine AS build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Relative by default: the API is served on the same domain under /api (see Caddyfile),
# so the same image works locally and in production
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Runtime: Caddy serves the SPA, proxies /api and handles HTTPS ---
FROM caddy:2-alpine
COPY frontend/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/frontend/dist /srv
