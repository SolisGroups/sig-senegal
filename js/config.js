/* ===== CONFIGURATION DE L'APPLICATION SIG SÉNÉGAL ===== */

// Configuration générale de l'application
const SIG_CONFIG = {
    // Paramètres de la carte
    map: {
        initialCenter: [14.7167, -14.6667],  // Coordonnées du Sénégal
        initialZoom: 7,
        minZoom: 1,
        maxZoom: 20,
        preferCanvas: true
    },

    // Styles par défaut
    styles: {
        primary: '#1e3c72',
        secondary: '#2a5298',
        accent: '#00d4ff',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f5f5f5',
        dark: '#333'
    },

    // Configuration des couches
    layers: {
        region: {
            name: 'Régions',
            pane: 'pane_Region_1',
            zIndex: 401,
            interactive: true
        },
        departement: {
            name: 'Départements',
            pane: 'pane_Departement_2',
            zIndex: 402,
            interactive: true
        },
        arrondissement: {
            name: 'Arrondissements',
            pane: 'pane_Arrondissement_3',
            zIndex: 403,
            interactive: true
        },
        routes: {
            name: 'Routes',
            pane: 'pane_Routes_4',
            zIndex: 404,
            interactive: false
        },
        localites: {
            name: 'Localités',
            pane: 'pane_localites_5',
            zIndex: 405,
            interactive: true
        }
    },

    // Configuration des fonds de carte
    basemaps: {
        osm: {
            name: 'OpenStreetMap',
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; OpenStreetMap contributors'
        },
        satellite: {
            name: 'Satellite',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri'
        },
        terrain: {
            name: 'Terrain',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri'
        }
    },

    // Configuration de la recherche
    search: {
        enabled: true,
        minChars: 2,
        maxResults: 10,
        debounceMs: 300
    },

    // Configuration des exports
    export: {
        csv: {
            enabled: true,
            delimiter: ','
        },
        geojson: {
            enabled: true,
            indent: 2
        },
        shapefile: {
            enabled: false
        }
    },

    // Configuration des outils
    tools: {
        measure: {
            enabled: true,
            primaryUnit: 'meters',
            secondaryUnit: 'kilometers'
        },
        locate: {
            enabled: true,
            maxZoom: 19
        },
        zoom: {
            enabled: true
        },
        fullscreen: {
            enabled: true
        },
        print: {
            enabled: true
        }
    },

    // Configuration de l'interface utilisateur
    ui: {
        // Panneaux
        panels: {
            left: {
                defaultVisible: true,
                width: 300,
                collapsible: true
            },
            right: {
                defaultVisible: true,
                width: 280,
                collapsible: true
            }
        },

        // Info bar
        infoBar: {
            visible: true,
            showCoordinates: true,
            showScale: true,
            showZoom: true
        },

        // Minimap
        minimap: {
            enabled: true,
            position: 'bottom-right',
            width: 150,
            height: 150,
            zoom: -3
        },

        // Notifications
        notifications: {
            enabled: true,
            duration: 3000,
            position: 'bottom-right'
        },

        // Tooltips
        tooltips: {
            enabled: true,
            delay: 300
        }
    },

    // Configuration des modales
    modals: {
        home: {
            enabled: true,
            title: 'Accueil'
        },
        about: {
            enabled: true,
            title: 'À propos'
        },
        catalog: {
            enabled: true,
            title: 'Catalogue des données'
        }
    },

    // Configuration du stockage local
    storage: {
        enabled: true,
        prefix: 'sig_senegal_'
    },

    // Configuration des événements
    events: {
        enableLogging: false,
        trackPageViews: false
    }
};

// Couleurs régionales
const REGION_COLORS = {
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

// Types de routes et leurs styles
const ROUTE_STYLES = {
    'Route principale à 4 voies': {
        color: 'rgba(227,26,28,1.0)',
        weight: 5.0,
        dashArray: '',
        lineCap: 'round',
        lineJoin: 'round'
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

// Messages multilingues
const i18n = {
    fr: {
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Avertissement',
        info: 'Information',
        close: 'Fermer',
        yes: 'Oui',
        no: 'Non',
        confirm: 'Confirmer',
        cancel: 'Annuler',
        save: 'Enregistrer',
        delete: 'Supprimer',
        search: 'Rechercher...',
        noResults: 'Aucun résultat trouvé',
        layers: 'Couches',
        basemaps: 'Fonds de carte',
        legend: 'Légende',
        tools: 'Outils',
        home: 'Accueil',
        about: 'À propos',
        catalog: 'Catalogue',
        zoomIn: 'Zoom avant',
        zoomOut: 'Zoom arrière',
        initialView: 'Vue initiale',
        fullscreen: 'Plein écran',
        print: 'Imprimer',
        measure: 'Mesurer',
        locate: 'Ma position',
        download: 'Télécharger',
        export: 'Exporter',
        csv: 'CSV',
        geojson: 'GeoJSON',
        spatialQuery: 'Requête spatiale',
        attributeQuery: 'Requête attributaire'
    },
    en: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        close: 'Close',
        yes: 'Yes',
        no: 'No',
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        search: 'Search...',
        noResults: 'No results found',
        layers: 'Layers',
        basemaps: 'Basemaps',
        legend: 'Legend',
        tools: 'Tools',
        home: 'Home',
        about: 'About',
        catalog: 'Catalog',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        initialView: 'Initial view',
        fullscreen: 'Fullscreen',
        print: 'Print',
        measure: 'Measure',
        locate: 'My location',
        download: 'Download',
        export: 'Export',
        csv: 'CSV',
        geojson: 'GeoJSON',
        spatialQuery: 'Spatial query',
        attributeQuery: 'Attribute query'
    }
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SIG_CONFIG, REGION_COLORS, ROUTE_STYLES, i18n };
}
