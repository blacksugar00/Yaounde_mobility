# Guide individuel P3 — API Flask, participatif et coordination

**Projet :** Observatoire de la mobilite urbaine de Yaounde
**Perimetre :** backend Flask, lecture de donnees, barometre, Methodologie, README et integration d'equipe
**Branche de fonctionnalite :** `p3-back`
**Document socle :** [Plan technique d'execution](./Guide_execution_observatoire_mobilite_Yaounde.md)

Le plan technique est la source de verite des contrats de l'equipe. Ce guide
precise vos taches depuis le bootstrap jusqu'au gel de la demonstration. Vous
etes proprietaire du backend et coordonnez les integrites; vous n'etes pas
proprietaire du frontend graphique, des scripts de donnees, de Leaflet ou de
Docker.

---

## 1. Votre mission et les limites de votre perimetre

Vous fournissez une API Flask stable qui lit les JSON/GeoJSON de P1, expose les
routes aux pages React, valide les reponses du formulaire et ne diffuse que des
agregats anonymes. Vous maintenez aussi les pages participatives, Methodologie,
README, bilans et coordination d'integration.

### Vous possedez

| Fichier / livrable | Resultat attendu |
|---|---|
| `api/app.py` | Application factory, enregistrement des routes, health et fallback React |
| `api/services/data_loader.py` | Lecture/validation/cache des fichiers P1 |
| `api/routes/indicateurs.py` | Catalogue et fiche d'indicateur |
| `api/routes/zones.py` | GeoJSON pour annees valides |
| `api/routes/barometre.py` | POST valide et CSV local; GET agreges, si schema officiel recu |
| `web/src/pages/Participatif.jsx` | Formulaire React, consentement, messages d'erreur |
| `web/src/pages/Resultats.jsx` | F9, agregats de reponses de test et ChartCard de P2 |
| `web/src/pages/Methodologie.jsx` | Sources, provenance, limites et fonctions reportees |
| `README.md`, bilans et support | Instructions reproductibles et coordination |

### Vous ne modifiez pas sans accord

- `scripts/`, `data/indicateurs/`, `data/geojson/` et `MapView.jsx` : P1.
- `web/src/App.jsx`, `Layout.jsx`, `ChartCard.jsx`, pages principales et CSS :
  P2.
- `Dockerfile`, `docker-compose.yml`, `.dockerignore` : P1.
- Les contrats de donnees/API et le schema de questionnaire : decision commune.
  Vous etes responsable de leur implementation, pas de leur modification
  unilaterale.

### Decisions de fonctionnement non negociables

- Pas de base de donnees. Flask lit les JSON/GeoJSON prepares par P1.
- Une seule origine en production : React sur `/`, API sur `/api/*`.
- Un seul conteneur Docker de livraison.
- Collecte retenue : React -> `POST /api/barometre` -> CSV local.
- Le CSV reste dans `data/barometre/reponses.csv`, ignore par Git.
- Le GET de resultats ne renvoie jamais des lignes de reponses individuelles.
- Aucune collecte publique sur un stockage ephemere ou sans consentement et
  regles de conservation approuvees.

---

## 2. Avant votre branche : participer a la stabilisation de `main`

Le travail parallele commence apres M0. Le depot de depart est d'abord cree sur
`init/bootstrap`, puisque les commits directs sur `main` sont interdits.

### 2.1 Au cadrage commun

Avec P1/P2, validez :

1. contrat JSON d'indicateur et contrat GeoJSON;
2. noms/format des routes et erreurs HTTP;
3. contrat ChartCard de P2 et client Axios `/api`;
4. flux questionnaire React -> POST -> CSV (choix deja retenu, pas de Google
   Form);
5. question officielle et listes de choix : demander a l'organisation les six
   a huit champs exacts et leurs choix fermes;
6. autorisation de diffusion des sources et sorties preparees;
7. partage des fichiers et jalons M0–M5 du plan technique.

Le contenu des questions est un intrant de l'organisation. Ne l'inventez pas.
Si les questions ne sont pas disponibles au kickoff, consignez le nom de la
personne qui les obtient et son echeance. Le backend peut avancer avec F8
desactive explicitement; il ne doit ni creer un CSV a schema provisoire, ni
accepter une reponse factice.

### 2.2 Pendant le bootstrap partage

Votre contribution M0 sur `init/bootstrap` :

- application Flask et `GET /api/sante`;
- blueprints/routes vides ou en 503 explicite jusqu'a livraison des assets;
- `data_loader.py` avec erreurs visibles, pas de tableau vide factice;
- placeholders des pages `Participatif`, `Resultats`, `Methodologie` dans
  l'arborescence initiale (P2 cree les chemins React en M0, puis vous prenez la
  propriete de leur contenu apres la promotion);
