Source de collecte: formulaire React du site.
Stockage runtime: reponses.csv, cree par Flask apres validation du schema et ignore par Git.
Schema: les noms de colonnes sont ceux de FIELDS dans api/routes/barometre.py.
Vie privee: uniquement choix fermes; aucune donnee identifiante ou texte libre.
Docker: ./data/barometre est monte en ecriture sur /app/data/barometre.
Etat M0: le fichier reponses.csv est absent et FIELDS reste vide.
