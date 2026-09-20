# GLOU Toulouse, Drinking Water Fountains Map

## 1. Context & Objective

**Objective:** demonstrate full-stack technical proficiency (design, backend, database, frontend, deployment, CI/CD) using a real, local open dataset (Toulouse Métropole open data).

**Target audience:** residents and visitors of Toulouse looking to locate a drinking water fountain.

**Data source:** [data.toulouse-metropole.fr, Fontaines à boire](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/) (~480 entries).

---

## 2. Actor & User Stories

**Single actor:** unauthenticated visitor looking for a drinking fountain in Toulouse (no admin role or user account in V1).

**V1 User Stories:**

1. **US1, Overview**
  As a visitor, I want to see all fountains in Toulouse on a map as soon as I land on the site, so I get a general view without any action on my part.

2. **US2, Readability at large scale**
  As a visitor, I want nearby fountains to be visually grouped (clusters), so I'm not overwhelmed by 480 overlapping points.

3. **US3, Zooming into a cluster**
  As a visitor, I want to click a cluster to zoom in and see the fountains it contains spread out, so I can explore a specific area.

4. **US4, Filter by district**
  As a visitor, I want to filter fountains by district name, so I can focus on my area.

5. **US5, Filter by type**
  As a visitor, I want to filter fountains by type (BAYARD, PRESTO, AUTRE, WATER CONNECT), so I can find a specific model if needed.

6. **US6, Filter by status**
  As a visitor, I want to filter fountains by status (open, etc.), so I can avoid closed or out-of-service fountains.

7. **US7, View fountain details**
  As a visitor, I want to click a marker to see its address, type and status, so I know exactly where to go and what to expect.

8. **US8, Combine filters**
  As a visitor, I want to apply several filters at once (e.g. district + type), so I can narrow down my search.

9. **US9, Discover the project**
  As a visitor, I want to access the project presentation, so I can learn about the developer and the project's context.

10. **US10, Contact the developer**
  As a visitor, I want to be able to contact the developer, so I can ask questions or propose partnerships.

11. **US11, Filter by city**
  As a visitor, I want to be able to search by city or district, so I can quickly narrow down results.

---

## 3. Features, Version 1 (MVP)

- Interactive map as the **only** view of the application (no table/list view)
- Default behavior (no active filter): display all 480 fountains, on a view covering the whole city of Toulouse
- Marker **clustering** (natively via MapLibre, GeoJSON source + built-in clustering) for readability depending on zoom level
- Differentiated visual representation of **markers**:
  - Standalone fountain: pin with a color dot based on status
  - Cluster of fountains: numbered round badge
- **Filters**, positioned at the bottom of the screen (thumb-accessible zone, mobile-first approach):
  - District: accessible as a quick filter via a dropdown, also editable from the filter panel (both stay synced). Disabled by default until a city is selected, or if the selected city isn't Toulouse.
  - City, Type and Status: available in the filter panel, opened via the "Filter" button. Bidirectional dependency between City and District: selecting one filters the available options in the other (e.g. choosing a city restricts the district list to that city's; choosing a district auto-fills its city). If City is not Toulouse, District is disabled.
  - When a District or City filter is applied, the map automatically recenters and zooms to the matching area
  - Filters remain combinable with each other (US8)
- **Fountain details (US7)**, shown on marker click: ID, type, city, district, location, address, status
- About page: project presentation (context, objective, tech stack) and short bio
- Contact page: form (name, email, subject, message) sent via a dedicated backend (Nodemailer)
- Server-side field validation (valid email, required fields)
- Basic anti-spam measure planned (simple honeypot)
- Client-side routing added (React Router) to navigate between the map, About and Contact

---

## 4. Out of scope for V1 (explicitly excluded, to keep scope in check)

- User geolocation / proximity search (would require PostGIS) → planned for V2
- User authentication
- User reviews, ratings, or contributions
- Filtering by `territory` (data kept in the database but not used in V1)

---

## 5. Data model

Two tables, related through a reference table of districts (cross-referencing the fountains dataset with Toulouse Métropole's official "Quartiers de proximité" dataset, to get district names from their numbers).

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
  district_number   INTEGER REFERENCES district(number_d)
);

CREATE INDEX idx_fountain_district ON fountain(district_number);
CREATE INDEX idx_fountain_type_f ON fountain(type_f);
CREATE INDEX idx_fountain_status ON fountain(status_f);
```

**Source dataset fields not carried over:**

- `geo_shape`: redundant with `geo_point`, not needed for a fixed point (V1, no PostGIS)
- `territory`: kept conceptually but not modeled as a filter in V1 (grouping level above districts, not a priority)

---

## 6. Technical architecture

| Layer | Tech |
| --- | --- |
| Frontend | React + TypeScript + MapLibre GL JS + clustering via MapLibre (GeoJSON source + built-in clustering) + SCSS |
| Basemap | Positron style via openmaptiles.geo.data.gouv.fr (Etalab, free, OSM-based) |
| Backend | Node.js + Express |
| Database | PostgreSQL (no PostGIS extension in V1) |
| CI | GitHub Actions |
| CD | Deployment on a dedicated VPS |
| Containerization | Docker Compose (frontend, backend, PostgreSQL) |

- Design tokens pipeline: Tokens Studio (Figma) → DTCG format (tokens.json) → Style Dictionary (@tokens-studio/sd-transforms) → CSS custom properties (variables.css)
- Routing: React Router
- Contact: `POST /contact` route on the Express backend, sent via Nodemailer (SMTP provider TBD, Gmail, OVH, or another option depending on what's already available on your domain)
- Server-side field validation (valid email, required fields)
- Basic anti-spam measure planned (simple honeypot)
- V1 state management: local React state (`useState`), simple and sufficient for the current scope. Migration to Redux Toolkit planned for V2 (learning objective)

---

## 7. API Endpoints (V1)

| Method | Route | Description |
| --- | --- | --- |
| GET | `/fountains` | List all fountains |
| GET | `/fountains/:id` | Fountain detail |
| GET | `/fountains?city=X&district=Y&type=Z&status=W` | Filtered fountains |
| GET | `/districts` | List of districts (id + name) |
| POST | `/contact` | Send the contact form (name, email, subject, message) |

---

## 8. CI/CD & Deployment

**CI (GitHub Actions), triggered on push/PR:**

- Lint (ESLint)
- Tests (if written)
- Build (frontend + backend)

**CD, triggered on push to `main`:**

- SSH connection to the dedicated VPS
- Deployment via Docker Compose

**VPS security (set up from the start, based on lessons learned from the Breco project):**

- Dedicated ED25519 SSH key (no password)
- Fail2ban installed
- Firewall (UFW) configured restrictively

---

## 9. Definition of Done for V1

- [ ] Navigation between the 3 pages (map/About/Contact) working
- [ ] About page accessible and up to date
- [ ] Functional map displaying all ~480 fountains with clustering
- [ ] Filters (city, district, type, status) working, with bidirectional city/district dependency
- [ ] Fountain details accessible on click
- [x] Functional backend API connected to PostgreSQL
- [ ] Passing CI pipeline (lint, build)
- [ ] Live deployment on the VPS, application accessible online
- [ ] Working contact form (submission + validation + visual feedback to the user)
- [ ] Complete README (context, stack, installation, screenshots)

---

## 10. V2 ideas

- User geolocation + proximity search (PostGIS)
- Address/street search (geocoding, e.g. API Adresse or Nominatim), combined with geolocation
- More advanced automated deployment (staging/production)
- Migrate state management (filters, fountain data) to Redux Toolkit (learning objective, skill-building)

## Last update

September 20, 2026
