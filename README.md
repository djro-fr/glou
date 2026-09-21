# GLOU Toulouse - Drinking Water Fountains in Toulouse

Interactive map listing the ~480 public drinking water fountains in Toulouse, built from Toulouse Métropole's open data. The app also includes a project presentation page and a contact form.

## Tech Stack

- **Frontend**: React + TypeScript + OpenStreetMap & MapLibre GL JS + SCSS
- **Basemap**: Positron style via openmaptiles.geo.data.gouv.fr (Etalab)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions + Docker Compose deployment on a VPS
- **Routing**: React Router
- **Contact form**: Nodemailer (backend)

## Mockups

- [`Wireframe`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=1-52&viewport=782%2C466%2C0.35&t=NYSrWPvKp3Uyk6Z9-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A52&show-proto-sidebar=1&page-id=0%3A1)
- [`Mockup`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=9-481&viewport=885%2C766%2C0.24&t=HjIiaVk6J6dD3emi-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=9%3A481&page-id=9%3A469)

## Documentation

The full spec (context, user stories, data model, architecture, API endpoints, definition of done) is available in [`docs/SPECIFICATIONS.md`](docs/SPECIFICATIONS.md).

## Design tokens

Tokens are defined in [`design-system/tokens.json`](design-system/tokens.json) (Tokens Studio / DTCG format)
and transformed into CSS variables via Style Dictionary.

`npm run build-tokens` → generates `build/css/variables.css` (do not edit directly)

## Live demo

_Coming soon, once deployed._

## Local setup

### Prerequisites

- Node.js v24.16.0+
- Docker & Docker Compose
- PostgreSQL running (via Docker Compose or locally on port 5433)

### Steps

1. **Clone the repo and install dependencies**

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

2. Set up environment variables

   ```bash
      cp .env.example .env
      # Edit .env with your PostgreSQL credentials
   ```

3. **Start PostgreSQL** (if using Docker Compose)

   ```bash
      docker compose up -d
   ```

   Wait for the database to be ready (schema and districts are auto-seeded).

4. **Seed the fountains** (one-time after first `docker compose up`)

   ```bash
      npx tsx db/scripts/seed-fountains.ts
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
└── README.md
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

September 21, 2026
