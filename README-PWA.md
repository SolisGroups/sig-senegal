SIG Sénégal — PWA & Service Worker
=================================

Ce fichier décrit la procédure pour générer le `sw.js` localement et le comportement de CI ajouté au dépôt.

Prérequis
---------
- Node.js (v16+) et npm
- Git (pour push automatique depuis la CI)

Installer les dépendances
-------------------------
Ouvrez une console à la racine du projet et exécutez :

```bash
npm install
```

Générer le `sw.js` localement
-----------------------------
Le projet contient `build-sw.js` qui utilise `workbox-build` pour générer un `sw.js` adapté aux fichiers présents.

```bash
npm run build-sw
```

Le script écrasera `sw.js` avec une version générée automatiquement (précache + règles runtime pour les tuiles OSM et les data files).

Notes sur le contenu généré
- `navigateFallback` = `offline.html` (page fallback hors-ligne)
- Runtime cache configuré pour `tile.openstreetmap.org` en `CacheFirst` avec expiration (maxEntries 600, 30 jours)

CI / GitHub Actions
--------------------
Un workflow GitHub Actions est ajouté : `.github/workflows/build-sw.yml`.
Il s'exécute sur :
- push sur `master`
- publication de release

Que fait-il ?
- clone le repo
- installe Node.js
- `npm ci`
- `npm run build-sw`
- si `sw.js` est modifié, il commit et push `sw.js` vers `master` (bot)

Vérifications locales et post-déploiement
---------------------------------------
- Ouvrez le site via HTTPS (GitHub Pages URL) et ouvrez DevTools → Application → Service Workers pour vérifier l'installation et l'état.
- Vérifiez Cache Storage → `osm-tiles`, `pages-cache`, `static-resources`.
- Testez la navigation hors-ligne après avoir chargé la page une première fois : déconnectez et rechargez pour voir `offline.html`.

Commandes utiles
----------------
- Forcer rebuild et push localement :

```bash
npm run build-sw
git add sw.js
git commit -m "chore: build sw.js"
git push origin master
```

- Purger le cache des tuiles depuis la console (client) :

```js
navigator.serviceWorker.controller.postMessage({type:'CLEAR_TILE_CACHE'})
```

Dépannage
---------
- Si Workbox CDN est utilisé et le SW ne se charge pas, regardez la console pour les erreurs `importScripts`.
- Si `npm ci` échoue dans la CI, vérifiez que `package.json` contient `workbox-build` et que la version est compatible.

Questions / Améliorations possibles
- Automatiser incrément de version ou ajout d'un hash dans `manifest.json` lors des releases.
- Étendre l'expiration/stratégie tile (LRU, priorisation par région) ou intégrer un quota par utilisateur.
