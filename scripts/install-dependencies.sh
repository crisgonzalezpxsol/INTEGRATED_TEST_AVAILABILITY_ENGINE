#!/bin/bash

# Script para instalar dependencias del proyecto
echo "🔧 Instalando dependencias del proyecto..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "📦 Instalando dependencias con npm..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
    
    echo "🏗️  Compilando TypeScript..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Compilación exitosa"
        
        echo "🧪 Ejecutando tests..."
        npm test
        
        if [ $? -eq 0 ]; then
            echo "✅ Tests ejecutados correctamente"
            echo ""
            echo "🎉 ¡Instalación completa!"
            echo ""
            echo "Para ejecutar el framework:"
            echo "  npm run dev          # Test en desarrollo"
            echo "  npm run start prod   # Test en producción"
            echo "  npm run start compare # Comparar entornos"
        else
            echo "⚠️  Tests fallaron, pero la instalación está completa"
        fi
    else
        echo "❌ Error en la compilación"
        exit 1
    fi
else
    echo "❌ Error instalando dependencias"
    exit 1
fi