# GLOU Toulouse, Drinking Water Fountains Map

## 1. Context & Objective

**Objective:** demonstrate full-stack technical proficiency (design, backend, database, frontend, deployment, CI/CD) using a real, local open dataset (Toulouse Métropole open data).

**Target audience:** residents and visitors of Toulouse looking to locate a drinking water fountain.

**Data source:** [data.toulouse-metropole.fr, Fontaines à boire](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/) (481 entries, 38 of which have no district assigned in the source data: 35 in Toulouse, 3 in Tournefeuille).

---

## 2. Actor & User Stories

**Single actor:** unauthenticated visitor looking for a drinking fountain in Toulouse (no admin role or user account in V1).

**V1 User Stories:**

1. **US1, Overview**
  As a visitor, I want to see all fountains in Toulouse on a map as soon as I land on the site, so I get a general view without any action on my part.

2. **US2, Readability at large scale**
  As a visitor, I want nearby fountains to be visually grouped (clusters), so I'm not overwhelmed by 481 overlapping points.

3. **US3, Zooming into a cluster**
  As a visitor, I want to click a cluster to zoom in and see the fountains it contains spread out, so I can explore a specific area.

4. **US4, Filter by district**
  As a visitor, I want to filter fountains by district name, so I can focus on my area.

5. **US5, Filter by type**
  As a visitor, I want to filter fountains by type (BAYARD, PRESTO, AUTRE, WATER CONNECT, etc.), so I can find a specific model if needed.

6. **US6, Filter by status**
  As a visitor, I want to filter fountains by status, so I can avoid closed or out-of-service fountains.

7. **US7, View fountain details**
  As a visitor, I want to click a marker to see its address, type and status, so I know exactly where to go and what to expect.

8. **US8, Combine filters**
  As a visitor, I want to apply several filters at once (e.g. district + type), so I can narrow down my search.

9. **US9, Discover the project**
  As a visitor, I want to access the project presentation, so I can learn about the developer and the project's context.

10. **US10, Contact the developer**
  As a visitor, I want to be able to contact the developer, so I can ask questions or propose partnerships.

11. **US11, Filter by city**
  As a visitor, I want to filter fountains by city, so I can quickly narrow down results outside Toulouse.

12. **US12, Locate myself**
  As a visitor, I want to see my position on the map, so I can spot the fountains around me.

13. **US13, Splash screen**
  As a visitor, I want to see the app's identity (logo, name, baseline, version) while it starts, so I know right away which app I'm in and that it is loading.

---

## 3. Features, Version 1 (MVP)

- Interactive map as the **only** view of the application (no table/list view)
- Default behavior: city filter preset to Toulouse, map covering the whole city
- Marker **clustering** (natively via MapLibre, GeoJSON source + built-in clustering) for readability depending on zoom level
- Differentiated visual representation of **markers**:
  - Standalone fountain: pin with a color dot based on status
  - Cluster of fountains: numbered round badge
- **Filters**, positioned at the bottom of the screen (thumb-accessible zone, mobile-first approach):
  - **Client-side filtering**: fountains are loaded once from the API and filtered in the frontend (small dataset, ~481 entries)
  - District: quick filter via a dropdown in the bottom bar, also editable from the filter panel (both stay synced through a shared Svelte 5 runes store, `filters.svelte.ts`). Enabled only when the selected city is Toulouse (the "Quartiers de proximité" dataset covers Toulouse only).
  - City, Type and Status: available in the filter panel (bottom sheet built on a native `<dialog>` + `showModal()`), opened via the "Filter" button
  - Business rule: a selected district always implies city = Toulouse (choosing a district sets the city; choosing another city clears the district)
  - **Faceted filtering**: each dropdown only shows options that still have matching fountains given the other active filters
  - Live count of matching fountains; the "Validate" button is disabled when the count is 0
  - "Cancel" resets all filters
  - When a District or City filter is applied, the map automatically recenters and zooms to the matching area (`fitBounds` on the bounding box of matching fountains)
  - Filters remain combinable with each other (US8)