- README de depart, commandes de lancement et schema de donnees/barometre en
  attente de validation.

La branche initiale est promue par P3 en `main` uniquement apres validation
commune du build React, `/api/sante`, `docker compose config` et absence de
sources/secrets/reponses dans Git.

### 2.3 Porte M0 puis branche `p3-back`

Confirmez que `main` est la branche par defaut et contient la revision stable
commune. Puis :

```bash
git status --short
git switch main
git pull --ff-only
git switch -c p3-back
git status --short
```

Commencez sur un arbre propre et depuis le meme commit que P1/P2. Ne basez pas
votre branche sur le travail d'une autre personne.

---

## 3. Contrats API a livrer

| Methode et route | Contrat de succes | Erreurs pertinentes |
|---|---|---|
| `GET /api/sante` | `{"statut":"ok"}` | Processus non disponible |
| `GET /api/indicateurs` | `[{code, libelle, unite}]` | `503` si JSON absent/invalide |
| `GET /api/indicateurs/<code>` | Fiche avec series; scenario facultatif | `404` code inconnu, `503` fichier absent |
| `GET /api/zones?annee=2018` | FeatureCollection contractuelle | `400` annee invalide, `503` GeoJSON absent |
| `POST /api/barometre` | `{"ok":true}`, HTTP 201 apres validation | `400` reponse/consentement invalide; `503` si schema non configure |
| `GET /api/barometre/resultats` | `{total, agregats: {champ: [{reponse, nombre}]}}`; `par_mode` seulement si le questionnaire a ce champ | `503` si schema non configure ou CSV indisponible |

Le contrat du PDF nomme `{total, par_mode}`. Comme les questions de
l'organisation ne sont pas encore connues, le plan retient une aggregation
generique `agregats` indexee par nom de champ, qui peut servir 2–3 graphiques
sans prejuger du questionnaire. Pour rester compatible, renvoyez aussi
`par_mode` lorsque le schema approuve contient le champ `mode_principal`.
P2 doit construire F9 depuis `agregats`; il ne doit pas supposer que des champs
de frequence ou motif existent.

Une erreur ne doit jamais ressembler a un succes vide. Retournez un statut
approprie et une erreur courte en JSON; consignez le detail technique dans les
logs serveur.

---

## 4. Parcours par jalon, etapes et commits

### Etape 1 — health, factory et fallback SPA

**Quand :** socle M0 et branche `p3-back`.
**Depend de :** structure Python, dependances Flask.
**But :** React et Flask sont servables, meme quand les assets metier ne sont
pas encore disponibles.

`api/app.py` :

```python
from pathlib import Path

from flask import Flask, jsonify, send_from_directory

from routes.barometre import (
    bp as barometre_bp,
    initialize_responses,
    questionnaire_configured,
)
from routes.indicateurs import bp as indicateurs_bp
from routes.zones import bp as zones_bp

API_DIR = Path(__file__).resolve().parent
STATIC_DIR = API_DIR / "static"


def create_app():
    app = Flask(
        __name__,
        static_folder=str(STATIC_DIR),
        static_url_path="",
    )
    app.config["MAX_CONTENT_LENGTH"] = 4 * 1024
    app.register_blueprint(indicateurs_bp, url_prefix="/api")
    app.register_blueprint(zones_bp, url_prefix="/api")
    app.register_blueprint(barometre_bp, url_prefix="/api")

    if questionnaire_configured():
        with app.app_context():
            initialize_responses()

    @app.get("/api/sante")
    def health():
        return jsonify({"statut": "ok"})

    @app.errorhandler(FileNotFoundError)
    @app.errorhandler(RuntimeError)
    @app.errorhandler(ValueError)
    def handle_data_error(error):
        app.logger.error("Donnees absentes ou invalides: %s", error)
        return jsonify({"erreur": "donnees absentes ou invalides"}), 503

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_react(path):
        if path == "api" or path.startswith("api/"):
            return jsonify({"erreur": "route API inconnue"}), 404

        candidate = STATIC_DIR / path
        if path and candidate.is_file():
            return send_from_directory(STATIC_DIR, path)

        index = STATIC_DIR / "index.html"
        if not index.is_file():
            return jsonify({"erreur": "build React absent"}), 503
        return send_from_directory(STATIC_DIR, "index.html")

    return app
```

