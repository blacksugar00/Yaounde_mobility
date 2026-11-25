# Guide individuel P2 — Frontend, pages et graphiques

**Projet :** Observatoire de la mobilite urbaine de Yaounde
**Perimetre :** application React, navigation, client Axios, ChartCard, graphiques et responsive
**Branche de fonctionnalite :** `p2-front`
**Document socle :** [Plan technique d'execution](./Guide_execution_observatoire_mobilite_Yaounde.md)

Le plan technique est la source de verite sur les decisions produit. Ce guide
detaille votre travail et les interfaces avec P1 (donnees, carte, Docker) et P3
(Flask, questionnaire, resultats, methodologie).

---

## 1. Votre mission et les limites de votre perimetre

Vous rendez les donnees accessibles et compréhensibles dans le navigateur :
shell commun, navigation, pages, appels API, graphiques Chart.js et rendu
responsive. Vous ne recalculez aucune donnee du modele.

### Vous possedez

| Fichier / livrable | Resultat attendu |
|---|---|
| `web/src/App.jsx`, `Layout.jsx` | Sept routes, navigation claire, structure commune |
| `web/src/pages/Accueil.jsx` | F1 : contexte, acces aux volets, avertissement de modele |
| `web/src/pages/Retrospectif.jsx` | F2 : indicateurs historiques; F3/F4 en lien avec la carte/infrastructures |
| `web/src/pages/Prospectif.jsx` | F5 : comparateur de scenarios; F6/F7 seulement si le noyau est stable |
| `web/src/pages/Carte.jsx` | Selecteur d'annee et etats de chargement; integre le composant P1 |
| `web/src/api/client.js` | Client Axios avec `baseURL: "/api"` et erreurs visibilisees |
| `web/src/components/ChartCard.jsx` | Wrapper Chart.js conforme au contrat de partage |
| CSS frontend | Lisibilite, responsive, etats de chargement/erreur |

### Interfaces que vous consommez

- **API P3 :** `GET /api/indicateurs`, `GET /api/indicateurs/<code>`,
  `GET /api/zones?annee=`, `GET /api/barometre/resultats`,
  `POST /api/barometre`.
- **Donnees P1 :** JSON d'indicateurs et GeoJSON population valides.
- **Composant P1 :** `MapView({ geojson, year })`.
- **Pages P3 :** `Participatif.jsx`, `Resultats.jsx`, `Methodologie.jsx`.
  P3 remplace les placeholders presentes dans le socle; vous n'editez pas leur
  contenu apres le transfert de proprietaire.

### Vous ne faites pas

- Aucun script Python, route Flask, Dockerfile, Compose ou logique GeoJSON.
- Aucune interpolation, projection, somme de population, conversion d'unite,
  correction ou calcul de GES dans React.
- Pas de Google Form, iframe, deuxieme source de reponses, ou collecte cote
  navigateur seulement.
- Aucun champ absent transforme en zero.

---

## 2. Avant votre branche : participer a la stabilisation de `main`

Le travail de fonctionnalite commence seulement quand M0 est valide. Le socle
initial est cree sur `init/bootstrap` pour respecter l'interdiction de commit
direct sur `main`; P2 y contribue seulement au frontend de base.

### 2.1 Au cadrage commun

Validez avec P1 et P3 :

1. contrat JSON : `code`, `libelle`, `unite`, `source`, `series[]`;
2. point de serie : `scenario`, `annee`, `valeur`, `origine`, `statut` source;
3. contrat de route et erreurs de l'API;
4. props ChartCard : `type`, `data`, `options`, `titre`, `unite`, `source`;
5. nom et chemin de `MapView` et props `geojson`, `year`;
6. questionnaire : formulaire React -> POST Flask -> CSV; aucun Google Form.

Demandez a P1 une fixture conforme au contrat et a P3 les routes de l'API. Une
fixture peut depanner le developpement de la mise en page, mais doit etre
remplacee par des reponses API avant M1/M2 et ne doit pas servir de valeur de
demonstration.

### 2.2 Pendant le bootstrap partage

Sur `init/bootstrap`, votre contribution M0 comprend :

- installation des dependances et `package-lock.json`;
- configuration Vite avec proxy `/api` et `outDir: ../api/static`;
- `App.jsx`, `Layout.jsx`, les sept chemins et etats vides explicites;
- feuille CSS de base mobile-first;
- client Axios `baseURL: "/api"` (les methodes peuvent etre initialisees).

Pour eviter les conflits apres M0 :

- P2 cree les chemins React/les placeholders des sept pages dans le socle.
- Apres la promotion du socle, P2 possede les pages principales et la page Carte.
- P3 prend la propriete du contenu `Participatif.jsx`, `Resultats.jsx` et
  `Methodologie.jsx`; P2 n'edite plus ces trois fichiers sans accord.
- P1 cree `MapView.jsx`; P2 garde la page Carte, le selecteur et l'appel API.

### 2.3 Porte M0 puis branche `p2-front`

Verifiez que le commit du socle est sur `main`, branche par defaut, que le build
frontend passe et que les sept routes s'ouvrent. Ensuite :

```bash
git status --short
git switch main
git pull --ff-only
git switch -c p2-front
git status --short
```

Commencez sur un arbre propre et depuis le commit stable commun. N'utilisez pas
la branche de P1 ou P3 comme base.

---

## 3. Contrats visuels et de donnees

### 3.1 Regles de representation

- Palette scenario fixe : historique `#7f8c8d`, tendanciel `#E67E22`,
  volontariste `#27AE60`, rupture `#2980B9`.
- Trait plein pour les valeurs source; pointille pour `interpole` ou
  `extrapole`.
- Etiquette « hypothese » pour la rupture construite.
- Infobulle : annee, valeur, unite, scenario, origine, statut disponible.
- Absence : espace vide et libelle « non disponible », pas de valeur zero.
- Les courbes ne sont jamais lissees; les valeurs visibles proviennent de l'API.
- La carte est une population par zone et par annee, pas une carte par scenario.

### 3.2 Ce que signifie le JSON

Les indicateurs sont des sorties de modele. Les annees intermediaires peuvent
etre interpolees; 2036 est extrapolee. La rupture existe pour une partie des
indicateurs seulement. F5 compare seulement les annees/scenarios communs et
rend la couverture partielle visible. Pour GES, afficher les champs prepares
par P1; ne pas sommer les modes dans le navigateur.

### 3.3 Pages et priorites

| Page | Route suggeree | Proprietaire | Fonction |
|---|---|---|---|
| Accueil | `/` | P2 | F1 |
| Retrospectif | `/retrospectif` | P2 | F2, acces F3/F4 |
| Prospectif | `/prospectif` | P2 | F5, F6/F7 si temps |
| Carte | `/carte` | P2 (MapView: P1) | F3 |
| Participatif | `/participatif` | P3 | F8 |
| Resultats | `/resultats` | P3 | F9 |
| Methodologie | `/methodologie` | P3 | F10 |

Fonctions indispensables : F1, F2, F3, F5, F8, F9, F10 selon le plan produit.
F4, F6, F7 sont souhaitables; corridors, `ZONAGE_` et export sont a couper en
premier si l'equipe prend du retard.

---

## 4. Parcours par jalon, etapes et commits

### Etape 1 — etablir les routes et le layout du socle

**Quand :** mardi, avant 17 h 30 (M0).
**Objectif :** toutes les pages sont joignables meme si les donnees ne sont pas
encore disponibles.

Lors du bootstrap initial uniquement, verrouillez les versions du socle
technique dans `package-lock.json` :

```bash
cd web
npm install react@18 react-dom@18 react-router-dom@6 axios chart.js@4 react-chartjs-2@5 leaflet@1.9 react-leaflet@4
npm run build
```

Le commit M0 contient le `package-lock.json`. Sur les branches suivantes et les
nouveaux clones, utilisez `npm ci` pour reproduire exactement cet arbre de
dependances, sans modifier le lockfile.

`web/src/App.jsx` :

```jsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Accueil from "./pages/Accueil";
import Retrospectif from "./pages/Retrospectif";
import Prospectif from "./pages/Prospectif";
import Carte from "./pages/Carte";
import Participatif from "./pages/Participatif";
import Resultats from "./pages/Resultats";
import Methodologie from "./pages/Methodologie";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="retrospectif" element={<Retrospectif />} />
          <Route path="prospectif" element={<Prospectif />} />
          <Route path="carte" element={<Carte />} />
          <Route path="participatif" element={<Participatif />} />
          <Route path="resultats" element={<Resultats />} />
          <Route path="methodologie" element={<Methodologie />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

`web/src/Layout.jsx` :

```jsx
import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["/", "Accueil"],
  ["/retrospectif", "Retrospectif"],
  ["/prospectif", "Prospectif"],
  ["/carte", "Carte"],
  ["/participatif", "Participatif"],
  ["/resultats", "Resultats"],
  ["/methodologie", "Methodologie"],
];

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="site-header">
        <a className="brand" href="/">Observatoire mobilite Yaounde</a>
        <nav aria-label="Navigation principale">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="contenu">
        <Outlet />
      </main>
      <footer>
        Prototype de demonstration — les projections ne sont pas des observations.
      </footer>
    </>
  );
}
```

Chaque module de page a un composant React valide. Exemple de placeholder que
vous pouvez dupliquer au bootstrap pour creer les chemins P3 :

```jsx
export default function Participatif() {
  return (
    <section>
      <h1>Questionnaire</h1>
      <p>Le questionnaire est en preparation.</p>
    </section>
  );
}
```

Une fois le socle promu, P3 remplace le contenu de ses trois modules sur
`p3-back`.

Vite doit utiliser le proxy local et le bon dossier de sortie :

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

Commit M0 :

```bash
git add web/
git commit -m "Create React routes and shared layout"
```

Base responsive a placer dans la feuille principale (`web/src/index.css`) :

```css
:root {
  font-family: system-ui, sans-serif;
  color: #20252b;
  background: #f5f7f8;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

.site-header,
main,
footer {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
}

.site-header {
  padding-block: 1rem;
}

.site-header nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 0.75rem;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
}

