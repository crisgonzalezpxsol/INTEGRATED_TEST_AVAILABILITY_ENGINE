#!/bin/bash

# Script para cambiar rápidamente la ubicación de búsqueda

if [ $# -eq 0 ]; then
    echo "🇦🇷 Ubicaciones Predefinidas Disponibles:"
    echo ""
    echo "  buenosAires  - Buenos Aires, Argentina"
    echo "  mendoza      - Mendoza, Capital, Mendoza, Argentina"
    echo "  cordoba      - Córdoba, Argentina"
    echo "  iguazu       - Puerto Iguazú, Misiones, Argentina"
    echo "  salta        - Salta, Argentina"
    echo "  bariloche    - Bariloche, Río Negro, Argentina"
    echo "  sanLuis      - San Luis, Argentina"
    echo "  marDelPlata  - Mar del Plata, Provincia de Buenos Aires, Argentina"
    echo "  carilo       - Cariló, Provincia de Buenos Aires, Argentina"
    echo ""
    echo "Uso: ./scripts/set-location.sh [ubicacion]"
    echo "Ejemplo: ./scripts/set-location.sh mendoza"
    exit 1
fi

LOCATION=$1

case $LOCATION in
    "buenosAires")
        LATITUDE="-34.6036739"
        LONGITUDE="-58.3821215"
        RADIUS="50000"
        NAME="Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina"
        ;;
    "mendoza")
        LATITUDE="-32.8894587"
        LONGITUDE="-68.8458386"
        RADIUS="30000"
        NAME="Mendoza, Capital, Mendoza, Argentina"
        ;;
    "cordoba")
        LATITUDE="-31.420083299999995"
        LONGITUDE="-64.1887761"
        RADIUS="50000"
        NAME="Córdoba, Argentina"
        ;;
    "iguazu")
        LATITUDE="-25.5965209"
        LONGITUDE="-54.575030899999994"
        RADIUS="30000"
        NAME="Puerto Iguazú, Misiones, Argentina"
        ;;
    "salta")
        LATITUDE="-24.782126899999998"
        LONGITUDE="-65.4231976"
        RADIUS="30000"
        NAME="Salta, Argentina"
        ;;
    "bariloche")
        LATITUDE="-41.1334722"
        LONGITUDE="-71.3102778"
        RADIUS="50000"
        NAME="Bariloche, Río Negro, Argentina"
        ;;
    "sanLuis")
        LATITUDE="-33.301726699999996"
        LONGITUDE="-66.3377522"
        RADIUS="50000"
        NAME="San Luis, Argentina"
        ;;
    "marDelPlata")
        LATITUDE="-38.0054771"
        LONGITUDE="-57.542610599999996"
        RADIUS="30000"
        NAME="Mar del Plata, Provincia de Buenos Aires, Argentina"
        ;;
    "carilo")
        LATITUDE="-37.164258"
        LONGITUDE="-56.9030558"
        RADIUS="30000"
        NAME="Cariló, Provincia de Buenos Aires, Argentina"
        ;;
    *)
        echo "❌ Ubicación desconocida: $LOCATION"
        echo "Ejecuta sin parámetros para ver las ubicaciones disponibles"
        exit 1
        ;;
esac

echo "🌍 Configurando ubicación: $NAME"
echo ""

# Actualizar .env
if [ -f .env ]; then
    # Crear backup
    cp .env .env.backup
    
    # Actualizar valores
    sed -i.tmp "s/SEARCH_LATITUDE=.*/SEARCH_LATITUDE=$LATITUDE/" .env
    sed -i.tmp "s/SEARCH_LONGITUDE=.*/SEARCH_LONGITUDE=$LONGITUDE/" .env
    sed -i.tmp "s/SEARCH_DISTANCE_RADIUS=.*/SEARCH_DISTANCE_RADIUS=$RADIUS/" .env
    sed -i.tmp "s/SEARCH_LOCATION_NAME=.*/SEARCH_LOCATION_NAME=\"$NAME\"/" .env
    
    # Limpiar archivos temporales
    rm -f .env.tmp
    
    echo "✅ Configuración actualizada en .env:"
    echo "   Latitud: $LATITUDE"
    echo "   Longitud: $LONGITUDE" 
    echo "   Radio: $RADIUS metros"
    echo "   Ubicación: $NAME"
    echo ""
    echo "🚀 Ahora puedes ejecutar:"
    echo "   npm run dev"
    echo "   npm run compare"
else
    echo "❌ Archivo .env no encontrado"
    echo "Ejecuta: cp env.example .env"
    exit 1
fi