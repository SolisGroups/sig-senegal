/* ===== APPLICATION MODERNE SIG - FICHIER JAVASCRIPT ===== */

// Configuration globale
const APP_CONFIG = {
    initialZoom: 7,
    initialCenter: [14.7167, -14.6667], // Centre du Sénégal
    maxZoom: 20,
    minZoom: 1,
    attributionText: 'SIG Sénégal | Powered by Leaflet'
};

// Variables globales
let map;
let minimap;
let highlightLayer;
let bounds_group;

// Note: labels, obj2, obj3, totalMarkers are declared by labels.js library - do not redeclare

// États des panneaux
let panelStates = {
    left: true,
    right: true
};

// ===== INITIALISATION DE L'APPLICATION =====
document.addEventListener('DOMContentLoaded', function () {
    initializeMap();
    initializeEventListeners();
    initializeToolbar();
    setupPanelToggle();
    setupResponsive();
});

// ===== INITIALISATION DE LA CARTE =====
function initializeMap() {
    // Initialiser la carte principale
    map = L.map('map', {
        zoomControl: false,
        attributionControl: true,
        maxZoom: APP_CONFIG.maxZoom,
        minZoom: APP_CONFIG.minZoom,
        preferCanvas: true
    }).setView(APP_CONFIG.initialCenter, APP_CONFIG.initialZoom);

    // Exposer la carte globalement pour les autres scripts
    window.map = map;

    // Ajouter attribution personnalisée
    map.attributionControl.setPrefix(
        '<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; ' +
        '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; ' +
        '<a href="https://qgis.org">QGIS</a>'
    );

    // Hash URL
    if (typeof L.Hash !== 'undefined') {
        new L.Hash(map);
    }

    // Ajouter la minimap
    initializeMinimap();

    // Écouteurs d'événements pour les coordonnées et l'échelle
    map.on('mousemove', updateCoordinates);
    map.on('zoom', updateScale);
    map.on('load', updateScale);

    // Ajouter les contrôles Leaflet personnalisés
    addMapControls();

    // Initialiser les couches
    initializeLayers();
}

// ===== MINIMAP =====
function initializeMinimap() {
    // Créer conteneur minimap s'il n'existe pas
    if (!document.getElementById('minimap')) {
        const minimapContainer = document.createElement('div');
        minimapContainer.className = 'minimap-container';
        minimapContainer.innerHTML = '<div id="minimap"></div>';
        document.querySelector('.map-container').appendChild(minimapContainer);
    }

    // Initialiser la minimap avec Leaflet Control Minimap si disponible
    minimap = L.map('minimap', {
        attributionControl: false,
        zoomControl: false,
        dragging: true,
        tap: false
    }).setView(APP_CONFIG.initialCenter, APP_CONFIG.initialZoom - 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        opacity: 0.8
    }).addTo(minimap);

    // Synchroniser minimap avec la carte principale
    let isMoving = false;
    map.on('move', function () {
        if (!isMoving) {
            isMoving = true;
            minimap.setView(map.getCenter(), minimap.getZoom());
            setTimeout(() => { isMoving = false; }, 100);
        }
    });
}

// ===== MISE À JOUR DES COORDONNÉES =====
function updateCoordinates(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    const coordDisplay = document.querySelector('.coordinates-display');
    if (coordDisplay) {
        coordDisplay.innerHTML = `
            <div class="coord-item">
                <span class="coord-label">Latitude:</span>
                <span>${lat}°</span>
            </div>
            <div class="coord-item">
                <span class="coord-label">Longitude:</span>
                <span>${lng}°</span>
            </div>
        `;
    }
}

