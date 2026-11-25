# Guide d'execution technique - Observatoire de la mobilite urbaine de Yaounde

**Document de reference de l'equipe — aligne sur `plan.pdf` et `partage_des_taches.pdf`**
Projet de hackathon, trois developpeurs, du 24 au 27 novembre 2026
Livrable: premiere maquette retrospectif / prospectif / participatif

> **Regle d'arbitrage :** `plan.pdf` est le cahier des charges de reference. Ce
> guide l'explicite en taches, contrats et exemples de code; il ne remplace pas
> ses choix de produit. Les ajustements proposes ci-dessous resolvent les
> contradictions entre les deux PDF, les decisions validees par l'equipe et les
> limites observees dans les donnees. Les guides individuels seront produits
> ensuite a partir de ce socle.

---

## 1. Le produit a construire

L'equipe construit une application web de demonstration qui :

1. expose des indicateurs de mobilite deja prepares, sans recalculer les
   indicateurs ni les projections;
2. distingue clairement les valeurs de source, interpolees, extrapolees,
   recalculees et construites;
3. compare historique, tendanciel, volontariste et rupture, uniquement quand la
   valeur correspondante existe;
4. montre la population par zone pour 2018, 2025 et 2035;
5. integre un questionnaire anonyme de six a huit questions et une vue de ses
   reponses de test;
6. explique les sources, les hypotheses et les limites;
7. se lance avec un seul conteneur Docker : Flask sert l'API et le build React.

### Fonctionnement complet, de la source a l'ecran

```text
CSV / dictionnaire + shapefile
        │
        ├─ P1 : scripts de preparation, sans recalcul des indicateurs
        │        ├─ data/indicateurs/*.json
        │        └─ data/geojson/zones_population.geojson
        │
        └─ P3 : Flask lit ces fichiers, les valide/cache et expose /api/*
                 │
                 └─ P2 : client Axios (/api) alimente pages React et Chart.js
                          P1 fournit le composant de carte Leaflet

React questionnaire ──POST /api/barometre──> Flask valide ──> CSV local
Page Resultats       <──GET /api/barometre/resultats── agregats anonymes

Build Docker multi-stage : Vite compile React -> api/static/
                           Flask sert l'API et l'interface sur le port 5000
```

Le navigateur ne lit jamais les CSV ou shapefiles bruts. P1 les transforme en
fichiers statiques versionnes ou fournis au build; P3 les sert sans base de
donnees; P2 consomme les routes pour les visualisations. Le seul ecrit runtime
est le CSV de reponses de test, partage par le bind mount Docker local.

### Hors perimetre

- Base de donnees, comptes, authentification, administration et multi-villes.
- Recalcul des indicateurs, entrainement de modele ou nouvelle prevision.
- Donnees de trafic en temps reel, accidents, OD ou mesure de l'impact des
  projets.
- Suivi de l'avancement du plan d'action, diagramme de Gantt ou outil de gestion
  de projets.
- Plateforme de production, observabilite, pipeline automatise ou CI/CD elaboree.
- Couches d'infrastructure et export CSV si les fonctions obligatoires ne sont
  pas terminees.

## 2. Arbitrages de senior et incoherences a ne pas laisser a l'equipe

Les decisions de produit du PDF sont maintenues. Les points suivants sont des
clarifications necessaires pour que son architecture fonctionne en pratique.

| Point du PDF | Risque ou ambiguite | Decision d'execution |
|---|---|---|
| `plan.pdf` place le cadrage au mardi matin; `partage_des_taches.pdf` reserve 14 h–17 h 30 au depot/contrats | Les calendriers ne donnent pas le meme horaire de kickoff | Prevalence de `plan.pdf` : contrats et choix le mardi matin; l'apres-midi sert a terminer le bootstrap. M0 est valide au plus tard mardi 17 h 30, avant les branches. |
| `partage_des_taches.pdf` place deux objectifs differents au mercredi matin | Donnees/API/premier graphique et premier parcours complet ne peuvent pas etre deux jalons separes sur la meme plage | Prevalence du decoupage de `plan.pdf` : mercredi matin = M1 (assets, API, premier graphique/build); mercredi apres-midi = M2 (parcours complet). |
| La repartition demande Google Form/iframe, alors que le contrat de route prevoit POST Flask | Deux canaux de collecte ne partageraient ni stockage ni resultats | Decision deja validee : formulaire React -> `POST /api/barometre` -> CSV local. Pas de Google Form, iframe ni import manuel. C'est l'unique ecart fonctionnel assumé au PDF de repartition. |
| Le contrat de resultat du PDF nomme `{total, par_mode}`; les questions finales ne sont pas encore connues | Des cles `par_frequence`/`par_motif` fixes supposeraient un questionnaire non approuve | Contrat retenu : `{total, agregats: {<champ_approuve>: [...]}}`; les agregats suivent les champs confirmes par l'organisation. Si `mode_principal` existe, exposer aussi `par_mode` pour compatibilite avec le contrat PDF. |
| `plan.pdf` exige une page Resultats dans ses livrables/criteres; `partage_des_taches.pdf` classe F9 comme souhaitable | Le niveau de priorite se contredit | `plan.pdf` prevaut : F9 est obligatoire au minimum en 2–3 graphiques agreges de test; etat « aucune reponse » si le CSV est vide, jamais de chiffres inventes. |
| Les contrats d'indicateur et GeoJSON sont fournis, mais les colonnes de la source doivent rester autoritaires | Un code, une unite ou une propriete recopiee du PDF peut ne pas exister dans les fichiers remis | P1 verifie code, unite, champs et CRS contre les fichiers sources; l'API et React consomment les noms stables definis ici, jamais des suppositions. |
| Les proprietaires des contrats ne sont pas tous ceux des consommateurs | P2 peut commencer les graphiques avant les JSON ou l'API; carte et page Carte risquent d'etre modifiees simultanement | P1 produit JSON, GeoJSON et composant Leaflet; P3 produit les routes; P2 produit le shell, la mise en page, Axios et ChartCard. Les dependances et fichiers exclusifs sont en section 3. |
| `docker-compose.yml` monte toutes les donnees en lecture seule alors que POST doit ecrire | Le questionnaire echouerait sur le systeme de fichiers en lecture seule | Monter `indicateurs/` et `geojson/` en lecture seule; monter `./data/barometre` en ecriture. Generer le `.env` local pour aligner UID/GID. |
| Le CSV de reponses est persistant localement, mais le disque d'un conteneur heberge peut etre ephemere | Les reponses peuvent disparaitre au redeploiement | Les reponses du hackathon restent des donnees de test. Pour une collecte reelle, configurer un disque persistant et valider consentement, acces et conservation avant ouverture publique. |
| URL publique dans les criteres, mais un lancement local est aussi annonce comme livrable | La disponibilite de l'hebergeur, des comptes ou du reseau peut echapper a l'equipe | Cible: URL publique si l'acces est disponible. Solution de repli: image Docker demonstrable en local, avec blocage consigne. |
| Donnees de rupture incompletes et incoherence signalee en 2036 | Un graphique peut laisser croire a des observations ou a une couverture complete | N'inventer aucune valeur. Afficher « non disponible », le badge « hypothese » et la provenance. Ne pas corriger le modele source dans ce projet. |
| La carte contient des populations par zone, pas par scenario de transport | Une carte pourrait suggérer que les populations varient selon le scénario | La carte est uniquement un choix d'annee de population; ne pas la faire varier selon tendanciel / volontariste / rupture. |
| Le PDF donne un seuil d'image Docker de 500 Mo | La taille peut varier selon les images de base et dependances geospatiales | GeoPandas sert a la preparation sur la machine de developpement, pas dans le conteneur de production. Mesurer l'image et enlever les dependances de preparation si elle depasse le seuil. |

### Faits sur les donnees a garder visibles

- `donnees_longues.csv` a les colonnes `code_indicateur`, `indicateur`,
  `unite`, `annee`, `scenario`, `valeur`, `statut`, `origine`.
- Le fichier contient 16 328 lignes de donnees et 311 codes d'indicateurs;
  confirmer ces totaux le premier jour avant de coder.
- Six annees sont des points d'ancrage : 2000, 2005, 2010, 2018, 2025 et 2035.
  Les annees intermediaires sont interpolees; 2036 est extrapolee.
- La rupture est construite et n'existe que pour une partie des indicateurs.
- Pour les GES, afficher les champs recalcules `ges_total_recalcule` et
  `ges_par_habitant_recalcule`; ne pas recomposer le total a partir des modes.
- Pour les parts modales, utiliser `part_modale__*`, et non les pourcentages
  arrondis.
- Les donnees de population par zone sont dans `Noms_zones.shp` :
  `pop_2018`, `pop_2025`, `pop_2035`, 105 polygones. Les champs et totaux sont
  a verifier avant export.
- Ne pas utiliser les couches `Population*_points100` pour recalculer une
  population : leur poids n'est pas documente.

## 3. Equipe, responsabilites et definition de fini

Chaque personne a un domaine principal, mais le depot et les choix d'interface
sont partages. Une integration collective est faite a chaque fin de demi-journee.

| Personne | Perimetre exclusif (conforme au PDF) | Fichiers / livrables possedes | Ne modifie pas sans accord |
|---|---|---|---|
| P1 — Data + Carte + Docker | Verification/preparation des donnees, SIG/Leaflet, conteneurisation et deploiement | `scripts/`, `data/indicateurs/`, `data/geojson/`, `web/src/components/MapView.jsx`, `Dockerfile`, `docker-compose.yml` | API Flask, Chart.js, layout React, questionnaire et pages P3 |
| P2 — Frontend | Squelette React, layout/nav, conventions visuelles, graphiques et responsive | `web/src/App.jsx`, `Layout.jsx`, `web/src/pages/Accueil.jsx`, `Retrospectif.jsx`, `Prospectif.jsx`, `Carte.jsx`, `web/src/components/ChartCard.jsx`, CSS | Scripts Python, API Flask, composant Leaflet de P1, Docker |
| P3 — Backend + Participatif + Coordination | API Flask, lecture/cache des fichiers, collecte/resultats, Methodologie, README et coordination | `api/`, `web/src/pages/Participatif.jsx`, `Resultats.jsx`, contenu de `Methodologie.jsx`, `README.md`, bilan et support de demo | Graphiques/ChartCard, carte/Leaflet, scripts et fichiers Docker |

