# Interface web — React + Vite

Interface de l'Observatoire de la mobilité de Yaoundé. Elle consomme uniquement l'API
Flask (`/api`) ; aucune donnée n'est embarquée dans le front.

## Commandes

```bash
npm ci            # installation depuis package-lock.json
npm run dev       # serveur de développement (http://localhost:5173, proxy /api -> :5000)
npm run lint      # oxlint
npm run build     # compile dans ../api/static, servi par Flask
```

## Pile

React 19, React Router 7, Axios, Chart.js 4 (`react-chartjs-2`), Leaflet
(`react-leaflet`), icônes `lucide-react`.

## Organisation

| Dossier / fichier | Rôle |
|---|---|
| `src/App.jsx` | Routes ; `/participatif` et `/resultats` sont imbriquées dans la page `Barometre` |
| `src/Layout.jsx` | En-tête (logo vers l'accueil, menu repliable sur mobile), pied de page, apparition au défilement |
| `src/api/client.js` | Client Axios ; les erreurs API remontent avec leur message |
| `src/pages/` | Accueil, Retrospectif, Prospectif, Carte, Barometre, Participatif, Resultats, Methodologie |
| `src/components/ChartCard.jsx` | Carte de graphique commune ([Contrat D](CONTRAT_D.md)) |
| `src/components/IndicatorChart.jsx` | Un indicateur, une courbe par scénario |
| `src/components/StackedBarChart.jsx` | Barres empilées à 100 % (parts modales) |
| `src/components/MultiIndicatorChart.jsx` | Plusieurs indicateurs sur le même axe |
| `src/components/MapView.jsx` | Carte Leaflet : couches, année, horizon, légendes, popups et infobulles |
| `src/components/palette.js` | Couleurs des scénarios, thème des graphiques, libellés d'origine, formats |
| `src/index.css` | Charte et classes partagées |

## Charte graphique

- Couleurs institutionnelles (variables CSS dans `:root`) : vert `--green-700` (#135c41),
  ocre `--gold-400` (#e3b23c), rouge `--red-700` (#a6201b), fond papier `--paper` (#f7f6f2).
- Typographie : Source Serif 4 pour les titres, Inter pour le texte.
- Classes partagées : `container`, `page`, `page-head`, `kicker`, `lead`, `card`, `btn`
  (`--primary`, `--secondary`, `--sm`), `field`, `select`, `chip`, `notice`, `badge`,
  `tabs`/`tab`, `grid-2/3/4`, `skeleton`, `reveal`.
- Les couleurs des scénarios ne suivent pas la charte : elles sont fixées par le
  Contrat D et ne doivent pas changer.
- Responsive : vérifié de 390 px à 1366 px, sans défilement horizontal.

## Règles de représentation des données

- Une année sans valeur reste un trou dans la courbe, jamais un zéro.
- Trait pointillé pour les valeurs interpolées ou extrapolées, avec une note sous le graphique.
- Les infobulles donnent la valeur, l'unité et l'origine (valeur source, interpolée,
  extrapolée, recalculée, hypothèse).
- Les valeurs construites du scénario de rupture affichent le badge « Hypothèse ».
- Les parts modales (stockées en fraction) sont converties en pourcentage d'après leur
  unité, sans arrondi des données.
