# Contrat du baromètre — version validée et active

Ce document est le contrat commun de collecte/API. La définition exécutable des
questions et des valeurs est `api/services/barometre_schema.py`. Les deux
sources doivent rester cohérentes. **Le questionnaire est validé et actif** depuis
le jalon M2 (25 novembre 2026) : voir « Validation et activation » en fin de document.

## Règles communes

- 17 questions facultatives, dans l'ordre A, B, C ci-dessous; toutes à choix
  unique. Aucune option « Je préfère ne pas répondre ».
- Une réponse omise signifie que la question a été passée. Le client omet les
  champs vides; le serveur écrit une cellule vide pour chacune des questions
  absentes.
- Le consentement n'est pas une question. L'envoi exige un consentement explicite
  (`consentement: true`) et au moins une réponse renseignée.
- Aucun nom, téléphone, adresse, texte libre ou donnée directement identifiante.
- `quartier_residence` utilise la liste officielle des 105 quartiers issue du
  GeoJSON fourni par P1, avec des valeurs stables. Aucune adresse n'est demandée.
- Les choix de sexe et d'âge sont validés. Le questionnaire vise les adultes
  (18 ans et plus); l'inclusion de mineurs exigerait une validation spécifique.
- Le consentement, les règles de conservation et la suppression des petites
  cellules sont approuvés : la distribution d'une question est entièrement
  masquée si une catégorie comporte moins de 5 réponses.
- Le CSV local est créé à la première soumission valide. Il contient les 17 colonnes; le consentement n'est pas une colonne.
- `total` correspond au nombre de formulaires envoyés. Les agrégats ignorent les
  cellules vides et comptent les réponses séparément pour chaque question.
  Aucun résultat ne renvoie de ligne individuelle.

## A. Profil et foyer

| # | Question | Clé | Valeurs (`libellé` → `valeur`) |
|---|---|---|---|
| 1 | Quel est votre sexe ? | `sexe` | Femme → `femme`; Homme → `homme` |
| 2 | Dans quelle tranche d’âge vous situez-vous ? | `tranche_age` | 18–24 ans → `18_24`; 25–34 ans → `25_34`; 35–44 ans → `35_44`; 45–54 ans → `45_54`; 55–64 ans → `55_64`; 65 ans ou plus → `65_plus` |
| 3 | Dans quel quartier résidez-vous ? | `quartier_residence` | 105 quartiers officiels (`APPROVED_QUARTIERS` dans `barometre_schema.py`), ex. TSINGA 1 → `tsinga_1` |
| 4 | Combien de personnes vivent dans votre foyer ? | `taille_foyer` | 1 → `1`; 2 → `2`; 3 → `3`; 4 → `4`; 5 → `5`; 6 → `6`; 7 → `7`; 8 ou plus → `8_plus` |
| 5 | Combien de véhicules votre foyer possède-t-il ? | `vehicules_foyer` | 0 → `0`; 1 → `1`; 2 → `2`; 3 → `3`; 4 ou plus → `4_plus` |
| 6 | Avez-vous un permis de conduire valide ? | `permis_conduire` | Oui → `oui`; Non → `non` |
| 7 | Avez-vous actuellement un abonnement de transport collectif ? | `abonnement_transport` | Oui → `oui`; Non → `non` |

## B. Pratiques de déplacement

| # | Question | Clé | Valeurs (`libellé` → `valeur`) |
|---|---|---|---|
| 8 | Quel moyen de déplacement utilisez-vous le plus souvent à Yaoundé ? | `mode_principal` | Marche à pied → `marche`; Moto-taxi → `moto_taxi`; Taxi → `taxi`; Bus ou autocar → `bus_autocar`; Voiture personnelle → `voiture_personnelle`; Voiture partagée → `voiture_partagee`; Vélo → `velo` |
| 9 | Quel est le motif principal de vos déplacements ? | `motif_principal` | Travail → `travail`; Études → `etudes`; Achats → `achats`; Loisirs → `loisirs`; Autres motifs → `autres_motifs` |
| 10 | Combien de temps dure habituellement un de vos trajets ? | `duree_trajet` | Moins de 15 minutes → `moins_15`; De 15 à moins de 30 minutes → `15_30`; De 30 à moins de 45 minutes → `30_45`; De 45 minutes à moins d’une heure → `45_60`; D’une heure à moins d’une heure 30 → `60_90`; Une heure 30 ou plus → `90_plus` |
| 11 | À quelle fréquence utilisez-vous un taxi ? | `frequence_taxi` | Très souvent → `tres_souvent`; Souvent → `souvent`; Parfois → `parfois`; Rarement → `rarement`; Jamais → `jamais` |
| 12 | À quelle fréquence utilisez-vous une moto-taxi ? | `frequence_moto_taxi` | Mêmes choix que la question 11 |
| 13 | Dans quelle situation choisissez-vous principalement une moto-taxi ? | `situation_moto_taxi` | Pour contourner les embouteillages → `embouteillages`; Lorsque je suis pressé(e) → `urgence`; Pour un trajet court → `trajet_court`; Pour rejoindre une destination difficile d’accès ou peu desservie → `destination_peu_desserte`; Lorsque mon moyen de transport habituel n’est pas disponible → `mode_habituel_indisponible` |

