<div align="center">
  <h1>Observatoire de la mobilité de Yaoundé</h1>
  <p>Application Flask + React/Vite pour les indicateurs, la carte et le baromètre participatif.</p>
</div>

## Demarrage local

```bash
cd web
npm ci
npm run dev
```

Dans un autre terminal :

```bash
cd api
python -m pip install -r requirements.txt
python -m flask --app app run --port 5000
```

Le proxy Vite envoie `/api` vers `http://localhost:5000`.

## Docker

```bash
docker compose config
docker compose up --build
```

L'application est ensuite disponible sur `http://localhost:5000`.

## Routes API

| Route | Rôle |
|---|---|
| `GET /api/sante` | État du service |
| `GET /api/indicateurs`, `GET /api/indicateurs/<code>?scenario=` | Catalogue (88 indicateurs) et séries |
| `GET /api/zones?annee=2018\|2025\|2035` | 105 zones avec population |
| `GET /api/geojson/<couche>` | Couches SIG : `zones_population`, `reseau_bus`, `projets_voirie`, `projets_tp`, `gares`, `carrefours` |
| `GET /api/barometre/questions`, `POST /api/barometre`, `GET /api/barometre/resultats` | Baromètre (17 questions, agrégats masqués si k < 5) |
| `GET /api/export/indicateurs.csv[?scenario=]` | Export de tous les indicateurs (CSV UTF-8) |
| `GET /api/export/indicateurs/<code>.csv[?scenario=]` | Export d'un indicateur |
| `GET /api/export/geojson/<couche>.geojson` | Téléchargement d'une couche SIG |

Les réponses individuelles du baromètre ne sont jamais exportées.

## Tests

```bash
python -m unittest discover -s api/tests -v
cd web && npm run lint && npm run build
```

## Etat des jalons

| Jalon | Statut |
|---|---|
| M0 — Socle technique | PASS, fusionné dans `main` |
| M1 — Données, API, premier graphique | PASS : 7 JSON, 88 indicateurs, GeoJSON 105 zones, premier build Docker |
| M2 — Parcours bout en bout | PASS : baromètre 17 questions et CSV, page Résultats ($k \ge 5$), carte Leaflet |
| M3 — Noyau F1 à F10 | PASS : Rétrospectif et Prospectif sur données réelles (F2, F5, F6, F7), carte 2018/2025/2035 et 5 couches d'infrastructures (F3, F4), Méthodologie (F10) |
| M4 — Export et image | EN COURS : export CSV/GeoJSON (F11/F12) livré dans l'API et la page Méthodologie ; `docker compose up --build` à revalider avec les nouvelles couches |
| M5 — Prêt pour la démo | À faire le ven. 27 : test mobile/navigateurs, répétition |

Contrôle de fidélité : les 5 561 points exportés (88 indicateurs) ont été comparés à
`data/raw/donnees_longues.csv` par code, année et scénario, avec 0 écart.

## Sources locales

Les sept JSON d'indicateurs et `data/geojson/zones_population.geojson` sont
livrés dans le dépôt. Les sources CSV brutes (`dictionnaire_indicateurs.csv` et
`donnees_longues.csv`) restent locales sous `data/raw/` et ignorées par Git; ne
pas les committer.