Le code ci-dessus ne lance aucune collecte si
`questionnaire_configured()` est faux. N'activez pas CORS globalement en
production : en dev, le proxy Vite et le meme host suffisent; ajoutez une
configuration CORS locale seulement si un besoin technique est confirme.

Test M0 :

```bash
cd api
flask --app app:create_app run --debug --port 5000
```

Dans un second terminal :

```bash
curl -i http://localhost:5000/api/sante
```

Succes attendu : HTTP 200 et `{"statut":"ok"}`. Les routes de donnees peuvent
retourner 503 tant que P1 n'a pas livre les JSON/GeoJSON; c'est attendu.

Commit :

```bash
git add api/app.py
git commit -m "Create Flask app and health endpoint"
```

### Etape 2 — service de chargement des assets P1

**Quand :** mercredi matin, M1.
**Depend de :** contrats JSON/GeoJSON signes; fichiers P1 disponibles ou un
mock local explicitement identifié.

`api/services/data_loader.py` :

```python
import json
from functools import lru_cache
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
INDICATOR_DIR = DATA_DIR / "indicateurs"
ZONE_FILE = DATA_DIR / "geojson" / "zones_population.geojson"


@lru_cache(maxsize=1)
def load_indicators():
    files = sorted(INDICATOR_DIR.glob("*.json"))
    if not files:
        raise FileNotFoundError(
            f"Aucun fichier indicateur disponible dans {INDICATOR_DIR}"
        )

    indicators = []
    seen_codes = set()
    required = {"code", "libelle", "unite", "source", "series"}
    for path in files:
        try:
            records = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError(f"JSON invalide: {path.name}") from error
        if not isinstance(records, list):
            raise ValueError(f"{path.name} doit contenir une liste.")
        for record in records:
            if not isinstance(record, dict) or not required <= record.keys():
                raise ValueError(f"Structure indicateur invalide dans {path.name}.")
            if record["code"] in seen_codes:
                raise ValueError(f"Code duplique: {record['code']}")
            if not isinstance(record["series"], list):
                raise ValueError(f"Series invalides pour {record['code']}.")
            seen_codes.add(record["code"])
            indicators.append(record)
    return indicators


@lru_cache(maxsize=1)
def load_zones():
    try:
        content = json.loads(ZONE_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError(f"GeoJSON absent ou invalide: {ZONE_FILE}") from error

    if not isinstance(content, dict) or content.get("type") != "FeatureCollection":
        raise ValueError("Le GeoJSON doit etre une FeatureCollection.")
    if len(content.get("features", [])) != 105:
        raise ValueError("Le GeoJSON doit contenir 105 zones.")
    properties = {"nom", "pop_2018", "pop_2025", "pop_2035"}
    for feature in content["features"]:
        actual = set((feature.get("properties") or {}).keys())
        if actual != properties:
            raise ValueError("Proprietes GeoJSON non conformes au contrat.")
    return content
```

Le cache est en memoire; apres regeneration, redemarrez Flask. Ne renvoyez pas
un resultat vide en cas d'erreur. Le schema des series et des geometries est
livre par P1; si sa structure change, faites valider le changement avant de
modifier ce service.

Commit :

```bash
git add api/services/data_loader.py
git commit -m "Load and validate prepared datasets"
```

### Etape 3 — routes indicateurs et zones

**Quand :** mercredi matin, disponible pour la premiere integration M1.
**Depend de :** service de chargement et fichiers P1.

`api/routes/indicateurs.py` :

```python
from flask import Blueprint, jsonify, request

from services.data_loader import load_indicators

bp = Blueprint("indicateurs", __name__)


@bp.get("/indicateurs")
def list_indicators():
    return jsonify([
        {
            "code": item["code"],
            "libelle": item["libelle"],
            "unite": item["unite"],
        }
        for item in load_indicators()
    ])


@bp.get("/indicateurs/<path:code>")
def get_indicator(code):
    scenario = request.args.get("scenario")
    for item in load_indicators():
        if item["code"] != code:
            continue
        if not scenario:
            return jsonify(item)
        series = [
            point for point in item["series"]
            if point["scenario"] == scenario
        ]
        if not series:
            return jsonify({
                "erreur": "scenario indisponible pour cet indicateur",
                "code": code,
                "scenario": scenario,
            }), 404
        return jsonify({**item, "series": series})
    return jsonify({"erreur": "indicateur inconnu", "code": code}), 404
```

`api/routes/zones.py` :

