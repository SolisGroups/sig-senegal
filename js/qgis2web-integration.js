/* ===== QGIS2WEB MAP INITIALIZATION - INTEGRATED WITH MODERN UI ===== */

// Flag pour tracker l'initialisation
let qgis2webInitialized = false;

// Initialiser quand le document est chargé
document.addEventListener('DOMContentLoaded', function () {
    // Vérifier les données tous les 100ms jusqu'à 10 secondes
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;

        // Vérifier que tous les fichiers sont chargés
        if (typeof json_Region_1 !== 'undefined' &&
            typeof json_Departement_2 !== 'undefined' &&
            typeof json_Arrondissement_3 !== 'undefined' &&
            typeof json_Routes_4 !== 'undefined' &&
            typeof json_localites_5 !== 'undefined' &&
            window.map && !qgis2webInitialized) {

            clearInterval(checkInterval);
            console.log('All data loaded, initializing QGIS2Web map...');
            initializeQGIS2WebMap();
        }

        // Timeout après 10 secondes
        if (attempts > 100) {
            clearInterval(checkInterval);
            console.error('Timeout waiting for data files to load');
        }
    }, 100);
});

function initializeQGIS2WebMap() {
    // Éviter les initialisations multiples
    if (qgis2webInitialized) {
        console.log('QGIS2Web map already initialized');
        return;
    }
    qgis2webInitialized = true;

    // Vérifier que Leaflet et la carte sont disponibles
    if (typeof L === 'undefined' || !window.map) {
        console.error('Leaflet or map not available');
        qgis2webInitialized = false;
        return;
    }

    // Map est maintenant prête
    console.log('Initializing QGIS2Web layers...');
    const map = window.map;
    window.qgis2webMap = map; // Expose map globalement pour les fonctions des couches

    // Créer bounds_group si n'existe pas
    console.log('Before creating bounds_group - L available:', typeof L, 'L.featureGroup:', typeof L.featureGroup);
    if (typeof window.bounds_group === 'undefined' || !window.bounds_group) {
        window.bounds_group = new L.featureGroup([]);
        console.log('✓ Created window.bounds_group:', window.bounds_group);
    }
    // Assurer la compatibilité avec la variable locale
    window.bounds_group = window.bounds_group || new L.featureGroup([]);
    console.log('Final window.bounds_group:', window.bounds_group);

    // Ajouter la couche basemap si pas déjà présente
    if (!map.getPane('pane_OpenStreetMap_0')) {
        map.createPane('pane_OpenStreetMap_0');
    }
    map.getPane('pane_OpenStreetMap_0').style.zIndex = 400;

    var layer_OpenStreetMap_0 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        pane: 'pane_OpenStreetMap_0',
        opacity: 1.0,
        attribution: '© OpenStreetMap contributors',
        minZoom: 1,
        maxZoom: 20,
        minNativeZoom: 0,
        maxNativeZoom: 19
    });

    map.addLayer(layer_OpenStreetMap_0);
    window.layer_OpenStreetMap_0 = layer_OpenStreetMap_0; // Exposer le basemap
    if (!window.currentBasemapLayer) {
        window.currentBasemapLayer = layer_OpenStreetMap_0; // Utiliser comme basemap initial
    }

    // Initialize all layers
    try {
        initializeRegionLayer();
        console.log('✓ Regions layer loaded');
    } catch (e) { console.error('Region layer error:', e); }

    try {
        initializeDepartementLayer();
        console.log('✓ Departments layer loaded');
    } catch (e) { console.error('Department layer error:', e); }

    try {
        initializeArrondissementLayer();
        console.log('✓ Arrondissements layer loaded');
    } catch (e) { console.error('Arrondissement layer error:', e); }

    try {
        initializeRoutesLayer();
        console.log('✓ Routes layer loaded');
    } catch (e) { console.error('Routes layer error:', e); }

    try {
        initializeLocalitesLayer();
        console.log('✓ Localities layer loaded');
    } catch (e) { console.error('Localities layer error:', e); }

    // Setup layer control and bounds
    setupLayerControl();
    setBounds();
}

