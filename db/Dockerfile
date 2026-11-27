# One-shot fountains seed, run with: docker compose -f docker-compose.prod.yml run --rm seed
# Build context: repo root. The script reads db/data/ relative to /app.
FROM node:24-alpine
WORKDIR /app
COPY db/package.json db/package-lock.json db/
RUN cd db && npm ci
COPY db/ db/
USER node
CMD ["db/node_modules/.bin/tsx", "db/scripts/seed-fountains.ts"]