// ===== MISE À JOUR DE L'ÉCHELLE =====
function updateScale() {
    const bounds = map.getBounds();
    const maxMeters = bounds.getNorthWest().distanceTo(bounds.getNorthEast());

    let scaleText = '';
    if (maxMeters > 1000) {
        scaleText = (maxMeters / 1000).toFixed(2) + ' km';
    } else {
        scaleText = maxMeters.toFixed(0) + ' m';
    }

    const scaleDisplay = document.querySelector('.scale-display');
    if (scaleDisplay) {
        const scaleLabel = scaleDisplay.querySelector('.scale-label');
        if (scaleLabel) {
            scaleLabel.textContent = scaleText;
        }
    }

    // Mettre à jour minimap zoom
    if (minimap) {
        minimap.setZoom(Math.max(map.getZoom() - 3, 0));
    }
}

// ===== CONTRÔLES DE LA CARTE =====
function addMapControls() {
    // Contrôle de zoom personnalisé
    L.control.zoom({
        position: 'topleft'
    }).remove(); // Supprimer le zoom par défaut

    // Ajouter les boutons de contrôle dans la barre d'outils
    const toolbar = document.querySelector('.map-toolbar');
    if (toolbar) {
        // Zoom avant
        createToolbarButton(toolbar, 'zoom-in', 'fa-plus', 'Zoom avant', () => {
            map.zoomIn();
        });

        // Zoom arrière
        createToolbarButton(toolbar, 'zoom-out', 'fa-minus', 'Zoom arrière', () => {
            map.zoomOut();
        });

        // Vue initiale
        createToolbarButton(toolbar, 'home', 'fa-home', 'Vue initiale', () => {
            map.setView(APP_CONFIG.initialCenter, APP_CONFIG.initialZoom);
        });

        // Plein écran
        createToolbarButton(toolbar, 'fullscreen', 'fa-expand', 'Plein écran', () => {
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer.requestFullscreen) {
                mapContainer.requestFullscreen();
            }
        });

        // Impression
        createToolbarButton(toolbar, 'print', 'fa-print', 'Imprimer', () => {
            window.print();
        });
    }

    // Localisation
    if (typeof L.control.locate !== 'undefined') {
        L.control.locate({
            locateOptions: { maxZoom: 19 },
            position: 'topleft'
        }).addTo(map);
    }

    // Mesure
    if (typeof L.Control.Measure !== 'undefined') {
        const measureControl = new L.Control.Measure({
            position: 'topleft',
            primaryLengthUnit: 'meters',
            secondaryLengthUnit: 'kilometers',
            primaryAreaUnit: 'sqmeters',
            secondaryAreaUnit: 'hectares'
        });
        measureControl.addTo(map);

        const measureToggle = document.querySelector('.leaflet-control-measure-toggle');
        if (measureToggle) {
            measureToggle.innerHTML = '';
            measureToggle.className += ' fas fa-ruler';
        }
    }
}

// ===== CRÉER BOUTON BARRE D'OUTILS =====
function createToolbarButton(toolbar, id, icon, tooltip, callback) {
    const btn = document.createElement('button');
    btn.className = 'map-toolbar-btn';
    btn.id = id;
    btn.innerHTML = `<i class="fas ${icon}"></i>`;
    btn.title = tooltip;
    btn.addEventListener('click', callback);
    toolbar.appendChild(btn);
}

// ===== INITIALISATION DES COUCHES =====
function initializeLayers() {
    bounds_group = new L.featureGroup([]);
    window.bounds_group = bounds_group; // Expose globalement pour qgis2web-integration.js

    // Les couches seront ajoutées par le script QGIS2WEB existant
    // On va intercepter et adapter les styles
    setupLayerPanels();
}

// ===== CONFIGURATION DES PANNEAUX DE COUCHES =====
function setupLayerPanels() {
    // Récupérer tous les éléments de couche du DOM
    const layerItems = document.querySelectorAll('.layer-item');

    layerItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', function () {
                // Mettre à jour la visibilité de la couche
                const layerId = this.dataset.layerId;
                if (window[layerId]) {
                    if (this.checked) {
                        map.addLayer(window[layerId]);
                    } else {
                        map.removeLayer(window[layerId]);
                    }
                }
            });
        }
    });

    // Configurer les basemaps
    setupBasemaps();

    // Configurer la légende
    setupLegend();
}

