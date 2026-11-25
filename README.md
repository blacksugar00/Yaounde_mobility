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

## Etat des jalons

**M0 est PASS et fusionné dans `main`**. Le bootstrap est terminé et n'est plus
une tâche à refaire.

**M1 est validé et fusionné dans `main`** : les sept jeux JSON d'indicateurs et le
GeoJSON 105 zones de P1 sont livrés, les routes P3 les servent (88 indicateurs catalogués),
le graphique de population de la page Rétrospective lit les données réelles par l'API,
et le premier build Docker réussit (~213 Mo).

**M2 est EN COURS** :
- **Baromètre participatif validé et activé** (P3) : 17 questions à choix fermés, 105 quartiers
  officiels issus du GeoJSON, texte de consentement validé. Formulaire citoyen opérationnel sur
  `/participatif`, persistance CSV dans `data/barometre/reponses.csv` et page `/resultats`
  avec agrégats anonymisés et masquage des petites cellules ($k \ge 5$).
- **Visualisations graphiques** (P3/P2) : refonte entreprise de `ChartCard.jsx` (support `line`,
  `bar`, `pie`, badges de statut mesuré/estimé/projeté, infobulles sombres haute précision).
- **Cartographie et couches SIG** (P1/P2) : intégration du composant Leaflet `MapView.jsx`
  dans `Carte.jsx` (population 2018) et préparation des couches géographiques d'infrastructures
  et de voirie (F4).

**Périmètre M3 / M4 confirmé** :
Toutes les fonctionnalités cibles sont intégrées à la feuille de route :
- **F4** (Couches SIG infrastructures & voirie sur la carte).
- **F6** (Parts modales prospectives réelles via `parts_modales.json`).
- **F7** (Émissions GES et temps de parcours réels via `ges.json` et `temps.json`).
- **F11/F12** (Téléchargement et export des données ouvertes).

## Sources locales

Les sept JSON d'indicateurs et `data/geojson/zones_population.geojson` sont
livrés dans le dépôt. Les sources CSV brutes (`dictionnaire_indicateurs.csv` et
`donnees_longues.csv`) restent locales sous `data/raw/` et ignorées par Git; ne
pas les committer.