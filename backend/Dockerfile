# Build context: repo root (docker-compose.prod.yml), for tsconfig.base.json

# --- Build: compile TypeScript to dist/ ---
FROM node:24-alpine AS build
WORKDIR /app
COPY tsconfig.base.json ./
COPY backend/package.json backend/package-lock.json backend/
RUN cd backend && npm ci
COPY backend/ backend/
RUN cd backend && npm run build

# --- Runtime: production dependencies + compiled code only ---
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/backend/dist ./dist
USER node
EXPOSE 3000
# node directly (not npm start): proper signal handling, and env vars come from Compose, not a .env file
CMD ["node", "dist/src/app.js"]