// ===== CONFIGURATION DES BASEMAPS =====
function setupBasemaps() {
    const basemapsContainer = document.getElementById('basemaps-list');
    if (!basemapsContainer) return;

    // Définir les basemaps disponibles
    const basemaps = {
        osm: {
            name: 'OpenStreetMap',
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors'
        },
        satellite: {
            name: 'Satellite',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri'
        },
        terrain: {
            name: 'Terrain',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri'
        }
    };

    // Écouter les changements de basemap
    document.querySelectorAll('input[name="basemap"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const basemapKey = this.value;
            const basemap = basemaps[basemapKey];

            if (basemap && map) {
                // Supprimer l'ancien basemap
                if (window.currentBasemapLayer) {
                    map.removeLayer(window.currentBasemapLayer);
                }

                // Ajouter le nouveau basemap
                window.currentBasemapLayer = L.tileLayer(basemap.url, {
                    attribution: basemap.attribution,
                    maxZoom: 19,
                    zIndex: 400
                }).addTo(map);

                console.log('✓ Basemap changed to:', basemapKey);
            }
        });
    });

    console.log('✓ Basemaps configured');
}

// ===== CONFIGURATION DE LA LÉGENDE =====
function setupLegend() {
    const legendContainer = document.getElementById('legend');
    if (!legendContainer) return;

    // Attendre que les couches QGIS2Web soient chargées
    const checkLegendInterval = setInterval(() => {
        if (window.layer_Region_1 && window.layer_Departement_2 && window.layer_Routes_4) {
            clearInterval(checkLegendInterval);
            generateLegend(legendContainer);
        }
    }, 100);

    // Timeout après 10 secondes
    setTimeout(() => clearInterval(checkLegendInterval), 10000);
}

