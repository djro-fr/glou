# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

GLOU Toulouse: interactive map of the 481 public drinking water fountains in Toulouse (open data from Toulouse Métropole), plus an About page and a contact form. Full spec (user stories, data model, API, definition of done, V2 ideas) lives in `docs/SPECIFICATIONS.md`; keep it in sync when API or UI behavior changes. User-facing text and error messages are in French.

## Working rules

- Never commit, push or switch branches without my explicit approval.
- Never read or modify `.env`; use `.env.example` for variable names.
- Import `.svelte.ts` modules with the `.svelte.js` extension.
- SCSS files are imported globally (not scoped): use BEM class names (`block__element--modifier`).
- Propose a plan before multi-file changes; keep changes small and focused on the task.

## Repository layout

Relative imports use explicit `.ts` extensions and type-only imports need `import type`; no enums or other non-erasable TS syntax.

A single `.env` at the repo root (template: `.env.example`) serves everything: Postgres, SMTP, `CORS_ORIGINS`, and `VITE_API_URL` (Vite reads it via `envDir: '../'`).

## Commands

```bash
docker compose up -d                    # Postgres 18 on host port 5433; db/init/*.sql runs on first start (schema + districts)
npx tsx db/scripts/seed-fountains.ts    # from repo root (reads db/data/ relative to cwd); idempotent upsert in one transaction

cd backend  && npm run dev              # Express API on :3000 (tsx)
cd frontend && npm run dev              # Vite on :5173

# Production stack (separate project "glou-prod"; needs GLOU_DOMAIN)
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm seed
```

Production (`docker-compose.prod.yml`): Caddy (`frontend/Dockerfile` + `frontend/Caddyfile`) is the only service publishing ports (80/443, overridable with `HTTP_PORT`/`HTTPS_PORT`); it serves the SPA, proxies `/api/*` to `backend:3000` (prefix stripped), handles HTTPS and sets the security headers (CSP, HSTS, Permissions-Policy). Backend and Postgres stay on the internal network: never add `ports:` to them (Docker bypasses UFW). The frontend image is built with `VITE_API_URL=/api` (relative). Dockerfiles build from the repo root (`tsconfig.base.json`); `.dockerignore` keeps `.env` out of images. If the frontend loads a new external host or inline script, update the CSP in the Caddyfile.

Deployment: every push to `main` that passes CI runs the `deploy` job, which SSHes to the VPS (`glou.sylys.dev`) as `deploy`; the key's forced command runs `deploy/deploy.sh` (always deploys `main`: `git fetch origin main`, `git switch main`, `git merge --ff-only origin/main` in `/opt/glou`, then `up -d --build --wait`, image prune), then the job curls `/api/health`. Keep `deploy.sh` LF-only (`.gitattributes`) and wrapped in `main()`, since updating the clone can rewrite it mid-run. The VPS `.env` and the GitHub `production` secrets are managed by hand, never in the repo.

What CI runs (`.github/workflows/ci-cd.yml`, three parallel jobs, Node 24, then a `deploy` job on push to `main`); run the same before considering work done:

- `db/`: `npm run check`
- `backend/`: `npm run check`, `npm run build`
- `frontend/`: `npm run lint`, `npm run check` (svelte-check + tsc), `npm run build`

`frontend` build fails if `VITE_API_URL` is unset. There is no automated test suite yet (Vitest is planned). API behavior is covered by a Postman collection in `docs/postman/GLOU.postman_collection.json` (run manually with the Collection Runner, backend running, **Manual** folder excluded since it sends a real email); update it when an endpoint's responses change.

## Backend architecture (`backend/`)

Express 5, layered Controller → Service → Repository, wired in `src/app.ts`:

- **Controller**: parses input with Zod `safeParse` (schemas in `src/DTO/`) and returns validation errors as `400 { errors: [{ field, message }] }`. This error shape is shared by every endpoint and by the frontend.
- **Service**: business logic. E.g. `fountainService` maps filter keys to real column names via a `COLUMNS` whitelist and builds a parameterized `WHERE` (`$1, $2…`); never interpolate values into SQL.
- **Repository**: raw SQL through a single shared `pg.Client` (`config/database.ts`), or Nodemailer for contact.
- `Middleware/errorHandler.ts` catches anything thrown (Express 5 forwards async rejections) and returns a generic 500 in the same `{ errors }` format, without leaking internals.

Config: the root `.env` is loaded by Node's `--env-file` flag in the npm scripts (`dev`: `tsx --env-file=../.env`, `start`: `node --env-file-if-exists=../.env`), not in code (no `dotenv` in `backend/`), so always start the backend through the npm scripts. `config/env.ts` validates SMTP + `CORS_ORIGINS` with Zod at startup; it must stay the **first import** in `app.ts` so validation runs before `config/database.ts` and the mailer read `process.env` directly. The DB host/port come from `POSTGRES_HOST`/`POSTGRES_PORT` (validated in `env.ts`, default `127.0.0.1:5433` for the dev compose), and the server exits at startup if the database is unreachable: run `docker compose up -d` before `npm run dev` in `backend/`. Zod error messages use the French locale (`z.config(z.locales.fr())`) in both backend and frontend.

`GET /health` runs `SELECT 1` and returns `{ status: "ok" }` (500 if the database is down); it is the backend's Docker healthcheck. `/fountains` uses a strict schema (unknown query params rejected). The frontend does not use server-side filters or `/fountains/:id`: it fetches all fountains once and filters client-side.

## Frontend architecture (`frontend/`)

Svelte 5 (runes) + Vite + TypeScript + SCSS, feature-based under `src/features/{map,about,contact}` with shared code in `src/shared/`. Routing is `@keenmate/svelte-spa-router` in history mode (`src/routes.ts`, hash routing disabled in `main.ts`).

- **Shared reactive state** lives in `*.svelte.ts` modules exporting `$state` objects plus mutator functions: `features/map/filters.svelte.ts` (city/district/type/status), `districts.svelte.ts`, `shared/components/toasts.svelte.ts`. Use the mutators (`setCity`, `setDistrict`, `resetFilters`) rather than writing to `filters` directly; they enforce the invariants (district only applies to Toulouse, picking a district forces city = Toulouse). `matchesFilters(f, except?)` powers both the map and the faceted dropdown counts.
- **Map** (`FountainMap.svelte`): MapLibre GL is lazy-loaded via dynamic `import()` (with its worker URL) to keep the initial bundle small; keep it out of static imports. Uses a GeoJSON source with native clustering and status-colored markers. The fountain fetch and the map `load` event can resolve in either order, so handle both cases.
- **API errors**: check `response.ok`, log to the console, and show `addToast(LOAD_ERROR_MESSAGE, 'error')`.
- **Design tokens**: source of truth is `design-system/tokens.json` (Tokens Studio/DTCG). `npm run build-tokens` generates `src/shared/styles/tokens.css` and `tokens.scss`. **Do not edit those generated files by hand.** SCSS uses `$vars`; JS/MapLibre reads CSS custom properties through `shared/helpers/getCSSVariable.ts`.

## Data

Tables `district(number_d, name_d)` and `fountain(id, location_f, type_f, address_f, city, status_f, latitude, longitude, district_number → district)`; column suffixes `_f`/`_d` are intentional. No PostGIS in V1. 38 fountains have no district, and some status values are empty in the source CSV.

## Conventions

Commits follow Conventional Commits with scopes, e.g. `feat(map): …`, `fix(api): …`, `docs(spec): …`, `ci: …`.