.chart-card {
  min-width: 0;
  margin: 0;
  padding: 1rem;
  background: #ffffff;
}

.chart-area {
  position: relative;
  min-height: 18rem;
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}

.map-legend li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.map-legend span {
  width: 1rem;
  height: 1rem;
  border: 1px solid #555555;
}

.skip-link {
  position: absolute;
  left: -10000px;
}

.skip-link:focus {
  position: static;
}
```

### Etape 2 — client Axios partage par toutes les pages

**Quand :** M0 pour le contrat de base; mercredi matin pour les appels concrets.
**Depend de :** routes convenues par P3.
**Utilise :** `baseURL: "/api"` en dev et production.

`web/src/api/client.js` :

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

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

export const getResultats = () =>
  request(api.get("/barometre/resultats"));

export const postBarometre = (reponse) =>
  request(api.post("/barometre", reponse));
```

N'ajoutez pas de fallback vers une liste vide, un zero ou des donnees en dur
quand une requete echoue. Chaque page doit distinguer chargement, erreur
reessayable, absence legitime de donnees et contenu.

Commit :

```bash
git add web/src/api/client.js
git commit -m "Add shared Axios API client"
```

### Etape 3 — ChartCard et premier indicateur

**Quand :** mercredi matin, M1.
**Depend de :** Axios, premier JSON P1, `GET /api/indicateurs/<code>` P3.

