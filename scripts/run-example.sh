#!/bin/bash

# Script de ejemplo para ejecutar tests
echo "🏨 Hotel Availability Flow Testing - Ejemplo"
echo "============================================"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  Por favor configura las variables en .env antes de continuar"
fi

echo ""
echo "🔄 Ejecutando test de ejemplo en desarrollo..."
echo ""

# Ejecutar test en desarrollo
npm run start dev

echo ""
echo "✅ Test completado. Revisa los archivos en ./reports/ y ./logs/"
echo ""
echo "Para ejecutar más tests:"
echo "  npm run start prod     # Test en producción"
echo "  npm run start compare  # Comparar entornos"