```python
from flask import Blueprint, jsonify, request

from services.data_loader import load_zones

bp = Blueprint("zones", __name__)
VALID_YEARS = {"2018", "2025", "2035"}


@bp.get("/zones")
def get_zones():
    year = request.args.get("annee", "2018")
    if year not in VALID_YEARS:
        return jsonify({
            "erreur": "annee invalide",
            "annees_valides": sorted(VALID_YEARS),
        }), 400
    return jsonify(load_zones())
```

La route verifie l'annee mais conserve les proprietes strictes du GeoJSON.
React choisit le champ d'affichage; n'ajoutez pas de proprietes a la reponse.

Tests manuels avec des fichiers P1 :

```bash
curl -i http://localhost:5000/api/indicateurs
curl -i \
  'http://localhost:5000/api/indicateurs/1.1__population_urbaine_de_l_aire_metropolitaine'
curl -i 'http://localhost:5000/api/zones?annee=2018'
curl -i 'http://localhost:5000/api/zones?annee=2020'
```

Le catalogue doit contenir les indicateurs exportes; la derniere requete doit
retourner 400. La requete 2018 retourne les 105 features et le contrat exact.

Commit :

```bash
git add api/routes/indicateurs.py api/routes/zones.py
git commit -m "Expose indicator and zone API routes"
git push -u origin p3-back
```

### Etape 4 — schema officiel et stockage du barometre

**Quand :** M0 pour obtenir l'intrant; implementation au plus tard mercredi
apres-midi; test M2.
**Depend de :** formulation et choix approuves par l'organisation, validation du
consentement et du traitement des reponses.

#### Regle de blocage avant schema

Sur le socle, gardez `QUESTIONNAIRE_CONFIGURED = False`. Flask ne cree aucun
fichier de reponses et les deux routes barometre retournent 503. Le formulaire
ne peut pas etre presente comme collectant tant que l'organisation n'a pas
confirme ses six a huit questions fermees, leurs choix et leur texte de
consentement.

Les noms de champs et les options sont tires uniquement du schema approuve.
Partagez les clefs d'agregation F9 avec P1/P2 avant l'integration; l'alias
`par_mode` n'existe que si une question approuvee porte le nom
`mode_principal`. Aucun champ identifiant, adresse courriel, telephone ou texte
libre dans cette version.

#### Module `api/routes/barometre.py`

Le bloc ci-dessous est une implementation complete de la validation, de
l'ecriture CSV et d'une aggregation. Quand l'organisation transmet les
questions, options, libelles et consentement approuves, P3 les retranscrit dans
`ALLOWED` et `QUESTIONS`. Dans le socle, `ALLOWED` reste vide et
`QUESTIONNAIRE_CONFIGURED` reste `False`.

```python
import csv
import os
from collections import Counter
from pathlib import Path

from flask import Blueprint, jsonify, request

bp = Blueprint("barometre", __name__)

# Remplir ALLOWED exclusivement avec les choix approuves; garder vide sur M0.
ALLOWED = {}
QUESTIONNAIRE_CONFIGURED = False
FIELDS = list(ALLOWED)


def questionnaire_configured():
    if set(FIELDS) != set(ALLOWED):
        raise RuntimeError("FIELDS et ALLOWED ne correspondent pas.")
    if not QUESTIONNAIRE_CONFIGURED:
        return False
    if not 6 <= len(FIELDS) <= 8:
        raise RuntimeError("Le questionnaire approuve doit contenir 6 a 8 champs.")
    if any(not choices for choices in ALLOWED.values()):
        raise RuntimeError("Chaque champ doit avoir des choix autorises.")
    return True


def response_file():
    configured = os.environ.get("BAROMETRE_CSV")
    if configured:
        return Path(configured)
    repository = Path(__file__).resolve().parents[2]
    return repository / "data" / "barometre" / "reponses.csv"


def require_questionnaire():
    if not questionnaire_configured():
        return jsonify({"erreur": "questionnaire non configure"}), 503
    return None


def initialize_responses():
    if not questionnaire_configured():
        return
    path = response_file()
    path.parent.mkdir(parents=True, exist_ok=True)

    if path.exists() and path.stat().st_size:
        with path.open(newline="", encoding="utf-8") as file:
            header = next(csv.reader(file), [])
        if header != FIELDS:
            raise RuntimeError(
                "Schema CSV different du questionnaire actif; "
                "sauvegarder puis traiter uniquement les reponses de test."
            )
        return

    with path.open("w", newline="", encoding="utf-8") as file:
        csv.DictWriter(file, fieldnames=FIELDS).writeheader()


@bp.post("/barometre")
def submit_response():
    unavailable = require_questionnaire()
    if unavailable:
        return unavailable

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"erreur": "objet JSON requis"}), 400
    if payload.get("consentement") is not True:
        return jsonify({"erreur": "consentement requis"}), 400

    expected = set(FIELDS) | {"consentement"}
    missing = expected - set(payload)
    unexpected = set(payload) - expected
    if missing or unexpected:
        return jsonify({
            "erreur": "champs invalides",
            "manquants": sorted(missing),
            "inattendus": sorted(unexpected),
        }), 400

    invalid = [
        field for field in FIELDS
        if payload[field] not in ALLOWED[field]
    ]
    if invalid:
        return jsonify({
            "erreur": "reponses non autorisees",
            "champs": invalid,
        }), 400

    path = response_file()
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.stat().st_size == 0:
        initialize_responses()

    with path.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writerow({field: payload[field] for field in FIELDS})
    return jsonify({"ok": True}), 201


@bp.get("/barometre/resultats")
def get_results():
    unavailable = require_questionnaire()
    if unavailable:
        return unavailable

    path = response_file()
    if not path.is_file():
        return jsonify({"erreur": "fichier de reponses absent"}), 503

    with path.open(newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))
    aggregates = {}
    for field in FIELDS:
        counts = Counter(row[field] for row in rows if row.get(field))
        aggregates[field] = [
            {"reponse": answer, "nombre": count}
            for answer, count in sorted(counts.items())
        ]
    result = {"total": len(rows), "agregats": aggregates}
    if "mode_principal" in FIELDS:
        result["par_mode"] = aggregates["mode_principal"]
    return jsonify(result)
```