Le contrat impose que la page construise `data` et `options`, puis les transmette
au composant. `ChartCard.jsx` ne choisit pas les indicateurs et ne calcule pas
leurs valeurs.

`web/src/components/ChartCard.jsx` :

```jsx
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
);

export const SCENARIO_COLORS = {
  historique: "#7f8c8d",
  tendanciel: "#E67E22",
  volontariste: "#27AE60",
  rupture: "#2980B9",
};

export default function ChartCard({
  type = "line",
  data,
  options,
  titre,
  unite,
  source,
}) {
  const Chart = type === "bar" ? Bar : Line;
  return (
    <figure className="chart-card">
      <figcaption>
        <h3>{titre}</h3>
        <p>{unite} · Source : {source}</p>
      </figcaption>
      <div className="chart-area">
        <Chart data={data} options={options} />
      </div>
    </figure>
  );
}
```

`IndicatorChart.jsx` prepare l'alignement par annee tout en gardant le point
source dans une structure parallele pour l'origine/statut :

```jsx
import ChartCard, { SCENARIO_COLORS } from "./ChartCard";

export default function IndicatorChart({ indicator }) {
  const years = [...new Set(indicator.series.map((point) => point.annee))]
    .sort((left, right) => left - right);
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
      borderColor: SCENARIO_COLORS[scenario] ?? "#555555",
      backgroundColor: SCENARIO_COLORS[scenario] ?? "#555555",
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
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            const point = aligned[context.datasetIndex][context.dataIndex];
            if (!point) return "";
            const status = point.statut ? ` · ${point.statut}` : "";
            return `${context.dataset.label}: ${point.valeur} ${indicator.unite}`
              + ` · ${point.origine}${status}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: indicator.unite,
        },
      },
    },
  };

  const hasRupture = indicator.series.some(
    (point) => point.scenario === "rupture" && point.origine === "construit",
  );

  return (
    <section>
      {hasRupture && <p className="hypothesis-badge">Rupture : hypothese</p>}
      <ChartCard
        type="line"
        data={data}
        options={options}
        titre={indicator.libelle}
        unite={indicator.unite}
        source={indicator.source}
      />
    </section>
  );
}
```

Le code presente un trou comme `null` uniquement pour Chart.js. Il n'ajoute pas
de ligne absente au JSON, et `spanGaps: false` rend le trou visible. Une suite de
points interpoles doit etre pointillee suivant le contrat; n'en deduisez pas
qu'il s'agit d'observations mesurees.

Premier affichage dans `Retrospectif.jsx` :

```jsx
import { useEffect, useState } from "react";
import { getIndicateur } from "../api/client";
import IndicatorChart from "../components/IndicatorChart";

