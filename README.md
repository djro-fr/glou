# GLOU Toulouse - Drinking Water Fountains in Toulouse

Interactive map listing the 481 public drinking water fountains in Toulouse, built from Toulouse Métropole's open data. The app also includes a project presentation page and a contact form.

## Features

- Interactive map with clustering and status-based markers
- Filter panel (mobile-first): city, district, type, status — combinable
- Quick district filter, kept in sync with the filter panel (shared state)
- Client-side filtering: fountains are fetched once, filtered in the browser
- Auto-zoom on the selected city or district
- Toulouse selected by default
- User geolocation: locate-me control in the filter bar, with live position tracking and accuracy circle

## Tech Stack

- **Frontend**: Svelte 5 + Vite + TypeScript + OpenStreetMap & MapLibre GL JS + SCSS
- **Basemap**: Positron style via openmaptiles.geo.data.gouv.fr (Etalab)
- **Cartography**: MapLibre GL JS clustering with color-coded markers (status-based)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions + Docker Compose deployment on a VPS
- **Routing**: @keenmate/svelte-spa-router (history mode)
- **Contact form**: Nodemailer (backend)

## Mockups

- [`Wireframe`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=1-52&viewport=782%2C466%2C0.35&t=NYSrWPvKp3Uyk6Z9-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A52&show-proto-sidebar=1&page-id=0%3A1)
- [`Mockup`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=9-481&viewport=885%2C766%2C0.24&t=HjIiaVk6J6dD3emi-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=9%3A481&page-id=9%3A469)

## Documentation

The full spec (context, user stories, data model, architecture, API endpoints, definition of done) is available in [`docs/SPECIFICATIONS.md`](docs/SPECIFICATIONS.md).

## Development and AI

- v0: designed and coded by me. Claude (chat) served as my assistant to learn Node/Express, debug, and validate my modeling choices.

- v1: developed with Claude Code (AI agent): CI/CD pipeline, tests, PostGIS proximity search. My role: plan each step, proofread and correct the proposed code, write or validate tests.

What I take away from this: ...

## Design tokens

Tokens are defined in [`frontend/design-system/tokens.json`](frontend/design-system/tokens.json) (Tokens Studio / DTCG format) and transformed into CSS and SCSS variables via Style Dictionary.

`npm run build-tokens` (from `frontend/`) → generates `frontend/src/shared/styles/tokens.css` and `frontend/src/shared/styles/tokens.scss` (do not edit directly)

### Why two formats?

- `tokens.scss` for SCSS styles (`$primary-700`)
- `tokens.css` for JS and MapLibre (`--primary-700` via `getComputedStyle`), imported globally in the entry point (`main.ts`)

Sass variables only exist at compile time, so MapLibre, configured in JS, needs the CSS custom properties.

## Performance optimizations

- Lazy-loaded MapLibre GL JS via dynamic `import()` to reduce initial bundle (103 KiB → reduced from 364 KiB)
- Mobile-first architecture with responsive marker clustering
- Non-render-blocking font stylesheet (`media="print"` swap) + preload of the main font file (Ubuntu Bold)
- Lighthouse mobile score: 85/100, LCP: 3.2s, CLS: 0.029

## Live demo

