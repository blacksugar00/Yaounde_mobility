<div align="center">
  <h1>Observatoire de la mobilité urbaine de Yaoundé</h1>
  <p>Application web Flask + React/Vite : indicateurs rétrospectifs et prospectifs,
  cartographie des quartiers et des infrastructures, baromètre citoyen anonyme.</p>
  <p><em>Hackathon de la Semaine de la Mobilité Durable à Yaoundé (SMDY), 24–27 novembre 2026 ·
  données de la Communauté Urbaine de Yaoundé (CUY) et des études DVDH.</em></p>
</div>

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Architecture](#architecture)
3. [Démarrage local](#démarrage-local)
4. [Docker](#docker)
5. [Préparation des données](#préparation-des-données)
6. [Routes API](#routes-api)
7. [Interface](#interface)
8. [Tests et contrôles](#tests-et-contrôles)
9. [Structure du dépôt](#structure-du-dépôt)
10. [Données, sources et confidentialité](#données-sources-et-confidentialité)
11. [État des jalons](#état-des-jalons)
12. [Limites connues](#limites-connues)
13. [Équipe et documentation](#équipe-et-documentation)

## Fonctionnalités

| # | Fonctionnalité | Page | État |
|---|---|---|---|
| F1 | Accueil : présentation et accès aux quatre volets | `/` | Livré |
| F2 | Rétrospectif 2000–2025 : population, parts modales, parc, motorisation | `/retrospectif` | Livré |
| F3 | Carte de population des 105 quartiers (2018, 2025, 2035) | `/carte` | Livré |
| F4 | Couches d'infrastructures : réseau de bus, projets de voirie et de transport public, gares, carrefours | `/carte` | Livré |
| F5 | Comparateur de scénarios 2026–2036 (tendanciel, volontariste, rupture) | `/prospectif` | Livré |
| F6 | Parts modales prospectives | `/prospectif` | Livré |
| F7 | Émissions de GES et temps de déplacement | `/prospectif` | Livré |
| F8 | Baromètre citoyen : 17 questions facultatives, consentement, parcours par étapes | `/participatif` | Livré |
| F9 | Résultats agrégés du baromètre, masquage des petites cellules ($k \ge 5$) | `/resultats` | Livré |
| F10 | Méthodologie, scénarios, FAQ, mentions légales, licences | `/methodologie` | Livré |
| F11/F12 | Téléchargement des indicateurs (CSV) et des couches géographiques (GeoJSON) | `/methodologie#licences` | Livré |

Principes respectés partout : aucune valeur n'est recalculée ni inventée, une valeur
absente reste « non disponible » (jamais zéro), et chaque point garde son scénario,
son statut et son origine (valeur source, interpolée, extrapolée, recalculée ou hypothèse).

## Architecture

```text
data/raw/*.csv, *.shp  (local, non versionné)
   └─ scripts/preparer_*.py ─► data/indicateurs/*.json (7 thèmes, 88 indicateurs)
                               data/geojson/*.geojson   (105 zones + 5 couches)
        └─ api/  Flask : lecture, validation, cache ─► /api/*
             └─ web/  React + Vite + Chart.js + Leaflet ─► 7 pages

Formulaire React ──POST /api/barometre──► data/barometre/reponses.csv
Page Résultats   ◄─GET /api/barometre/resultats── agrégats anonymes uniquement

Docker : Vite compile React dans api/static/, Gunicorn sert l'API et l'interface sur :5000
```

Il n'y a ni base de données ni compte utilisateur : l'API sert des fichiers préparés,
et le seul fichier écrit à l'exécution est le CSV des réponses du baromètre.

## Démarrage local

Prérequis : Python 3.11+, Node.js 20+.

```bash
# Terminal 1 — API Flask
python -m venv .venv && source .venv/bin/activate
pip install -r api/requirements.txt
cd api && flask --app app run --debug --port 5000

# Terminal 2 — interface Vite
cd web
npm ci
npm run dev
```

Ouvrir `http://localhost:5173`. Le proxy Vite transmet `/api` à `http://localhost:5000`.

Pour servir l'interface compilée directement par Flask (comme en production) :
`cd web && npm run build`, puis ouvrir `http://localhost:5000`.

## Docker

```bash
printf 'LOCAL_UID=%s\nLOCAL_GID=%s\n' "$(id -u)" "$(id -g)" > .env
docker compose config
docker compose up --build
```

L'application est servie sur `http://localhost:5000`.

- Image multi-étapes : Node 20 compile le front, Python 3.11-slim exécute Gunicorn ;
  GeoPandas n'est pas dans l'image (préparation des données uniquement).
- `data/indicateurs` et `data/geojson` sont montés en lecture seule,
  `data/barometre` en écriture pour conserver les réponses entre deux redémarrages.
- Variable : `BAROMETRE_CSV` (par défaut `/app/data/barometre/reponses.csv`).

## Préparation des données

Les fichiers JSON et GeoJSON sont déjà livrés dans le dépôt. Pour les régénérer à
partir des sources brutes placées dans `data/raw/` :

```bash
pip install -r scripts/requirements.txt
python scripts/preparer_donnees.py   # donnees_longues.csv -> data/indicateurs/*.json
python scripts/preparer_zones.py     # Noms_zones.shp      -> data/geojson/zones_population.geojson
```

Les cinq couches d'infrastructures (`reseau_bus`, `projets_voirie`, `projets_tp`,
`gares`, `carrefours`) ont été exportées directement en GeoJSON (WGS84) depuis les
couches SIG de la CUY ; aucun script de régénération n'est versionné pour elles.

## Routes API

| Route | Rôle | Erreurs |
|---|---|---|
| `GET /api/sante` | État du service : `{"statut":"ok"}` | — |
| `GET /api/indicateurs` | Catalogue `[{code, libelle, unite}]` (88 indicateurs) | 503 si données absentes |
| `GET /api/indicateurs/<code>?scenario=` | Fiche et séries d'un indicateur | 404 code ou scénario inconnu |
| `GET /api/zones?annee=2018\|2025\|2035` | 105 zones avec population | 400 année invalide |
| `GET /api/geojson/<couche>` | Couches : `zones_population`, `reseau_bus`, `projets_voirie`, `projets_tp`, `gares`, `carrefours` | 404 couche inconnue |
| `GET /api/barometre/questions` | 17 questions, options et texte de consentement | — |
| `POST /api/barometre` | `{consentement: true, reponses: {cle: valeur}}`, HTTP 201 | 400 consentement ou valeur invalide |
| `GET /api/barometre/resultats` | `{total, agregats}` ; distribution masquée si une catégorie < 5 | — |
| `GET /api/export/indicateurs.csv[?scenario=]` | Tous les indicateurs en CSV UTF-8 | 503 si données absentes |
| `GET /api/export/indicateurs/<code>.csv[?scenario=]` | Un indicateur en CSV | 404 |
| `GET /api/export/geojson/<couche>.geojson` | Téléchargement d'une couche | 404 |

Les réponses individuelles du baromètre ne sont jamais exposées ni exportées.
Contrat détaillé : [docs/contrat_barometre.md](docs/contrat_barometre.md).

## Interface

| Page | Contenu |
|---|---|
| Accueil | Photo de Yaoundé, quatre cartes d'accès (Tendances historiques, Projections, Cartographie, Baromètre) |
| Rétrospectif | Population, parts modales aux années de référence, parc de véhicules, motorisation |
| Prospectif | Choix du thème et de l'indicateur, scénarios activables, zoom sur 2018–2036 |
| Carte | Couches activables, année de population, filtre d'horizon des projets, infobulle de tranche de population au survol |
| Baromètre | Onglets Participatif (questionnaire en 5 étapes avec progression) et Résultats |
| Méthodologie | Sources, scénarios, statut des données, FAQ, mentions légales, licences et téléchargements |

Charte : palette institutionnelle (vert, ocre, rouge), titres en Source Serif 4, texte
en Inter, couleurs des scénarios fixées par le [Contrat D](web/CONTRAT_D.md).
Responsive vérifié de 390 px à 1366 px. Détails techniques : [web/README.md](web/README.md).

## Tests et contrôles

```bash
python -m unittest discover -s api/tests -v   # 19 tests : données, zones, couches, baromètre, export
cd web && npm run lint && npm run build
```

Contrôle de fidélité réalisé le 26 novembre 2026 : les 5 561 points exportés
(88 indicateurs) ont été comparés à `data/raw/donnees_longues.csv` par code, année et
scénario, avec 0 écart.

## Structure du dépôt

```text
api/
  app.py                 fabrique Flask, routes /api et service du build React
  routes/                indicateurs, zones et couches, baromètre, export
  services/              chargement/validation des données, schéma du baromètre
  tests/                 tests unittest et fixtures
web/
  src/pages/             Accueil, Retrospectif, Prospectif, Carte, Barometre,
                         Participatif, Resultats, Methodologie
  src/components/        ChartCard, IndicatorChart, StackedBarChart,
                         MultiIndicatorChart, MapView, palette
  src/index.css          charte et classes partagées
data/
  indicateurs/           7 JSON d'indicateurs
  geojson/               zones de population et 5 couches d'infrastructures
  barometre/             réponses CSV (ignorées par Git)
scripts/                 préparation des données (pandas, GeoPandas)
docs/                    guides d'équipe, contrat du baromètre, cahier des charges
Dockerfile, docker-compose.yml
```

## Données, sources et confidentialité

- Sources et droits : [SOURCES.md](SOURCES.md).
- `data/raw/` (CSV et shapefiles bruts) reste local et ignoré par Git.
- `data/barometre/reponses.csv` est ignoré par Git : ne jamais committer de réponses.
- Le baromètre ne collecte aucune donnée directement identifiante ; les résultats ne
  publient que des agrégats, masqués dès qu'une catégorie compte moins de 5 réponses.
- Les réponses du hackathon sont des données de test, sans valeur représentative.

## État des jalons

| Jalon | Statut |
|---|---|
| M0 — Socle technique | Atteint |
| M1 — Données, API, premier graphique | Atteint : 7 JSON, 88 indicateurs, GeoJSON 105 zones, premier build Docker |
| M2 — Parcours de bout en bout | Atteint : baromètre 17 questions et CSV, résultats ($k \ge 5$), carte Leaflet |
| M3 — Noyau F1 à F10 | Atteint : données réelles partout, carte multi-années et 5 couches, méthodologie |
| M4 — Export et image | Export F11/F12 livré ; `docker compose up --build` à revalider avec la version finale |
| M5 — Prêt pour la démo | Interface finalisée et vérifiée sur navigateur (bureau et mobile) |

## Limites connues

- Docker : la version finale n'a pas été reconstruite (accès Docker non disponible
  sur le poste de finalisation) ; à valider avant tout déploiement.
- Les scénarios sont des trajectoires de modèle ; la rupture n'existe que pour une
  partie des indicateurs et ses valeurs construites sont signalées « Hypothèse ».
- La population par zone ne varie pas selon les scénarios de transport.
- Le stockage des réponses est un CSV local : un hébergement sans disque persistant
  perdrait les réponses à chaque redéploiement.
- Les cinq couches d'infrastructures n'ont pas de script de régénération versionné.

## Équipe et documentation

Réalisation : étudiants-ingénieurs de l'ENSPY — NJOME David, EYEBE EYEBE Miguel,
KIKI Daniel Bryan, KOUCHE NGAMENI Arron. Partenaires : CUY, DVDH, Union européenne,
Oslandia.

| Document | Contenu |
|---|---|
| [Guide d'exécution](docs/Guide_execution_observatoire_mobilite_Yaounde.md) | Référence d'équipe : périmètre, contrats, jalons, critères d'acceptation |
| [Guide P1](docs/Guide_P1_Donnees_SIG_Docker.md) | Données, SIG, carte et Docker |
| [Guide P2](docs/Guide_P2_Frontend_Graphiques.md) | Interface, pages et graphiques |
| [Guide P3](docs/Guide_P3_API_Barometre_Coordination.md) | API, baromètre et coordination |
| [Contrat du baromètre](docs/contrat_barometre.md) | Questions, valeurs, routes, anonymisation |
| [Contrat D](web/CONTRAT_D.md) | Composant `ChartCard` et palette des scénarios |
| [SOURCES.md](SOURCES.md) | Origine et statut des données |
