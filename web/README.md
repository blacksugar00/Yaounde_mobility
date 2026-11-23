# web/ : front de la plateforme

Lancer en local (les modules ES exigent un serveur, pas un double-clic) :

    cd web && python3 -m http.server 8080
    # puis ouvrir http://localhost:8080

- `js/api.js` : seul fichier qui connait les URL. `USE_MOCK = true` lit `mock/` ; mettre `false` pour la vraie API (`/api`).
- `mock/` : donnees FACTICES (source_id "mock"), au format du contrat. A supprimer quand l'API est prete.
- `vendor/` : ECharts 5.5.1 et MapLibre 4.7.1, copies fixes (DEC-12).
- Fond de carte : OpenFreeMap (DEC-06). Les noms de fichiers/branches sont en francais sans accents (DEC-16).
