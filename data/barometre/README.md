# Baromètre

Contrat commun: [docs/contrat_barometre.md](../../docs/contrat_barometre.md).
Le schéma exécutable est défini dans `api/services/barometre_schema.py`.

Statut: proposition de 17 questions en attente de validation; collecte
désactivée. Le questionnaire n'est pas activé tant que les validations
organisationnelles et la liste officielle des quartiers fournie par P1 ne sont
pas disponibles. Le consentement est une condition d'envoi distincte des
questions.

Le fichier `reponses.csv` est absent à M0. Flask ne le crée pas au démarrage;
après approbation complète, la première soumission valide le crée localement.
Les 17 colonnes sont écrites et les questions passées restent des cellules
vides. Le CSV est ignoré par Git. Compose monte ce dossier en écriture.

Ne pas ajouter de réponse réelle, de consentement ou de contenu de CSV à Git.
Les résultats HTTP n'exposent que des agrégats; les distributions à petites
cellules sont masquées selon une politique à faire approuver avant activation.