Avant `QUESTIONNAIRE_CONFIGURED = True`, completez :

1. `ALLOWED` avec 6–8 clefs correspondant aux questions approuvees et des listes
   de choix explicites;
2. `web/src/pages/Participatif.jsx` avec les memes clefs/valeurs;
3. `Resultats.jsx` avec 2–3 graphiques selectionnes a partir des champs
   effectivement approuves;
4. tests d'une reponse valide, consentement absent, choix non autorise,
   champ additionnel et total/resultat agrege;
5. confirmation des mentions de consentement et de la politique de conservation.

La sortie `agregats` est indexee par les noms techniques des questions
approuvees. L'alias `par_mode` est emis uniquement lorsque le champ
`mode_principal` existe. Ne renommez pas les clefs silencieusement.

#### Comportement des fichiers

- M0 : `.gitkeep` seulement; le CSV n'existe pas.
- Schema officiel active : Flask cree l'en-tete au demarrage.
- Local ou Compose : l'ecriture est dans `data/barometre/reponses.csv`.
- Le fichier est ignore par Git et Docker; jamais de reponses dans un commit.
- Le schema du CSV est verifie au demarrage; pas de migration automatique.
- Un seul worker Gunicorn dans cette maquette; le CSV n'est pas une base fiable
  pour un flux concurrent ou une collecte publique.

Test d'API apres activation officielle :

```bash
curl -i http://localhost:5000/api/barometre/resultats
curl -i -X POST http://localhost:5000/api/barometre \
  -H 'Content-Type: application/json' \
  -d @/tmp/reponse-barometre-test.json
curl -i http://localhost:5000/api/barometre/resultats
```

Creer ce fichier temporaire avec exactement les clefs de `FIELDS`, une valeur
autorisee par champ et `consentement: true`. Utiliser une reponse de test
fictive, ne pas la commiter, puis verifier que le GET ne contient que les
comptes agreges et aucune reponse individuelle.

Commit uniquement apres schema approuve :

```bash
git add api/routes/barometre.py web/src/pages/Participatif.jsx
git commit -m "Implement approved anonymous mobility survey"
git push origin p3-back
```

### Etape 5 — page participative et Resultats

**Quand :** mercredi apres-midi pour questionnaire si schema disponible;
jeudi matin pour F9.
**Depend de :** champs officiels, client Axios et ChartCard de P2.

Le questionnaire React affiche un `<select>` par champ approuve. Ne proposez
aucune question, aucun choix ni texte de consentement de votre propre
initiative. Le code ci-dessous reste en attente tant que ces contenus ne sont
pas fournis :

