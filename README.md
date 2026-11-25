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

## Etat M0

M0 fournit le socle reproductible, mais pas de données métier, GeoJSON ni questionnaire approuvé.
Les routes indicateurs/zones retournent une erreur explicite sans succès vide.
Les routes baromètre retournent HTTP 503 et ne créent jamais `data/barometre/reponses.csv`.

## Sources locales

`dictionnaire_indicateurs.csv` et `donnees_longues.csv` sont présents sous `data/raw/`
et ignorés par Git. Ne pas les committer. Les shapefiles/cartes ne sont pas livrés au dépôt.