// Helper function to get the map instance
function getMap() {
    const m = window.qgis2webMap || window.map;
    if (!m) {
        console.error('getMap() - Map is undefined! qgis2webMap:', window.qgis2webMap, 'map:', window.map);
    }
    return m;
}

// Remove empty rows from popup
function removeEmptyRowsFromPopupContent(content, feature) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var rows = tempDiv.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
        var td = rows[i].querySelector('td.visible-with-data');
        var key = td ? td.id : '';
        if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
            rows[i].parentNode.removeChild(rows[i]);
        }
    }
    return tempDiv.innerHTML;
}

// Add class to popup if media
function addClassToPopupIfMedia(content, popup) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var imgTd = tempDiv.querySelector('td img');
    if (imgTd) {
        var src = imgTd.getAttribute('src');
        if (/\.(jpg|jpeg|png|gif|bmp|webp|avif)$/i.test(src)) {
            popup._contentNode.classList.add('media');
            setTimeout(function () {
                popup.update();
            }, 10);
        } else if (/\.(mp3|wav|ogg|aac)$/i.test(src)) {
            var audio = document.createElement('audio');
            audio.controls = true;
            audio.src = src;
            imgTd.parentNode.replaceChild(audio, imgTd);
            popup._contentNode.classList.add('media');
            setTimeout(function () {
                popup.setContent(tempDiv.innerHTML);
                popup.update();
            }, 10);
        } else if (/\.(mp4|webm|ogg|mov)$/i.test(src)) {
            var video = document.createElement('video');
            video.controls = true;
            video.src = src;
            video.style.width = "400px";
            video.style.height = "300px";
            video.style.maxHeight = "60vh";
            video.style.maxWidth = "60vw";
            imgTd.parentNode.replaceChild(video, imgTd);
            popup._contentNode.classList.add('media');
            video.addEventListener('loadedmetadata', function () {
                popup.update();
            });
            setTimeout(function () {
                popup.setContent(tempDiv.innerHTML);
                popup.update();
            }, 10);
        }
    }
}

// Region Layer
function initializeRegionLayer() {
    function pop_Region_1(feature, layer) {
        layer.on({
            mouseout: function (e) {
                for (var i in e.target._eventParents) {
                    if (typeof e.target._eventParents[i].resetStyle === 'function') {
                        e.target._eventParents[i].resetStyle(e.target);
                    }
                }
                if (typeof layer.closePopup == 'function') {
                    layer.closePopup();
                } else {
                    layer.eachLayer(function (feature) { feature.closePopup() });
                }
            },
            mouseover: window.highlightFeature,
        });

        var popupContent = '<table style="width:100%">\
                    <tr><td colspan="2"><strong>Code</strong><br />' + (feature.properties['Code'] !== null ? String(feature.properties['Code']).toLocaleString() : '') + '</td></tr>\
                    <tr><td colspan="2"><strong>Région</strong><br />' + (feature.properties['Région'] !== null ? String(feature.properties['Région']).toLocaleString() : '') + '</td></tr>\
                </table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.on('popupopen', function (e) { addClassToPopupIfMedia(content, e.popup); });
        layer.bindPopup(content, { maxHeight: 400 });

        // Ajouter tooltip avec le nom de la région
        var tooltipContent = feature.properties['Région'] !== null ? String(feature.properties['Région']) : 'Région';
        layer.bindTooltip(tooltipContent, { permanent: false, direction: 'center', className: 'leaflet-tooltip-region' });
    }

    function style_Region_1_0(feature) {
        var regionColors = {
            'DAKAR': 'rgba(90,240,21,1.0)',
            'DIOURBEL': 'rgba(233,178,130,1.0)',
            'FATICK': 'rgba(239,67,54,1.0)',
            'KAFFRINE': 'rgba(184,209,120,1.0)',
            'KAOLACK': 'rgba(218,128,194,1.0)',
            'KEDOUGOU': 'rgba(99,144,234,1.0)',
            'KOLDA': 'rgba(131,43,231,1.0)',
            'LOUGA': 'rgba(215,89,131,1.0)',
            'MATAM': 'rgba(217,67,240,1.0)',
            'SAINT-LOUIS': 'rgba(60,215,197,1.0)',
            'SEDHIOU': 'rgba(113,185,214,1.0)',
            'TAMBACOUNDA': 'rgba(64,201,130,1.0)',
            'THIES': 'rgba(222,204,84,1.0)',
            'ZIGUINCHOR': 'rgba(72,219,84,1.0)'
        };

        return {
            pane: 'pane_Region_1',
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            dashArray: '',
            lineCap: 'butt',
            lineJoin: 'miter',
            weight: 1.0,
            fill: true,
            fillOpacity: 1,
            fillColor: regionColors[String(feature.properties['Région'])] || 'rgba(200,200,200,1.0)',
            interactive: true,
        };
    }

    const map = getMap();
    map.createPane('pane_Region_1');
    map.getPane('pane_Region_1').style.zIndex = 401;
    map.getPane('pane_Region_1').style['mix-blend-mode'] = 'normal';

    var layer_Region_1 = new L.geoJson(json_Region_1, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Region_1',
        layerName: 'layer_Region_1',
        pane: 'pane_Region_1',
        onEachFeature: pop_Region_1,
        style: style_Region_1_0,
    });

    window.bounds_group.addLayer(layer_Region_1);
    map.addLayer(layer_Region_1);
    window.layer_Region_1 = layer_Region_1;
}

