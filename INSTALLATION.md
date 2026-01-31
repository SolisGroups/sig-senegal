# Guide d'Installation et Déploiement - SIG Sénégal

## Prérequis

- Apache/Tomcat ou serveur web compatible
- Navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Connexion Internet (pour les fonds de carte OSM)

## Installation

### 1. Structure des Fichiers

L'application doit être structurée comme suit:

```
sig-senegal/
├── index.html
├── README.md
├── css/
│   ├── modern-ui.css              (NEW)
│   ├── map-extensions.css         (NEW)
│   ├── leaflet.css
│   ├── fontawesome-all.min.css
│   ├── L.Control.Layers.Tree.css
│   ├── L.Control.Locate.min.css
│   ├── qgis2web.css
│   ├── MarkerCluster.css
│   ├── MarkerCluster.Default.css
│   ├── leaflet-search.css
│   ├── leaflet.photon.css
│   └── leaflet-measure.css
├── js/
│   ├── app-modern.js              (NEW)
│   ├── qgis2web-integration.js    (NEW)
│   ├── qgis2web_expressions.js
│   ├── leaflet.js
│   ├── L.Control.Layers.Tree.min.js
│   ├── L.Control.Locate.min.js
│   ├── leaflet.rotatedMarker.js
│   ├── leaflet.pattern.js
│   ├── leaflet-hash.js
│   ├── Autolinker.min.js
│   ├── rbush.min.js
│   ├── labelgun.min.js
│   ├── labels.js
│   ├── leaflet.photon.js
│   ├── leaflet-measure.js
│   ├── leaflet.markercluster.js
│   └── leaflet-search.js
├── data/
│   ├── Region_1.js
│   ├── Departement_2.js
│   ├── Arrondissement_3.js
│   ├── Routes_4.js
│   └── localites_5.js
├── images/
│   └── (images de la carte)
├── legend/
│   └── (images de la légende)
├── markers/
│   └── (marqueurs de la carte)
└── webfonts/
    └── (polices Font Awesome)
```

### 2. Copie des Fichiers

1. Copier tous les fichiers existants du projet QGIS2WEB
2. Ajouter les nouveaux fichiers CSS:
   - `css/modern-ui.css`
   - `css/map-extensions.css`
3. Ajouter les nouveaux fichiers JS:
   - `js/app-modern.js`
   - `js/qgis2web-integration.js`
4. Remplacer le fichier `index.html`

### 3. Configuration du Serveur Web

#### Avec Apache

```apache
<Directory "/var/www/sig-senegal">
    AllowOverride All
    Order allow,deny
    Allow from all
    Require all granted
</Directory>

<VirtualHost *:80>
    ServerName sig-senegal.local
    DocumentRoot /var/www/sig-senegal
    
    <Directory /var/www/sig-senegal>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Avec Tomcat

Placer le dossier `sig-senegal` dans:

```
CATALINA_HOME/webapps/sig-senegal
```

Accès: `http://localhost:8080/sig-senegal/`

#### Avec Python (développement)

```bash
cd sig-senegal
python -m http.server 8000
```

Accès: `http://localhost:8000/`

### 4. Vérification de l'Installation

1. Ouvrir le navigateur sur: `http://localhost/sig-senegal/`
2. Vérifier que la carte charge correctement
3. Tester les fonctionnalités:
   - Navigation de la carte
   - Affichage/masquage des couches
   - Recherche
   - Export de données

## Configuration CORS (Problèmes Cross-Origin)

Si vous avez des erreurs CORS:

### Pour Apache

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

### Pour Nginx

```nginx
location / {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type';
}
```

## Optimisation des Performances

### 1. Compression GZIP

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Cache Browser

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
</IfModule>
```

### 3. Minification des Fichiers

- Minifier les fichiers CSS et JS
- Utiliser des outils comme:
  - UglifyJS (JavaScript)
  - CSSNano (CSS)

### 4. CDN pour les Ressources

Vous pouvez charger certaines bibliothèques depuis un CDN:

```html
<!-- Leaflet from CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>

<!-- Font Awesome from CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
```

## Maintenance

### Mises à Jour des Données

1. Exporter les nouvelles données depuis QGIS en utilisant QGIS2WEB
2. Remplacer les fichiers de données (data/*.js)
3. Rafraîchir le navigateur (Ctrl+Shift+R)

### Sauvegarde

```bash
# Sauvegarde complète
tar -czf sig-senegal-backup-$(date +%Y%m%d).tar.gz sig-senegal/

# Sauvegarde des données uniquement
tar -czf sig-senegal-data-backup-$(date +%Y%m%d).tar.gz sig-senegal/data/
```

### Logs

- Activer les logs du serveur web
- Consulter la console du navigateur (F12) pour les erreurs
- Vérifier les permissions des fichiers

## Déploiement en Production

### Checklist Pre-Deployment

- [ ] Tous les fichiers sont en place
- [ ] Les chemins relatifs sont corrects
- [ ] La compression GZIP est activée
- [ ] Le cache du navigateur est configuré
- [ ] Les erreurs CORS sont résolues
- [ ] Les certificats SSL sont installés (HTTPS)
- [ ] Les performances sont optimales
- [ ] Les tests de fonctionnalité réussissent

### Déploiement sur Serveur

```bash
# 1. Connexion SSH
ssh user@server.com

# 2. Navigation vers le répertoire
cd /var/www/sig-senegal

# 3. Télécharger les fichiers
git clone https://github.com/user/sig-senegal.git .

# 4. Définir les permissions
chmod -R 755 .
chmod -R 644 *.html *.css *.js

# 5. Redémarrer le serveur web
sudo systemctl restart apache2
# ou pour Tomcat
sudo systemctl restart tomcat9
```

### Monitoring

- Utiliser des outils comme:
  - Google Analytics
  - Sentry (error tracking)
  - DataDog (monitoring)
  - New Relic (APM)

## Dépannage Courant

### Problème: Port 8080 déjà utilisé

```bash
# Trouver le processus
lsof -i :8080

# Tuer le processus
kill -9 <PID>
```

### Problème: Permissions refusées

```bash
chmod -R 755 sig-senegal/
chown -R www-data:www-data sig-senegal/
```

### Problème: HTTPS redirection

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Support Technique

Pour plus d'assistance:

1. Consulter la documentation de Leaflet: <https://leafletjs.com/>
2. Consulter la documentation de QGIS2WEB: <https://github.com/tomchadwin/qgis2web>
3. Consulter les logs du serveur
4. Vérifier les messages d'erreur dans la console (F12)

## Ressources Supplémentaires

- **Leaflet Documentation**: <https://leafletjs.com/>
- **QGIS Documentation**: <https://docs.qgis.org/>
- **Web Performance**: <https://web.dev/>
- **Security Best Practices**: <https://owasp.org/>

---
Date: Janvier 2026
Version: 1.0
