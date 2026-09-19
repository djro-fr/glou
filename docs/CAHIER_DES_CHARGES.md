# Cahier des charges — GLOU Toulouse, carte des fontaines d'eau potable de Toulouse

## 1. Contexte & objectif

**Objectif :** démontrer une maîtrise complète de la chaîne technique (conception, backend, base de données, frontend, déploiement, CI/CD) à partir d'un jeu de données réel et local (open data Toulouse Métropole).

**Public cible :** habitants et visiteurs de Toulouse cherchant à localiser une fontaine d'eau potable.

**Source des données :** [data.toulouse-metropole.fr — Fontaines à boire](https://data.toulouse-metropole.fr/explore/dataset/fontaines-a-boire/) (~480 entrées).

---

## 2. Acteur & User Stories

**Acteur unique :** visiteur non authentifié cherchant une fontaine à boire à Toulouse (pas de rôle admin ou de compte utilisateur en V1).

**User Stories V1 :**

1. **US1 — Vue d'ensemble**
  En tant que visiteur, je veux voir toutes les fontaines de Toulouse sur une carte dès l'arrivée sur le site, afin d'avoir une vue générale sans action de ma part.

2. **US2 — Lisibilité à grande échelle**
  En tant que visiteur, je veux que les fontaines proches les unes des autres soient regroupées visuellement (clusters), afin de ne pas être submergé par 480 points superposés.

3. **US3 — Zoom sur un cluster**
  En tant que visiteur, je veux cliquer sur un cluster pour zoomer et voir les fontaines qu'il contient se déplier, afin d'explorer une zone précise.

4. **US4 — Filtrer par quartier**
  En tant que visiteur, je veux filtrer les fontaines par nom de quartier, afin de me concentrer sur mon secteur.

5. **US5 — Filtrer par type**
  En tant que visiteur, je veux filtrer les fontaines par type (BAYARD, PRESTO, AUTRE, WATER CONNECT), afin de trouver un modèle spécifique si j'en ai besoin.

6. **US6 — Filtrer par statut**
  En tant que visiteur, je veux filtrer les fontaines par statut (ouverte, etc.), afin d'éviter les fontaines fermées ou hors service.

7. **US7 — Voir le détail d'une fontaine**
  En tant que visiteur, je veux cliquer sur un marker pour voir son adresse, son type et son statut, afin de savoir précisément où aller et à quoi m'attendre.

8. **US8 — Combiner les filtres**
  En tant que visiteur, je veux pouvoir appliquer plusieurs filtres en même temps (quartier + type, par exemple), afin d'affiner ma recherche.
9. **US9 — Découvrir le projet**
  En tant que visiteur, je veux pouvoir accéder à la présentation du projet, afin de connaître le développeur et le contexte du projet.
10. **US10 — Contacter le développeur**
  En tant que visiteur, je veux pouvoir contacter le développeur afin de demander des précisions ou proposer des partenariats.
11. **US11 — Filtrer par commune**
  En tant que visiteur, je veux pouvoir rechercher par commune ou par quartier afin de filtrer rapidement les résultats.

---

## 3. Fonctionnalités — Version 1 (MVP)

- Carte interactive comme vue **unique** de l'application (pas de vue tableau/liste)
- Comportement par défaut (aucun filtre actif) : affichage de la totalité des 480 fontaines, sur une vue englobant toute la ville de Toulouse
- **Clustering** des markers (nativement via MapLibre, GeoJSON source + clustering intégré) pour lisibilité selon le niveau de zoom
- Représentation visuelle différenciée des **markers** :
  - Fontaine isolée : pin avec puce de couleur selon le statut
  - Cluster de fontaines : badge rond numéroté
- **Filtres**, positionnés en bas d'écran (zone accessible au pouce, approche mobile-first) :
  - Quartier : accessible en filtre rapide via un dropdown, également modifiable depuis le volet de filtres (les deux restent synchronisés). Désactivé par défaut tant qu'aucune commune n'est sélectionnée, ou si la commune sélectionnée n'est pas Toulouse.
  - Commune, Type et Statut : disponibles dans le volet de filtres, ouvert via le bouton "Filtrer". Dépendance bidirectionnelle entre Commune et Quartier : sélectionner l'un filtre les options disponibles dans l'autre (ex: choisir une commune restreint la liste des quartiers à ceux de cette commune ; choisir un quartier renseigne automatiquement sa commune). Si Commune différente de Toulouse, quartier désactivé.
  - Lorsqu'un filtre Quartier ou Commune est appliqué, la carte recentre et zoome automatiquement sur la zone correspondante
  - Les filtres restent combinables entre eux (US8)
- **Détail d'une fontaine (US7)**, affiché au clic sur un marker : identifiant (ID), type, commune, quartier, localisation, adresse, statut
- Page About : présentation du projet (contexte, objectif, stack technique) et courte bio
- Page Contact : formulaire (nom, email, message) avec envoi via backend propre (Nodemailer)
- Ajout d'un routing client (React Router) pour naviguer entre la carte, About et Contact

---

## 4. Hors scope V1 (explicitement exclu, pour piloter le périmètre)

- Géolocalisation de l'utilisateur / recherche de proximité (nécessiterait PostGIS) → prévu en V2
- Authentification utilisateur
- Avis, notes, ou contributions utilisateurs
- Filtre par `territoire` (donnée conservée en base mais non exploitée en V1)

---

## 5. Modélisation de données

Deux tables, avec relation entre les fontaines et un référentiel de quartiers (recoupement du dataset fontaines avec le dataset officiel "Quartiers de proximité" de Toulouse Métropole, pour obtenir les noms de quartiers à partir des numéros).

```sql
CREATE TABLE quartiers (  
  numero      INTEGER PRIMARY KEY,   -- numéro de quartier (recoupé avec "Quartiers de proximité")
  nom         VARCHAR(255) NOT NULL
);

CREATE TABLE fontaines (
  id                INTEGER PRIMARY KEY,
  localisation      VARCHAR(255),
  type_font         VARCHAR(50),
  adresse           VARCHAR(255),
  commune           VARCHAR(20),
  statut            VARCHAR(20),
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  quartier_numero   INTEGER REFERENCES quartiers(numero)
);

CREATE INDEX idx_fontaines_quartier ON fontaines(quartier_numero);
CREATE INDEX idx_fontaines_type ON fontaines(type_font);
CREATE INDEX idx_fontaines_statut ON fontaines(statut);
```

**Champs du dataset source non repris :**

- `geo_shape` : redondant avec `geo_point`, non nécessaire pour un point fixe (V1 sans PostGIS)

- `territoire` : conservé conceptuellement mais non modélisé comme filtre en V1 (regroupement de niveau supérieur aux quartiers, non prioritaire)

---

## 6. Architecture technique

| Couche | Techno |
| --- | --- |
| Frontend | React + TypeScript + MapLibre GL JS + Clustering via MapLibre (GeoJSON source + clustering intégré) + SCSS |
| Fond de carte | style Positron via openmaptiles.geo.data.gouv.fr (Etalab, gratuit, basé sur OSM) |
| Backend | Node.js + Express |
| Base de données | PostgreSQL (sans extension PostGIS en V1) |
| CI | GitHub Actions |
| CD | Déploiement sur VPS dédié |
| Conteneurisation | Docker Compose (frontend, backend, PostgreSQL) |

- Stack de gestion des design tokens : Tokens Studio (Figma) → format DTCG (tokens.json) → Style Dictionary (@tokens-studio/sd-transforms) → CSS custom properties (variables.css)
- Routing : React Router
- Contact : route POST /contact sur le backend Express, envoi via Nodemailer (SMTP à définir — Gmail, OVH, ou autre selon ce que tu as déjà comme adresse sylys.dev)
- Validation serveur des champs (email valide, champs requis)
- Anti-spam basique à prévoir (honeypot simple)
- Gestion d'état V1 : state local React (useState), simple et suffisant pour le scope. Migration vers Redux Toolkit envisagée en V2 (objectif pédagogique)

---

## 7. Endpoints API (V1)

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/fontaines` | Liste toutes les fontaines |
| GET | `/fontaines/:id` | Détail d'une fontaine |
| GET | `/fontaines?commune=X&quartier=Y&type=Z&statut=W` | Fontaines filtrées |
| GET | `/quartiers` | Liste des quartiers (id + nom) |
| POST | `/contact` | Envoi du formulaire de contact (nom, email, message) |

---

## 8. CI/CD & Déploiement

**CI (GitHub Actions), déclenché sur push/PR :**

- Lint (ESLint)
- Tests (si écrits)
- Build (frontend + backend)

**CD, déclenché sur push vers `main` :**

- Connexion SSH vers le VPS dédié
- Déploiement via Docker Compose

**Sécurité du VPS (dès la mise en place, tirée des retours d'expérience sur le projet Breco) :**

- Clé SSH dédiée en ED25519 (pas de mot de passe)
- Fail2ban installé
- Firewall (UFW) configuré de manière restrictive

---

## 9. Critères pour la V1

- [ ] Navigation entre les 3 pages (carte/About/Contact) opérationnelle
- [ ] Page About accessible et à jour
- [ ] Carte fonctionnelle affichant les ~480 fontaines avec clustering
- [ ] Filtres (commune, quartier, type, statut) opérationnels, avec dépendance bidirectionnelle commune/quartier
- [ ] Détail d'une fontaine accessible au clic
- [ ] API backend fonctionnelle et connectée à PostgreSQL
- [ ] Pipeline CI passant (lint, build)
- [ ] Déploiement effectif sur le VPS, application accessible en ligne
- [ ] Formulaire de contact fonctionnel (envoi + validation + retour visuel à l'utilisateur)
- [ ] README complet (contexte, stack, installation, captures d'écran)

---

## 10. Pistes V2

- Géolocalisation de l'utilisateur + recherche de proximité (PostGIS)
- Recherche d'adresse/rue (géocodage, ex: API Adresse ou Nominatim), couplée à la géolocalisation
- Déploiement automatisé plus poussé (staging/production)
- Migration de la gestion d'état (filtres, données fontaines) vers Redux Toolkit (objectif pédagogique, montée en compétence)
