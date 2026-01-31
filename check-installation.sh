#!/bin/bash
# Script de vérification de l'installation - SIG Sénégal

echo "═══════════════════════════════════════════════════════════"
echo "  Vérification de l'Installation - SIG Sénégal"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
total=0
passed=0
failed=0

# Fonction de vérification
check_file() {
    local file=$1
    local description=$2
    total=$((total + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        passed=$((passed + 1))
    else
        echo -e "${RED}✗${NC} $description (NOT FOUND: $file)"
        failed=$((failed + 1))
    fi
}

check_directory() {
    local dir=$1
    local description=$2
    total=$((total + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        passed=$((passed + 1))
    else
        echo -e "${RED}✗${NC} $description (NOT FOUND: $dir)"
        failed=$((failed + 1))
    fi
}

# Début des vérifications
echo "1️⃣  Vérification des fichiers HTML..."
check_file "index.html" "Page principale (index.html)"
echo ""

echo "2️⃣  Vérification des fichiers CSS..."
check_file "css/modern-ui.css" "CSS moderne (modern-ui.css)"
check_file "css/map-extensions.css" "CSS extensions map (map-extensions.css)"
check_file "css/leaflet.css" "CSS Leaflet (leaflet.css)"
check_file "css/qgis2web.css" "CSS QGIS2Web (qgis2web.css)"
check_file "css/fontawesome-all.min.css" "CSS Font Awesome (fontawesome-all.min.css)"
check_file "css/MarkerCluster.css" "CSS MarkerCluster (MarkerCluster.css)"
check_file "css/L.Control.Layers.Tree.css" "CSS Layers Tree (L.Control.Layers.Tree.css)"
echo ""

echo "3️⃣  Vérification des fichiers JavaScript..."
check_file "js/app-modern.js" "App moderne (app-modern.js)"
check_file "js/qgis2web-integration.js" "Intégration QGIS2Web (qgis2web-integration.js)"
check_file "js/config.js" "Configuration (config.js)"
check_file "js/leaflet.js" "Leaflet (leaflet.js)"
check_file "js/leaflet.markercluster.js" "MarkerCluster (leaflet.markercluster.js)"
check_file "js/labels.js" "Labels (labels.js)"
check_file "js/leaflet-measure.js" "Measure (leaflet-measure.js)"
echo ""

echo "4️⃣  Vérification des fichiers de données..."
check_file "data/Region_1.js" "Données régions (Region_1.js)"
check_file "data/Departement_2.js" "Données départements (Departement_2.js)"
check_file "data/Arrondissement_3.js" "Données arrondissements (Arrondissement_3.js)"
check_file "data/Routes_4.js" "Données routes (Routes_4.js)"
check_file "data/localites_5.js" "Données localités (localites_5.js)"
echo ""

echo "5️⃣  Vérification des répertoires..."
check_directory "css" "Répertoire CSS (css/)"
check_directory "js" "Répertoire JavaScript (js/)"
check_directory "data" "Répertoire données (data/)"
check_directory "images" "Répertoire images (images/)"
check_directory "legend" "Répertoire légende (legend/)"
check_directory "markers" "Répertoire marqueurs (markers/)"
check_directory "webfonts" "Répertoire webfonts (webfonts/)"
echo ""

echo "6️⃣  Vérification de la documentation..."
check_file "README.md" "Documentation README"
check_file "INSTALLATION.md" "Guide d'installation"
check_file "CONTRIBUTING.md" "Guide de contribution"
check_file "CHANGELOG.md" "Changelog"
echo ""

echo "7️⃣  Vérification des droits d'accès..."
if [ -r "index.html" ]; then
    echo -e "${GREEN}✓${NC} Fichiers en lecture"
    passed=$((passed + 1))
else
    echo -e "${RED}✗${NC} Permissions insuffisantes"
    failed=$((failed + 1))
fi
total=$((total + 1))
echo ""

echo "8️⃣  Vérification des ressources externes..."
# Vérifier Font Awesome
if grep -q "fontawesome" index.html; then
    echo -e "${GREEN}✓${NC} Font Awesome intégré"
    passed=$((passed + 1))
else
    echo -e "${YELLOW}⚠${NC} Font Awesome peut ne pas être intégré"
fi
total=$((total + 1))

# Vérifier Leaflet
if grep -q "leaflet.js" index.html; then
    echo -e "${GREEN}✓${NC} Leaflet intégré"
    passed=$((passed + 1))
else
    echo -e "${RED}✗${NC} Leaflet n'est pas intégré"
    failed=$((failed + 1))
fi
total=$((total + 1))

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 Résumé:"
echo "═══════════════════════════════════════════════════════════"
echo -e "Total des vérifications: $total"
echo -e "${GREEN}Réusites: $passed${NC}"
echo -e "${RED}Échecs: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ Installation complète et correcte!${NC}"
    echo ""
    echo "💡 Prochaines étapes:"
    echo "  1. Accéder à l'application: http://localhost/sig-senegal/"
    echo "  2. Vérifier que la carte se charge"
    echo "  3. Tester les fonctionnalités"
    echo "  4. Consulter le README pour plus d'informations"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Certains fichiers sont manquants ou mal configurés${NC}"
    echo ""
    echo "⚠️  Actions recommandées:"
    echo "  1. Vérifier que tous les fichiers ont été copiés"
    echo "  2. Vérifier les permissions des fichiers"
    echo "  3. Consulter INSTALLATION.md pour le dépannage"
    echo "  4. Vérifier la console du navigateur (F12)"
    echo ""
    exit 1
fi