[glou.sylys.dev](https://glou.sylys.dev), deployed automatically on every push to `main` (see [Deployment](#deployment-vps)).

## Local setup

### Prerequisites

- Node.js v24.16.0 LTS or higher
- Docker & Docker Compose
- PostgreSQL running (via Docker Compose or locally on port 5433)

### Steps

1. **On Windows: Start Docker Desktop**

   Open Docker Desktop app and wait until it shows "running" status.

   _(Skip this step on Linux/macOS)_

2. **Clone the repo and install dependencies**

   ```bash
      git clone <repo-url>
      cd glou

      # Install root dependencies (tsx for running scripts)
      npm install

      # Install backend dependencies
      cd backend
      npm install
      cd ..

      # Install db script dependencies
      cd db
      npm install
      cd ..

      # Install frontend dependencies (Vite, Svelte, Sass, Style Dictionary, tsx)
      cd frontend
      npm install
      cd ..
   ```

3. **Set up environment variables**

   ```bash
      cp .env.example .env
      # Edit .env with your PostgreSQL credentials
   ```

4. **Start PostgreSQL**

   ```bash
      docker compose up -d
   ```

   Wait for the database to be ready (schema and districts are auto-seeded).

5. **Seed the fountains** (one-time after first `docker compose up`)

   ```bash
      npx tsx db/scripts/seed-fountains.ts
   ```

   The map will render with 481 fountains clustered by default (zoom to expand clusters).

6. **Start the development servers** (in separate terminals)

   ```bash
      # Terminal 1: Start backend (port 3000)
      cd backend
      npm run dev

      # Terminal 2: Frontend (port 5173 Vite dev server)
      cd frontend
      npm run dev
   ```

### Notes

- The fountains CSV (`db/data/fontaines-a-boire.csv`) has been downloaded separately from [data.toulouse-metropole.fr](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/) and placed in `db/data/`
- Database schema and districts are auto-seeded on container start; fountains seed must be run manually
- The seed script is idempotent (safe to re-run)
- Geolocation requires a secure context: it works on `localhost` and over HTTPS, but not over plain HTTP (e.g. testing on a phone via the local network IP)

## Available scripts

| Package | Script | Role |
| --- | --- | --- |
| `frontend/` | `dev` | Start the Vite dev server |
| `frontend/` | `lint` | Lint the code (ESLint) |
| `frontend/` | `check` | Type-check (svelte-check + tsc) |
| `frontend/` | `build` | Generate tokens, type-check and build for production |
| `frontend/` | `preview` | Preview the production build locally |
| `frontend/` | `build-tokens` | Generate CSS/SCSS variables from design tokens |
| `backend/` | `dev` | Start the dev server (tsx) |
| `backend/` | `check` | Type-check (`tsc --noEmit`) |
| `backend/` | `build` | Compile to `dist/` |
| `backend/` | `start` | Run the compiled production server (loads the root `.env` if present) |
| `db/` | `check` | Type-check the seed scripts |

## Production (Docker)

`docker-compose.prod.yml` runs the full stack: Caddy (serves the frontend, proxies `/api` to the backend, HTTPS with Let's Encrypt), the backend and PostgreSQL. Only Caddy publishes ports (80/443); the backend and the database stay on the internal Docker network.

On the server, with the root `.env` filled in (including `GLOU_DOMAIN`, the public domain):

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm seed   # load or update the 481 fountains (safe to re-run)
```

To try it locally (ports 8080/8443, local certificate from Caddy to accept in the browser), open `https://glou.localhost:8443` after:

```bash
GLOU_DOMAIN=glou.localhost HTTP_PORT=8080 HTTPS_PORT=8443 docker compose -f docker-compose.prod.yml up -d --build
```

Container logs are rotated (`json-file`, 3 files of 10 MB per service).

## Deployment (VPS)

GLOU is deployed to [glou.sylys.dev](https://glou.sylys.dev) on every push to `main`, once the three CI jobs pass: the `deploy` job in `.github/workflows/ci-cd.yml` connects over SSH and runs [`deploy/deploy.sh`](deploy/deploy.sh) on the VPS (update the clone to `main` with a fast-forward only, whatever branch it is on, rebuild, wait for every service to be healthy, prune old images), then checks `https://glou.sylys.dev/api/health`.

The deploy SSH key is restricted to that script (forced command in `authorized_keys`): if it leaked, it could only redeploy `main`, not open a shell.

### One-time setup

Prerequisites on the VPS: Docker Engine with the Compose plugin, and git. DNS `A`/`AAAA` records for `glou.sylys.dev` point to the VPS.

1. **Deploy key**, on your machine (Git Bash), then print the restricted `authorized_keys` line:

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/glou_deploy -C "github-actions-glou-deploy" -N ""
   printf 'command="/opt/glou/deploy/deploy.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty %s\n' "$(cat ~/.ssh/glou_deploy.pub)"
   ```

2. **`deploy` user** on the VPS (member of the `docker` group), with that line as its only authorized key:

   ```bash
   sudo adduser --disabled-password --gecos "" deploy
   sudo usermod -aG docker deploy
   sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
   sudo nano /home/deploy/.ssh/authorized_keys          # paste the line printed in step 1
   sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
   sudo chmod 600 /home/deploy/.ssh/authorized_keys
   ```

   If `/etc/ssh/sshd_config` has an `AllowUsers` line, add `deploy` to it, then `sudo systemctl reload ssh`.

3. **Project and `.env`**:

   ```bash
   sudo install -d -o deploy -g deploy /opt/glou
   sudo -u deploy git clone https://github.com/djro-fr/glou.git /opt/glou
   sudo -u deploy install -m 600 /opt/glou/.env.example /opt/glou/.env
   sudo -u deploy nano /opt/glou/.env    # GLOU_DOMAIN=glou.sylys.dev, strong Postgres password, SMTP
   ```

   `CORS_ORIGINS` and `VITE_API_URL` are not used in production (set by `docker-compose.prod.yml`).

4. **Firewall**: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 443/udp`.

5. **First deployment**, by hand:

   > **First setup only:** until the deployment PR is merged, `deploy/deploy.sh` exists only on the `feat/deploy` branch, and the script always deploys `main`. So for this first deployment, switch the clone to `feat/deploy` and start the stack with Compose directly instead of `deploy.sh`:
   >
   > ```bash
   > sudo -u deploy git -C /opt/glou switch feat/deploy
   > cd /opt/glou && sudo -u deploy docker compose -f docker-compose.prod.yml up -d --build --wait
   > sudo -u deploy docker compose -f docker-compose.prod.yml run --rm seed
   > ```
   >
   > Leave the clone on `feat/deploy`: the restricted key needs `deploy/deploy.sh` on disk. After the merge, the first automatic deployment runs it, and it switches the clone to `main` by itself.

   Afterwards (or on a new server once the PR is merged), the manual deployment is:

   ```bash
   sudo -u deploy /opt/glou/deploy/deploy.sh
   cd /opt/glou && sudo -u deploy docker compose -f docker-compose.prod.yml run --rm seed
   ```

6. **GitHub**: Settings → Environments → New environment `production`, deployment branches restricted to `main`, with these secrets:

   | Secret | Value |
   | --- | --- |
   | `SSH_HOST` | VPS host name or IP |
   | `SSH_PORT` | VPS SSH port |
   | `SSH_USER` | `deploy` |
   | `SSH_PRIVATE_KEY` | content of `~/.ssh/glou_deploy` (private key) |
   | `SSH_KNOWN_HOSTS` | output of `ssh-keyscan -p <port> <host>` (compare with `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the VPS) |

   Once the secret is saved, keep the private key in a password manager or delete it from your machine.

### Operations

On the VPS, from `/opt/glou` (as `deploy`, e.g. `sudo -u deploy …`):

```bash
docker compose -f docker-compose.prod.yml ps                  # service status and health
docker compose -f docker-compose.prod.yml logs -f backend     # logs
docker compose -f docker-compose.prod.yml run --rm seed       # reload the fountains after a CSV update

# Rollback to a previous commit (the next push to main redeploys main)
git reset --hard <commit-sha> && docker compose -f docker-compose.prod.yml up -d --build --wait
```

## API tests (Postman)

The API is tested with a Postman collection: [`docs/postman/GLOU.postman_collection.json`](docs/postman/GLOU.postman_collection.json). Requests are grouped by expected status code (200, 400, 404). Each request checks the status code and the response body: the shape of the data, that filters are applied, and the shared error format `{ errors: [{ field, message }] }`. To run it, start the database and the backend (steps 4 to 6 above), import the collection into Postman and run it with the Collection Runner. The `baseUrl` collection variable defaults to `http://localhost:3000`. Leave the **Manual** folder unchecked: its request sends a real email through the contact form.

## Project structure

```text
.
├── .github/workflows/ci-cd.yml  # CI: lint, type-check, build; CD: deploy to the VPS on main (GitHub Actions)
├── deploy/
│   └── deploy.sh                # Run on the VPS by the deploy job: pull, rebuild, wait for healthy
├── docs/
│   ├── postman/                 # Postman collection (API tests)
│   └── SPECIFICATIONS.md
├── db/
│   ├── data/                    # CSV sources, versioned
│   ├── init/                    # Schema + districts seed (auto-run on first container start)
│   ├── scripts/                 # Seeds fountains
│   ├── Dockerfile               # One-shot seed service (production)
│   └── tsconfig.json            # Extends ../tsconfig.base.json
│
├── backend/
│   ├── config/                  # Env, database and transporter (smtp mail) configuration
│   ├── src/
│   │   ├── Controller/          # HTTP request handling
│   │   ├── Service/             # Business logic
│   │   ├── Repository/          # Data access (PostgreSQL, SMTP)
│   │   ├── DTO/                 # Zod validation schemas
│   │   └── Middleware/          # Global error handling
│   ├── Dockerfile               # Production image (compiled code, non-root)
│   └── tsconfig.json            # Extends ../tsconfig.base.json
│
├── frontend/
│   ├── design-system/
│   │   └── tokens.json          # Design tokens (Tokens Studio / DTCG format)
│   ├── public/                  # Static assets (fonts, icons, images, favicons)
│   ├── src/
│   │   ├── features/            # Feature-based structure
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── map/             # Fountain map with clustering, details panel & filters
│   │   │       ├── types/       # Map feature TypeScript interfaces (district, fountain)
│   │   │       └── *.svelte.ts  # Shared reactive state (filters, districts)
│   │   ├── shared/              # Reusable components, helpers, layout, styles
│   │   └── routes.ts            # Router configuration
│   ├── build-tokens.ts          # Generates tokens.css / tokens.scss from tokens.json
│   ├── Caddyfile                # Production: static files, /api proxy, HTTPS, security headers
│   ├── Dockerfile               # Production image: Vite build served by Caddy
│   ├── tsconfig.json            # Project references (app + node)
│   ├── tsconfig.app.json        # Browser code (src/)
│   └── tsconfig.node.json       # Node code (vite.config.ts)
│
├── .env.example                 # Environment variables template
├── .dockerignore                # Keeps .env, node_modules and build output out of images
├── docker-compose.yml           # PostgreSQL service for local dev
├── docker-compose.prod.yml      # Production stack: Caddy, backend, PostgreSQL, seed
├── README.md                    # Project documentation
└── tsconfig.base.json           # Shared TypeScript options (extended by backend/ and db/)
```

## Database

### Seeding the fountains

The script `db/scripts/seed-fountains.ts` reads the "fontaines à boire" dataset CSV and inserts the 481 rows into the `fountain` table.

**Does not run automatically** (unlike the schema and the districts seed), it must be run manually after every `docker compose up` on an empty volume:

```bash
npx tsx db/scripts/seed-fountains.ts
```

The source CSV file (`db/data/fontaines-a-boire.csv`) must be present beforehand, downloadable from
[data.toulouse-metropole.fr](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/).

The script is idempotent (`ON CONFLICT (id) DO NOTHING`): re-running it on an already-seeded database won't insert duplicates.

## Data source

[data.toulouse-metropole.fr, Fontaines à boire](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/) (ODbL license)

## Known limitations

- 38 fountains have no district in the source dataset (35 in Toulouse, 3 in Tournefeuille):
  they are shown on the map but don't appear under any district filter.
  V2 idea: compute their district from coordinates with PostGIS (`ST_Contains`).
- Some status values are empty in the dataset and can't be selected in the status filter.

## Last update

November 27, 2026