function generateLegend(container) {
    const legendItems = [
        {
            label: 'Régions',
            icon: '<i class="fas fa-border-all" style="color: rgba(90,240,21,1)"></i>',
            description: '14 régions administratives'
        },
        {
            label: 'Départements',
            icon: '<i class="fas fa-border-all" style="color: rgba(228,26,28,1)"></i>',
            description: 'Divisions départementales'
        },
        {
            label: 'Arrondissements',
            icon: '<i class="fas fa-border-all" style="color: rgba(74,153,175,1)"></i>',
            description: 'Subdivisions administratives'
        },
        {
            label: 'Routes',
            icon: '<i class="fas fa-road" style="color: rgba(227,26,28,1)"></i>',
            description: 'Réseau routier avec classification'
        },
        {
            label: 'Localités',
            icon: '<i class="fas fa-circle" style="color: rgba(141,90,153,1)"></i>',
            description: 'Communes et villages'
        }
    ];

    // Vider le conteneur
    container.innerHTML = '';

    // Ajouter chaque élément de la légende
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-item-icon">${item.icon}</div>
            <div class="legend-item-text">
                <strong>${item.label}</strong>
                <small>${item.description}</small>
            </div>
        `;
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.gap = '10px';
        legendItem.style.marginBottom = '10px';
        legendItem.style.padding = '8px';
        legendItem.style.borderRadius = '4px';
        legendItem.style.backgroundColor = 'rgba(255,255,255,0.05)';

        container.appendChild(legendItem);
    });

    console.log('✓ Legend generated');
}

// ===== ÉVÉNEMENTS ÉCOUTEURS =====
function initializeEventListeners() {
    // Barre de recherche
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }

    // Boutons de menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            handleMenuClick(this);
        });
    });

    // Boutons de menu déroulant
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            handleDropdownClick(this);
        });
    });

    // Initialiser les requêtes
    setupSpatialQuery();
    setupAttributeQuery();
}

// ===== GESTION CLIC MENU =====
function handleMenuClick(element) {
    const menuText = element.querySelector('span') ? element.querySelector('span').textContent : element.textContent;

    switch (menuText.trim()) {
        case 'Accueil':
            showModal('home');
            break;
        case 'À propos':
            showModal('about');
            break;
        case 'Catalogue':
            showModal('catalog');
            break;
        case 'Outils':
            // Outils déjà disponibles
            break;
    }
}

// ===== GESTION CLIC MENU DÉROULANT =====
function handleDropdownClick(element) {
    const text = element.textContent.trim();

    if (text.includes('CSV')) {
        exportData('csv');
    } else if (text.includes('GeoJSON')) {
        exportData('geojson');
    } else if (text.includes('Requête spatiale')) {
        showModal('spatial-query');
    } else if (text.includes('Requête attributaire')) {
        showModal('attribute-query');
    } else if (text.includes('Afficher/Masquer')) {
        toggleLayersPanel();
    } else if (text.includes('Styles')) {
        showToast('Outils de style - En développement', 'info');
    } else if (text.includes('Légende')) {
        // La légende est déjà visible dans le panel droit
        showToast('La légende s\'affiche dans le panneau droit', 'success');
        document.querySelector('.toggle-right-btn').click(); // Afficher panel droit
    }
}

// ===== RECHERCHE RAPIDE =====
function performSearch(query) {
    if (!query.trim()) return;

    showToast('Recherche en cours...', 'info');

    // Implémenter la logique de recherche
    setTimeout(() => {
        showToast(`Résultats de recherche pour "${query}"`, 'success');
    }, 1000);
}

// ===== EXPORT DONNÉES =====
function exportData(format) {
    showToast(`Export en ${format.toUpperCase()} en cours...`, 'info');

    // Implémenter la logique d'export
    setTimeout(() => {
        const dataStr = format === 'csv' ? generateCSV() : generateGeoJSON();
        downloadFile(dataStr, `export.${format === 'csv' ? 'csv' : 'geojson'}`);
        showToast('Export réussi !', 'success');
    }, 1000);
}

// ===== GÉNÉRER CSV =====
function generateCSV() {
    // Générer un CSV à partir des données de la carte
    let csv = 'ID,Nom,Latitude,Longitude\n';
    // Ajouter les données
    return csv;
}

// ===== GÉNÉRER GEOJSON =====
function generateGeoJSON() {
    // Générer un GeoJSON
    return JSON.stringify({
        type: 'FeatureCollection',
        features: []
    });
}

// ===== TÉLÉCHARGER FICHIER =====
function downloadFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ===== GESTION DES MODALES =====
function showModal(modalType) {
    const modal = document.getElementById(`${modalType}-modal`);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalType) {
    const modal = document.getElementById(`${modalType}-modal`);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Fermer modal en cliquant en dehors
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
});

// Boutons de fermeture modal
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function () {
        this.closest('.modal').classList.remove('show');
        document.body.style.overflow = 'auto';
    });
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };

    toast.innerHTML = `
        <i class="fas ${iconMap[type]} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== REQUÊTE SPATIALE =====
function setupSpatialQuery() {
    const executeBtn = document.getElementById('execute-spatial-query');
    if (!executeBtn) return;

    executeBtn.addEventListener('click', function () {
        const queryType = document.querySelector('input[name="spatial-query"]:checked').value;
        const selectedLayers = Array.from(document.querySelectorAll('.query-layer:checked')).map(cb => cb.value);

        if (selectedLayers.length === 0) {
            showToast('Sélectionnez au moins une couche', 'warning');
            return;
        }

        showToast(`Requête spatiale lancée (Type: ${queryType})`, 'info');

        // Créer un layer pour afficher les résultats
        const queryResultsLayer = L.featureGroup().addTo(map);
        window.queryResultsLayer = queryResultsLayer;

        // Ajouter les couches sélectionnées avec surbrillance
        selectedLayers.forEach(layer => {
            const layerMapping = {
                'region': 'layer_Region_1',
                'departement': 'layer_Departement_2',
                'arrondissement': 'layer_Arrondissement_3',
                'routes': 'layer_Routes_4',
                'localites': 'cluster_localites_5'
            };

            const layerId = layerMapping[layer];
            if (window[layerId]) {
                const features = window[layerId].getLayers ? window[layerId].getLayers() : [window[layerId]];
                features.forEach(feature => {
                    if (feature.setStyle) {
                        feature.setStyle({ weight: 3, color: 'yellow', fillOpacity: 0.7 });
                    }
                    queryResultsLayer.addLayer(feature);
                });
            }
        });

        showToast(`${queryResultsLayer.getLayers().length} éléments trouvés`, 'success');
        hideModal('spatial-query');
    });
}

// ===== REQUÊTE ATTRIBUTAIRE =====
function setupAttributeQuery() {
    const layerSelect = document.getElementById('attribute-layer');
    const executeBtn = document.getElementById('execute-attribute-query');

    if (!layerSelect || !executeBtn) return;

    // Mettre à jour les champs disponibles selon la couche sélectionnée
    layerSelect.addEventListener('change', function () {
        const fieldSelect = document.getElementById('attribute-field');
        fieldSelect.innerHTML = '<option value="">-- Sélectionner un attribut --</option>';

        const layer = this.value;
        let attributes = [];

        // Récupérer les attributs selon la couche
        const layerMapping = {
            'region': 'layer_Region_1',
            'departement': 'layer_Departement_2',
            'arrondissement': 'layer_Arrondissement_3',
            'routes': 'layer_Routes_4',
            'localites': 'cluster_localites_5'
        };

        const layerId = layerMapping[layer];
        if (window[layerId]) {
            const features = window[layerId].toGeoJSON ? window[layerId].toGeoJSON().features :
                (window[layerId].getLayers ? window[layerId].getLayers() : []);

            if (features.length > 0) {
                const firstFeature = features[0];
                attributes = Object.keys(firstFeature.properties || {});
            }
        }

        // Ajouter les attributs au sélecteur
        attributes.forEach(attr => {
            const option = document.createElement('option');
            option.value = attr;
            option.textContent = attr;
            fieldSelect.appendChild(option);
        });
    });

    // Exécuter la requête
    executeBtn.addEventListener('click', function () {
        const layer = layerSelect.value;
        const field = document.getElementById('attribute-field').value;
        const operator = document.getElementById('attribute-operator').value;
        const value = document.getElementById('attribute-value').value;

        if (!layer || !field || !value) {
            showToast('Remplissez tous les champs', 'warning');
            return;
        }

        showToast('Filtrage des données...', 'info');

        const layerMapping = {
            'region': 'layer_Region_1',
            'departement': 'layer_Departement_2',
            'arrondissement': 'layer_Arrondissement_3',
            'routes': 'layer_Routes_4',
            'localites': 'cluster_localites_5'
        };

        const layerId = layerMapping[layer];
        if (!window[layerId]) return;

        // Filtrer les données
        const filteredFeatures = [];
        const features = window[layerId].toGeoJSON ? window[layerId].toGeoJSON().features :
            (window[layerId].getLayers ? window[layerId].getLayers() : []);

        features.forEach(feature => {
            const props = feature.properties || {};
            const fieldValue = String(props[field] || '').toLowerCase();
            const searchValue = String(value).toLowerCase();

            let matches = false;
            switch (operator) {
                case '=':
                    matches = fieldValue === searchValue;
                    break;
                case '!=':
                    matches = fieldValue !== searchValue;
                    break;
                case '>':
                    matches = parseFloat(fieldValue) > parseFloat(searchValue);
                    break;
                case '<':
                    matches = parseFloat(fieldValue) < parseFloat(searchValue);
                    break;
                case '>=':
                    matches = parseFloat(fieldValue) >= parseFloat(searchValue);
                    break;
                case '<=':
                    matches = parseFloat(fieldValue) <= parseFloat(searchValue);
                    break;
                case 'contains':
                    matches = fieldValue.includes(searchValue);
                    break;
                case 'starts':
                    matches = fieldValue.startsWith(searchValue);
                    break;
            }

            if (matches) {
                filteredFeatures.push(feature);
                // Surbrillancer les résultats
                if (feature.setStyle) {
                    feature.setStyle({ weight: 2, color: 'orange', fillOpacity: 0.6 });
                }
            }
        });

        showToast(`${filteredFeatures.length} enregistrement(s) trouvé(s)`, 'success');
        hideModal('attribute-query');
    });
}

// ===== AFFICHAGE PANEL COUCHES =====
function toggleLayersPanel() {
    const leftPanel = document.querySelector('.left-panel');
    if (leftPanel) {
        leftPanel.classList.toggle('panel-collapsed');
        panelStates.left = !panelStates.left;
        map.invalidateSize();
        setTimeout(() => map.invalidateSize(), 100);
    }
}

// ===== BARRE D'OUTILS =====
function initializeToolbar() {
    const toolbar = document.querySelector('.map-toolbar');
    if (!toolbar) {
        const mapContainer = document.querySelector('.map-container');
        const newToolbar = document.createElement('div');
        newToolbar.className = 'map-toolbar';
        mapContainer.appendChild(newToolbar);
    }
}

// ===== BASCULE PANNEAUX =====
function setupPanelToggle() {
    const toggleLeftBtn = document.querySelector('.toggle-left-btn');
    const toggleRightBtn = document.querySelector('.toggle-right-btn');
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');

    if (toggleLeftBtn && leftPanel) {
        toggleLeftBtn.addEventListener('click', function () {
            panelStates.left = !panelStates.left;
            leftPanel.classList.toggle('panel-collapsed');
            map.invalidateSize();
            setTimeout(() => map.invalidateSize(), 100);
        });
    }

    if (toggleRightBtn && rightPanel) {
        toggleRightBtn.addEventListener('click', function () {
            panelStates.right = !panelStates.right;
            rightPanel.classList.toggle('panel-collapsed');
            map.invalidateSize();
            setTimeout(() => map.invalidateSize(), 100);
        });
    }
}

// ===== RESPONSIVE =====
function setupResponsive() {
    window.addEventListener('resize', function () {
        const width = window.innerWidth;
        if (width < 768) {
            // Mode mobile
            const leftPanel = document.querySelector('.left-panel');
            const rightPanel = document.querySelector('.right-panel');
            if (leftPanel) leftPanel.classList.add('panel-collapsed');
            if (rightPanel) rightPanel.classList.add('panel-collapsed');
            panelStates.left = false;
            panelStates.right = false;
        } else {
            // Mode desktop
            const leftPanel = document.querySelector('.left-panel');
            const rightPanel = document.querySelector('.right-panel');
            if (leftPanel) leftPanel.classList.remove('panel-collapsed');
            if (rightPanel) rightPanel.classList.remove('panel-collapsed');
            panelStates.left = true;
            panelStates.right = true;
        }
        map.invalidateSize();
    });
}

// ===== HIGHLIGHT FEATURE =====
window.highlightFeature = function (e) {
    highlightLayer = e.target;

    if (e.target.feature.geometry.type === 'LineString' || e.target.feature.geometry.type === 'MultiLineString') {
        highlightLayer.setStyle({
            color: 'rgba(255, 255, 0, 1.00)',
            weight: 3
        });
    } else {
        highlightLayer.setStyle({
            fillColor: 'rgba(255, 255, 0, 1.00)',
            fillOpacity: 1,
            weight: 2
        });
    }

    highlightLayer.openPopup();
};

// ===== AUTOLINKER =====
if (typeof Autolinker === 'undefined') {
    window.Autolinker = {
        link: function (text) {
            return text;
        }
    };
}

// Export global pour les scripts QGIS2WEB
window.APP = {
    map: map,
    minimap: minimap,
    highlightFeature: highlightFeature,
    bounds_group: bounds_group,
    config: APP_CONFIG,
    showToast: showToast,
    showModal: showModal,
    hideModal: hideModal
};
