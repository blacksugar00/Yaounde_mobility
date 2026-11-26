# Contrat D — ChartCard et palette

Statut : **validé et appliqué** sur toutes les pages (version finale du 26 novembre 2026).

## 1. Composant React `ChartCard`

Composant commun à tous les graphiques (`src/components/ChartCard.jsx`).

Props du contrat :
- `type` : `"line"` | `"bar"` | `"pie"`
- `data` : objet Chart.js (`labels`, `datasets`) construit par la page
- `options` : objet Chart.js, fusionné avec les options par défaut (axes, légende, infobulle)
- `titre` : titre qui énonce le message du graphique
- `unite` : unité affichée sous le graphique
- `source` : source de la série (conservée dans le composant, voir § 3)
- `statut` : `"mesure"` | `"estime"` | `"projete"` (badge facultatif)
- `badgeHypothese` : booléen, badge « Hypothèse » pour les valeurs construites de la rupture

Props ajoutées (facultatives) :
- `note` : texte de lecture sous le graphique (ex. signification des pointillés)
- `grand` : graphique plus haut (page Prospectif)
- `hauteur` : hauteur en pixels (barres des résultats du baromètre)

Options par défaut : nombres au format français (« 250 k », « 4 M »), infobulle groupée
par année, légende en bas, points visibles sur les valeurs source uniquement. Une
orientation horizontale (`indexAxis: "y"`) est prise en charge.

## 2. Palette des scénarios (figée)

Identique sur tous les graphiques, la carte de l'accueil et la méthodologie :

| Scénario | Couleur |
|---|---|
| historique | `#7f8c8d` (gris) |
| tendanciel | `#E67E22` (orange) |
| volontariste | `#27AE60` (vert) |
| rupture | `#2980B9` (bleu) |

Ordre d'affichage : historique, tendanciel, volontariste, rupture. Les séries qui ne sont
pas des scénarios utilisent `CATEGORY_COLORS` (`src/components/palette.js`).

## 3. Règles visuelles

- Trait plein pour les valeurs source, trait pointillé pour les valeurs interpolées ou
  extrapolées, avec une note explicative.
- L'unité et, le cas échéant, le statut ou le badge « Hypothèse » sont affichés.
- Décision du 26 novembre 2026 : la source n'est plus affichée sous chaque graphique
  pour alléger la lecture ; elle reste transmise au composant et les sources sont
  détaillées dans la page Méthodologie.
- Responsive : une colonne sur mobile, grille sur ordinateur.

## 4. Validation

- Producteur : P2 (Frontend), modernisé par P3 puis finalisé avec la charte institutionnelle.
- Revue : P3 (Backend).