P2 possede la page `Carte.jsx` et son layout; cette page integre le composant
`MapView.jsx` fourni par P1. P2 possede `ChartCard.jsx`; P3 consomme ce composant
pour ses resultats, sans le modifier. P3 possede les contrats et routes API;
P1 et P2 les consomment. P3 redige les commandes README, P1 les verifie sur
Docker, sans transfert de propriete du Dockerfile. Le contrat d'interface est
la seule zone modifiable par accord commun. Chacun fait une revue fonctionnelle
d'au moins un livrable hors de son perimetre.

### Contrats figes avant les branches de fonctionnalite

| Contrat | Producteur / consommateurs | Forme acceptee |
|---|---|---|
| Indicateur JSON | P1 / P3, P2 | `code`, `libelle`, `unite`, `source`, `series[]`; un point contient `scenario`, `annee`, `valeur`, `origine` et le `statut` source s'il existe. Les valeurs sont reprises des sources, pas recalculees. |
| GeoJSON | P1 / P3 et P1 | `FeatureCollection` en EPSG:4326; `properties` contient exactement `nom`, `pop_2018`, `pop_2025`, `pop_2035`. Geometries simplifiees; aucun identifiant additionnel. |
| API | P3 / P1, P2 | Routes stables ci-dessous; les erreurs HTTP et les donnees absentes restent explicites. |
| ChartCard | P2 / P3 | Props exactes : `type`, `data`, `options`, `titre`, `unite`, `source`; `data/options` sont les objets Chart.js construits par le consommateur. Palette du PDF. |
| Barometre | P3 / P2 | Formulaire React a choix fermes; POST valide consentement et valeurs; CSV local; GET ne renvoie que totaux agreges sans lignes brutes. |

Routes minimales partagees :

| Methode et route | Reponse / comportement |
|---|---|
| `GET /api/sante` | `{"statut":"ok"}` |
| `GET /api/indicateurs` | Liste `[{code, libelle, unite}]` |
| `GET /api/indicateurs/<code>?scenario=` | Fiche avec series; scenario optionnel |
| `GET /api/zones?annee=2018` | FeatureCollection, annee parmi 2018/2025/2035 |
| `POST /api/barometre` | Validation puis `{"ok":true}`, HTTP 201 |
| `GET /api/barometre/resultats` | `{total, agregats: {champ: [{reponse, nombre}]}}`; agregats anonymes et limites aux champs approuves; alias `par_mode` si le champ existe |

Les quatre contrats d'interface du PDF (JSON, GeoJSON, routes API, ChartCard)
sont relus par les trois personnes avant les branches. Le questionnaire a un
contrat de transport fige (React -> POST -> CSV), mais ses six a huit libelles
et listes de choix sont un intrant de l'organisation, pas un choix technique a
inventer. P3 les recueille avant d'implementer F8 et fige `FIELDS`/`ALLOWED`
avec P2. S'ils sont absents au kickoff, le socle conserve seulement des routes
barometre desactivees (503 explicite), ne cree pas de CSV et affiche que le
questionnaire n'est pas configure; cette dependance est attribuee a P3 et aucune
collecte publique n'est ouverte. Les autres perimetres peuvent avancer sans
simuler les reponses.

### Dependances entre livrables

```text
P1 JSON ───────────────> P3 API indicateurs ─────> P2 pages/graphiques
      └──────────────────────────────────────────> P2 pages/graphiques
P1 GeoJSON ────────────> P3 API zones ───────────> P1 MapView / P2 page Carte
P2 client Axios + ChartCard ─────────────────────> P3 Resultats
P3 routes barometre ────────────────────────────> P3 Participatif / Resultats
P1 assets + P2 build Vite + P3 app Flask ───────> Docker Compose integration
```

Le consommateur ne bloque pas en silence : si un contrat/livrable est en retard
de plus de 30 minutes, son proprietaire alerte les deux autres au sync et le
trio choisit explicitement mock temporaire, livraison partielle ou report.

### Priorites de livraison si le temps manque

| Priorite du PDF | Fonctions | Decision |
|---|---|---|
| Indispensable | F1 accueil, F2 retrospectif, F3 carte population, F5 comparateur, F8 questionnaire, F9 resultats, F10 methodologie | Garder; terminer et verifier avant les souhaitables |
| Souhaitable | F4 infrastructures, F6 parts modales, F7 GES/temps | Au sync du jeudi 17 h 30, terminer seulement si les indispensables passent; sinon marquer « en cours / non disponible » et ne pas les presenter comme terminees |
| Optionnel | F12/export, corridors, couches `ZONAGE_` et finitions | Couper en premier |

Le socle local, l'API, la provenance et le build Docker restent des conditions
de fonctionnement de la demo, pas des fonctions numerotees a substituer aux
priorites produit. L'URL publique depend des acces et du stockage; elle ne bloque
pas une demonstration locale validee.

Ne pas sacrifier l'exactitude des donnees ou faire passer une valeur absente pour
zero afin de gagner du temps.

## 4. Initialiser le depot et les environnements

### 4.1 Arborescence demandee

```text
Yaounde_mobility/
├── data/
│   ├── indicateurs/
│   │   ├── .gitkeep          # M0; JSON generes et ajoutes a M1 si autorises
│   │   └── *.json            # sortie P1, pas presente au bootstrap
│   ├── geojson/
│   │   ├── .gitkeep          # M0; GeoJSON genere a M1 si autorise
│   │   └── zones_population.geojson
│   ├── barometre/
│   │   ├── .gitkeep          # conserve le dossier dans Git
│   │   ├── README.md         # schema et regles de conservation
│   │   └── reponses.csv      # cree apres validation du schema; ignore par Git
│   └── raw/                  # local et ignore; CSV/SHP fournis
├── scripts/
│   ├── preparer_donnees.py
│   ├── preparer_zones.py
│   └── requirements.txt
├── api/
│   ├── app.py
│   ├── routes/
│   │   ├── indicateurs.py
│   │   ├── zones.py
│   │   └── barometre.py
│   ├── services/data_loader.py
│   └── requirements.txt
├── web/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── src/
│       ├── api/client.js
│       ├── components/       # ChartCard P2 (M1), MapView P1 (M2)
│       ├── pages/            # sept routes; squelette M0, fonctions par branche
│       ├── App.jsx
│       └── Layout.jsx
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── README.md
└── SOURCES.md
```

### 4.2 Etat exact de `main` avant les branches personnelles

Il n'y a qu'un depot neuf, sans copier ni modifier le depot de reference. Le
premier etat publie sur `main` est un socle compilable et executable, pas une
version metier terminee :

| Chemin sur `main` | Etat initial requis |
|---|---|
| Racine | `README.md` (demarrage, flux, contrats, commandes), `SOURCES.md` (provenance), `.gitignore`, `.dockerignore`, `Dockerfile`, `docker-compose.yml` |
| `data/indicateurs/`, `data/geojson/` | Seulement `.gitkeep`; aucun JSON/GeoJSON invente ou incomplet |
| `data/barometre/` | `.gitkeep` + README avec schema, vie privee et stockage; aucun `reponses.csv` |
| `data/raw/` | Dossier local ignore; CSV, dictionnaire et shapefile ne sont pas dans le socle Git |
| `scripts/` | Deux points d'entree avec contrat/arguments documentes; la preparation complete appartient a P1 |
| `api/` | Application factory, `GET /api/sante`, blueprints/services initialises; routes donnees en 503 tant que les assets manquent; routes barometre en 503 tant que le schema organisationnel n'est pas valide |
| `web/` | Vite/React, dependances lockees, client Axios `baseURL: "/api"`, Layout/navigation et 7 routes avec etats vides clairement marques |
| Fichiers locaux | `.env`, environnements virtuels, `node_modules`, build frontend, reponses et sources brutes exclus de Git |

Ce socle n'inclut ni mock metier pouvant etre pris pour une vraie valeur, ni
collecte reelle, ni resultat de formulaire. L'interface peut afficher un etat
« donnees non encore preparees »; une route qui depend de fichiers absents
retourne une erreur explicite (pas une liste vide presentee comme un succes).
Les routes et leurs schemas sont toutefois fixes avant les branches.

**Porte d'acceptation de `main` avant de se separer :**

1. Tous les trois valident les contrats de la section 3 et les proprietaires de
   fichiers; P3 inscrit les decisions et les commandes dans `README.md`.
2. `npm ci && npm run build` reussit; les sept routes naviguent sans erreur.
3. Flask demarre, `GET /api/sante` retourne `{"statut":"ok"}` et les routes de
   donnees signalent clairement que les assets metier sont encore absents.
4. `docker compose config` valide la declaration du conteneur; le build complet
   est fait mercredi apres livraison des donnees selon le planning de `plan.pdf`.
5. `git status --short` ne montre ni sources brutes, ni `.env`, ni reponses.

### 4.3 Bootstrap, merge de base et creation des branches

Le socle est construit une seule fois avant le travail de fonctionnalite.
Dans le depot réel `Yaounde_mobility`, la branche de base reste `main`.
La proposition M0 est préparée sur `init/bootstrap`, sans commit ni transfert
de fichiers M0 sur `main`. Après revue humaine, une PR `init/bootstrap` vers
`main` doit être créée puis fusionnée par l'équipe. La branche bootstrap n'est
ni renommée en `main`, ni supprimée automatiquement.

