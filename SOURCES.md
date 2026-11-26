# Sources des données

Toutes les données de l'Observatoire proviennent de la **Communauté Urbaine de Yaoundé
(CUY)**, structurées avec le cabinet **DVDH (Des Villes et Des Hommes)** dans le cadre du
PMUS. Elles sont utilisées pour le hackathon SMDY 2026 ; leur réutilisation suppose de
citer : « Observatoire de la Mobilité de Yaoundé (Données : CUY / Études : DVDH) ».

## Données tabulaires

| Fichier | Statut | Usage |
|---|---|---|
| `data/raw/donnees_longues.csv` | Local, ignoré par Git | Séries longues : code, indicateur, unité, année, scénario, valeur, statut, origine |
| `data/raw/dictionnaire_indicateurs.csv` | Local, ignoré par Git | Dictionnaire des indicateurs |
| `data/indicateurs/*.json` | Versionné | 7 thèmes, 88 indicateurs, produits par `scripts/preparer_donnees.py` sans recalcul |

Années de référence : 2000, 2005, 2010, 2018 et 2025 (2035 pour les projections) ; les
années intermédiaires sont interpolées et 2036 est extrapolée. Les GES affichés sont les
totaux recalculés à la source (`ges_total_recalcule`, `ges_par_habitant_recalcule`).

Contrôle du 26 novembre 2026 : les 5 561 points exposés par l'API sont identiques aux
lignes correspondantes de `donnees_longues.csv` (0 écart).

## Données cartographiques

| Fichier | Statut | Origine |
|---|---|---|
| `data/geojson/zones_population.geojson` | Versionné | `Noms_zones.shp` (CUY) via `scripts/preparer_zones.py` : 105 zones, `nom`, `pop_2018`, `pop_2025`, `pop_2035`, `id_zone`, EPSG:4326 |
| `data/geojson/reseau_bus.geojson` | Versionné | Couche SIG CUY, 9 tracés de lignes |
| `data/geojson/projets_voirie.geojson` | Versionné | Couche SIG CUY, 21 projets, horizon Coup parti / MT / LT |
| `data/geojson/projets_tp.geojson` | Versionné | Couche SIG CUY, 6 projets de transport public |
| `data/geojson/gares.geojson` | Versionné | Couche SIG CUY, 10 gares et pôles d'échanges |
| `data/geojson/carrefours.geojson` | Versionné | Couche SIG CUY, 44 carrefours |

Les noms de 10 zones avaient perdu leurs accents dans le `.dbf` source ; ils sont
conservés tels quels. Les couches `Population*_points100` ne sont pas utilisées (poids
non documenté). Les cinq couches d'infrastructures ont été exportées directement en
GeoJSON, sans script de régénération versionné.

## Questionnaire du baromètre

Statut : **validé et actif**. 17 questions facultatives, liste officielle des 105
quartiers issue du GeoJSON, texte de consentement, règle de conservation et masquage des
petites cellules ($k \ge 5$) approuvés. Voir le [contrat du baromètre](docs/contrat_barometre.md)
et le schéma exécutable `api/services/barometre_schema.py`.

Les réponses (`data/barometre/reponses.csv`) sont des données de test du hackathon,
ignorées par Git ; elles ne sont jamais publiées autrement qu'en agrégats.
