# Guide individuel P1 — Donnees, SIG, carte et Docker

**Projet :** Observatoire de la mobilite urbaine de Yaounde
**Perimetre :** preparation des donnees, GeoJSON, composant Leaflet, image Docker et deploiement
**Branche de fonctionnalite :** `p1-data`
**Document socle :** [Plan technique d'execution](./Guide_execution_observatoire_mobilite_Yaounde.md)

Ce guide est a lire apres le cadrage commun et avant de coder sur la branche
personnelle. Le plan technique reste l'autorite pour les decisions communes;
ce guide explique votre parcours concret, ses livrables et les moments ou vous
devez vous synchroniser avec P2 et P3.

---

## 1. Votre mission et les limites de votre perimetre

Vous rendez les donnees fournies exploitables sans changer leur sens, fournissez
la carte des populations par zone et livrez une image Docker demonstrable.
Vous ne possedez ni les routes Flask, ni le layout React, ni les graphiques
Chart.js, ni le questionnaire.

### Vous possedez

| Fichier / livrable | Resultat attendu |
|---|---|
| `SOURCES.md` | Provenance, nom des sources, licence/autorisation connue et limites SIG |
| `scripts/preparer_donnees.py` | Validation des deux CSV et export des JSON utiles |
| `scripts/preparer_zones.py` | Export des polygones population en GeoJSON WGS84 |
| `data/indicateurs/*.json` | Sept themes de donnees, si la redistribution est autorisee |
| `data/geojson/zones_population.geojson` | 105 zones; quatre proprietes requises et `id_zone` facultatif |
| `web/src/components/MapView.jsx` | Carte Leaflet; le selecteur d'annee appartient a P2 |
| `Dockerfile`, `docker-compose.yml`, `.dockerignore` | Build multi-stage et test de l'application complete |
| Deploiement/captures | Publication seulement si les acces et le stockage sont disponibles |

### Vous ne modifiez pas sans accord de l'equipe

- `api/` et les routes Flask : proprietaire P3.
- `web/src/App.jsx`, `Layout.jsx`, `ChartCard.jsx`, les pages et styles : P2,
  sauf `MapView.jsx`, qui est votre composant.
- `web/src/pages/Carte.jsx` : P2 l'integre et lui passe `geojson` et `year`.
- Le contrat JSON/GeoJSON, l'API et les props ChartCard : changements communs,
  annonces au sync avant toute modification.
- Le schema des questions : il vient de l'organisation; P3 le recueille.

Le dossier de reference est en lecture seule pour cette realisation.
Le depot de travail existe déjà sous le nom `Yaounde_mobility`; les noms Docker
et applicatifs `observatoire-yaounde` / `observatoire` restent inchangés.

---

## 2. M0 terminé — synchroniser `main` avant le travail P1

**M0 technique est PASS et fusionné dans `main`; le bootstrap n'est plus à
réaliser.** Synchronisez `main` avant de créer ou reprendre votre branche P1.

Depuis le dossier parent du dépôt :

```bash
cd Yaounde_mobility
git status --short
git fetch origin
git switch main
git pull --ff-only origin main
# Première création :
git switch -c p1-data
# Si p1-data existe déjà : utilisez plutôt `git switch p1-data`.
git status --short --branch
```

Si une branche P1 déjà existante n'est pas à jour avec `main`, inspectez les
divergences avant intégration; ne forcez ni ne réécrivez son historique.

### Configuration locale P1

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r scripts/requirements.txt -r api/requirements.txt
```

Les sources brutes peuvent être copiées localement dans `data/raw/` depuis les
remises autorisées si elles ne sont pas déjà présentes. Vérifiez seulement les
noms; ne les ajoutez jamais à Git. Les sources cartographiques restent à
confirmer/livrer par P1 avant préparation du GeoJSON. Pour tester Compose avec
l'utilisateur courant :

```bash
export LOCAL_UID="$(id -u)"
export LOCAL_GID="$(id -g)"
docker compose config
```

Vérifiez votre identité Git avant tout commit :

```bash
git config user.name "Votre nom GitHub"
git config user.email "Votre adresse e-mail GitHub (ou noreply)"
git var GIT_AUTHOR_IDENT
```

### Suite des tâches P1

Le bootstrap, les ignore rules et le Compose M0 sont déjà présents. Passez aux
tâches P1 de validation des deux CSV locaux, vérification des sources/CRS SIG
et préparation autorisée des indicateurs/GeoJSON. Ne générez pas ces sorties
pendant une vérification M0 et ne fabriquez aucune donnée.
P1 doit également fournir les libellés de quartiers et leurs valeurs stables
depuis la source géographique approuvée; le contrat du baromètre est dans
[`contrat_barometre.md`](./contrat_barometre.md).

---

## 3. Contrats dont vous etes le producteur

### 3.1 Format JSON d'indicateur

Un theme est un fichier JSON contenant une liste d'indicateurs. Chaque
indicateur expose :

```json
{
  "code": "code exact du CSV",
  "libelle": "libelle valide dans le dictionnaire",
  "unite": "unite validee",
  "source": "donnees_longues.csv",
  "series": [
    {
      "scenario": "historique",
      "annee": 2000,
      "valeur": 1500000,
      "statut": "statut source",
      "origine": "fichier"
    }
  ]
}
```

Le code, le libelle, l'unite, l'annee, la valeur, le scenario, le statut et
l'origine proviennent des sources. Ne calculez ni interpolation, ni total GES,
ni scenario. Gardez les trous de donnees comme des absences de lignes; P2
convertira les points absents en `null` uniquement pour aligner Chart.js.

Themes cibles : `population`, `deplacements`, `parts_modales`, `parc`, `ges`,
`temps`, `corridors`. Le dernier est optionnel si les priorites produit sont en
retard. Le code `ges_total_recalcule` est le total GES a exposer; ne le
recomposez pas a partir des modes. Pour les parts modales, prenez les codes
`part_modale__*`, et non les valeurs arrondies.

### 3.2 Format GeoJSON

- Racine : `FeatureCollection`.
- CRS de sortie : EPSG:4326.
- Nombre attendu : 105 polygones; verifier la valeur reellement trouvee.
- `properties` contient `nom`, `pop_2018`, `pop_2025`, `pop_2035` et peut
  conserver l'identifiant source `id_zone`.
- Geometries simplifiees dans un CRS projete avant conversion en EPSG:4326.
- Aucun autre champ de propriété; ne jamais choisir silencieusement le premier
  champ qui ressemble a un nom.

Totaux de controle a comparer, sans les forcer : 3 212 283 en 2018, 4 028 468
en 2025 et 5 599 668 en 2035. Signalez les ecarts et conservez les valeurs
reelles.

### 3.3 Carte Leaflet

`MapView.jsx` recoit `geojson` et `year`. Il montre un fond OSM, une choroplethe,
une legende, une info-bulle sure (texte assaini) et une classe specifique pour
valeur absente. La page/selection d'annee est la responsabilite de P2.

---

## 4. Parcours par jalon, etapes et commits

Les commits ci-dessous sont une sequence proposee. Faites un commit atomique
apres une etape testable, pas un commit par fichier. Les messages peuvent etre
en anglais, comme dans le plan, mais restent descriptifs.

### Etape 1 — auditer les sources et leurs droits

**Etat :** le bootstrap M0 est terminé. Cette tâche P1 valide maintenant les
sources locales avant la préparation des sorties métier.
**Entrees :** les CSV déjà présents sous `data/raw/`, leurs métadonnées et les
références dans le plan d'analyse; les sources cartographiques restent à livrer.
**Sorties :** valeurs et noms controles, `SOURCES.md` renseigné.

Les CSV attendus sont déjà présents localement sous `data/raw/` dans cet
environnement. Pour un autre clone, placer les sources autorisées à ces chemins
sans les suivre dans Git; ne pas recopier une source cartographique non livrée.
Vérifier uniquement les noms de fichiers :

```bash
find data/raw -maxdepth 1 -type f -printf '%f\n' | sort
python - <<'PY'
import pandas as pd

data = pd.read_csv("data/raw/donnees_longues.csv", encoding="utf-8-sig")
dictionary = pd.read_csv(
    "data/raw/dictionnaire_indicateurs.csv",
    encoding="utf-8-sig",
)
print("lignes:", len(data))
print("codes:", data["code_indicateur"].nunique())
print("scenarios:", sorted(data["scenario"].dropna().unique()))
print("colonnes:", list(data.columns))
print("codes dictionnaire dupliques:",
      dictionary["code_indicateur"].duplicated().sum())
PY
```

Le CSV doit montrer 16 328 lignes de donnees et 311 codes. Si ce n'est pas le
cas, arretez l'export, annoncez le blocage a P2/P3 et demandez quel fichier est
la reference. Ne corrigez pas le jeu source a l'aveugle.

Ne copiez pas le classeur de l'organisation dans Git pour documenter la source.
Dans `SOURCES.md`, decrivez le nom du fichier, son organisme, sa date/version
connue, son usage, son autorisation de diffusion et les limites. S'il n'y a pas
d'autorisation, gardez depot et sorties dans un espace prive valide.

Le socle M0 a déjà ajouté `SOURCES.md` et les règles d'exclusion. Si l'audit P1
modifie les sources autorisées, ne commitez que la mise à jour documentaire
nécessaire; ne reprenez pas les fichiers d'infrastructure M0.

Ne faites jamais `git add data/raw/`.

### Etape 2 — preparer les JSON d'indicateurs

**Quand :** mercredi matin; livraison M1 avant 12 h 30.
**Depend de :** CSV/dictionnaire valides et autorisation de publier les sorties.
**Consommateurs :** P3 charge les fichiers; P2 les affiche via l'API.

Avant le script, verifier que les champs sources sont ceux du plan :

```python
import pandas as pd

data = pd.read_csv("data/raw/donnees_longues.csv", encoding="utf-8-sig")
REQUIRED = {
    "code_indicateur",
    "indicateur",
    "unite",
    "annee",
    "scenario",
    "valeur",
    "statut",
    "origine",
}

missing = REQUIRED - set(data.columns)
if missing:
    raise ValueError(f"Colonnes manquantes: {sorted(missing)}")
```

La logique complete de validation et d'export est dans la section 5.2 du plan
technique. Travaillez depuis cette version : validation des colonnes et doublons,
verification de l'unite/dictionnaire, choix explicite des codes prioritaires,
puis sortie deterministe dans `data/indicateurs/<theme>.json`. Remplacez tout
prefixe d'exemple par la liste de codes verifiee dans le dictionnaire. Le script
doit interrompre l'execution quand une source ou une unite est ambigue.

Executer et examiner les sorties :

```bash
source .venv/bin/activate
python scripts/preparer_donnees.py
python - <<'PY'
import json
from pathlib import Path

files = sorted(Path("data/indicateurs").glob("*.json"))
if len(files) < 6:
    raise SystemExit(f"Nombre de themes inattendu: {len(files)}")
for path in files:
    records = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(records, list):
        raise SystemExit(f"{path}: la racine doit etre une liste")
    for record in records:
        required = {"code", "libelle", "unite", "source", "series"}
        if not required <= record.keys():
            raise SystemExit(f"{path}: champs indicateur manquants")
        if not record["series"]:
            raise SystemExit(f"{path}: serie vide pour {record['code']}")
print("Themes valides:", [path.name for path in files])
PY
```

Controlez au moins huit indicateurs distincts, l'absence de doublons sur
`code/annee/scenario`, les valeurs numeriques, les unites et les scenarios.
Une rupture absente reste absente. Les annees intermediaires peuvent etre
interpolees dans la source; ne les recalculez pas. Si les sorties ne peuvent pas
etre publiees, ne les commitez pas : partagez-les par le transfert prive convenu
et notez la procedure dans README avec P3.

Commit si autorise :

```bash
git add scripts/preparer_donnees.py data/indicateurs/
git commit -m "Prepare validated indicator datasets"
```

Avant de pousser, relisez `git status --short` et `git diff --cached --stat`.

### Etape 3 — convertir les zones en GeoJSON

**Quand :** mercredi matin; livraison M1 avant 12 h 30.
**Depend de :** shapefile complet, CRS et champs verifiés.
**Consommateurs :** API zones par P3, carte par vous-meme, page Carte par P2.

La source peut ne pas avoir exactement le champ `nom`. Inspectez ses noms de
colonnes et le CRS avant de definir `ZONE_NAME_FIELD`. La version de
`scripts/preparer_zones.py` dans le plan technique constitue la base. Exemple
de garde obligatoire :

```python
import os
from pathlib import Path

import geopandas as gpd
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/raw/Noms_zones.shp"
OUTPUT = ROOT / "data/geojson/zones_population.geojson"
ZONE_NAME_FIELD = os.environ.get("ZONE_NAME_FIELD")
POP_FIELDS = ["pop_2018", "pop_2025", "pop_2035"]

zones = gpd.read_file(SOURCE)
print("CRS:", zones.crs)
print("Colonnes:", list(zones.columns))
print("Nombre de zones:", len(zones))
if not ZONE_NAME_FIELD:
    raise ValueError("Definir ZONE_NAME_FIELD apres inspection du shapefile.")
if zones.crs is None or not zones.crs.is_projected:
    raise ValueError("Un CRS projete connu est requis pour simplifier.")
required = {ZONE_NAME_FIELD, *POP_FIELDS}
missing = required - set(zones.columns)
if missing:
    raise ValueError(f"Champs manquants: {sorted(missing)}")
if len(zones) != 105:
    raise ValueError(f"105 zones attendues; {len(zones)} trouvees.")

output = zones[[ZONE_NAME_FIELD, *POP_FIELDS, "geometry"]].rename(
    columns={ZONE_NAME_FIELD: "nom"}
)
for field in POP_FIELDS:
    numeric = pd.to_numeric(output[field], errors="coerce")
    invalid = output[field].notna() & numeric.isna()
    if invalid.any():
        raise ValueError(f"Valeurs non numeriques dans {field}.")
    output[field] = numeric

output.geometry = output.geometry.simplify(
    tolerance=10,
    preserve_topology=True,
)
output = output.to_crs("EPSG:4326")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
output.to_file(OUTPUT, driver="GeoJSON", encoding="utf-8")
for field in POP_FIELDS:
    print(field, "total:", output[field].sum())
```

`ZONE_NAME_FIELD` doit contenir le nom réel observe, pas une supposition. En
tant que fichier complet, ajoutez les controles numeriques et les sommes avant
l'ecriture; utilisez le script final de la section 5.4 du plan.

Controle sortie :

```bash
python scripts/preparer_zones.py
python - <<'PY'
import json
from pathlib import Path

path = Path("data/geojson/zones_population.geojson")
geojson = json.loads(path.read_text(encoding="utf-8"))
assert geojson["type"] == "FeatureCollection"
assert len(geojson["features"]) == 105
required = {"nom", "pop_2018", "pop_2025", "pop_2035"}
for feature in geojson["features"]:
    properties = set(feature["properties"])
    assert properties in (required, required | {"id_zone"})
print("GeoJSON conforme:", len(geojson["features"]), "zones")
PY
```

Verifiez CRS WGS84 et les totaux de population; rapportez les ecarts, ne les
forcez pas. Poussez les sorties uniquement si leur diffusion est autorisee.

Commit :

```bash
git add scripts/preparer_zones.py data/geojson/
git commit -m "Export simplified population zones"
```

### Etape 4 — livrer `MapView.jsx`

**Quand :** mercredi apres-midi pour 2018; jeudi matin pour 2018/2025/2035.
**Depend de :** contrat GeoJSON, P3 `GET /api/zones`, page `Carte.jsx` de P2.

Commencez par un composant autonome. P2 ajoutera le selecteur et fera l'appel
API. Gardez la popup en DOM texte, pas en HTML fabrique avec les proprietes.

```jsx
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const POPULATION_FIELD = {
  2018: "pop_2018",
  2025: "pop_2025",
  2035: "pop_2035",
};

const BREAKS = [10000, 25000, 50000, 100000];
const COLORS = ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"];

function colorFor(value) {
  if (value == null || !Number.isFinite(Number(value))) return "#bdbdbd";
  const index = BREAKS.findIndex((limit) => Number(value) < limit);
  return COLORS[index < 0 ? COLORS.length - 1 : index];
}

function bindPopup(feature, layer, year) {
  const properties = feature.properties ?? {};
  const popup = document.createElement("div");
  const name = document.createElement("strong");
  const value = properties[POPULATION_FIELD[year]];
  const detail = document.createElement("div");
  name.textContent = properties.nom ?? "Zone sans nom";
  detail.textContent = value == null
    ? `Population ${year} : non disponible`
    : `Population ${year} : ${Number(value).toLocaleString("fr-FR")}`;
  popup.append(name, detail);
  layer.bindPopup(popup);
}

export default function MapView({ geojson, year }) {
  const field = POPULATION_FIELD[year];
  if (!field) throw new RangeError(`Annee de carte invalide: ${year}`);

  const style = (feature) => ({
    fillColor: colorFor(feature.properties?.[field]),
    color: "#333333",
    weight: 1,
    fillOpacity: 0.7,
  });

  return (
    <div>
      <MapContainer
        center={[3.848, 11.502]}
        zoom={10}
        style={{ height: 500, width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {geojson && (
          <GeoJSON
            key={year}
            data={geojson}
            style={style}
            onEachFeature={(feature, layer) => bindPopup(feature, layer, year)}
          />
        )}
      </MapContainer>
      <ul aria-label={`Legende population ${year}`} className="map-legend">
        <li><span style={{ backgroundColor: COLORS[0] }} /> Moins de 10 000</li>
        <li><span style={{ backgroundColor: COLORS[1] }} /> 10 000–24 999</li>
        <li><span style={{ backgroundColor: COLORS[2] }} /> 25 000–49 999</li>
        <li><span style={{ backgroundColor: COLORS[3] }} /> 50 000–99 999</li>
        <li><span style={{ backgroundColor: COLORS[4] }} /> 100 000 et plus</li>
        <li><span style={{ backgroundColor: "#bdbdbd" }} /> Non disponible</li>
      </ul>
    </div>
  );
}
```

La simplification garde la topologie; les seuils sont des classes visuelles
provisoires, non des classes statistiques. P2 doit confirmer qu'ils sont
lisibles. Toute tuile OSM conserve l'attribution visible. Le parent fournit une
hauteur explicite et affiche ses propres etats de chargement/erreur.

Commit mercredi, puis commit d'amelioration jeudi :

```bash
git add web/src/components/MapView.jsx
git commit -m "Add population map for 2018"
git push -u origin p1-data
```

Avant M2, demandez a P2 de brancher le composant, et a P3 de confirmer la route.
Ne modifiez pas `Carte.jsx` pour corriger l'integration; communiquez le contrat
de props `geojson` et `year`.

### Etape 5 — image Docker complete et stockage de test

**Etat :** Dockerfile/Compose M0 sont déjà présents; premier build complet mercredi matin;
`docker compose up --build` complet jeudi apres-midi.
**Depend de :** `api/`, `web/`, sorties de donnees autorisees et stockage CSV
configuré par P3.

Le contrat est un service : stage Node compile Vite dans `api/static/`, stage
Python sert le build et l'API sur le port 5000. Gardez GeoPandas et le shapefile
hors image runtime. Le Dockerfile complet et Compose de reference sont en
section 8 du plan. Points a ne pas modifier sans accord :

- Vite `outDir` : `../api/static`.
- runtime : `gunicorn` et `app:create_app()`.
- `data/indicateurs` et `data/geojson` lecture seule dans Compose.
- `data/barometre` lecture/ecriture dans Compose seulement quand le questionnaire
  est configure.
- `.env` local ignore avec `LOCAL_UID` et `LOCAL_GID`.

Sur Linux, apres clone, avant Compose :

```bash
printf 'LOCAL_UID=%s\nLOCAL_GID=%s\n' "$(id -u)" "$(id -g)" > .env
docker compose config
```

Quand P1 livre les assets et P3 a active le schema, construire puis tester :

```bash
python scripts/preparer_donnees.py
python scripts/preparer_zones.py
docker compose up --build
```

Dans un second terminal :

```bash
curl -fsS http://localhost:5000/api/sante
curl -fsS http://localhost:5000/api/indicateurs
curl -fsS 'http://localhost:5000/api/zones?annee=2018'
curl -fsS http://localhost:5000/
```

Tester la persistance du barometre avec P3 : soumettre une reponse de test,
verifier le CSV local, arreter puis relancer Compose et verifier le total
agregé. Le CSV ne rejoint jamais Git. L'image doit faire moins de 500 Mo;
si elle depasse, inspectez `.dockerignore`, les couches et les dependances,
sans ajouter GeoPandas au runtime.

Commit Docker seulement apres un build reel reussi :

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "Package application with Docker Compose"
git push origin p1-data
```

---

## 5. Vos commits et les merges d'equipe

### 5.1 Cadence de commits recommandee

| Commit | Contenu | Porte de validation |
|---|---|---|
| M0 terminé | PASS et fusionné dans `main`; ne pas refaire le bootstrap | Fetch/pull `main`, puis travailler sur `p1-data` |
| P1-1 | Audit et documentation des sources | Totaux et colonnes traces; aucun brut suivi |
| P1-2 | Script indicateurs et JSON autorises | Au moins huit indicateurs, structure valide, sources conformes |
| P1-3 | Script GeoJSON et couche | 105 zones, champs exacts, EPSG:4326, sommes controlees |
| P1-4 | `MapView.jsx` population 2018 | Carte, legend, popup, valeur manquante |
| P1-5 | Selecteur rendu avec P2 et trois annees | Les 3 champs changent, total/limite documentes |
| P1-6 | Dockerfile/Compose et corrections | Build, routes, page, CSV ecrivable et persistant localement |

Exemple pour le commit du script indicateurs :

```bash
git status --short
git diff --check
git diff --stat
git add scripts/preparer_donnees.py
git commit -m "Prepare validated indicator datasets"
git push origin p1-data
```

### 5.2 Comment votre travail arrive dans `main`

1. Vous poussez `p1-data` avant le sync de 12 h 30 ou 17 h 30.
2. Vous montrez le script, les sorties/controle, la carte ou le build; pas
   uniquement une capture.
3. P2 et P3 confirment qu'ils peuvent lire le JSON/GeoJSON via les contrats.
4. P3 coordonne l'integration. Si l'equipe utilise une forge, ouvrir une PR
   `p1-data` vers `main`; sinon P3 integre depuis une revision/test approuvee.
5. L'ordre M1 est P1 (assets) puis P3 (routes) puis P2 (visualisation), si les
   dependances imposent cet ordre. A chaque merge, relancer le gate adequat.
6. Apres le merge, synchronisez votre branche avec `main` :

```bash
git fetch origin
git switch p1-data
git merge origin/main
```

Resolvez uniquement les conflits de vos fichiers; si un conflit touche le code
de P2/P3, demandez au proprietaire de le resoudre. Ne poussez pas une branche
rebasee ou fusionnee avant `git diff` et les tests.

Un merge de votre branche vers `main` n'est pas une permission de pousser
directement une fonctionnalite non testee. Le gate minimal de l'equipe est :
React s'affiche, l'API repond, les assets chargent, la carte s'ouvre et le
conteneur fonctionne au jalon de gel.

---

## 6. Synchronisation et communication pendant les trois jours

| Moment | Ce que vous apportez |
|---|---|
| Mardi matin, cadrage | Acces aux fichiers, dimensions, champs connus/inconnus, statut des droits |
| M0 terminé — PASS (25 nov. 2026) | Structure, ignore rules et Docker/Compose vérifiés; aucun bootstrap à refaire |
| Mercredi 9 h 15 | Blocage source/CRS et resultat attendu pour 12 h 30 |
| Mercredi 12 h 30, M1 | JSON/GeoJSON, statistiques de controle, premier build avec les assets |
| Mercredi 17 h 30, M2 | Carte population 2018 et integration avec API + page |
| Jeudi 12 h 30, M3 | Carte 2018/2025/2035, totaux et ecarts commentes |
| Jeudi 17 h 30, M4 | `docker compose up --build`, test CSV et liste des fonctions reportées |
| Vendredi 13 h, M5 | URL si prete, sinon Docker local, captures et verification du conteneur |

Si une source manque, un droit de diffusion n'est pas clair, un champ ou le CRS
est inconnu, alertez les deux autres sous 30 minutes. Ne livrez pas une carte
vide ou une valeur devinee comme si le pipeline avait reussi.

---

## 7. Definition de fini pour P1

Votre perimetre est livre quand :

- les sources et limites sont decrites dans `SOURCES.md`;
- les bruts et reponses ne sont pas suivis dans Git ni copies dans l'image;
- les scripts valident leur schema et terminent avec des erreurs explicites;
- les JSON couvrent au moins huit indicateurs dans les themes prioritaires;
- le GeoJSON a les 105 zones attendues, les 4 proprietes requises, un
  `id_zone` facultatif et le CRS EPSG:4326;
- les sommes population sont comparees aux controles et les ecarts documentes;
- `MapView` affiche population 2018/2025/2035, legend, popup et valeurs absentes;
- l'image multi-stage est sous 500 Mo ou l'ecart est explique;
- Compose sert `/` et `/api/*`; le CSV test persiste dans le dossier hote;
- P2/P3 ont teste les donnees consommees depuis leurs branches.

Les couches d'infrastructure ne bloquent pas cette definition de fini. Si elles
ne sont pas fiables ou consommables avant jeudi, retirez-les et demandez a P3
de les noter « non disponible » dans Methodologie.

---

## 8. Apres la demonstration

Ne commencez pas un second chantier dans cette branche sans nouvelle decision
d'equipe. Les suites possibles sont un controle SIG metier, les couches
d'infrastructure, la validation detaillee des projections et le stockage
persistant pour collecte reelle. Elles ne font pas partie des trois jours.