```jsx
import { useState } from "react";
import { postBarometre } from "../api/client";

const QUESTIONS = [];
const CONSENT_TEXT = "";

function isConfigured() {
  return (
    QUESTIONS.length >= 6 &&
    QUESTIONS.length <= 8 &&
    QUESTIONS.every(
      (question) =>
        question.name &&
        question.label &&
        Array.isArray(question.options) &&
        question.options.length > 0 &&
        question.options.every((option) => option.value && option.label),
    ) &&
    CONSENT_TEXT.trim().length > 0
  );
}

export default function Participatif() {
  const [answers, setAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!isConfigured()) {
    return <p>Questionnaire en attente de validation par l'organisation.</p>;
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSending(true);
    try {
      await postBarometre({ ...answers, consentement: consent });
      setMessage("Reponse de test enregistree; elle n'est pas representative.");
      setAnswers({});
      setConsent(false);
    } catch (error) {
      setMessage(`Envoi impossible : ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <section>
      <h1>Questionnaire de mobilite</h1>
      <p>Prototype de test. Ne saisissez aucune donnee personnelle.</p>
      <form onSubmit={submit}>
        {QUESTIONS.map((question) => (
          <label key={question.name}>
            {question.label}
            <select
              required
              value={answers[question.name] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [question.name]: event.target.value,
                }))
              }
            >
              <option value="">Choisir une reponse</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
          />
          {CONSENT_TEXT}
        </label>
        <button
          type="submit"
          disabled={
            !consent ||
            sending ||
            QUESTIONS.some((question) => !answers[question.name])
          }
        >
          {sending ? "Envoi..." : "Envoyer"}
        </button>
      </form>
      <p role="status">{message}</p>
    </section>
  );
}
```

Apres validation, remplir `QUESTIONS` et `CONSENT_TEXT` exclusivement avec les
contenus approuves. Les valeurs `name`/`value` doivent correspondre exactement
a `FIELDS`/`ALLOWED` de Flask; activez le bool `QUESTIONNAIRE_CONFIGURED` dans
le meme changement apres que les tests de schema passent. Le navigateur aide a
l'UX; Flask refait obligatoirement toute validation.

`Resultats.jsx` utilise `getResultats()` et le `ChartCard` de P2; il ne charge
jamais les lignes du CSV. Affichez « aucune reponse de test » lorsque `total`
est zero. Toute erreur est visible et reessayable; marquez les chiffres comme
non representatifs.

Exemple de page qui ne suppose aucun champ de questionnaire et consomme le
contrat `agregats` :

```jsx
import { useEffect, useState } from "react";
import { getResultats } from "../api/client";
import ChartCard from "../components/ChartCard";

