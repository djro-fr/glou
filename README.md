# GLOU Toulouse - Drinking Water Fountains in Toulouse

Interactive map listing the ~480 public drinking water fountains in Toulouse, built from Toulouse Métropole's open data. The app also includes a project presentation page and a contact form.

## Tech Stack

- **Frontend**: Svelte 5 + TypeScript + OpenStreetMap & MapLibre GL JS + SCSS
- **Basemap**: Positron style via openmaptiles.geo.data.gouv.fr (Etalab)
- **Cartography**: MapLibre GL JS clustering with color-coded markers (status-based)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions + Docker Compose deployment on a VPS
- **Routing**: @keenmate/svelte-spa-router (history mode)
- **Contact form**: Nodemailer (backend)

## Mockups

- [`Wireframe`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=1-52&viewport=782%2C466%2C0.35&t=NYSrWPvKp3Uyk6Z9-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A52&show-proto-sidebar=1&page-id=0%3A1)
- [`Mockup`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=9-481&viewport=885%2C766%2C0.24&t=HjIiaVk6J6dD3emi-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=9%3A481&page-id=9%3A469)

## Documentation

The full spec (context, user stories, data model, architecture, API endpoints, definition of done) is available in [`docs/SPECIFICATIONS.md`](docs/SPECIFICATIONS.md).

## Design tokens

Tokens are defined in [`design-system/tokens.json`](design-system/tokens.json) (Tokens Studio / DTCG format)
and transformed into CSS variables via Style Dictionary.

`npm run build-tokens` → generates `build/css/tokens.css` (do not edit directly)

## Performance optimizations

- Lazy-loaded MapLibre GL JS via dynamic `import()` to reduce initial bundle (103 KiB → reduced from 364 KiB)
- Mobile-first architecture with responsive marker clustering
- Non-render-blocking font loading via media queries
- Lighthouse mobile score: 85/100, LCP: 3.2s, CLS: 0.029

## Live demo

_Coming soon, once deployed._

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

   The map will render with ~481 fountains clustered by default (zoom to expand clusters).

6. **Start the development servers** (in separate terminals)

   ```bash
      # Terminal 1: Start backend (port 3000)
      cd backend
      npx tsx src/app.ts

      # Terminal 2: Frontend (port 5173 Vite dev server)
      cd frontend 
      npm run dev
   ```

### Notes

- The fountains CSV (`db/data/fontaines-a-boire.csv`) has been downloaded separately from [data.toulouse-metropole.fr](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/) and placed in `db/data/`
- Database schema and districts are auto-seeded on container start; fountains seed must be run manually
- The seed script is idempotent (safe to re-run)

## Project structure

```text
.
├── docs/
│   └── SPECIFICATIONS.md
├── db/
│   ├── data/        # CSV sources, versioned
│   ├── init/        # schema + districts seed (auto-run on first container start)
│   └── scripts/     # seeds fountains
├── backend/
│   ├── config/      # env, database and transporter (smtp mail) configuration
│   └── src/
│       ├── Controller/   # HTTP request handling
│       ├── Service/      # Business logic
│       ├── Repository/   # Data access (PostgreSQL, SMTP)
│       ├── DTO/          # Zod validation schemas
│       └── Middleware/   # Global error handling
├── frontend/
│   ├── design-system/
│   │   └── tokens.json      # Design tokens (Tokens Studio / DTCG format)
│   ├── public/              # Static assets (fonts, icons, images, favicons)
│   └── src/   
│       ├── features/        # Feature-based structure
│       │   ├── about/   
│       │   ├── contact/   
│       │   └── map/         # Fountain map with clustering & details panel
│       │       └── types/   # Map feature TypeScript interfaces (district, fountain)
│       ├── shared/          # Reusable components, helpers, layout, styles
│       └── routes.ts        # Router configuration
├── README.md
└── [config files: tsconfig.json, vite.config.ts, etc.]
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

## Last update

September 26, 2026