Apres la promotion, chaque personne met a jour `main` et cree une branche depuis
ce meme commit stable : `p1-data`, `p2-front`, `p3-back`. Aucun travail de
fonctionnalite ne commence avant cette etape. Pas de push direct sur `main`;
les integrations passent par une revue/test court, P3 coordonne le merge et les
autres rebasent/mergent `main` dans leur branche au prochain sync. Les commits
restent petits, limites au perimetre possede et n'embarquent pas de fichiers
locaux.

Sequence locale correcte pour remettre le socle M0 sur la branche stable :

```bash
git switch init/bootstrap
git push -u origin init/bootstrap
# P3 ou un mainteneur humain crée une PR init/bootstrap -> main.
# Après revue et fusion humaine, synchroniser le dépôt local :
git switch main
git pull --ff-only
```

Apres la promotion, exemple de creation de branche pour chaque developpeur :

```bash
git switch main
git pull --ff-only
git switch -c p1-data  # P2 remplace par p2-front; P3 par p3-back
```

Le nom de branche est unique par personne; les branches partent toutes du meme
`main` stable et non d'une autre branche de travail.

### 4.4 Commandes d'initialisation

Executer depuis le dossier parent du dépôt déjà existant `Yaounde_mobility`.
Ne pas créer de dépôt imbriqué et ne pas lancer `git init` dans le dépôt existant.

```bash
cd Yaounde_mobility
git switch main
git switch -c init/bootstrap

mkdir -p data/{indicateurs,geojson,barometre,raw}
mkdir -p scripts api/{routes,services}
touch data/indicateurs/.gitkeep data/geojson/.gitkeep
touch data/barometre/.gitkeep
touch data/barometre/README.md
printf 'LOCAL_UID=%s\nLOCAL_GID=%s\n' "$(id -u)" "$(id -g)" > .env

python3.11 -m venv .venv
source .venv/bin/activate
pip install pandas geopandas shapely pyproj
pip install Flask flask-cors gunicorn

npm create vite@latest web -- --template react
cd web
npm install react@18 react-dom@18 react-router-dom@6 axios chart.js@4 react-chartjs-2@5 leaflet@1.9 react-leaflet@4
cd ..

docker --version
docker compose version
```

Separer les dependances afin que GeoPandas et ses dependances ne soient pas
installees dans l'image Flask:

`api/requirements.txt` — uniquement necessaire au runtime:

```text
Flask>=3,<4
flask-cors>=5,<6
gunicorn>=22,<24
```

`scripts/requirements.txt` — preparation lancee sur le poste, pas dans l'image:

```text
pandas>=2,<4
geopandas>=1,<2
shapely>=2,<3
pyproj>=3,<4
```

`npm create vite` cree le `package-lock.json`; le conserver pour que `npm ci`
reproduise le build. Choisir et noter les versions reelles lors de l'installation.

### 4.5 Sources et Git

Copier les sources utiles dans `data/raw/` sans modifier le dossier `files/`
d'origine. Le CSV long et son dictionnaire sont les entrees du prototype; le
classeur Excel sert de reference pour les controles.

```bash
cp ../files/donnees_longues.csv data/raw/
cp ../files/dictionnaire_indicateurs.csv data/raw/
```

Les donnees brutes ne sont jamais commitees. Les placer localement sous
`data/raw/`; les scripts d'exemple utilisent ce chemin fixe, sans option de
chemin alternatif. P1 inscrit dans `SOURCES.md` la provenance, la licence et la
decision de diffusion avant de generer ou de partager les sorties preparees.
Les JSON/GeoJSON necessaires a l'application ne sont commites que si leur
redistribution est autorisee; sinon le depot reste prive et le README de P3
documente le mode de transfert/localisation approuve. Ne pas publier des
donnees d'organisation sans autorisation.

Exemple `.gitignore` :

```gitignore
.venv/
__pycache__/
*.py[cod]
web/node_modules/
web/dist/
api/static/
data/raw/
data/barometre/reponses.csv
.env
```

Exemple `.dockerignore` :

```dockerignore
.git/
.venv/
__pycache__/
*.py[cod]
web/node_modules/
web/dist/
api/static/
data/raw/
data/barometre/reponses.csv
.env
*.shp
*.shx
*.dbf
*.prj
*.qpj
*.pbf
*.log
```

`data/barometre/reponses.csv` est exclu de Git et de l'image. En Flask local,
l'application cree le fichier a son demarrage; avec Compose, le meme fichier
de l'hote est monte sur `/app/data/barometre/reponses.csv`. Le formulaire React
ecrit dans cette unique source de reponses via le POST Flask. Ne jamais ajouter
de reponse de participant au depot.

Contenu a inscrire dans `data/barometre/README.md` :

```text
Source de collecte: formulaire React du site.
Stockage runtime: reponses.csv, cree par Flask apres validation du schema et ignore par Git.
Schema: les noms de colonnes sont ceux de FIELDS dans api/routes/barometre.py.
Vie privee: uniquement choix fermes; aucune donnee identifiante ou texte libre.
Docker: ./data/barometre est monte en ecriture sur /app/data/barometre.
```

Le contrat des six a huit champs doit etre fige avant la page du questionnaire.
`FIELDS` et `ALLOWED` cote Flask font autorite; les noms de champs du formulaire
React doivent correspondre exactement. Aucun champ ni choix d'exemple n'est
fourni dans le depot; les configurations restent vides jusqu'a la validation
officielle du questionnaire.

Comportement exact de `data/barometre/` :

| Contexte | Fichier utilise | Persistance |
|---|---|---|
| Depot neuf | Seul `.gitkeep` est versionne; `reponses.csv` n'existe pas encore | Aucun contenu utilisateur dans Git |
| Flask lance directement sur le poste | `data/barometre/reponses.csv`; cree avec l'en-tete au demarrage si le schema est valide | Sur le poste, ignore par Git |
| `docker compose up` | Le fichier hote `data/barometre/reponses.csv`, monte sur `/app/data/barometre/reponses.csv` apres activation du questionnaire | Persiste dans le depot local apres l'arret du conteneur; ignore par Git |
| Hebergeur sans disque persistant | CSV dans le systeme de fichiers du conteneur | Temporaire; collecte de tests seulement |

Il n'y a pas de copie entre un volume Docker et le depot : Compose monte le
dossier `data/barometre/` lui-meme. Une fois le schema valide, l'API cree le
CSV a son demarrage puis y ajoute les reponses validees. Sans schema, aucune
initialisation ni ecriture n'a lieu. Le `.gitignore` empeche ces reponses de
rejoindre un commit.

Le schema doit etre gele avant la premiere reponse. Au demarrage, l'API compare
l'en-tete du CSV aux champs actifs et s'arrete explicitement en cas d'ecart;
aucune migration ni suppression automatique n'est faite. Si le schema change,
le proprietaire sauvegarde le CSV et ne le reinitialise que s'il ne contient
que des reponses de test.

## 5. Preparation des donnees

### 5.1 Ce que fait le script

Le script lit le CSV long et le dictionnaire, selectionne les indicateurs
prioritaires, verifie les colonnes et la cle, puis produit un JSON par theme.
Il **ne** calcule ni interpolation, ni part modale, ni scenario, ni emission.
Il conserve `statut` et `origine` pour que l'interface sache expliquer chaque
point.

Themes de depart : population, deplacements, parts modales, parc, GES, temps et
corridors si le temps le permet. Les prefixes ci-dessous viennent des codes
disponibles; la liste finale est validee par la personne responsable des donnees
contre le dictionnaire.

### 5.2 Exemple `scripts/preparer_donnees.py`

