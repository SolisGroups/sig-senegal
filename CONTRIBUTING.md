# Guide de Contribution - SIG Sénégal

## Pour les Développeurs

### Structure du Code

#### Fichiers Principaux

**index.html**

- Structure HTML de l'application
- Chargement des CSS et JavaScript
- Éléments de l'interface utilisateur

**js/app-modern.js**

- Logique principale de l'application
- Gestion des événements
- Initialisation de la carte
- Fonctions utilitaires

**js/qgis2web-integration.js**

- Intégration des couches QGIS
- Initialisation des données géographiques
- Configuration des popups et styles

**js/config.js**

- Configuration globale
- Couleurs et styles
- Messages multilingues

**css/modern-ui.css**

- Styles de la navigation
- Styles des panneaux
- Styles des modales et boutons

**css/map-extensions.css**

- Styles des extensions Leaflet
- Styles personnalisés de la carte
- Styles des notifications

### Conventions de Codage

#### JavaScript

```javascript
// Utiliser camelCase pour les noms de variables et fonctions
let myVariable = 'value';
function myFunction() {}

// Utiliser const par défaut, let pour les variables mutables
const config = { /* ... */ };
let counter = 0;

// Commenter le code complexe
// Initialiser la carte avec les paramètres fournis
map = L.map('map', { /* ... */ });

// Utiliser les template literals
const message = `L'erreur est: ${error}`;

// Utiliser arrow functions
const handleClick = (event) => { /* ... */ };
```

#### CSS

```css
/* Utiliser kebab-case pour les noms de classes */
.panel-header {
    /* ... */
}

/* Utiliser les variables CSS */
:root {
    --primary-color: #1e3c72;
    --secondary-color: #2a5298;
}

/* Organiser par ordre logique */
.element {
    display: block;
    position: relative;
    width: 100%;
    height: auto;
    /* ... */
}
```

#### HTML

```html
<!-- Utiliser des attributs data pour les données personnalisées -->
<div data-layer-id="123" data-type="region">Content</div>

<!-- Utiliser des classes BEM (Block Element Modifier) -->
<div class="panel panel--left">
    <header class="panel__header">
        <h3 class="panel__title">Title</h3>
        <button class="panel__close-btn">X</button>
    </header>
</div>
```

### Ajout de Nouvelles Fonctionnalités

#### 1. Ajouter une Nouvelle Couche

**Étape 1**: Exporter les données depuis QGIS

- Utiliser QGIS2Web pour générer les données JSON
- Placer le fichier dans `data/`

**Étape 2**: Intégrer la couche dans `js/qgis2web-integration.js`

```javascript
function initializeNewLayer() {
    function pop_NewLayer(feature, layer) {
        // Gérer les popups
    }
    
    function style_NewLayer_0(feature) {
        return {
            pane: 'pane_NewLayer',
            color: 'rgba(100,100,100,1.0)',
            weight: 1.0,
            // ...
        };
    }
    
    map.createPane('pane_NewLayer');
    map.getPane('pane_NewLayer').style.zIndex = 406;
    
    var layer_NewLayer = new L.geoJson(json_NewLayer, {
        attribution: '',
        interactive: true,
        dataVar: 'json_NewLayer',
        layerName: 'layer_NewLayer',
        pane: 'pane_NewLayer',
        onEachFeature: pop_NewLayer,
        style: style_NewLayer_0,
    });
    
    bounds_group.addLayer(layer_NewLayer);
    map.addLayer(layer_NewLayer);
    window.layer_NewLayer = layer_NewLayer;
}
```

**Étape 3**: Charger les données dans `index.html`

```html
<script src="data/NewLayer.js"></script>
```

#### 2. Ajouter un Nouvel Outil

**Étape 1**: Créer la fonction dans `js/app-modern.js`

```javascript
function myNewTool() {
    // Logique de l'outil
}
```

**Étape 2**: Ajouter le bouton dans la barre d'outils

```javascript
function initializeToolbar() {
    const toolbar = document.querySelector('.map-toolbar');
    createToolbarButton(toolbar, 'my-tool', 'fa-icon', 'Tooltip', myNewTool);
}
```

**Étape 3**: Ajouter les styles CSS si nécessaire

```css
.map-toolbar-btn#my-tool {
    /* Styles spécifiques */
}
```

#### 3. Ajouter une Nouvelle Langue

**Étape 1**: Ajouter les traductions dans `js/config.js`

```javascript
const i18n = {
    de: {
        loading: 'Wird geladen...',
        error: 'Fehler',
        // ...
    }
};
```

**Étape 2**: Utiliser les traductions

```javascript
const lang = 'de'; // ou déterminer depuis le navigateur
const message = i18n[lang].loading;
```

### Processus de Développement

#### 1. Configuration Locale

```bash
# Cloner le repository
git clone https://github.com/user/sig-senegal.git
cd sig-senegal