- **User geolocation (US12)**: MapLibre `GeolocateControl`, mounted in the filter bar (left of the district dropdown) instead of a map corner. Requires a secure context (HTTPS or localhost).
- **Splash screen (US13)**, full-screen overlay shown on the first load of the app (not on client-side navigation between pages):
  - Content: GLOU logo (`public/images/logo-glou-couleur.png`), app name "GLOU Toulouse", baseline "Les fontaines d'eau potable près de vous", version number (e.g. "v0.2.0")
  - Version read from `frontend/package.json` at build time (Vite `define`, `import.meta.env.APP_VERSION`), never hard-coded, so it always matches the release
  - Hidden once the fountains are loaded and the map is ready, with a minimum display time (800 ms) so it doesn't just flash, and a maximum one (5 s) so a slow or failed load never blocks the app (errors still show the usual toast); when the first page is not the map (About, Contact, 404), only the minimum applies
  - Fade-out transition, disabled with `prefers-reduced-motion`
  - Accessible: logo `alt`, loading state announced to screen readers (`role="status"`); the overlay doesn't trap focus and is removed from the DOM once hidden
  - Styled with the design tokens (colors, typography); must not noticeably degrade LCP/CLS (see section 9)
- **Fountain details (US7)**, shown on marker click: ID, type, city, district, location, address, status
- About page: project presentation (context, objective, tech stack) and short bio
- Contact page: form (name, email, subject, message) sent via a dedicated backend (Nodemailer)
  - Validation on both sides with aligned Zod schemas (trim, max lengths, no line breaks in subject)
  - Live client-side validation (on blur/input) + submit-time validation, focus moved to the first invalid field
  - Accessible markup (`aria-invalid`, `aria-describedby`, `aria-live`)
  - Honeypot anti-spam field (hidden off-screen, not `display: none`); the honeypot response is identical to a success response
  - Email sent in plain text, `from` = site address, `replyTo` = visitor's email (SPF/DMARC compliance)
- Client-side routing (@keenmate/svelte-spa-router, history mode) to navigate between the map, About and Contact
- **Error notifications**: toast notifications (shared store `toasts.svelte.ts` + `ToastContainer.svelte`, mounted once in the layout)
  - Persistent until closed by the user (no auto-dismiss)
  - Accessible: `aria-live="polite"` container always present in the DOM, `role="alert"` on error toasts
  - Deduplicated: when both fountains and districts fail to load, a single message is shown

---

## 4. Out of scope for V1 (explicitly excluded, to keep scope in check)

- Proximity search / sorting fountains by distance (would require PostGIS) → planned for V2
- User authentication
- User reviews, ratings, or contributions
- Filtering by `territory` (data kept in the database but not used in V1)

---

## 5. Data model

