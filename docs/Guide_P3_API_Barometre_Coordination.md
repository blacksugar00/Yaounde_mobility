# Guide individuel P3 — API Flask, participatif et coordination

**Projet :** Observatoire de la mobilite urbaine de Yaounde
**Perimetre :** backend Flask, lecture de donnees, barometre, Methodologie, README et integration d'equipe
**Branche de fonctionnalite :** `p3-back`
**Document socle :** [Plan technique d'execution](./Guide_execution_observatoire_mobilite_Yaounde.md)

> **État final — 26 novembre 2026.** Le projet est terminé : F1 à F12 sont livrés et
> la version finale est dans la PR #11 (interface institutionnelle). Ce guide garde
> la trace du déroulé du hackathon ; les étapes ci-dessous décrivent comment le
> travail a été mené. L'état à jour est résumé dans la section « État final » en fin
> de document et dans le [README](../README.md).

Le plan technique est la source de verite des contrats de l'equipe. M0 est
terminé et fusionné dans `main`; ce guide précise vos tâches jusqu'au gel de la
démonstration. Vous etes proprietaire du backend et coordonnez les integrites;
vous n'etes pas proprietaire du frontend graphique, des scripts de donnees, de
Leaflet ou de Docker.

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

## 2. M0 terminé — synchroniser `main` avant le travail P3

**M0 technique est PASS et fusionné dans `main`; le bootstrap n'est plus à
réaliser.** Synchronisez `main` avant de créer ou reprendre votre branche P3.

Depuis le dossier parent du dépôt :

```bash
cd Yaounde_mobility
git status --short
git fetch origin
git switch main
git pull --ff-only origin main
# Première création :
git switch -c p3-back
# Si p3-back existe déjà : utilisez plutôt `git switch p3-back`.
git status --short --branch
```

Si une branche P3 déjà existante n'est pas à jour avec `main`, inspectez les
divergences avant intégration; ne forcez ni ne réécrivez son historique.

### Configuration locale P3

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r api/requirements.txt -r scripts/requirements.txt
python -m unittest discover -s api/tests -v
python -m flask --app api.app run --host 127.0.0.1 --port 5000
```

Le CSV par défaut est `data/barometre/reponses.csv`; il est ignoré par Git et ne
doit pas exister avant activation approuvée et première soumission valide.
N'ajoutez pas de `.env` avec des secrets au dépôt.

Vérifiez votre identité Git avant tout commit :

```bash
git config user.name "Votre nom GitHub"
git config user.email "Votre adresse e-mail GitHub (ou noreply)"
git var GIT_AUTHOR_IDENT
```

### Suite des tâches P3

Le socle Flask, l'endpoint de santé et les gardes 503 M0 sont déjà en place.
Poursuivez les routes métier et la coordination selon les livraisons P1/P2. Le
contrat commun du questionnaire est [`contrat_barometre.md`](./contrat_barometre.md);
la proposition de 17 questions est codée mais **non approuvée et non activée**.
Obtenez les validations organisationnelles, le texte exact du consentement, la
politique de conservation et de petites cellules; coordonnez avec P1 pour la
liste des quartiers. Le M0 n'est pas à refaire.

---

## 3. Contrats API a livrer

| Methode et route | Contrat de succes | Erreurs pertinentes |
|---|---|---|
| `GET /api/sante` | `{"statut":"ok"}` | Processus non disponible |
| `GET /api/indicateurs` | `[{code, libelle, unite}]` | `503` si JSON absent/invalide |
| `GET /api/indicateurs/<code>` | Fiche avec series; scenario facultatif | `404` code inconnu, `503` fichier absent |
| `GET /api/zones?annee=2018` | FeatureCollection contractuelle | `400` annee invalide, `503` GeoJSON absent |
| `POST /api/barometre` | `{consentement: true, reponses: {champ: valeur}}`; réponses renseignées seulement, `{"ok":true}`, HTTP 201 | `400` payload/consentement/valeur invalide; `503` si schéma non activé |
| `GET /api/barometre/resultats` | `{total, agregats: {champ: {nombre_reponses, reponses, distribution_masquee}}}` | `503` si schéma non activé ou CSV illisible; après activation sans CSV, succès avec zéro réponse |

Le contrat canonique et la proposition de 17 questions figurent dans
[`contrat_barometre.md`](./contrat_barometre.md); le schéma exécutable est
`api/services/barometre_schema.py`. `total` compte les formulaires et chaque
question expose séparément son nombre de réponses non vides. Si une catégorie
est sous le seuil approuvé, la distribution de cette question est masquée.
P2 consomme `agregats`; aucun endpoint ne renvoie des lignes brutes.

Une erreur ne doit jamais ressembler a un succes vide. Retournez un statut
approprie et une erreur courte en JSON; consignez le detail technique dans les
logs serveur.

---

## 4. Parcours par jalon, etapes et commits

### Etape 1 — health, factory et fallback SPA

**Etat :** le health check et les routes M0 ont été vérifiés; ne recréez pas
l'application factory. Les changements P3 partent depuis `main` synchronisé.
**Depend de :** structure Python, dependances Flask.
**But :** React et Flask sont servables, meme quand les assets metier ne sont
pas encore disponibles.

`api/app.py` :

```python
from pathlib import Path

from flask import Flask, jsonify, send_from_directory

from routes.barometre import barometre_bp
from routes.indicateurs import indicateurs_bp
from routes.zones import zones_bp

API_DIR = Path(__file__).resolve().parent
STATIC_DIR = API_DIR / "static"


def create_app():
    app = Flask(
        __name__,
        static_folder=str(STATIC_DIR),
        static_url_path="",
    )
    app.config["MAX_CONTENT_LENGTH"] = 4 * 1024
    app.register_blueprint(indicateurs_bp)
    app.register_blueprint(zones_bp)
    app.register_blueprint(barometre_bp)

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

Le code ci-dessus n'initialise aucun CSV au démarrage. N'activez pas CORS globalement en
production : en dev, le proxy Vite et le meme host suffisent; ajoutez une
configuration CORS locale seulement si un besoin technique est confirme.

Smoke test de l'API après un changement P3 (le health test M0 a déjà passé) :

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
git status --short --branch
**Quand :** mercredi matin, M1.
**Depend de :** contrats JSON/GeoJSON signes; fichiers P1 disponibles ou un
mock local explicitement identifié.

**Etat M1 (25 novembre) :** le service de chargement/validation/cache est
implémenté. En attendant les assets de P1, les tests utilisent deux fixtures
minimales sous `api/tests/fixtures/` : un indicateur fictif et une zone
GeoJSON fictive. Elles ne doivent pas être copiées dans `data/` ni utilisées
comme données de démonstration. Après le merge P1, les routes liront les assets
depuis `data/indicateurs/` et `data/geojson/`; redémarrez Flask pour vider le
cache après leur remplacement.

Le service [`data_loader.py`](../api/services/data_loader.py) lit tous les
fichiers JSON d'indicateurs, rejette les schémas invalides ou les codes
dupliqués, et met en cache les assets validés. Il vérifie également le
GeoJSON, ses géométries, ses propriétés et les 105 features attendues. Les
erreurs sont propagées comme erreurs d'assets; les routes les journalisent et
répondent 503 plutôt que de retourner des listes vides. Le cache est en mémoire :
redémarrez Flask après la livraison ou la régénération des fichiers par P1.

### Etape 3 — routes indicateurs et zones

**Quand :** mercredi matin, disponible pour la premiere integration M1.
**Depend de :** service de chargement et fichiers P1.

**Etat M1 (25 novembre) :** les routes de catalogue, détail/scénario et zones
sont implémentées et testées avec les deux fixtures courtes. L’application
accepte `INDICATORS_DIR` et `ZONES_FILE` pour les tests; le contrôle de
production exige les 105 zones du contrat, tandis que le test configure une
seule feature fictive. Les fichiers absents ou invalides retournent 503,
l’année invalide retourne 400, et aucun asset manquant ne devient une réponse
vide de succès. Rejouez les tests d'intégration mock avec
`./.venv/bin/python -m unittest discover -s api/tests -v`.

Les routes [`indicateurs.py`](../api/routes/indicateurs.py) et
[`zones.py`](../api/routes/zones.py) consomment ce service. Le catalogue ne
retourne que `code`, `libelle` et `unite`; le détail retourne la fiche complète
et filtre `series` si `scenario` est fourni. Le code ou scénario absent retourne
404. `/api/zones` accepte uniquement les années 2018, 2025 et 2035 et renvoie
le GeoJSON sans modifier ses propriétés.

Tests manuels avec des fichiers P1 :

```bash
curl -i http://localhost:5000/api/indicateurs
curl -i \
  'http://localhost:5000/api/indicateurs/1.1__population_urbaine_de_l_aire_metropolitaine'
curl -i 'http://localhost:5000/api/zones?annee=2018'
curl -i 'http://localhost:5000/api/zones?annee=2020'
```

Avec les assets P1, le catalogue doit contenir les indicateurs exportés; la
dernière requête doit retourner 400. La requête 2018 retourne les 105 features
et le contrat exact. Avant leur livraison, ces routes doivent retourner 503;
les fixtures courtes ne remplacent pas les assets sous `data/`.

Commit :

```bash
git add api/routes/indicateurs.py api/routes/zones.py
git commit -m "Expose indicator and zone API routes"
git push -u origin p3-back
```

### Etape 4 — contrat proposé, validations et transport CSV

**Etat actuel :** le bootstrap M0 est passé. Les routes et la validation
technique sont en place, mais la collecte demeure inactive. Le contrat unique
est [`contrat_barometre.md`](./contrat_barometre.md), avec les choix exécutables
dans `api/services/barometre_schema.py`. Il propose 17 questions facultatives;
ne maintenez pas un second tableau de champs ou de valeurs dans les guides.

Avant activation, P3 obtient et consigne :

1. approbation par l'organisation des 17 libellés et choix, dont les options de
   sexe et d'âge; la cible actuelle est adulte;
2. le texte exact du consentement, qui reste une condition d'envoi et pas une
   question/colonne;
3. les règles d'accès, de conservation et de suppression;
4. la politique de confidentialité des petites cellules (seuil technique
   proposé : masquer la distribution entière d'une question si une de ses
   catégories a moins de 5 réponses).

P1 fournit et valide la liste officielle des quartiers et les valeurs stables.
Le champ `quartier_residence` reste non disponible jusque-là; aucune adresse ou
option libre ne le remplace. Tant qu'une seule validation manque, les drapeaux
dans `api/services/barometre_schema.py` restent faux/vides; POST et GET
répondent 503 et Flask ne crée pas de CSV. Le seuil 5 est une proposition, pas
une décision organisationnelle déjà approuvée.

Après approbation, le client envoie `consentement: true` et un sous-ensemble
non vide des réponses renseignées. Les questions passées sont omises par le
client et enregistrées comme cellules vides par Flask dans les 17 colonnes.
Le serveur refuse les champs inconnus, les valeurs non autorisées, l'absence
de consentement et un formulaire sans réponse. Le CSV n'est créé qu'à la
première soumission valide; aucun fichier n'est initialisé au démarrage.

### Etape 5 — page participative et Resultats

Cette étape reste bloquée pour la collecte jusqu'aux validations ci-dessus. À
l'implémentation, les contrôles sont des listes déroulantes facultatives à choix
unique, dans l'ordre et avec les libellés du contrat canonique. Le bouton exige
le consentement et au moins une réponse; les champs vides ne sont pas envoyés.
La page doit afficher l'état en attente tant que l'API retourne 503 et ne doit
pas faire passer la proposition pour un questionnaire approuvé.

F9 consomme uniquement `GET /api/barometre/resultats`. `total` est le nombre
de formulaires reçus; `nombre_reponses` est calculé séparément pour chaque
question en excluant les valeurs vides. Si une catégorie d'une question est
sous le seuil approuvé, la distribution entière de cette question est masquée
pour empêcher les déductions par différence. N'affichez jamais les réponses
individuelles. Avec zéro formulaire après activation, l'état « aucune réponse »
est explicite; cela ne doit pas être confondu avec le 503 du questionnaire
encore désactivé.

Tests ciblés disponibles :

```bash
python -m unittest discover -s api/tests -v
```

Les tests couvrent les 17 champs, la configuration désactivée, l'absence de CSV,
une soumission partielle, la validation de valeurs et la suppression des
petites cellules. N'ajoutez aucune réponse réelle ou CSV de test au dépôt.

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
| Champ inconnu/valeur invalide | POST apres activation | 400; aucune ecriture |
| Réponses partielles valides | POST après activation | 201; toutes les colonnes CSV, absences vides |
| Aucune réponse renseignée | POST après activation | 400; aucune écriture |
| Agrégation | GET résultat après test | Comptes par question; petites distributions masquées; aucune ligne brute |
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
| M0 terminé — PASS (25 nov. 2026) | App factory, health, routes et état 503 vérifiés; ne pas refaire le bootstrap |
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

| Jalon | Votre livrable a montrer | Statut |
|---|---|---|
| M0 — terminé, PASS (25 nov. 2026) | Health route, factory, routes désactivées, proposition de 17 questions, tests ciblés et guides; ne pas refaire le bootstrap | Terminé |
| M1 — mercredi 12 h 30 | Routes indicateurs/zones lisent les vrais fichiers P1; 88 indicateurs catalogués, 105 zones | Terminé |
| M2 — mercredi 17 h 30 | Baromètre validé (105 quartiers, 17 questions), POST valide, CSV persistant, page `Participatif.jsx` livrée | Terminé |
| M3 — jeudi 12 h 30 | F9 résultats agrégés avec ChartCard haute fidélité (livré), support multi-couches F4 (infrastructures), indicateurs réels F6 (parts modales) et F7 (GES/temps), page Methodologie F10 | Terminé |
| M4 — jeudi 17 h 30 | Routes d'export de données F11/F12, README reproductible, validation Docker Compose avec P1, gel de livraison | Export et README terminés ; Docker final à revalider |
| M5 — vendredi 13 h | Contrôle croisé de 5 valeurs, répétition générale de la démo (10 min), déploiement | Contrôle fait (5 561 points, 0 écart) ; répétition à faire |

Votre perimetre est fini quand :

- les routes de l'API couvrent l'intégralité des indicateurs réels (dont F6 parts modales, F7 GES/temps, F4 couches);
- JSON/GeoJSON invalides ne se transforment pas en reponses vides de succes;
- le cache est redemarre apres generation et l'erreur est visible;
- `POST` refuse consentement absent, réponse vide, champs inconnus ou valeurs
  non autorisées; les réponses partielles sont acceptées et les absences restent
  des cellules CSV vides;
- le schema du CSV est verifie et les reponses restent hors Git;
- F8 (Participatif) et F9 (Résultats) sont interactifs, esthétiques et respectent le seuil d'anonymat $k \ge 5$;
- les pages Methodologie et README correspondent aux choses livrees, pas aux
  choses espérées;
- P1/P2 ont execute un test d'integration avec vous;
- la demo est repetee; les blocages et l'URL locale/publique sont explicites.

---

## 7. Decisions a escalader avant de coder

| Question | Qui obtient la reponse | Effet si inconnue |
|---|---|---|
| La proposition de 17 questions et les choix (notamment sexe/âge) sont-ils approuvés ? | P3 auprès de l'organisation | F8/F9 restent bloqués; POST/GET baromètre en 503 |
| P1 a-t-il fourni la liste officielle des quartiers et valeurs stables ? | P1 avec validation de l'organisation | Le champ `quartier_residence` reste non configuré et le questionnaire désactivé |
| Texte de consentement et durée de conservation approuvés ? | Organisation, relayée par P3 | Pas de collecte |
| Politique de suppression des petites cellules approuvée ? | Organisation avec P3 | Pas de publication des agrégats |
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

## État final P3 — 26 novembre 2026

- API : routes indicateurs, zones, couches GeoJSON, baromètre (questions, envoi,
  résultats) et export (`/api/export/indicateurs.csv`, `/api/export/indicateurs/<code>.csv`,
  `/api/export/geojson/<couche>.geojson`) ; 19 tests unittest passent.
- Baromètre : 17 questions validées et actives, 105 quartiers, consentement, CSV local,
  agrégats masqués si une catégorie compte moins de 5 réponses ; les réponses brutes
  ne sont jamais exportées. Voir [`contrat_barometre.md`](./contrat_barometre.md).
- Interface P3 : page Baromètre à onglets (Participatif, Résultats) ; questionnaire en
  5 étapes avec progression et récapitulatif ; résultats en barres horizontales.
- Méthodologie (F10) : sources, scénarios, statut des données, FAQ, mentions légales,
  licences et téléchargements, équipe ENSPY.
- Coordination : PR #2, #5, #9 et #10 fusionnées ; PR #11 finale ; README, SOURCES et
  contrats mis à jour. Contrôle de fidélité : 5 561 points, 0 écart avec le CSV brut.
