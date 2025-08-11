# 🚀 Guía de Configuración Rápida - Hotel Availability Testing

## ⚡ Instalación en 3 Pasos

### 1. Preparación del Entorno
```bash
# Verificar Node.js (requiere v18+)
node --version

# Si no tienes Node.js, instálalo desde: https://nodejs.org/

# Clonar o descargar el proyecto
cd hotel-availability-testing
```

### 2. Instalación Automática
```bash
# Opción A: Instalación completa automática
npm run setup

# Opción B: Instalación manual
npm install
npm run build
npm test
```

### 3. Configuración
```bash
# Copiar configuración de ejemplo
cp .env-example .env

# El archivo .env ya incluye el token de autorización necesario
# Si el token cambia, editar la variable AUTHORIZATION_API_INTEGRATION
# nano .env
```

## 🎯 Primer Test

### Test Rápido en Desarrollo
```bash
npm run dev
```

### Test en Producción
```bash
npm run prod
```

### Test Comparativo
```bash
npm run compare
```

## 📋 Verificación de Instalación

### ✅ Checklist
- [ ] Node.js v18+ instalado
- [ ] Dependencias instaladas sin errores
- [ ] Compilación TypeScript exitosa
- [ ] Tests unitarios pasan
- [ ] Archivo .env configurado
- [ ] Scripts ejecutables tienen permisos

### 🔍 Troubleshooting

#### Error: "node: command not found"
```bash
# Instalar Node.js desde https://nodejs.org/
# O usar nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

#### Error: "Permission denied"
```bash
chmod +x scripts/*.sh
```

#### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Error de TypeScript
```bash
npm run build
# Revisar errores en src/
```

## 🏁 Primeros Resultados

Después del primer test verás:

### En Consola
```
Test Summary - DEVELOPMENT
=====================================
Search Insert: ✅ (1200ms)
Hotels Availability: ✅ (3500ms)
Hotels Analysis:
- Total hotels returned: 25
- Hotels with supposed availability: 15
- Hotels tested in list6: 15
- Hotels with real availability: 12
- Accuracy: 80%
```

### Archivos Generados
```
reports/
├── test-result-development-2024-01-01T00-00-00-000Z.json
└── test-summary-development-2024-01-01T00-00-00-000Z.txt

logs/
├── test-results.log
└── error.log
```

## 📊 Interpretación de Resultados

### Métricas Clave
- **Accuracy**: % de hoteles con disponibilidad real vs supuesta
- **Duration**: Tiempo total del test
- **Discrepancies**: Hoteles con disponibilidad supuesta pero sin disponibilidad real

### Rangos Esperados
- **Excelente**: >95% accuracy
- **Bueno**: 85-95% accuracy  
- **Regular**: 70-85% accuracy
- **Problemático**: <70% accuracy

## 🔧 Personalización Rápida

### Cambiar Ubicación de Búsqueda
Editar `src/index.ts`:
```typescript
const DEFAULT_SEARCH_CONFIG = {
  latitude: 40.7128,      // Nueva York
  longitude: -74.0060,
  location_search: 'New York, NY, USA',
  // ... resto igual
};
```

### Limitar Hoteles a Testear
```typescript
const config = {
  // ...
  maxHotelsToTest: 3,  // Solo testear 3 hoteles
};
```

### Cambiar Fechas
```typescript
import { generateTestDates } from './src/utils/dateHelper';

const searchParams = {
  // ...
  ...generateTestDates(60, 3) // 60 días desde hoy, 3 noches
};
```

## 🎯 Casos de Uso Comunes

### 1. Test de Regresión Diario
```bash
# Crear cron job
0 9 * * * cd /path/to/project && npm run compare >> logs/daily.log 2>&1
```

### 2. Test de Performance
```bash
# Múltiples tests seguidos
for i in {1..5}; do npm run dev; sleep 30; done
```

### 3. Test de Diferentes Ubicaciones
```bash
# Modificar DEFAULT_SEARCH_CONFIG para cada ubicación
# Madrid, Buenos Aires, Nueva York, etc.
```

## 📞 Soporte

### Logs de Debug
```bash
LOG_LEVEL=debug npm run dev
```

### Reportar Issues
1. Incluir logs de error
2. Configuración utilizada
3. Pasos para reproducir
4. Entorno (OS, Node.js version)

### Contacto
- **Equipo**: PXSOL Development Team
- **Logs**: `logs/error.log`
- **Config**: `.env`

---

**¡Listo para testear! 🚀**

Ejecuta `npm run dev` para tu primer test.