// Departement Layer
function initializeDepartementLayer() {
    function pop_Departement_2(feature, layer) {
        layer.on({
            mouseout: function (e) {
                for (var i in e.target._eventParents) {
                    if (typeof e.target._eventParents[i].resetStyle === 'function') {
                        e.target._eventParents[i].resetStyle(e.target);
                    }
                }
                if (typeof layer.closePopup == 'function') {
                    layer.closePopup();
                } else {
                    layer.eachLayer(function (feature) { feature.closePopup() });
                }
            },
            mouseover: window.highlightFeature,
        });

        var popupContent = '<table style="width:100%">\
                    <tr><th>cod_reg</th><td>' + (feature.properties['cod_reg'] !== null ? String(feature.properties['cod_reg']).toLocaleString() : '') + '</td></tr>\
                    <tr><th>reg</th><td>' + (feature.properties['reg'] !== null ? String(feature.properties['reg']).toLocaleString() : '') + '</td></tr>\
                    <tr><th>dept</th><td>' + (feature.properties['dept'] !== null ? String(feature.properties['dept']).toLocaleString() : '') + '</td></tr>\
                </table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.on('popupopen', function (e) { addClassToPopupIfMedia(content, e.popup); });
        layer.bindPopup(content, { maxHeight: 400 });

        // Ajouter tooltip avec le nom du département
        var tooltipContent = feature.properties['dept'] !== null ? String(feature.properties['dept']) : 'Département';
        layer.bindTooltip(tooltipContent, { permanent: false, direction: 'center', className: 'leaflet-tooltip-departement' });
    }

    function style_Departement_2_0() {
        return {
            pane: 'pane_Departement_2',
            opacity: 1,
            color: 'rgba(228,26,28,1.0)',
            dashArray: '',
            lineCap: 'square',
            lineJoin: 'bevel',
            weight: 4.0,
            fillOpacity: 0,
            interactive: true,
        };
    }

    const map = getMap();
    if (!map) {
        console.error('initializeDepartementLayer - map is undefined');
        return;
    }
    map.createPane('pane_Departement_2');
    map.getPane('pane_Departement_2').style.zIndex = 402;
    map.getPane('pane_Departement_2').style['mix-blend-mode'] = 'normal';

    var layer_Departement_2 = new L.geoJson(json_Departement_2, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Departement_2',
        layerName: 'layer_Departement_2',
        pane: 'pane_Departement_2',
        onEachFeature: pop_Departement_2,
        style: style_Departement_2_0,
    });

    window.bounds_group.addLayer(layer_Departement_2);
    map.addLayer(layer_Departement_2);
    window.layer_Departement_2 = layer_Departement_2;
}

