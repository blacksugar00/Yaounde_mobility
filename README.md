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

**M1 est atteint sur `main`** : les sept jeux JSON et le GeoJSON P1 sont livrés,
les routes P3 les servent, le graphique de population de la page Rétrospective
lit les données réelles par l'API, et `docker compose build` réussit. Les autres
graphiques de démonstration sont identifiés comme données de test; la page Carte
reste à réaliser dans le périmètre M2.

Le baromètre proposé de 17 questions est décrit dans
[`docs/contrat_barometre.md`](docs/contrat_barometre.md). Il reste désactivé;
ses routes retournent HTTP 503 et ne créent pas `data/barometre/reponses.csv`
avant validation complète.

## Sources locales

Les sept JSON d'indicateurs et `data/geojson/zones_population.geojson` sont
livrés dans le dépôt. Les sources CSV brutes (`dictionnaire_indicateurs.csv` et
`donnees_longues.csv`) restent locales sous `data/raw/` et ignorées par Git; ne
pas les committer.