```python
from pathlib import Path
import json

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/raw/donnees_longues.csv"
DICTIONARY = ROOT / "data/raw/dictionnaire_indicateurs.csv"
OUTPUT = ROOT / "data/indicateurs"

REQUIRED_DATA = {
    "code_indicateur", "indicateur", "unite", "annee",
    "scenario", "valeur", "statut", "origine",
}
REQUIRED_DICTIONARY = {
    "code_indicateur", "indicateur", "unite",
}

# Prefixes are intentionally disjoint; confirm the selected codes in the
# dictionary before using this first cut as the public indicator catalogue.
THEMES = {
    "population": lambda code: code.startswith("1.1__"),
    "deplacements": lambda code: code.startswith("1.2__"),
    "parts_modales": lambda code: code.startswith("part_modale__"),
    "parc": lambda code: code.startswith("1.7__"),
    "ges": lambda code: code.startswith("ges_"),
    "temps": lambda code: code.startswith("4.2__"),
    "corridors": lambda code: code.startswith("corridors__"),
}

def main():
    if not SOURCE.is_file() or not DICTIONARY.is_file():
        raise FileNotFoundError(
            "Sources manquantes: placer les deux CSV dans data/raw/."
        )

    data = pd.read_csv(SOURCE, encoding="utf-8-sig")
    dictionary = pd.read_csv(DICTIONARY, encoding="utf-8-sig")

    missing_data = REQUIRED_DATA - set(data.columns)
    missing_dictionary = REQUIRED_DICTIONARY - set(dictionary.columns)
    if missing_data or missing_dictionary:
        raise ValueError(
            f"Schema inattendu: CSV={sorted(missing_data)}, "
            f"dictionnaire={sorted(missing_dictionary)}"
        )

    if len(data) != 16328 or data["code_indicateur"].nunique() != 311:
        raise ValueError(
            "Jeu inattendu: le plan attend 16 328 lignes et 311 codes; "
            f"trouve {len(data)} lignes et "
            f"{data['code_indicateur'].nunique()} codes."
        )

    if data["code_indicateur"].isna().any():
        raise ValueError("Le CSV contient un code d'indicateur vide.")
    if dictionary["code_indicateur"].duplicated().any():
        raise ValueError("Le dictionnaire contient des codes dupliques.")

    numeric = pd.to_numeric(data["valeur"], errors="coerce")
    invalid = data["valeur"].notna() & numeric.isna()
    if invalid.any():
        examples = data.loc[invalid, "valeur"].head(5).tolist()
        raise ValueError(f"Valeurs non numeriques inattendues: {examples}")
    if numeric.isna().any():
        raise ValueError("Le CSV contient des valeurs numeriques vides.")
    data["valeur"] = numeric
    data["annee"] = pd.to_numeric(data["annee"], errors="raise").astype(int)

    duplicate_key = ["code_indicateur", "annee", "scenario"]
    duplicates = data.duplicated(duplicate_key, keep=False)
    if duplicates.any():
        sample = data.loc[duplicates, duplicate_key].head(5).to_dict("records")
        raise ValueError(f"Doublons sur code/annee/scenario: {sample}")

    metadata = dictionary[
        ["code_indicateur", "indicateur", "unite"]
    ].rename(columns={
        "indicateur": "libelle_dictionnaire",
        "unite": "unite_dictionnaire",
    })
    data = data.merge(
        metadata,
        on="code_indicateur",
        how="left",
        validate="many_to_one",
    )
    unit_conflict = (
        data["unite_dictionnaire"].notna()
        & data["unite"].notna()
        & data["unite_dictionnaire"].astype(str).str.strip().ne(
            data["unite"].astype(str).str.strip()
        )
    )
    if unit_conflict.any():
        sample = data.loc[
            unit_conflict,
            ["code_indicateur", "unite", "unite_dictionnaire"],
        ].head(5).to_dict("records")
        raise ValueError(f"Unites CSV/dictionnaire divergentes: {sample}")
    data["libelle"] = data["libelle_dictionnaire"].fillna(data["indicateur"])
    data["unite_finale"] = data["unite_dictionnaire"].fillna(data["unite"])

    OUTPUT.mkdir(parents=True, exist_ok=True)
    all_codes = set()

    for theme, includes in THEMES.items():
        selected = data[data["code_indicateur"].map(includes)]
        indicators = []
        for code, rows in selected.groupby("code_indicateur", sort=True):
            all_codes.add(code)
            first = rows.iloc[0]
            indicators.append({
                "code": code,
                "libelle": first["libelle"],
                "unite": first["unite_finale"],
                "source": "donnees_longues.csv",
                "series": [
                    {
                        "scenario": row.scenario,
                        "annee": int(row.annee),
                        "valeur": float(row.valeur),
                        "statut": row.statut,
                        "origine": row.origine,
                    }
                    for row in rows.sort_values(
                        ["scenario", "annee"]
                    ).itertuples()
                ],
            })

        if indicators:
            target = OUTPUT / f"{theme}.json"
            target.write_text(
                json.dumps(indicators, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            print(f"{target.relative_to(ROOT)}: {len(indicators)} indicateurs")

    if len(all_codes) < 8:
        raise ValueError(
            f"Seulement {len(all_codes)} indicateurs selectionnes; "
            "valider les prefixes et la liste du dictionnaire."
        )
    print(f"Total selectionne: {len(all_codes)} indicateurs")

if __name__ == "__main__":
    main()
```

**A adapter avant execution :** verifier les prefixes/themes avec
`dictionnaire_indicateurs.csv`; les fichiers JSON ne doivent pas publier
automatiquement les 311 indicateurs si certains sont hors perimetre. Si les
unites du CSV et du dictionnaire divergent, comparer et expliquer l'ecart avant
de choisir l'une d'elles.

Le champ `origine` conserve les valeurs source telles que `fichier`,
`interpole`, `extrapole`, `recalcule`, `construit`. Une donnee manquante n'est
pas une ligne de valeur zero. Le script ne doit pas fabriquer de serie ou remplir
les scenarios incomplets.

### 5.3 Exemple de JSON produit

```json
[
  {
    "code": "1.1__population_urbaine_de_l_aire_metropolitaine",
    "libelle": "Population urbaine de l'aire metropolitaine",
    "unite": "personnes",
    "source": "donnees_longues.csv",
    "series": [
      {
        "scenario": "historique",
        "annee": 2000,
        "valeur": 1500000,
        "statut": "estime",
        "origine": "fichier"
      },
      {
        "scenario": "historique",
        "annee": 2001,
        "valeur": 1580000,
        "statut": "estime",
        "origine": "interpole"
      }
    ]
  }
]
```

Ce JSON illustre la forme, pas des valeurs a recopier. Toutes les valeurs
publiees doivent venir du CSV de reference.

### 5.4 Preparation GeoJSON

Le script de carte ne choisit pas silencieusement le premier champ qui ressemble
a un nom de zone. Le mercredi matin, P1 inspecte `Noms_zones.shp`, consigne le
champ de libelle reel et le renomme `nom`. Le contrat minimal du GeoJSON reste
celui du PDF de repartition : `nom`, `pop_2018`, `pop_2025`, `pop_2035`.

Exemple `scripts/preparer_zones.py` :

```python
from pathlib import Path

import geopandas as gpd
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/raw/Noms_zones.shp"
OUTPUT = ROOT / "data/geojson/zones_population.geojson"

# Remplacer cette valeur apres inspection des colonnes reelles du shapefile.
ZONE_NAME_FIELD = "CHAMP_NOM_A_CONFIRMER"
POP_FIELDS = ["pop_2018", "pop_2025", "pop_2035"]

def main():
    zones = gpd.read_file(SOURCE)
    print("CRS:", zones.crs)
    print("Colonnes:", list(zones.columns))
    print("Nombre de zones:", len(zones))

    if zones.crs is None:
        raise ValueError("CRS absent: confirmer le systeme de coordonnees.")
    required = {ZONE_NAME_FIELD, *POP_FIELDS}
    missing = required - set(zones.columns)
    if missing:
        raise ValueError(f"Champs manquants dans le shapefile: {sorted(missing)}")
    if len(zones) != 105:
        raise ValueError(f"105 zones attendues, {len(zones)} trouvees.")

    for field in POP_FIELDS:
        values = pd.to_numeric(zones[field], errors="coerce")
        invalid = zones[field].notna() & values.isna()
        if invalid.any():
            raise ValueError(f"Valeurs invalides dans {field}.")
        zones[field] = values

    output = zones[
        [ZONE_NAME_FIELD, *POP_FIELDS, "geometry"]
    ].rename(columns={
        ZONE_NAME_FIELD: "nom",
    })
    if not output.crs.is_projected:
        raise ValueError("Simplifier les geometries dans un CRS projete.")
    output.geometry = output.geometry.simplify(
        tolerance=10,
        preserve_topology=True,
    )
    output = output.to_crs("EPSG:4326")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    output.to_file(OUTPUT, driver="GeoJSON", encoding="utf-8")

    for field in POP_FIELDS:
        print(field, "total:", output[field].sum())
    print("GeoJSON ecrit:", OUTPUT)

if __name__ == "__main__":
    main()
```

Verifier les sommes des populations avec les totaux de reference (environ
3 212 283 en 2018, 4 028 468 en 2025, 5 599 668 en 2035). Tout ecart est
documente et arbitre; ne pas forcer une correction. Le champ de superficie ne
sert pas a publier une densite tant que son unite n'est pas confirmee.

## 6. API Flask : routes, erreurs et participation

### 6.1 Contrat de routes

| Methode et route | Utilisation | Reponse attendue |
|---|---|---|
| `GET /api/sante` | Verifier le processus | `{"statut":"ok"}` |
| `GET /api/indicateurs` | Catalogue pour filtres/menus | Liste `{code, libelle, unite}` |
| `GET /api/indicateurs/<code>` | Charger les series d'un indicateur | Indicateur complet; filtre scenario facultatif |
| `GET /api/zones?annee=2018` | Charger le GeoJSON population | FeatureCollection, annee parmi 2018/2025/2035 |
| `POST /api/barometre` | Enregistrer une reponse anonyme de test | HTTP 201 et `{"ok":true}` |
| `GET /api/barometre/resultats` | Alimenter la page F9 sans exposer de reponses brutes | Nombre de reponses et comptes agregees par champ ferme |

Les erreurs de fichiers ou de schema sont visibles dans les logs et renvoyees
avec un statut HTTP d'erreur. L'API ne renvoie pas `[]` ou `{"ok": true}` quand
elle n'a pas pu lire les donnees.

### 6.2 Chargement des JSON

`api/services/data_loader.py` :

```python
import json
from functools import lru_cache
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
INDICATOR_DIR = DATA_DIR / "indicateurs"

@lru_cache(maxsize=1)
def load_indicators():
    files = sorted(INDICATOR_DIR.glob("*.json"))
    if not files:
        raise FileNotFoundError(f"Aucun JSON d'indicateur dans {INDICATOR_DIR}")

    indicators = []
    for path in files:
        try:
            content = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"JSON invalide: {path.name}") from exc
        if not isinstance(content, list):
            raise ValueError(f"{path.name} doit contenir une liste.")
        indicators.extend(content)
    return indicators

@lru_cache(maxsize=1)
def load_zones():
    path = DATA_DIR / "geojson" / "zones_population.geojson"
    try:
        content = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"GeoJSON absent ou invalide: {path}") from exc
    if not isinstance(content, dict) or content.get("type") != "FeatureCollection":
        raise ValueError("Le GeoJSON doit etre une FeatureCollection.")
    return content
```

Le cache est en memoire par processus et sans endpoint d'invalidation; apres
regeneration des JSON/GeoJSON, redemarrer Flask. Cette strategie suffit au
prototype et evite d'introduire une base ou une couche de cache externe.

### 6.3 Exemple d'application Flask

`api/app.py` :