// Arrondissement Layer
function initializeArrondissementLayer() {
    function pop_Arrondissement_3(feature, layer) {
        layer.on({
            mouseout: function (e) {
                for (var i in e.target._eventParents) {
                    if (typeof e.target._eventParents[i].resetStyle === 'function') {
                        e.target._eventParents[i].resetStyle(e.target);
                    }
                }
                if (typeof layer.closePopup == 'function') {
                    layer.closePopup();
                } else {
                    layer.eachLayer(function (feature) { feature.closePopup() });
                }
            },
            mouseover: window.highlightFeature,
        });

        var popupContent = '<table style="width:100%">\
                    <tr><th>arr</th><td>' + (feature.properties['arr'] !== null ? String(feature.properties['arr']).toLocaleString() : '') + '</td></tr>\
                </table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.on('popupopen', function (e) { addClassToPopupIfMedia(content, e.popup); });
        layer.bindPopup(content, { maxHeight: 400 });

        // Ajouter tooltip avec le nom de l'arrondissement
        var tooltipContent = feature.properties['arr'] !== null ? String(feature.properties['arr']) : 'Arrondissement';
        layer.bindTooltip(tooltipContent, { permanent: false, direction: 'center', className: 'leaflet-tooltip-arrondissement' });
    }

    function style_Arrondissement_3_0() {
        return {
            pane: 'pane_Arrondissement_3',
            opacity: 1,
            color: 'rgba(74,153,175,1.0)',
            dashArray: '',
            lineCap: 'square',
            lineJoin: 'bevel',
            weight: 1.0,
            fillOpacity: 0,
            interactive: true,
        };
    }

    const map = getMap();
    if (!map) {
        console.error('initializeArrondissementLayer - map is undefined');
        return;
    }
    map.createPane('pane_Arrondissement_3');
    map.getPane('pane_Arrondissement_3').style.zIndex = 403;
    map.getPane('pane_Arrondissement_3').style['mix-blend-mode'] = 'normal';

    var layer_Arrondissement_3 = new L.geoJson(json_Arrondissement_3, {
        attribution: '',
        interactive: true,
        dataVar: 'json_Arrondissement_3',
        layerName: 'layer_Arrondissement_3',
        pane: 'pane_Arrondissement_3',
        onEachFeature: pop_Arrondissement_3,
        style: style_Arrondissement_3_0,
    });

    window.bounds_group.addLayer(layer_Arrondissement_3);
    map.addLayer(layer_Arrondissement_3);
    window.layer_Arrondissement_3 = layer_Arrondissement_3;
}

