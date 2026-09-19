# GLOU Toulouse - Fontaines d'eau potable à Toulouse

Carte interactive recensant les ~480 fontaines d'eau potable à Toulouse, à partir des données ouvertes de Toulouse Métropole. Application incluant une page de présentation du projet et un formulaire de contact.

## Stack technique

- **Frontend** : React + TypeScript + Open Street Map & MapLibre GL JS + SCSS
- **Fond de carte** : style Positron via openmaptiles.geo.data.gouv.fr (Etalab)
- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL
- **CI/CD** : GitHub Actions + déploiement Docker Compose sur VPS
- **Routing** : React Router
- **Formulaire de contact** : Nodemailer (backend)

## Maquettes

- [`Wireframe`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=1-52&viewport=782%2C466%2C0.35&t=NYSrWPvKp3Uyk6Z9-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A52&show-proto-sidebar=1&page-id=0%3A1)
- [`Mockup`](https://www.figma.com/proto/xSuUN7Zc4uRUs2I9mdYv34/GLOU---Design?node-id=9-481&viewport=885%2C766%2C0.24&t=HjIiaVk6J6dD3emi-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=9%3A481&page-id=9%3A469)

## Documentation

Le cahier des charges complet (contexte, User Stories, modélisation de données, architecture, endpoints API, critères de "fini") est disponible dans [`docs/CAHIER_DES_CHARGES.md`](docs/CAHIER_DES_CHARGES.md).

## Design tokens

Les tokens sont définis dans [`design-system/tokens.json`](design-system/tokens.json) (format Tokens Studio / DTCG)
et transformés en variables CSS via Style Dictionary.

`npm run build-tokens` → génère build/css/variables.css (ne pas éditer directement)

## Démo en ligne

*À venir une fois le déploiement effectué.*

## Installation & lancement en local

### Prérequis

- Node.js (version à préciser une fois le projet initialisé)
- PostgreSQL
- Docker & Docker Compose (optionnel, pour lancer l'environnement complet)

### Étapes

```bash
# Cloner le repo
git clone <url-du-repo>
cd <nom-du-repo>

# Installer les dépendances (frontend et backend)
npm install

# Configurer les variables d'environnement
cp .env.example .env
# puis éditer .env avec les identifiants PostgreSQL

# Lancer l'application (détail des scripts à préciser selon la structure finale)
npm run dev
```

## Structure du projet

```text
.
├── docs/
│   └── CAHIER_DES_CHARGES.md
├── frontend/
├── backend/
└── README.md
```

## Source des données

[data.toulouse-metropole.fr — Fontaines à boire](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/) (licence ODbL)

## Licence

*À définir.*