const POPULATION_CODE =
  "1.1__population_urbaine_de_l_aire_metropolitaine";

export default function Retrospectif() {
  const [indicator, setIndicator] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getIndicateur(POPULATION_CODE)
      .then((result) => {
        if (active) setIndicator(result);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  if (loading) return <p>Chargement des indicateurs...</p>;
  if (error) {
    return (
      <div>
        <p role="alert">Indicateur indisponible : {error}</p>
        <button onClick={() => setAttempt((value) => value + 1)}>
          Reessayer
        </button>
      </div>
    );
  }
  if (!indicator) return <p>Indicateur non disponible.</p>;

  return (
    <section>
      <h1>Retrospectif</h1>
      <p>Les annees interpolees sont signalees et ne sont pas des observations.</p>
      <IndicatorChart indicator={indicator} />
    </section>
  );
}
```

Avant de figer le code, P1 doit confirmer le code exact du dictionnaire. Si le
code reel differe, remplacez la constante par ce code approuve; ne mappez pas un
indicateur par recherche approximative de libelle.

Commits mercredi :

```bash
git add web/src/components/ChartCard.jsx web/src/components/IndicatorChart.jsx
git commit -m "Add Chart.js card and provenance styling"
git add web/src/pages/Retrospectif.jsx
git commit -m "Render population indicator from API"
git push -u origin p2-front
```

### Etape 4 — connecter la carte et les pages P3

**Quand :** mercredi apres-midi pour carte 2018; jeudi matin pour selecteur
2018/2025/2035.
**Depend de :** `GET /api/zones` P3, `MapView.jsx` et GeoJSON P1.

La page Carte est votre composant; `MapView.jsx` est importé de P1 :

```jsx
import { useEffect, useState } from "react";
import { getZones } from "../api/client";
import MapView from "../components/MapView";

const YEARS = [2018, 2025, 2035];

export default function Carte() {
  const [year, setYear] = useState(2018);
  const [geojson, setGeojson] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getZones(year)
      .then((data) => {
        if (active) setGeojson(data);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [year, attempt]);

  return (
    <section>
      <h1>Population par zone</h1>
      <label htmlFor="population-year">Annee affichee</label>
      <select
        id="population-year"
        value={year}
        onChange={(event) => setYear(Number(event.target.value))}
      >
        {YEARS.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
      {loading && <p>Chargement de la carte...</p>}
      {error && (
        <div>
          <p role="alert">Carte indisponible : {error}</p>
          <button onClick={() => setAttempt((value) => value + 1)}>
            Reessayer
          </button>
        </div>
      )}
      {!loading && !error && geojson && (
        <MapView geojson={geojson} year={year} />
      )}
    </section>
  );
}
```

`App.jsx` importe les pages P3 des placeholders deja presents dans `main`.
P3 remplace leur implementation sans changer les chemins. Si la page ne se rend
pas apres cette integration, reproduisez l'erreur et contactez P3; n'editez pas
leur logique API/formulaire.

### Etape 5 — F5 et indicateurs souhaitables

**Quand :** jeudi matin pour le comparateur; jeudi apres-midi seulement apres
les fonctions prioritaires.
**Depend de :** liste et codes confirmes par P1, route details P3.

Pour F5, laissez l'utilisateur choisir un indicateur dans le catalogue API,
puis filtrez par scenario. N'affichez que les scenarios et annees presents.
Les series sont comparables sur leurs annees communes; quand une annee manque,
mettez `null` et un texte expliquant la couverture.

Ordre de realisation :

1. Au moins huit indicateurs utiles accessibles et listes lisibles.
2. Population historique/prospective et comparaison des scenarios.
3. Parc/motorisation et deplacements selon les donnees retenues par P1.
4. Parts modales (F6), GES et temps (F7) si le noyau passe ses controles.
5. Corrections de responsive et visuels.

Ne fabriquez pas de "8 indicateurs" a partir de variantes ou valeurs dupliquées.
La source a 311 codes, mais le jeu publie par P1 contient un sous-ensemble
valide.

### Etape 6 — test responsive, navigation et erreurs

**Quand :** jeudi apres-midi et vendredi matin.

Verification:

- les sept routes sont accessibles avec navigation clavier et liens;
- les liens actifs et libelles sont compréhensibles;
- Chart.js garde un conteneur de hauteur utile sur telephone;
- l'axe Y affiche l'unite et le scenario est lisible;
- une requete 503/404 apparait comme erreur avec bouton de reessai;
- `null` ne devient jamais zero, absence n'est pas une erreur de JavaScript;
- l'interface ne qualifie pas les projections de resultats observes;
- la page Carte montre une legende et le nom/population dans la popup;
- `npm run build` ne donne pas d'erreur.

Commandes:

```bash
cd web
npm ci
npm run build
npm run dev
```

Pendant le dev, Vite sert le frontend sur `http://localhost:5173` et transmet
`/api` a Flask sur le port 5000.

---

## 5. Vos commits et les merges d'equipe

### 5.1 Sequence de commits

| Commit | Contenu | Validation |
|---|---|---|
| M0 | Routes, Layout, Vite et `package-lock.json` | `npm run build`; sept chemins |
| P2-1 | Client Axios | Toutes les methodes utilisent `/api`; erreurs visibles |
| P2-2 | ChartCard + palette | Props exactes; line/bar render |
| P2-3 | Premier indicateur et provenance | La vraie reponse API s'affiche |
| P2-4 | Carte.jsx avec MapView P1 | 2018 puis selecteur 2018/2025/2035 |
| P2-5 | F5, graphiques F2 | Valeurs confirmee; scenario/absence explicites |
| P2-6 | F6/F7 et responsive | Seulement apres acceptance des indispensables |

Gardez chaque commit coherent :

```bash
git status --short
git diff --check
npm run build
git add web/src/components/ChartCard.jsx
git commit -m "Add chart card contract"
git push origin p2-front
```

Stagez uniquement vos fichiers. P3 possede le README et ses pages de contenu;
P1 possede les scripts, les donnees et `MapView.jsx`.

### 5.2 Integration vers `main`

1. Poussez `p2-front` avant le sync de l'equipe.
2. Montrez la page et la requete reelle; mentionnez les mocks temporaires encore
   presents.
3. Faites verifier les props ChartCard par P3 et les code/unite/provenance par
   P1.
4. P3 coordonne l'integration de la branche via PR si la forge le permet, ou
   depuis un commit teste en sync. Aucun push direct de code sur `main`.
5. Apres le merge des assets/API necessaires, recuperez les derniers changements :

```bash
git fetch origin
git switch p2-front
git merge origin/main
npm run build
```

6. En cas de conflit, vous possedez `App.jsx`, `Layout.jsx`, `ChartCard.jsx`,
   `Carte.jsx` et les pages principales; les changements de pages P3 sont a
   arbitrer avec P3.
7. Le merge de fin d'equipe est valide seulement si le frontend, l'API et les
   vrais fichiers de donnees fonctionnent ensemble. Apres integration, relancez
   les tests et la demo.

---

## 6. Jalons communs et livrables P2

| Jalon | Votre livrable a montrer |
|---|---|
| M0 — mardi 17 h 30 | Sept routes accessibles, layout commun, Vite build, proxy et sorties corrects |
| M1 — mercredi 12 h 30 | Client Axios, ChartCard et graphique population avec API reelle ou fixture identifiee comme test |
| M2 — mercredi 17 h 30 | Graphique de population avec scenarios/origine; page Carte branchee a MapView P1 |
| M3 — jeudi 12 h 30 | F2 et F5 parcourables, indicateurs reels, carte selectionnable par annee |
| M4 — jeudi 17 h 30 | F6/F7 terminés seulement si prioritaires stables; sinon note de report; build Vite valide |
| M5 — vendredi 13 h | Responsive, test navigateur/mobile, cinq valeurs selectionnees pretes a verifier avec P3 |

Rituels :

- Stand-up 9 h 15 : livrable d'hier, blocage, objectif de la matinee.
- Syncs 12 h 30/17 h 30 : montrer le navigateur et console reseau, lister mocks
  et API manquantes.
- Blocage de plus de 30 minutes : prévenir P1/P3 et convenir de la marche a
  suivre; ne pas compenser avec une valeur non sourcee.

---

## 7. Definition de fini pour P2

- Navigation des sept pages, layout partage et pages P3 integrees.
- Huit indicateurs reels au minimum, choisis et confirmes avec P1.
- F2/F5 font des graphiques Chart.js; scenarios et annees sont filtres selon
  les lignes presentes.
- ChartCard respecte exactement les six props convenues.
- Origine, unite, scenario, statut et rupture sont lisibles.
- Les donnees manquantes sont `null` dans les chart datasets, jamais `0`.
- Carte fonctionne avec P1 `MapView`, selecteur et reponse GeoJSON P3.
- F8/F9 consomment les contrats P3; aucune reponse brute affichee sur Resultats.
- `npm ci` et `npm run build` passent; erreurs utilisateur sont explicites.
- Le site est lisible sur telephone; cinq points affiches sont repertoriés pour
  le controle final.

---

## 8. Apres la demonstration

N'ajoutez pas de framework, gestionnaire d'etat global ou systeme de design pour
ce prototype. Les demandes de nouveaux graphiques, calculs de densite, analyse
de correlation ou export doivent etre validees comme un prochain lot.

---

## Etat post-M0 pour P2

- Etat commun: M0 est préparé sur `init/bootstrap` et n'est pas fusionné sur
  `main`; ne créez pas de branche personnelle avant la PR humaine.
- Après fusion de M0, synchronisez `main` puis créez `p2-front`.
- React 18.3.1, Axios `/api`, les sept routes et le build vers `api/static`
  sont les bases vérifiées du socle.
- Les données métier restent absentes. P2 ne doit pas inventer de fixtures
  présentées comme résultats réels et attend P1/P3 pour les contrats livrés.