// Routes Layer
function initializeRoutesLayer() {
    function pop_Routes_4(feature, layer) {
        layer.on({
            mouseout: function (e) {
                for (var i in e.target._eventParents) {
                    if (typeof e.target._eventParents[i].resetStyle === 'function') {
                        e.target._eventParents[i].resetStyle(e.target);
                    }
                }
                if (typeof layer.closePopup == 'function') {
                    layer.closePopup();
                } else {
                    layer.eachLayer(function (feature) { feature.closePopup() });
                }
            },
            mouseover: window.highlightFeature,
        });

        var popupContent = '<table style="width:100%">\
                    <tr><th>FONCTION</th><td>' + (feature.properties['FONCTION'] !== null ? String(feature.properties['FONCTION']).toLocaleString() : '') + '</td></tr>\
                    <tr><th>CODE</th><td>' + (feature.properties['CODE'] !== null ? String(feature.properties['CODE']).toLocaleString() : '') + '</td></tr>\
                </table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.on('popupopen', function (e) { addClassToPopupIfMedia(content, e.popup); });
        layer.bindPopup(content, { maxHeight: 400 });
    }

    function style_Routes_4_0(feature) {
        var styles = {
            'Route principale à 4 voies': {
                color: 'rgba(227,26,28,1.0)',
                weight: 5.0,
                dashArray: ''
            },
            'Route principale à 2 voies': {
                color: 'rgba(54,130,214,1.0)',
                weight: 3.0,
                dashArray: ''
            },
            'Route principale': {
                color: 'rgba(219,30,42,1.0)',
                weight: 1.0,
                dashArray: ''
            },
            'Autres routes': {
                color: 'rgba(165,166,166,1.0)',
                weight: 1.0,
                dashArray: '4.0,2.0,1.0,2.0,1.0,2.0'
            },
            'Piste automobile': {
                color: 'rgba(72,36,42,1.0)',
                weight: 1.0,
                dashArray: '1.0,2.0'
            },
            'Piste secondaire': {
                color: 'rgba(207,208,224,1.0)',
                weight: 1.0,
                dashArray: ''
            },
            'Autres pistes': {
                color: 'rgba(218,223,222,1.0)',
                weight: 1.0,
                dashArray: '4.0,2.0'
            },
            'Chemin de fer': {
                color: 'rgba(0,0,0,1.0)',
                weight: 2.0,
                dashArray: '',
                lineCap: 'round',
                lineJoin: 'round'
            }
        };

        var fonction = String(feature.properties['FONCTION']);
        var style = styles[fonction] || {
            color: 'rgba(136,236,81,1.0)',
            weight: 1.0,
            dashArray: ''
        };

        return {
            pane: 'pane_Routes_4',
            opacity: 1,
            color: style.color,
            dashArray: style.dashArray,
            lineCap: style.lineCap || 'square',
            lineJoin: style.lineJoin || 'bevel',
            weight: style.weight,
            fillOpacity: 0,
            interactive: false,
        };
    }

    const map = getMap();
    if (!map) {
        console.error('initializeRoutesLayer - map is undefined');
        return;
    }
    map.createPane('pane_Routes_4');
    map.getPane('pane_Routes_4').style.zIndex = 404;
    map.getPane('pane_Routes_4').style['mix-blend-mode'] = 'normal';

    var layer_Routes_4 = new L.geoJson(json_Routes_4, {
        attribution: '',
        interactive: false,
        dataVar: 'json_Routes_4',
        layerName: 'layer_Routes_4',
        pane: 'pane_Routes_4',
        onEachFeature: pop_Routes_4,
        style: style_Routes_4_0,
    });

    window.bounds_group.addLayer(layer_Routes_4);
    map.addLayer(layer_Routes_4);
    window.layer_Routes_4 = layer_Routes_4;
}