## C. Perception et priorités

| # | Question | Clé | Valeurs (`libellé` → `valeur`) |
|---|---|---|---|
| 14 | Dans quelle mesure vous sentez-vous en sécurité lorsque vous prenez un taxi à Yaoundé ? | `securite_taxi` | Tout à fait en sécurité → `tres_en_securite`; Plutôt en sécurité → `plutot_en_securite`; Ni en sécurité ni en insécurité → `neutre`; Plutôt en insécurité → `plutot_en_insecurite`; Pas du tout en sécurité → `pas_du_tout_en_securite` |
| 15 | Quel aspect des moto-taxis vous préoccupe le plus, s’il y en a un ? | `preoccupation_moto_taxi` | La sécurité du trajet → `securite`; La conduite dans la circulation → `conduite_circulation`; Le coût → `cout`; Le confort ou l’exposition aux intempéries → `confort_intemperies`; La disponibilité ou le temps d’attente → `disponibilite_attente`; Aucun aspect ne me préoccupe particulièrement → `aucune_preoccupation` |
| 16 | Quel critère compte le plus dans le choix de votre moyen de déplacement ? | `critere_choix` | La durée du trajet → `duree`; Le coût → `cout`; La sécurité → `securite`; La disponibilité → `disponibilite`; Le confort → `confort`; La facilité d’accès à la destination → `acces_destination` |
| 17 | Quelle amélioration devrait être prioritaire pour les déplacements à Yaoundé ? | `priorite_mobilite` | Améliorer la sécurité → `securite`; Réduire les embouteillages et la durée des trajets → `reduction_congestion`; Rendre les déplacements plus abordables → `cout`; Améliorer la disponibilité et la régularité des transports collectifs → `transports_collectifs`; Améliorer les conditions de déplacement à pied → `deplacements_pietons`; Faciliter l’accès aux quartiers moins bien desservis → `acces_quartiers` |

## Contrats HTTP

### Soumission

`POST /api/barometre` :

```json
{
  "consentement": true,
  "reponses": {
    "sexe": "femme",
    "mode_principal": "marche"
  }
}
```

Le corps `reponses` contient uniquement les clés renseignées, parmi les 17
autorisées. Le serveur refuse le consentement absent/refusé, un objet vide, les
clés inconnues et les valeurs non autorisées. Succès : HTTP 201
`{"ok": true}`. Si le schéma venait à être désactivé (drapeaux de
`barometre_schema.py`), POST et GET résultats répondraient HTTP 503 sans créer de CSV.

### Résultats

`GET /api/barometre/resultats` retourne une structure de cette
forme :

```json
{
  "total": 12,
  "agregats": {
    "sexe": {
      "nombre_reponses": 11,
      "reponses": [{"reponse": "femme", "nombre": 7}],
      "distribution_masquee": true
    },
    "tranche_age": {
      "nombre_reponses": 10,
      "reponses": [{"reponse": "25_34", "nombre": 6}],
      "distribution_masquee": false
    }
  }
}
```

Chaque question présente son propre `nombre_reponses`. Si une catégorie est
inférieure au seuil approuvé, la distribution entière de cette question est
masquée pour éviter la déduction par différence; les lignes brutes ne sont
jamais exposées.

## Validation et activation

Validations obtenues et consignées dans `api/services/barometre_schema.py`
(`QUESTIONNAIRE_APPROVED`, `SEX_AND_AGE_OPTIONS_APPROVED`, `CONSENT_TEXT_APPROVED`,
`RETENTION_POLICY_APPROVED`, `SMALL_CELL_POLICY_APPROVED`, `MIN_GROUP_SIZE = 5`) :

- questionnaire de 17 questions et ses options, dont sexe et âge;
- texte exact du consentement :
  « Je consens à la collecte et au traitement anonyme de mes réponses dans le cadre
  de l'Observatoire de la mobilité de Yaoundé à des fins d'analyse statistique. »;
- liste des 105 quartiers et valeurs stables (P1);
- conservation locale des réponses et masquage des petites cellules ($k \ge 5$).

Côté interface, le questionnaire est présenté en cinq étapes (Profil et foyer,
Pratiques de déplacement, Taxis et motos-taxis, Critères et priorités, Envoi) dans la
page Baromètre, à côté de l'onglet Résultats. Les réponses collectées pendant le
hackathon sont des données de test. Une collecte publique réelle exigerait un stockage
persistant et une gouvernance des réponses validée par la CUY.