function displayLabel(field) {
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Resultats() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setError("");
    getResultats()
      .then((value) => {
        if (active) setResults(value);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  if (error) {
    return (
      <section>
        <p role="alert">Resultats indisponibles : {error}</p>
        <button onClick={() => {
          setResults(null);
          setAttempt((value) => value + 1);
        }}>
          Reessayer
        </button>
      </section>
    );
  }
  if (!results) return <p>Chargement des resultats...</p>;
  if (results.total === 0) return <p>Aucune reponse de test recue.</p>;

  return (
    <section>
      <h1>Resultats du barometre</h1>
      <p>{results.total} reponse(s) de test; resultat non representatif.</p>
      <div className="chart-grid">
        {Object.entries(results.agregats).map(([field, answers]) => {
          const data = {
            labels: answers.map((answer) => answer.reponse),
            datasets: [{
              label: "Reponses",
              data: answers.map((answer) => answer.nombre),
              backgroundColor: "#2980B9",
            }],
          };
          const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
          };
          return (
            <ChartCard
              key={field}
              type="bar"
              data={data}
              options={options}
              titre={displayLabel(field)}
              unite="reponses"
              source="Barometre de test"
            />
          );
        })}
      </div>
    </section>
  );
}
```

Le fichier devra importer `ChartCard` depuis le chemin effectivement retenu par
P2. Ce composant appartient a P2 : signalez toute incompatibilite de props sans
modifier son implementation.

Commit :

```bash
git add web/src/pages/Participatif.jsx web/src/pages/Resultats.jsx
git commit -m "Add survey and aggregate results pages"
git push origin p3-back
```

### Etape 6 — Methodologie, README, coordination et tests

**Quand :** squelette mardi; contenu mercredi; documentation complete jeudi
apres-midi.
**Depend de :** confirmations P1 sur provenance, P2 sur navigation/contrats,
P1 sur la procedure Docker.

`Methodologie.jsx` doit rendre visibles :

- source organisationnelle et date/version connue;
- indicateurs prepares, unites et provenance;
- interpolation/extrapolation et scenarios incomplets;
- rupture construite et limites des donnees;
- limites de la carte, ecarts de population documentes;
- questionnaires de test et absence de representativite;
- fonctions/layers non integrees et raison du report.

README requis :

1. objectif et perimetre (3 jours, esquisse);
2. architecture et flux JSON -> Flask -> React/Chart.js/Leaflet;
3. etat/versions et dependances, demarrage local;
4. emplacements sources, generations de donnees et autorisations;
5. routes API, schema JSON/GeoJSON;
6. schema du barometre, `data/barometre/`, fichiers exclus et stockage local;
7. build Compose, alignement `LOCAL_UID`/`LOCAL_GID`;
8. verification manuelle et limites, deploiement seulement si disponible.

Demarrage local documente :

```bash
source .venv/bin/activate
cd api
flask --app app:create_app run --debug --port 5000
```

Second terminal :

```bash
cd web
npm run dev
```

En Linux, avant le premier Compose :

```bash
printf 'LOCAL_UID=%s\nLOCAL_GID=%s\n' "$(id -u)" "$(id -g)" > .env
docker compose config
docker compose up --build
```

#### Tableau de test API

| Cas | Requete/action | Attendu |
|---|---|---|
| Health | `GET /api/sante` | 200 + `{"statut":"ok"}` |
| Donnees absentes en M0 | `GET /api/indicateurs` | 503 detail generique; erreur du chemin dans logs |
| Code inconnu | `GET /api/indicateurs/inconnu` | 404 |
| Annee invalide | `GET /api/zones?annee=2020` | 400 + annees valides |
| Barometre non configure | POST ou GET Resultats | 503; aucun CSV cree |
| Consentement absent | POST apres activation | 400 |
| Choix inconnu/champ de plus | POST apres activation | 400; aucune ecriture |
| Reponse valide | POST apres activation | 201; une ligne locale ajoutee |
| Aggregation | GET resultat apres test | Totaux anonymes, aucune ligne brute |
| Fallback SPA | GET `/methodologie` | `index.html` apres build |
| Route API inconnue | GET `/api/inconnu` | 404 JSON, pas `index.html` |

Commandes de verification :

```bash
cd api
python -m compileall app.py routes services
flask --app app:create_app run --debug --port 5000
```

Dans le frontend :

```bash
cd web
npm run build
```

Avant de marquer une route « testee », donnez a P2 les reponses et statuts
attendus, et demandez-lui de la consommer dans le navigateur.

Commit :

```bash
git add README.md web/src/pages/Methodologie.jsx
git commit -m "Document methodology and local workflow"
git push origin p3-back
```

---

## 5. Votre role dans les commits, merges et dependances

### 5.1 Votre cadence de commits

| Commit | Contenu | Validation |
|---|---|---|
| M0 | App factory, health, blueprints, README de depart, placeholders P3 | health 200; Compose config |
| P3-1 | `data_loader.py` | absence/corruption explicite; structure controlee |
| P3-2 | Routes indicateur et zones | HTTP, schemas et codes d'erreur |
| P3-3 | Barometre et CSV | seulement apres schema officiel; consentement et choix valides |
| P3-4 | pages Participatif/Resultats/Methodologie | Client Axios et ChartCard compatibles |
| P3-5 | README, bilan, support de presentation | Un nouveau membre reproduit les tests |
| P3-6 | corrections d'integration | Toutes les routes et parcours M5 verifies |

Petits commits, limites a vos fichiers :

```bash
git status --short
git diff --check
python -m compileall api
git add api/routes/indicateurs.py api/routes/zones.py
git commit -m "Expose indicator and zone API routes"
git push origin p3-back
```

Ne faites jamais `git add .`; ne stagez ni les reponses ni les sources brutes.

### 5.2 Vous coordonnez l'integration, mais ne fusionnez pas de code non teste

Ordre de dependance M1 :

1. P1 termine et publie le JSON/GeoJSON.
2. Vous mergez/testez les routes qui lisent les assets.
3. P2 connecte les pages aux vrais appels API.
4. P1 branche la carte Leaflet dans le layout de P2.
5. F8 est active seulement quand le schema organisationnel existe; ensuite la
   page F9 depend du contrat agregé.

Pour chaque merge, la personne qui integre :

```bash
git fetch origin
git switch main
git pull --ff-only
git merge --no-ff origin/p1-data
```

Remplacez la branche source par `p2-front` ou `p3-back` apres revue et test.
Si vous integrez sans PR, le sync d'equipe tient lieu de revue, pas une simple
absence d'objection. Ne poussez pas vers `main` tant que le gate du jalon ne
passe pas. Si l'equipe utilise une forge, la PR suit le meme ordre et P3
coordonne les validations.

Apres un merge, chaque personne actualise sa branche :

```bash
git fetch origin
git switch p3-back
git merge origin/main
python -m compileall api
```

Resoudre les conflits dans votre perimetre. Si un conflit concerne `App.jsx`,
`ChartCard.jsx`, `MapView.jsx`, Docker ou scripts de P1/P2, demandez son
proprietaire. Ne re-ecrivez pas ces fichiers pendant la resolution.

### 5.3 Bilans et animation

A 12 h 30 et 17 h 30, demandez a chacun une demonstration a l'ecran et notez :

```text
Fait:
Prochain livrable + responsable:
Blocage (depuis quand, decision ou dependance):
Commit/branche/test:
```

Si un blocage dure plus de 30 minutes, convoquez une decision rapide :
livraison partielle, mock clairement tagge, ordre de merge change ou fonction
reportee. Vous envoyez le bilan ecrit de fin de demi-journee et maintenez la
liste des dependances et fonctions encore absentes.

---

## 6. Jalons communs et definition de fini pour P3

| Jalon | Votre livrable a montrer |
|---|---|
| M0 — mardi 17 h 30 | Health route, app factory, plan de routes, schema en attente signale, README initial, depot stable |
| M1 — mercredi 12 h 30 | Routes indicateurs/zones lisent les vrais fichiers P1; erreurs/codes conformes |
| M2 — mercredi 17 h 30 | POST valide et enregistre une reponse de test si formulaire officiellement configure; page participative consomme l'API |
| M3 — jeudi 12 h 30 | F9 agrege sans lignes brutes, Methodologie documente sources, schema et limites |
| M4 — jeudi 17 h 30 | README reproductible, test Compose avec P1, bilans et decisions de report |
| M5 — vendredi 13 h | Toutes les routes, 5 valeurs, stockage local, coordination du deploiement/repetition |

Votre perimetre est fini quand :

- les six routes de l'API respectent les formats et statuts de la section 3;
- JSON/GeoJSON invalides ne se transforment pas en reponses vides de succes;
- le cache est redemarre apres generation et l'erreur est visible;
- `POST` refuse consentement absent, valeurs inconnues, champs manquants ou
  extras; les donnees sont validees cote serveur;
- le schema du CSV est verifie et les reponses restent hors Git;
- F8/F9 n'acceptent pas de collecte sans schema approuve;
- F9 montre des agregats anonymes et les qualifie de test/non representative;
- les pages Methodologie et README correspondent aux choses livrees, pas aux
  choses espérées;
- P1/P2 ont execute un test d'integration avec vous;
- la demo est repetee; les blocages et l'URL locale/publique sont explicites.

---

## 7. Decisions a escalader avant de coder

| Question | Qui obtient la reponse | Effet si inconnue |
|---|---|---|
| Quels sont les libelles/choix des 6–8 questions ? | P3 aupres de l'organisation | F8 bloque; garder POST/GET barometre en 503 et ne pas creer CSV |
| Le schema approuve contient-il `mode_principal` ? | P3 + organisation | Produire l'alias `par_mode` uniquement si ce champ existe; les autres agregats suivent les champs confirmes |
| Consentement et duree de conservation approuves ? | Organisation, relayee par P3 | Pas de collecte publique |
| Peut-on diffuser les donnees/source ou seulement deployer en prive ? | P1 collecte; P3 inscrit README | Ne pas inclure les fichiers dans Git ou image publique |
| Quel hebergeur et volume persistant sont disponibles ? | P1 avec soutien P3 | Demo locale seulement; reponses test non durables |

---

## 8. Apres la demonstration

Le CSV local n'est pas une base de production. Une vraie enquete requiert un
stockage persistant securise, droits d'acces, protocole de consentement,
politique de conservation/suppression, controle de representativite et
procedure de sauvegarde. Ces travaux ne sont pas a ajouter a `p3-back` pendant
les trois jours.

---

## Etat post-M0 pour P3

- Etat commun: M0 est préparé sur `init/bootstrap` et n'est pas fusionné sur
  `main`; ne créez pas de branche personnelle avant la PR humaine.
- Après fusion de M0, synchronisez `main` puis créez `p3-back`.
- Flask démarre, `/api/sante` retourne `200 {"statut":"ok"}`; les routes
  indicateurs/zones retournent des erreurs `503` en absence d'assets.
- Le baromètre reste désactivé (`FIELDS = {}`): POST/GET retournent `503` et
  aucun `reponses.csv` n'est créé.
- P3 doit obtenir de l'organisation les 6 à 8 questions, choix fermés,
  consentement et règles de conservation avant toute activation F8/F9.