// Localités Layer
function initializeLocalitesLayer() {
    function pop_localites_5(feature, layer) {
        layer.on({
            mouseout: function (e) {
                for (var i in e.target._eventParents) {
                    if (typeof e.target._eventParents[i].resetStyle === 'function') {
                        e.target._eventParents[i].resetStyle(e.target);
                    }
                }
                if (typeof layer.closePopup == 'function') {
                    layer.closePopup();
                } else {
                    layer.eachLayer(function (feature) { feature.closePopup() });
                }
            },
            mouseover: window.highlightFeature,
        });

        var popupContent = '<table style="width:100%">\
                    <tr><th>NOM</th><td>' + (feature.properties['NOM'] !== null ? String(feature.properties['NOM']).toLocaleString() : '') + '</td></tr>\
                    <tr><th>NUM_VILLAG</th><td>' + (feature.properties['NUM_VILLAG'] !== null ? String(feature.properties['NUM_VILLAG']).toLocaleString() : '') + '</td></tr>\
                </table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.on('popupopen', function (e) { addClassToPopupIfMedia(content, e.popup); });
        layer.bindPopup(content, { maxHeight: 400 });

        // Ajouter tooltip avec le nom de la localité
        var tooltipContent = feature.properties['NOM'] !== null ? String(feature.properties['NOM']) : 'Localité';
        layer.bindTooltip(tooltipContent, { permanent: false, direction: 'center', className: 'leaflet-tooltip-localites' });
    }

    function style_localites_5_0() {
        return {
            pane: 'pane_localites_5',
            radius: 4.0,
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            dashArray: '',
            lineCap: 'butt',
            lineJoin: 'miter',
            weight: 1,
            fill: true,
            fillOpacity: 1,
            fillColor: 'rgba(141,90,153,1.0)',
            interactive: true,
        };
    }

    const map = getMap();
    if (!map) {
        console.error('initializeLocalitesLayer - map is undefined');
        return;
    }
    map.createPane('pane_localites_5');
    map.getPane('pane_localites_5').style.zIndex = 405;
    map.getPane('pane_localites_5').style['mix-blend-mode'] = 'normal';

    var layer_localites_5 = new L.geoJson(json_localites_5, {
        attribution: '',
        interactive: true,
        dataVar: 'json_localites_5',
        layerName: 'layer_localites_5',
        pane: 'pane_localites_5',
        onEachFeature: pop_localites_5,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, style_localites_5_0(feature));
        },
    });

    var cluster_localites_5 = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        spiderfyDistanceMultiplier: 2
    });
    cluster_localites_5.addLayer(layer_localites_5);

    window.bounds_group.addLayer(layer_localites_5);
    cluster_localites_5.addTo(map);

    window.layer_localites_5 = layer_localites_5;
    window.cluster_localites_5 = cluster_localites_5;
}

// Layer control setup
function setupLayerControl() {
    const map = getMap();

    var overlaysTree = [
        {
            label: '<i class="fas fa-circle" style="color: rgba(141,90,153,1)"></i> Localités',
            layer: window.cluster_localites_5
        },
        {
            label: '<i class="fas fa-road" style="color: rgba(227,26,28,1)"></i> Routes',
            layer: window.layer_Routes_4
        },
        {
            label: '<i class="fas fa-border-all" style="color: rgba(74,153,175,1)"></i> Arrondissements',
            layer: window.layer_Arrondissement_3
        },
        {
            label: '<i class="fas fa-border-all" style="color: rgba(228,26,28,1)"></i> Départements',
            layer: window.layer_Departement_2
        },
        {
            label: '<i class="fas fa-border-all" style="color: rgba(90,240,21,1)"></i> Régions',
            layer: window.layer_Region_1
        }
    ];

    // Ajouter les couches au panneau de gauche
    const layersList = document.getElementById('layers-list');
    if (layersList) {
        overlaysTree.forEach((overlay, index) => {
            // Vérifier que overlay.layer existe
            if (!overlay.layer) {
                console.warn('Layer not found:', overlay.label);
                return;
            }

            const label = document.createElement('label');
            label.className = 'layer-item';
            label.innerHTML = `
                <input type="checkbox" data-layer-index="${index}" checked>
                <span>${overlay.label}</span>
            `;
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.gap = '8px';
            label.style.marginBottom = '8px';
            layersList.appendChild(label);

            const checkbox = label.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    map.addLayer(overlay.layer);
                } else {
                    map.removeLayer(overlay.layer);
                }
            });
        });
    }
}

// Set initial bounds
function setBounds() {
    const map = getMap();
    if (!map) {
        console.error('setBounds - map is undefined');
        return;
    }
    if (!window.bounds_group) {
        console.error('setBounds - window.bounds_group is undefined');
        return;
    }
    if (window.bounds_group.getLayers().length) {
        map.fitBounds(window.bounds_group.getBounds());
    }
}

// Store globally
window.setBounds = setBounds;