```python
from pathlib import Path

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from routes.indicateurs import bp as indicateurs_bp
from routes.zones import bp as zones_bp
from routes.barometre import (
    bp as barometre_bp,
    initialize_responses,
    questionnaire_configured,
)

API_DIR = Path(__file__).resolve().parent
STATIC_DIR = API_DIR / "static"

def create_app():
    app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="")
    app.config["MAX_CONTENT_LENGTH"] = 4 * 1024
    # En production, React et l'API sont sur la meme origine: pas de CORS requis.
    CORS(app, resources={
        r"/api/.*": {"origins": ["http://localhost:5173"]}
    })

    app.register_blueprint(indicateurs_bp, url_prefix="/api")
    app.register_blueprint(zones_bp, url_prefix="/api")
    app.register_blueprint(barometre_bp, url_prefix="/api")
    if questionnaire_configured():
        with app.app_context():
            initialize_responses()

    @app.errorhandler(FileNotFoundError)
    @app.errorhandler(RuntimeError)
    @app.errorhandler(ValueError)
    def handle_data_error(error):
        app.logger.error("Donnees absentes ou invalides: %s", error)
        return jsonify({"erreur": "donnees absentes ou invalides"}), 503

    @app.get("/api/sante")
    def health():
        return jsonify({"statut": "ok"})

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_react(path):
        # Une route API inconnue doit rester une vraie 404, jamais index.html.
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

Le fallback SPA doit renvoyer `index.html` pour les chemins React (ex.
`/methodologie`), mais jamais pour `/api/...`. En developpement, Vite sert les
pages; le fallback est principalement utilise dans le conteneur.

### 6.4 Exemple routes indicateurs

`api/routes/indicateurs.py` :

```python
from flask import Blueprint, jsonify, request

from services.data_loader import load_indicators

bp = Blueprint("indicateurs", __name__)

@bp.get("/indicateurs")
def list_indicators():
    catalogue = [
        {key: item[key] for key in ("code", "libelle", "unite")}
        for item in load_indicators()
    ]
    return jsonify(catalogue)

@bp.get("/indicateurs/<path:code>")
def get_indicator(code):
    scenario = request.args.get("scenario")
    for item in load_indicators():
        if item["code"] == code:
            if scenario:
                item = {
                    **item,
                    "series": [
                        point for point in item["series"]
                        if point["scenario"] == scenario
                    ],
                }
            return jsonify(item)
    return jsonify({"erreur": "indicateur inconnu", "code": code}), 404
```

Pour le prototype de 16k lignes, charger les petits JSON en memoire est
suffisant. Si un scenario n'a aucune ligne, le frontend montre « non disponible »;
il ne cree pas de point nul.

### 6.5 Exemple route GeoJSON

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

    # Keep the GeoJSON contract unchanged; the React map selects the field.
    return jsonify(load_zones())
```

La requete valide l'annee choisie mais renvoie les quatre proprietes GeoJSON
contractuelles sans les enrichir. React choisit `pop_2018`, `pop_2025` ou
`pop_2035`; une valeur manquante reste distincte de 0 et a son propre style.

### 6.6 Questionnaire et stockage de prototype

Le questionnaire React doit avoir six a huit questions approuvees par l'equipe
encadrante. Le flux retenu est formulaire React -> POST Flask -> CSV local.
Garder des reponses fermees (listes de choix) et ne demander ni nom, ni
telephone, ni adresse e-mail, ni texte libre. Les tests sont etiquetes comme
tests; ne pas presenter leur distribution comme un barometre representatif.

Le depot initial ne contient aucun champ de questionnaire suppose. Tant que
l'organisation n'a pas confirme les 6–8 questions, leurs valeurs autorisees et
le consentement, garder `ALLOWED` vide et `QUESTIONNAIRE_CONFIGURED = False`.
Dans cet etat, Flask ne cree aucun CSV et les routes barometre retournent `503`.
Le formulaire React affiche un etat « en attente de validation », sans accepter
de reponse. P3 active les deux cotes seulement apres avoir reporte le meme schema
approuve dans le backend et le frontend.

Implementation de validation, stockage et aggregation dans
`api/routes/barometre.py` :

```python
import csv
import os
from collections import Counter
from pathlib import Path

from flask import Blueprint, jsonify, request

bp = Blueprint("barometre", __name__)
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
    return QUESTIONNAIRE_CONFIGURED


def response_file():
    configured = os.environ.get("BAROMETRE_CSV")
    if configured:
        return Path(configured)
    repository = Path(__file__).resolve().parents[2]
    return repository / "data" / "barometre" / "reponses.csv"


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
    if not questionnaire_configured():
        return jsonify({"erreur": "questionnaire non configure"}), 503

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
    if not questionnaire_configured():
        return jsonify({"erreur": "questionnaire non configure"}), 503

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

Le formulaire React utilise la meme liste de champs et de valeurs que
`ALLOWED`. Conservez `QUESTIONS` vide tant que l'organisation n'a pas fourni le
schema; la page ne rend alors pas de controles de collecte :

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

  if (!isConfigured()) {
    return <p>Questionnaire en attente de validation par l'organisation.</p>;
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    try {
      await postBarometre({ ...answers, consentement: consent });
      setMessage("Reponse de test enregistree; elle n'est pas representative.");
    } catch (error) {
      setMessage(`Envoi impossible : ${error.message}`);
    }
  }

  return (
    <section>
      <h1>Questionnaire de mobilite</h1>
      <p>Prototype de test; ne saisissez aucune donnee personnelle.</p>
      <form onSubmit={submit}>
        {QUESTIONS.map((question) => (
          <label key={question.name}>
            {question.label}
            <select
              required
              value={answers[question.name] || ""}
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
            required
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          {CONSENT_TEXT}
        </label>
        <button
          type="submit"
          disabled={
            !consent ||
            QUESTIONS.some((question) => !answers[question.name])
          }
        >
          Envoyer
        </button>
      </form>
      <p role="status">{message}</p>
    </section>
  );
}
```

Remplir chaque element de `QUESTIONS` avec un `name`, un libelle et les choix
fournis; `name` et `value` doivent correspondre exactement a `FIELDS` et
`ALLOWED` de Flask. Ajouter aussi le libelle de consentement approuve. Cote
serveur, toute reponse manquante, inconnue ou hors liste est rejetee. La page
`Resultats.jsx` appelle `GET /api/barometre/resultats`; elle affiche les
agregats generiques et ne lit jamais le CSV directement.

**Limite importante :** ce CSV est un stockage de demonstration, pas une base
fiable pour une enquete publique. Le volume Docker local persiste entre les
redemarrages tant qu'il n'est pas supprime; le disque d'un hebergeur peut etre
ephemere. Ne lancer une collecte publique qu'apres configuration d'un stockage
persistant et validation de la duree de conservation, de l'acces, du consentement
et de la sauvegarde.

## 7. Frontend React, graphiques et carte

### 7.1 Configuration Vite

`web/vite.config.js` :

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  build: {
    outDir: "../api/static",
    emptyOutDir: true,
  },
});
```

Le proxy garde le client commun aux deux environnements : `baseURL` reste
`/api` en developpement et en production.

### 7.2 Client API Axios avec erreurs visibles

`web/src/api/client.js` :

```javascript
import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 10000 });

async function request(promise) {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.erreur
      ?? error?.message
      ?? "Erreur API inconnue";
    throw new Error(message);
  }
}

export const getIndicateurs = () => request(api.get("/indicateurs"));

export const getIndicateur = (code, scenario) =>
  request(api.get(`/indicateurs/${encodeURIComponent(code)}`, {
    params: scenario ? { scenario } : {},
  }));

export const getZones = (annee) =>
  request(api.get("/zones", { params: { annee } }));
export const getResultats = () => request(api.get("/barometre/resultats"));

export const postBarometre = (reponse) =>
  request(api.post("/barometre", reponse));
```

Dans chaque page, prevoir trois etats explicites: chargement, erreur avec
possibilite de reessayer, contenu. Ne pas remplacer une erreur par un tableau
vide ou une valeur zero. `baseURL` reste `/api` en developpement (proxy Vite) et
en production (meme origine); ne coder aucune URL de machine ou d'hebergeur.

Exemple d'appel dans un composant React :

```jsx
import { useEffect, useState } from "react";
import { getIndicateurs } from "../api/client";

export function IndicatorMenu({ onSelect }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    getIndicateurs()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attempt]);

  if (error) {
    return (
      <div>
        <p role="alert">Chargement impossible : {error}</p>
        <button onClick={() => setAttempt((value) => value + 1)}>
          Reessayer
        </button>
      </div>
    );
  }
  if (loading) return <p>Chargement des indicateurs…</p>;
  if (!items.length) return <p>Aucun indicateur disponible.</p>;

  return (
    <select onChange={(event) => onSelect(event.target.value)} defaultValue="">
      <option value="" disabled>Choisir un indicateur</option>
      {items.map((item) => (
        <option key={item.code} value={item.code}>
          {item.libelle} ({item.unite})
        </option>
      ))}
    </select>
  );
}
```

### 7.3 Pages et navigation

Les pages attendues du PDF:

| Page | Fonction | Contenu concret |
|---|---|---|
| Accueil | F1 | Contexte, chiffres cles, acces aux volets et avertissement « resultats de modele » |
| Retrospectif | F2 / F3 / F4 | Population, deplacements, parc/motorisation, carte population |
| Prospectif | F5 / F6 / F7 | Comparateur, parts modales, GES/temps si donnees suffisantes |
| Carte | F3 | Population par zone et selection 2018/2025/2035 |
| Participatif | F8 | Questionnaire integre, consentement et choix fermes |
| Resultats | F9 | Agregats anonymes des reponses de test, clairement etiquetes |
| Methodologie | F10 | Sources, provenance, scenarios, limites, hypotheses |

Une navigation par liens avec React Router est suffisante. Eviter de construire
un systeme de design ou une gestion d'etat globale pour ce prototype.

### 7.4 Conventions de graphique

Couleurs fixes du plan :

```javascript
export const SCENARIO_COLORS = {
  historique: "#7f8c8d",
  tendanciel: "#E67E22",
  volontariste: "#27AE60",
  rupture: "#2980B9",
};
```

- Trait plein : origine `fichier` ou autre valeur directement issue de la source.
- Trait pointille : `interpole` ou `extrapole`.
- Badge « hypothese » : scenario `rupture` / origine `construit`.
- Infobulle : annee, valeur, unite, scenario, origine et statut.
- Donnee absente : espace vide/mention « non disponible », jamais un zero ajoute.

Exemple de wrapper `web/src/components/ChartCard.jsx` :

```jsx
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend
);

