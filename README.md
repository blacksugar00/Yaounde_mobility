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

M0 technique est **PASS**; le bootstrap est terminé et n'est plus une tâche à refaire.
La branche `init/bootstrap` attend revue/fusion dans `main` via PR humaine. Le PR
n'implique pas que le questionnaire soit approuvé.
Les routes indicateurs/zones retournent une erreur explicite sans succès vide.
Le baromètre proposé de 17 questions est décrit dans
[`docs/contrat_barometre.md`](docs/contrat_barometre.md). Il reste désactivé;
ses routes retournent HTTP 503 et ne créent pas `data/barometre/reponses.csv`
avant validation complète.

## Sources locales

`dictionnaire_indicateurs.csv` et `donnees_longues.csv` sont présents sous `data/raw/`
et ignorés par Git. Ne pas les committer. Les shapefiles/cartes ne sont pas livrés au dépôt.