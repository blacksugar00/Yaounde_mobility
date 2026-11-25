# Contrat D — ChartCard et palette

## 1. Composant React `ChartCard`
Ce composant sera utilisé par toutes les pages pour afficher un graphique.

Props attendues :
- `type` : "line" | "bar" | "pie"
- `data` : objet format Chart.js (datasets, labels)
- `options` : objet format Chart.js (fusionné avec les options par défaut)
- `titre` : string (le titre-message du graphique, ex: "La population va doubler d'ici 2036")
- `unite` : string (ex: "habitants", "véhicules", "%")
- `source` : string (ex: "WUP 2025, ONU")
- `statut` : "mesure" | "estime" | "projete"
- `badgeHypothese` : boolean (affiche un badge "HYPOTHÈSE" si true, pour le scénario rupture)

## 2. Palette de couleurs figée
Identique sur TOUS les graphiques :
- historique   : #7f8c8d (gris)
- tendanciel   : #E67E22 (orange)
- volontariste : #27AE60 (vert)
- rupture      : #2980B9 (bleu)

## 3. Règles visuelles
- Trait plein pour l'historique, trait pointillé pour les projections.
- Le titre doit énoncer le message (pas juste "Population", mais "Évolution de la population").
- L'unité, la source et le statut doivent être affichés sous le graphique.
- Responsive : 1 colonne sur mobile, grille sur ordinateur.

## 4. Validation
- Producteur : P2 (Frontend)
- Revue : P3 (Backend)
- Statut : À valider mardi 24 novembre à 17h30.