export const SCENARIO_COLORS = {
  historique: "#7f8c8d",
  tendanciel: "#E67E22",
  volontariste: "#27AE60",
  rupture: "#2980B9",
};

export default function ChartCard({
  type = "line", data, options, titre, unite, source,
}) {
  const Component = type === "bar" ? Bar : Line;
  return (
    <figure className="chart-card">
      <figcaption>
        <h3>{titre}</h3>
        <span>{unite} — {source}</span>
      </figcaption>
      <div className="chart-area">
        <Component data={data} options={options} />
      </div>
    </figure>
  );
}
```

Exemple de preparation des series par P2, en conservant les points d'origine
pour les pointilles et les infobulles :

```jsx
import ChartCard, { SCENARIO_COLORS } from "../components/ChartCard";

function IndicatorChart({ indicator }) {
  const years = [...new Set(indicator.series.map((point) => point.annee))]
    .sort((a, b) => a - b);
  const scenarios = [...new Set(indicator.series.map((point) => point.scenario))];
  const aligned = scenarios.map((scenario) => {
    const byYear = new Map(
      indicator.series
        .filter((point) => point.scenario === scenario)
        .map((point) => [point.annee, point]),
    );
    return years.map((year) => byYear.get(year) ?? null);
  });
  const data = {
    labels: years,
    datasets: scenarios.map((scenario, datasetIndex) => ({
      label: scenario,
      data: aligned[datasetIndex].map((point) => point?.valeur ?? null),
      borderColor: SCENARIO_COLORS[scenario],
      spanGaps: false,
      segment: {
        borderDash: (context) => {
          const point = aligned[datasetIndex][context.p0DataIndex];
          return ["interpole", "extrapole"].includes(point?.origine)
            ? [6, 4]
            : undefined;
        },
      },
    })),
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { title: { display: true, text: indicator.unite } } },
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            const point = aligned[context.datasetIndex][context.dataIndex];
            if (!point) return "";
            const statut = point.statut ? `; ${point.statut}` : "";
            return `${context.dataset.label}: ${point.valeur} ${indicator.unite} `
              + `(${point.origine}${statut})`;
          },
        },
      },
    },
  };

  return (
    <ChartCard type="line" data={data} options={options}
      titre={indicator.libelle} unite={indicator.unite} source={indicator.source} />
  );
}
```

Ce composant suit exactement le contrat de partage : `type`, `data`, `options`,
`titre`, `unite`, `source`. Chaque page construit son objet Chart.js; elle garde
les metadonnees d'origine pour les pointilles et les infobulles. Les jeux de
donnees doivent aligner leurs valeurs sur les annees; une absence devient un
emplacement `null`, jamais un zero. Ne pas lisser ou recalculer les courbes dans
le navigateur.

La page `Resultats.jsx` (F9), detenue par P3, consomme les agregats du GET et
reutilise le contrat de `ChartCard.jsx`, detenu par P2 :

```jsx
import { useEffect, useState } from "react";
import ChartCard from "../components/ChartCard";
import { getResultats } from "../api/client";

export default function Resultats() {
  const [resultats, setResultats] = useState(null);
  const [erreur, setErreur] = useState("");
  const [tentative, setTentative] = useState(0);

  useEffect(() => {
    getResultats().then(setResultats).catch((error) => setErreur(error.message));
  }, [tentative]);

  if (erreur) {
    return (
      <div>
        <p role="alert">Resultats indisponibles : {erreur}</p>
        <button onClick={() => {
          setErreur("");
          setResultats(null);
          setTentative((value) => value + 1);
        }}>
          Reessayer
        </button>
      </div>
    );
  }
  if (!resultats) return <p>Chargement des resultats de test…</p>;
  if (resultats.total === 0) return <p>Aucune reponse de test recue.</p>;

  return (
    <section>
      <p>{resultats.total} reponse(s) de test — non representatives.</p>
      <div className="chart-grid">
        {Object.entries(resultats.agregats).map(([field, lignes]) => {
          const titre = field.replaceAll("_", " ");
          const data = {
            labels: lignes.map((ligne) => ligne.reponse),
            datasets: [{
              label: "Reponses",
              data: lignes.map((ligne) => ligne.nombre),
              backgroundColor: "#2980B9",
            }],
          };
          const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
          };
          return (
            <ChartCard key={field} type="bar" data={data} options={options}
              titre={titre} unite="reponses" source="Barometre de test" />
          );
        })}
      </div>
    </section>
  );
}
```

### 7.5 Carte Leaflet

L'application utilise `react-leaflet` 4 et `leaflet` 1.9. Le conteneur doit
avoir une hauteur explicite; rechanger l'annee remonte la couche GeoJSON pour
appliquer a nouveau le style.

```jsx
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const POPULATION_FIELD = {
  2018: "pop_2018",
  2025: "pop_2025",
  2035: "pop_2035",
};

function colorFor(value) {
  if (value == null || !Number.isFinite(Number(value))) return "#bdbdbd";
  if (value < 10000) return "#edf8fb";
  if (value < 25000) return "#b2e2e2";
  if (value < 50000) return "#66c2a4";
  if (value < 100000) return "#2ca25f";
  return "#006d2c";
}

function bindSafePopup(feature, layer, year) {
  const properties = feature.properties ?? {};
  const popup = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = properties.nom ?? "Zone sans nom";
  const value = properties[POPULATION_FIELD[year]];
  const detail = document.createElement("div");
  detail.textContent = value == null
    ? `Population ${year} : non disponible`
    : `Population ${year} : ${Number(value).toLocaleString("fr-FR")}`;
  popup.append(title, detail);
  layer.bindPopup(popup);
}

