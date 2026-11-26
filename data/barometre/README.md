# Baromètre — stockage des réponses

Contrat commun : [docs/contrat_barometre.md](../../docs/contrat_barometre.md).
Schéma exécutable : `api/services/barometre_schema.py`.

**Statut : actif.** Le questionnaire de 17 questions, la liste des 105 quartiers, le
consentement, la conservation et le masquage des petites cellules ($k \ge 5$) sont validés.

- La première soumission valide crée `reponses.csv` dans ce dossier (chemin modifiable
  avec la variable `BAROMETRE_CSV`).
- Le fichier contient une ligne par formulaire et les 17 colonnes ; une question passée
  reste une cellule vide. Le consentement est vérifié à l'envoi mais n'est pas une colonne.
- `GET /api/barometre/resultats` ne renvoie que des agrégats ; la distribution d'une
  question est masquée dès qu'une catégorie compte moins de 5 réponses.
- Docker Compose monte ce dossier en écriture pour conserver les réponses entre deux
  redémarrages.

`reponses.csv` est ignoré par Git : ne jamais committer de réponse, réelle ou de test.
Les réponses collectées pendant le hackathon sont des données de test, non représentatives.