Two tables: `fountain`, and a reference table `district` (cross-referencing the fountains dataset with Toulouse Métropole's official "Quartiers de proximité" dataset, to get district names from their numbers).

```sql
CREATE TABLE district (
  number_d       INTEGER PRIMARY KEY,   -- official district number (cross-referenced with "Quartiers de proximité")
  name_d         VARCHAR(255) NOT NULL
);

CREATE TABLE fountain (
  id                INTEGER PRIMARY KEY,
  location_f        VARCHAR(255),
  type_f            VARCHAR(50),
  address_f         VARCHAR(255),
  city              VARCHAR(20),
  status_f          VARCHAR(50),
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  district_number   INTEGER REFERENCES district(number_d)   -- nullable: 38 fountains have no district
);

CREATE INDEX idx_fountain_district ON fountain(district_number);
CREATE INDEX idx_fountain_type_f ON fountain(type_f);
CREATE INDEX idx_fountain_status ON fountain(status_f);
```

Queries joining `fountain` and `district` use `LEFT JOIN`, so fountains without a district are not dropped.

**Source dataset fields not carried over:**

- `geo_shape`: redundant with `geo_point`, not needed for a fixed point (V1, no PostGIS)
- `territory`: kept conceptually but not modeled as a filter in V1 (grouping level above districts, not a priority)

---

## 6. Technical architecture

| Layer | Tech |
| --- | --- |
| Frontend | Svelte 5 (runes) + TypeScript + Vite + MapLibre GL JS + SCSS |
| Basemap | Positron style via openmaptiles.geo.data.gouv.fr (Etalab, free, OSM-based) |
| Backend | Node.js + Express + TypeScript, Controller / Service / Repository layers (inspired by hexagonal / clean architecture) |
| Database | PostgreSQL (no PostGIS extension in V1), `pg` driver |
| CI | GitHub Actions |
| CD | Deployment on a dedicated VPS |
| Containerization | Docker Compose (Caddy serving the frontend, backend, PostgreSQL) |

- Monorepo: `frontend/`, `backend/`, `db/`, each with its own `package.json`; shared `tsconfig.base.json` extended by `backend/` and `db/`
- Single `.env` at the repository root (PostgreSQL, SMTP, `CORS_ORIGINS`, `VITE_API_URL`), read by Vite via `envDir` and loaded in the backend by Node's `--env-file` flag in the `dev` and `start` scripts (`--env-file-if-exists` for `start`, so variables can come from the environment instead, e.g. Docker)
- Backend environment variables validated at startup with Zod (`backend/config/env.ts`); CORS origins configurable via `CORS_ORIGINS`
- The frontend build fails if `VITE_API_URL` is missing (check in `vite.config.ts`)
- Design tokens pipeline: Tokens Studio (Figma) → DTCG format (tokens.json) → Style Dictionary (@tokens-studio/sd-transforms) → `tokens.css` (CSS custom properties, also read by MapLibre layer styling via `getComputedStyle()`) + `tokens.scss` (Sass variables for compile-time use)
- Clustering: native MapLibre GL JS with GeoJSON source
- MapLibre GL JS lazy-loaded (dynamic import) to optimize mobile LCP
- Routing: @keenmate/svelte-spa-router (history mode)
- Contact: `POST /contact` route on the Express backend, sent via Nodemailer over SMTP (`secure` derived from the port: 465 vs 587; `transporter.verify()` called at startup)
- Font: self-hosted Ubuntu (woff2, no external CDN), preloaded and loaded non-render-blocking (`media="print"` swap)

### Error handling & validation

- Backend input validation uses Zod (`safeParse`). Validation errors return **400** with a shared format: `{ errors: [{ field, message }] }`. `/fountains` query params use a strict schema: unknown params are rejected.
- A global Express error-handling middleware logs the full error server-side and returns a generic **500** message in the same format, without exposing internal details.
- PostgreSQL connection: the server exits at startup if the database is unreachable (`process.exit(1)`); runtime connection errors are logged, and the affected requests return a generic 500.
- Frontend: API responses are checked (`response.ok`) before use; loading failures are shown as a toast and logged in the console.

---

## 7. API Endpoints (V1)

| Method | Route | Description |
| --- | --- | --- |
| GET | `/fountains` | List all fountains (with district name, `LEFT JOIN`) |
| GET | `/fountains?city=X&district=Y&type=Z&status=W` | Filtered fountains (validated query params; not used by the frontend) |
| GET | `/fountains/:id` | Fountain detail as a single object; 400 if the id is not a positive integer, 404 if not found (not used by the frontend) |
| GET | `/districts` | List of districts (id + name) |
| POST | `/contact` | Send the contact form (name, email, subject, message) |
| GET | `/health` | Health check: `SELECT 1` on the database, returns `{ status: "ok" }` (500 if the database is down); used by the Docker healthcheck |

In production, the API is served on the same domain as the frontend under `/api` (e.g. `/api/fountains`); Caddy strips the prefix before forwarding to the backend.

Filtering is done client-side in the frontend (small dataset). The server-side filters remain available for other API consumers.

---

## 8. CI/CD & Deployment

**CI (GitHub Actions, `ci-cd.yml`), triggered on push/PR:**

- Three jobs running in parallel: `db`, `backend`, `frontend`
- Each job: `npm ci` + lint (ESLint) + type check + build (10-minute timeout per job)
- Tests: Vitest (planned)
- API tests: Postman collection (`docs/postman/GLOU.postman_collection.json`), run manually with the Collection Runner (not part of the pipeline)
- Code quality checked locally in the editor with SonarQube for IDE (not part of the pipeline)

**Production stack (`docker-compose.prod.yml`, project `glou-prod`):**

- `caddy` (`frontend/Dockerfile` + `frontend/Caddyfile`): serves the built SPA (history-mode fallback to `index.html`), proxies `/api/*` to the backend, HTTPS via Let's Encrypt with HTTP → HTTPS redirect. Only service publishing ports (80/443): Docker bypasses UFW, so any published port is public
- Security headers set by Caddy: Content-Security-Policy (self + the basemap hosts `openmaptiles.geo.data.gouv.fr` / `openmaptiles.data.gouv.fr`), Strict-Transport-Security, Permissions-Policy, X-Content-Type-Options, Referrer-Policy, `Server` header removed; Cache-Control `immutable` for hashed `/assets/*`, `no-cache` for other files, `no-store` for the API
- `backend` (`backend/Dockerfile`): compiled code + production dependencies, non-root user, healthcheck on `/health`; no published port
- `glou_db`: `postgres:18-alpine` (volume on `/var/lib/postgresql`), `db/init/*.sql` on first start, `pg_isready` healthcheck; no published port
- `seed` (`db/Dockerfile`): one-shot service, run on demand with `docker compose -f docker-compose.prod.yml run --rm seed`; idempotent upsert in a single transaction
- The frontend image is built with `VITE_API_URL=/api` (same domain), so the same image works locally and in production; frontend and API share an origin, so CORS is not needed in practice
- Variables come from the root `.env` on the server, including `GLOU_DOMAIN`

- Container logs rotated (`json-file` driver, 3 × 10 MB per service)

**CD (`deploy` job in `ci-cd.yml`), triggered on push to `main`:**

- Runs only if the three CI jobs pass (`needs`), never on pull requests; one deployment at a time (`concurrency: production`)
- GitHub `production` environment (restricted to `main`) holding the secrets: `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`; no manual approval for now
- SSH to the VPS as the dedicated `deploy` user (member of the `docker` group); the deploy key is restricted in `authorized_keys` to a forced command (`/opt/glou/deploy/deploy.sh`, no PTY, no forwarding), so a leaked key could only redeploy `main`
- `deploy/deploy.sh` on the VPS: always deploys `main` (`git fetch origin main`, `git switch main`, `git merge --ff-only origin/main` in `/opt/glou`, whatever branch the clone is on), `docker compose up -d --build --wait` (fails if a service does not become healthy), prune unused images; a lock prevents concurrent runs
- Smoke test after deployment: `https://glou.sylys.dev/api/health`
- Images are built on the VPS (no registry); the fountains seed is run by hand when the CSV changes
- Rollback: `git reset --hard <sha>` on the VPS and rebuild (the next push to `main` redeploys `main`)
- Setup steps documented in the README ("Deployment (VPS)")

**VPS security (shared with the Breco project):**

- SSH key authentication only, custom port; dedicated ED25519 key for deployment, restricted to the deploy script
- Fail2ban installed
- Firewall (UFW) configured restrictively; ports 80/443 opened for Caddy

---

## 9. Performance & Metrics

Lighthouse mobile, measured locally on September 26, 2026, right after the Svelte migration (before the filter panel, contact form and geolocation). To be re-measured on the production deployment.

- Lighthouse mobile: 89/100
- First Contentful Paint (FCP): 2.4s
- Largest Contentful Paint (LCP): 2.9s
- Total Blocking Time (TBT): 180ms
- Cumulative Layout Shift (CLS): 0.029
- Speed Index: 2.4s

---

## 10. Definition of Done for V1

- [x] Navigation between the 3 pages (map/About/Contact) working
- [x] About page accessible and up to date
- [x] Functional map displaying all 481 fountains with clustering
- [x] Filters (city, district, type, status) working, with city/district dependency and faceted options
- [x] Fountain details accessible on click
- [x] Functional backend API connected to PostgreSQL
- [x] Passing CI pipeline (lint, type check, build)
- [x] Working contact form (submission + validation + visual feedback to the user)
- [x] Validate `/fountains/:id` (400 on invalid id, 404 when not found, single object instead of an array)
- [x] Fix `.env` path resolution in the compiled backend
- [x] Dockerfiles + `docker-compose.prod.yml`
- [x] Live deployment on the VPS, application accessible online (<https://glou.sylys.dev>)
- [x] Splash screen with logo, name, baseline and version number (US13)
- [ ] Complete README (context, stack, installation, screenshots)

---

## 11. Known limitations

- 38 fountains have no district in the source data: they are displayed on the map but can't be matched by the district filter.
- 120 fountains have no status in the source data (shown with a neutral pin).
- The districts ("Quartiers de proximité") dataset only covers the Toulouse commune: no district filtering for other cities.

---

## 12. V2 ideas

### High priority

- **Proximity search**: display fountains sorted by distance from the user's location. Enable address/street search (geocoding via API Adresse or Nominatim). Requires PostGIS for spatial queries.
- **District detection from geolocation**: point-in-polygon test against district boundaries ("Quartiers de proximité" contours, Turf.js `booleanPointInPolygon` in the backend Repository layer, then PostGIS). Would also allow assigning a district to the 38 fountains missing one.
- **Status updates**: allow users to update fountain status (open/closed) with timestamp tracking
- **Accessibility audit & improvements**: full ARIA validation, keyboard navigation testing, screen reader compatibility
- **SEO optimization**: meta tags, structured data (Schema.org), Open Graph, sitemap, robots.txt

### Medium priority

- **Fountain photos**: add square photo storage and display in the fountain details panel

### Lower priority

- More advanced automated deployment (staging/production)

## AI usage

Up to v0.1.0, I used Claude in **chat mode as a tutor**: explanations, code reviews and step-by-step guidance. I wrote most of the code myself; some snippets come from the chat and were reviewed and integrated by hand.

From v0.1.0 onwards, I am introducing an AI coding agent (Claude Code) into the workflow, to learn how to work with AI beyond chat. Every change is reviewed before being committed.

## Last update

November 27, 2026