# Installer un serveur web local
python -m http.server 8000

# Ou utiliser Live Server avec VS Code
```

#### 2. Modification du Code

- Créer une nouvelle branche

```bash
git checkout -b feature/ma-nouvelle-feature
```

#### 3. Tests

- Tester dans plusieurs navigateurs
- Vérifier la console (F12) pour les erreurs
- Vérifier les performances
- Tester sur mobile

#### 4. Commit et Push

```bash
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin feature/ma-nouvelle-feature
```

#### 5. Pull Request

- Créer une PR sur GitHub
- Décrire les changements
- Attendre la review

### Débogage

#### Utiliser la Console du Navigateur

```javascript
// Log les messages
console.log('Message');
console.warn('Avertissement');
console.error('Erreur');

// Inspecter les objets
console.table(data);
console.group('Groupe');
console.log('Item 1');
console.log('Item 2');
console.groupEnd();

// Mesurer les performances
console.time('mon-timer');
// Code à mesurer
console.timeEnd('mon-timer');
```

#### Breakpoints

- Ouvrir les Dev Tools (F12)
- Aller dans l'onglet "Sources"
- Cliquer sur le numéro de ligne pour ajouter un breakpoint
- Rafraîchir la page

#### Network Tab

- Vérifier que tous les fichiers se chargent
- Vérifier les codes HTTP (200, 404, etc.)
- Analyser les temps de chargement

### Performance

#### Optimisation du Code

```javascript
// Mauvais: appels répétés au DOM
for (let i = 0; i < 1000; i++) {
    document.getElementById('myElement').innerHTML += 'text';
}

// Bon: modifier une seule fois
let html = '';
for (let i = 0; i < 1000; i++) {
    html += 'text';
}
document.getElementById('myElement').innerHTML = html;
```

#### Utiliser les DevTools Performance

- Ouvrir DevTools
- Onglet "Performance"
- Cliquer sur "Record"
- Effectuer une action
- Cliquer sur "Stop"
- Analyser le rapport

### Sécurité

#### Validations

```javascript
// Valider les entrées utilisateur
function validateInput(input) {
    if (!input || input.trim() === '') {
        throw new Error('Entrée invalide');
    }
    return input.trim();
}
```

#### Prévention XSS

```javascript
// Mauvais: innerHTML peut injecter du code
element.innerHTML = userInput;

// Bon: utiliser textContent pour du texte
element.textContent = userInput;

// Ou utiliser un sanitizer
const sanitizedHTML = sanitizeHTML(userInput);
element.innerHTML = sanitizedHTML;
```

#### Prévention CSRF

- Utiliser les tokens CSRF
- Valider les origines
- Utiliser SameSite cookies

### Testing

#### Tests Manuels

- Tester chaque fonctionnalité
- Tester sur différents navigateurs
- Tester sur mobile
- Tester les cas limites

#### Tests Automatisés (optionnel)

```javascript
// Exemple avec Jest
describe('calculateDistance', () => {
    test('devrait calculer la distance correctement', () => {
        const distance = calculateDistance([0, 0], [1, 1]);
        expect(distance).toBeCloseTo(157425, 0);
    });
});
```

### Documentation

#### Commenter le Code

```javascript
/**
 * Calcule la distance entre deux coordonnées
 * @param {number[]} coord1 - [lat, lng]
 * @param {number[]} coord2 - [lat, lng]
 * @returns {number} Distance en mètres
 */
function calculateDistance(coord1, coord2) {
    // Implémentation
}
```

#### README pour les Fonctionnalités

Ajouter une section dans README.md pour chaque nouvelle fonctionnalité:

```markdown
### Nouvelle Fonctionnalité

Description de la fonctionnalité.

#### Utilisation
```

### Ressources

- [JavaScript Best Practices](https://google.github.io/styleguide/javascriptguide.html)
- [Leaflet Documentation](https://leafletjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [QGIS Documentation](https://docs.qgis.org/)

### Support

Pour toute question ou problème:

1. Consulter la documentation
2. Chercher dans les issues GitHub
3. Créer une nouvelle issue
4. Contacter l'équipe de développement

---
Version: 1.0
Date: Janvier 2026