export default function MapView({ geojson, year }) {
  const field = POPULATION_FIELD[year];
  const style = (feature) => ({
    fillColor: colorFor(feature.properties?.[field]),
    weight: 1,
    color: "#333",
    fillOpacity: 0.7,
  });
  return (
    <MapContainer
      center={[3.848, 11.502]}
      zoom={10}
      style={{ height: "500px", width: "100%" }}
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
          onEachFeature={(feature, layer) => bindSafePopup(feature, layer, year)}
        />
      )}
    </MapContainer>
  );
}
```

Le PDF propose une palette de scenario constante pour les graphiques; la palette
ci-dessus pour la carte est une echelle de population distincte, ordonnee et
accompagnee d'une legende. Verifier que les seuils restent lisibles et que les
valeurs manquantes ont leur propre symbole. Les fonds OpenStreetMap necessitent
un acces internet et l'attribution visible.

## 8. Docker : image unique et testable

### 8.1 Flux de build/deploiement

```text
CSV / shapefile --(scripts sur poste)--> JSON / GeoJSON
React/Vite --(stage Node)--> api/static/
Flask + API + static + JSON --(stage Python)--> une image Docker
Navigateur --HTTP /: React; /api/*: Flask--> conteneur port 5000
```

Les `.gitkeep` permettent, si le temps le permet, un test d'image du socle M0;
cela ne remplace pas le premier build requis mercredi avec les assets P1. Pour
chaque image metier, les scripts de preparation sont executes **avant** le
build. L'image finale ne contient ni Node, ni GeoPandas, ni les sources brutes.
En production, une seule origine sert le site et l'API; CORS n'est utile qu'en
developpement Vite.

### 8.2 Dockerfile multi-stage

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS web-build
WORKDIR /app
COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci
COPY web/ ./web/
RUN cd web && npm run build

FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

COPY api/requirements.txt ./api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

COPY api/ ./api/
COPY data/indicateurs/ ./data/indicateurs/
COPY data/geojson/ ./data/geojson/
RUN mkdir -p /app/data/barometre
COPY --from=web-build /app/api/static/ ./api/static/

RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000
WORKDIR /app/api
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", \
     "app:create_app()"]
```

Le build Vite doit ecrire dans `api/static/` comme configure en section 7.1.
Un seul worker est suffisant pour 16k lignes et evite les ecritures concurrentes
dans le CSV du questionnaire. Le CSV est la source de reponses de l'application;
il n'y a pas de Google Form ni de deuxieme canal de collecte.

Les dossiers sources Docker existent des le bootstrap grace aux `.gitkeep`.
L'image de socle se construit donc sans donnees metier; ses routes indiquent
503. Pour une image de demonstration, les donnees preparees doivent etre
presentees dans ces dossiers avant `docker build`; si les dossiers eux-memes
manquent, `COPY data/indicateurs/` ou `COPY data/geojson/` echoue volontairement.
Ne pas ajouter de fallback de donnees vide.

### 8.3 Docker Compose de developpement

```yaml
services:
  app:
    build: .
    image: observatoire-yaounde:dev
    user: "${LOCAL_UID:-1000}:${LOCAL_GID:-1000}"
    ports:
      - "5000:5000"
    volumes:
      - ./data/indicateurs:/app/data/indicateurs:ro
      - ./data/geojson:/app/data/geojson:ro
      - ./data/barometre:/app/data/barometre:rw
    environment:
      BAROMETRE_CSV: /app/data/barometre/reponses.csv
    restart: unless-stopped
```

Ne pas monter tout `data/` avec `:ro`: cela bloquerait le questionnaire. Garder
les sources brutes hors du conteneur. L'UID/GID du conteneur doit correspondre
a celui du proprietaire du dossier local pour que Flask puisse ecrire dans le
bind mount; le README de P3 doit expliquer l'alignement UID/GID avant lancement.
`docker compose down` arrete le service sans supprimer le fichier de reponses.

P3 documente cette initialisation dans le README. Apres un nouveau clone Linux,
avant le premier `docker compose up --build`, generer le `.env` local ignore :

```bash
printf 'LOCAL_UID=%s\nLOCAL_GID=%s\n' "$(id -u)" "$(id -g)" > .env
```

Cette etape aligne le processus du conteneur sur le proprietaire du dossier
monte; ne pas committer le `.env`.

### 8.4 Build local, demarrage et diagnostic

```bash
# Generer les assets avant l'image
source .venv/bin/activate
python scripts/preparer_donnees.py
python scripts/preparer_zones.py

# Construire et mesurer
docker build -t observatoire-yaounde:local .
docker image inspect observatoire-yaounde:local \
  --format='{{.Size}}'

# Demarrer, puis tester dans un autre terminal
docker compose up
curl -i http://localhost:5000/api/sante
curl -i http://localhost:5000/api/indicateurs
curl -i 'http://localhost:5000/api/zones?annee=2018'
curl -i http://localhost:5000/
```

Le critere du PDF est `< 500 Mo`. Si l'image est trop grande, inspecter les
couches et verifier que `geopandas`, les shapefiles, `node_modules`, le CSV brut
et le dossier `.git` ne sont pas copies dans le runtime.

## 9. Travail par jour, livrables et integration

Ce calendrier applique l'ordre de `plan.pdf` : cadrage le mardi matin, donnees,
API et premier build Docker mercredi matin. Le bloc 14 h–17 h 30 du PDF de
repartition sert a finir le depot et les contrats. Le socle `main` est valide
au plus tard mardi 17 h 30, avant que P1/P2/P3 partent sur leurs branches.

| Jalon equipe | Echeance | Critere observable |
|---|---|---|
| M0 — Socle stable sur `main` | Mar. 24, 17 h 30 | Quatre contrats d'interface signes, transport du questionnaire fixe (questions fournies ou blocker assigne), sept routes de page, health, build React et configuration Docker validee |
| M1 — Donnees/API/graphique connectes | Mer. 25, 12 h 30 | Sept JSON + GeoJSON livres par P1; routes lecture disponibles par P3; P2 affiche le premier indicateur depuis l'API |
| M2 — Premier parcours bout en bout | Mer. 25, 17 h 30 | Une donnee source traverse JSON -> Flask -> React; carte 2018; POST de test fonctionne si le schema de questions est valide |
| M3 — Noyau demonstrable | Jeu. 26, 12 h 30 | F1, F2, F3, F5, F9 et F10 accessibles; F8/F9 sont pleinement valides avec les questions et reponses de test approuvees, sinon marques bloques et M3 n'est pas declare complet |
| M4 — Gel du perimetre et image | Jeu. 26, 17 h 30 | `docker compose up --build` fonctionne; decide explicitement quels souhaitables sont termines ou marques « non disponible / en cours » |
| M5 — Pret pour la demo | Ven. 27, 13 h | Cinq valeurs verifiees, test mobile/navigateurs, collecte de test, presentation repete; URL active si les prerequis existent |

### Mardi 24 novembre — cadrage le matin, socle avant 17 h 30

- **P1 :** verifier les totaux du CSV et les noms/CRS des fichiers fournis;
  remplir `SOURCES.md`; creer les repertoires de donnees, ignore rules et
  squelette Docker/Compose.
- **P2 :** creer Vite/React, proxy `/api`, `outDir: ../api/static`, Router,
  `Layout.jsx`, les sept routes et une premiere mise en page responsive.
- **P3 :** creer Flask factory, `data_loader.py`, blueprints/squelettes de
  routes, `/api/sante`, README de depart et definition du questionnaire ferme.
- **Ensemble :** valider les quatre contrats d'interface de la section 3, le
  transport du questionnaire, proprietaires de fichiers et ordre des priorites.
  P3 confirme que l'organisation a fourni les questions/choix; sinon consigne
  le nom de la personne qui les obtient et la date de livraison. Le questionnaire
  React remplace explicitement le Google Form et l'iframe du PDF.
- **Integration :** préparer la branche `init/bootstrap`, valider npm build,
  health route, `docker compose config` et absence de donnees locales suivies;
  après revue humaine, créer une PR vers `main`, puis les trois créent leurs branches
  uniquement après fusion.

**Sortie M0 :** branche `main` reproductible, aucune donnee metier simulee ou
reponse collectee; React et Flask sont testables en local, les routes metier
signalent que les JSON/GeoJSON ne sont pas encore disponibles, et le conteneur
est configure. Le premier build complet reste le jalon de mercredi.

### Mercredi 25 matin, 9 h–12 h 30 — donnees, API et premier graphique

- **P1 :** `preparer_donnees.py` (selection des sept themes, validation des
  schemas et export JSON); `preparer_zones.py` (105 zones, champs population,
  simplification et EPSG:4326); livrer et signaler toute anomalie de source.
- **P2 :** client Axios `/api`, `ChartCard.jsx` conforme au contrat, premier
  graphique de population. Une fixture temporaire est permise uniquement pour
  l'interface et ne devient jamais un chiffre de demonstration.
- **P3 :** routes indicateurs/zones, chargement/cache JSON, validation des
  schemas et erreurs HTTP explicites; squelette Methodologie.
- **Sync 12 h 30 :** P1 livre les fichiers a P2/P3; P2/P3 testent les routes;
  P1 fait le premier build de l'image avec les vrais assets (le build du socle
  a deja ete tente M0).

**Sortie M1 :** `data/indicateurs/*.json`, GeoJSON et premier graphique
alimente par API, sans donnee codee en dur.

### Mercredi 25 apres-midi, 14 h–17 h 30 — carte et boucle participative

- **P1 :** `MapView.jsx` avec Leaflet, fond OSM, choroplethe 2018, legende,
  popup nom/population et etat de valeur manquante.
- **P2 :** finaliser le graphique de population, scenarios couverts, provenance
  (plein/pointille), badge rupture/hypothese et rendu responsive; brancher la
  page Carte au composant MapView de P1.
- **P3 :** POST et GET barometre, controle serveur des choix/consentement, page
  `Participatif.jsx`; README v1. Aucun Google Form ni canal d'import parallele.
- **Ensemble :** tester une valeur source a l'ecran, la carte, le POST et la
  persistance dans `data/barometre/reponses.csv`.

**Sortie M2 :** premiere demonstration bout en bout; si elle echoue, corriger
ce parcours avant d'ajouter des indicateurs. Si les questions organisationnelles
ne sont toujours pas disponibles, ne pas inventer le schema : presenter F8 comme
bloque et obtenir une decision explicite de l'organisation.

### Jeudi 26 matin, 9 h–12 h 30 — noyau retrospectif/prospectif

- **P1 :** rendre `MapView` parametrable par `annee`, appliquer les trois
  champs/legendes, controler les totaux de population et noter tout ecart.
- **P2 :** ajouter le selecteur d'annee dans `Carte.jsx` et le relier au prop de
  P1; la propriete du composant Leaflet reste a P1.
- **P2 :** graphiques deplacements, parc, motorisation et comparateur F5; les
  pages restent dans le layout commun et consomment seulement les routes P3.
- **P3 :** page Resultats utilisant les agregats anonymes et ChartCard de P2,
  page Methodologie complete, test manuel de chaque route.
- **Ensemble :** comparer les series communes; signaler explicitement scenario
  ou annee sans donnees plutot que dessiner un zero.

**Sortie M3 :** F1/F2/F3/F5/F9/F10 presentables. F8 et les graphiques F9 sont
valides avec le schema et les reponses de test approuves. Sans l'intrant
organisationnel, les deux sont explicitement bloques; ne pas presenter le jalon
comme complet ni generer de fausses reponses.

### Jeudi 26 apres-midi, 14 h–17 h 30 — souhaitables et Docker de livraison

- **P1 :** couche infrastructure seulement si le shapefile est interpretable
  sans correction risquee; sinon documenter son report. Executer
  `docker compose up --build`, verifier port 5000, taille <500 Mo et ecriture
  CSV via le bind mount.
- **P2 :** parts modales, GES/temps uniquement si les fonctions obligatoires
  passent leurs controles; garder les graphiques hors perimetre en « en cours ».
- **P3 :** README reproductible (installation, sources, generation, Docker,
  limites/stockage), support de presentation; assister au diagnostic Docker
  sans modifier Dockerfile/Compose.
- **17 h 30 :** le trio coupe ou garde explicitement F4/F6/F7/F9; integrations
  necessaires sur `main`; plus aucun ajout non essentiel apres ce point.

**Sortie M4 :** image de demo fiable et liste de fonctions non terminees
visible dans la presentation.

### Vendredi 27 matin, 9 h–13 h — gel, controle et repetition

- **P1 :** deploiement (Render/Railway/VPS) et captures seulement si acces et
  stockage sont prets; sinon valider le parcours Docker local.
- **P2 :** corrections d'affichage, test telephone, Chrome et Firefox.
- **P3 :** verification de cinq valeurs CSV/ecran, routes et formulaire; coordonner
  le deploiement et la repetition de dix minutes.
- **Ensemble :** tester la soumission et l'agregat, gel de code, noter les
  limites et presenter les trois volets sans revendiquer la representativite.

**Vendredi 27, 14 h :** demonstration. P3 ouvre et presente contexte/limites;
P2 presente graphiques; P1 presente carte, pipeline de donnees et Docker.

### Rituels d'equipe issus du PDF

- 9 h 15 : stand-up de 15 minutes (fait, blocage, prochain objectif).
- 12 h 30 et 17 h 30 : sync de 20 minutes, demonstration reelle a l'ecran et
  decision de dependance; ne pas remplacer par un statut verbal.
- Fin de demi-journee : P3 envoie un bilan bref (fait, blocage/responsable,
  prochain livrable/commit).
- Blocage de plus de 30 minutes : alerte immediate aux deux autres; choisir
  ensemble mock temporaire, livraison partielle ou report.

### Bilan de demi-journee

```text
Fait:
En cours / prochaine demi-journee:
Blocage (responsable et decision attendue):
Lien vers le dernier commit / capture:
```

## 10. Verification, criteres d'acceptation et commandes

### 10.1 Criteres avant de declarer la demo prete

- `preparer_donnees.py` regenere les JSON et `preparer_zones.py` le GeoJSON.
- `docker build` termine et l'image finale est sous 500 Mo, ou l'ecart est
  explique et non bloquant pour la demo.
- Apres l'initialisation locale decrite dans le README, `docker compose up`
  expose React sur `/` et l'API sous `/api/*`; le formulaire peut ecrire dans
  `data/barometre/reponses.csv`.
- Au moins huit indicateurs distincts sont affiches.
- Les trois scenarios sont comparables sur les seules series communes;
  `rupture` est accompagne du badge « hypothese ».
- La carte permet de choisir 2018, 2025 et 2035.
- Chaque graphique a libelle, unite, scenario et origine.
- Cinq valeurs a l'ecran sont identiques aux lignes selectionnees du CSV.
- Le questionnaire et la page de resultats fonctionnent pour des reponses de
  test; la page methodologie existe.
- Le site est lisible sur telephone; README et presentation sont prets.
- L'URL publique est active si l'hebergement est disponible; sinon la procedure
  locale Docker est prouvee et le blocage de publication est explique.

### 10.2 Verification manuelle de cinq valeurs

P2 note code, annee, scenario et valeur de chaque point choisi. P1 ou P3
retrouve la ligne du CSV puis compare:

```text
code_indicateur | annee | scenario | valeur CSV | valeur ecran | origine
```

Choisir des points de plusieurs types (historique, interpole, projection et
scenario si disponible). Une difference de format d'affichage (separateur de
milliers/decimales) n'est pas une difference de valeur; documenter la precision
et eviter un arrondi qui change le sens du chiffre.

### 10.3 Developpement quotidien hors Docker

Terminal 1 — Flask :

```bash
source .venv/bin/activate
cd api
flask --app app:create_app run --debug --port 5000
```

Terminal 2 — Vite :

```bash
cd web
npm run dev
```

Ouvrir `http://localhost:5173`. Le proxy Vite transmet `/api` a Flask.
Regenerer les donnees apres modification d'une source:

```bash
python scripts/preparer_donnees.py
python scripts/preparer_zones.py
```

### 10.4 Deploiement

1. P1 construit et teste l'image sur une machine locale propre; P3 coordonne les
   prerequis et verifie les routes fonctionnelles.
2. Publier le depot prive ou autorise; ne pas y inclure les reponses ou sources
   non redistribuables.
3. Creer un service Docker sur l'hebergeur choisi, port HTTP interne `5000`.
4. Configurer les variables d'environnement non secretes et verifier
   `/api/sante`, `/` et `/api/indicateurs`.
5. Faire un redeploiement de test pour determiner si le disque des reponses est
   persistant. Sans volume persistant, limiter le questionnaire aux reponses de
   test et ne pas ouvrir une collecte publique.

Pas de commande VPS/SSH ou de secrets d'exemple dans le README public. Le
deploiement est une etape de livraison, pas une raison d'ajouter un service
secondaire ou une base de donnees.

### 10.5 Git et integrations

Les commits de fonctionnalite se font sur la branche personnelle, jamais sur
`main`. Ajouter seulement les fichiers possedes, pousser avant le sync et
integrer vers `main` apres la porte de test de l'equipe :

Ne versionner les JSON/GeoJSON que si P1 a confirme leur redistribution dans
`SOURCES.md`; sinon ne pas les ajouter a Git et utiliser le transfert local
approuve decrit dans le README.

```bash
git switch p1-data
git status --short
git add scripts/preparer_donnees.py scripts/preparer_zones.py data/indicateurs data/geojson
git commit -m "Prepare indicator and zone data"
git push -u origin p1-data
```

P2 remplace `p1-data` par `p2-front` et n'ajoute que ses fichiers React/CSS;
P3 fait de meme sur `p3-back` pour l'API, les pages participatives et README.
P3 coordonne la revue et le merge; ne jamais utiliser `git add .` tant que les
CSV, reponses de test et fichiers locaux sont dans l'arbre de travail.

## 11. Risques, controles et report apres le hackathon

| Risque | Action immediate | Quand reporter |
|---|---|---|
| Mauvais jeu de donnees ou chiffres inattendus | Jour 1: confirmer 16 328 lignes, 311 codes, colonnes et scenarios | Aucune fonctionnalite ne contourne une source non validee |
| Champ de population/CRS ambigu | P1 inspecte CRS, champs, 105 polygones et totaux | Densite et toute couche non confirmee |
| JSON manquant/corrompu | Flask renvoie erreur explicite et journalise le fichier | Aucun fallback vide |
| CORS ou API inaccessible | Client utilise `/api`; proxy Vite en dev, meme origine en prod | Pas de seconde URL d'API en prod |
| Courbe interpolee prise pour observation | Pointille, provenance dans l'info-bulle, methodologie | Aucun lissage supplementaire |
| Rupture absente | « Non disponible »; badge d'hypothese sur les valeurs construites | Ne pas completer les indicateurs absents |
| Carte Leaflet invisible | CSS Leaflet importe et hauteur explicite du conteneur | Aucune fonction cartographique additionnelle |
| Formulaire sans resultats | Quelques reponses de test, marquage clair | Collecte publique sans accord de conservation |
| Volume Compose en lecture seule | Volume distinct ecrivable pour `barometre/` | Pas de collecte dans une image ephemere |
| Docker build tarde | Build du socle au jalon M0, rebuild avec les vrais assets mercredi, cache `npm ci`, runtime leger | Deploiement public si blocage externe |
| Image > 500 Mo | Verifier `.dockerignore`, les dependances runtime et les couches | Ne pas mettre GeoPandas dans le runtime |
| Couche SIG inutilisable | Exclure et documenter dans `SOURCES.md` | Couches optionnelles |
| Retard global | Prioriser donnees > API > carte/graphes > participation > Docker > URL | Couches infra et fonctions optionnelles d'abord |

### Apres la demonstration

Si l'organisation poursuit le projet, les prochains lots doivent etre valides
separement: stockage persistant et gouvernance des reponses; protocole et
representativite de l'enquete; resolution de l'incoherence 2036; validation des
hypotheses de rupture; couches d'infrastructure et jointures de zones; mise a
jour des donnees; tests automatises plus complets; deploiement durable. Aucun de
ces travaux n'est une dependance a livrer en trois jours.

---

**Rappel d'equipe :** l'objectif est une esquisse fidele aux donnees et
demonstrable, pas une plateforme enterprise. Afficher moins vaut mieux que
fabriquer, masquer une limite ou publier un chiffre dont la provenance est
inconnue.

---

## 12. Etat M0 vérifié — 25 novembre 2026

La proposition M0 est préparée sur `init/bootstrap`; `main` reste à son état
initial. Elle n'est pas déclarée fusionnée tant qu'une PR n'a pas été revue et
fusionnée humainement.

| Critère | Statut | Preuve |
|---|---|---|
| Structure, ignore rules, données locales | PASS | `.gitignore`/`.dockerignore` excluent `data/raw/`, `.env`, réponses, artefacts; seuls les `.gitkeep` sont présents dans les sorties M0 |
| Flask `GET /api/sante` | PASS | `200 {"statut":"ok"}` exécuté localement |
| Assets indicateurs absents | PASS | `GET /api/indicateurs` retourne `503` avec erreur explicite |
| Asset cartographique absent | PASS | `GET /api/zones?annee=2018` retourne `503`, sans GeoJSON inventé |
| Baromètre non configuré | PASS | POST et GET résultats retournent `503`; aucun `reponses.csv` créé |
| React/Vite | PASS | React 18.3.1, axios `/api`, sept routes, `npm ci && npm run build` réussi |
| Docker Compose | PASS | `docker compose config` réussi |
| Diff whitespace | PASS | `git diff --check` réussi |
| Commit final / fichiers locaux | PASS | À vérifier avant PR via `git status --short` et `git diff`; `.env`, CSV bruts et réponses restent non suivis |
| Browser de validation | NOT RUN | Aucun navigateur automatisé n'a été utilisé |
| Docker build complet | NOT RUN | Un build d'image complet n'est pas requis au socle M0 sans assets métier |

Décision: **M0 technique prêt pour PR**, sous réserve humaine de la création/revue
de la PR. M0 n'est pas accepté/fusionné sur `main`.

Blocages assignés:

- P3 doit obtenir de l'organisation les 6 à 8 questions, les choix fermés,
  l'autorisation de collecte, le consentement et les règles de conservation.
  Responsable: P3; tant que ces informations manquent, F8/F9 restent bloqués.
- P1 doit confirmer/livrer les sources cartographiques et produire les GeoJSON
  autorisés au jalon P1. Aucun shapefile ni GeoJSON ne doit être inventé.
- Deux CSV locaux sont présents sous `data/raw/`: `dictionnaire_indicateurs.csv`
  et `donnees_longues.csv`. Ils restent ignorés par Git.
