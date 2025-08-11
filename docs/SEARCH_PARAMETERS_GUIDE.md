# 🔍 Guía de Parámetros de Búsqueda Dinámicos

## 🎯 Parámetros Configurables

Todos los parámetros de búsqueda ahora son configurables desde variables de entorno, permitiendo cambiar fácilmente la ubicación y fechas sin tocar código.

### Variables de Entorno Disponibles

```bash
# Coordenadas geográficas
SEARCH_LATITUDE=-34.6036739          # Latitud (entre -90 y 90)
SEARCH_LONGITUDE=-58.3821215         # Longitud (entre -180 y 180)

# Radio de búsqueda
SEARCH_DISTANCE_RADIUS=50000         # Radio en metros

# Información de ubicación
SEARCH_LOCATION_NAME="Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina"

# Fechas de búsqueda (días desde hoy)
SEARCH_START_DATE=30                 # Check-in en 30 días
SEARCH_END_DATE=32                   # Check-out en 32 días (2 noches)
```

## 🌍 Ubicaciones Predefinidas

### Script de Cambio Rápido

```bash
# Ver ubicaciones disponibles
./scripts/set-location.sh

# Cambiar a Mendoza
./scripts/set-location.sh mendoza

# Cambiar a Bariloche
./scripts/set-location.sh bariloche
```

### Ubicaciones Incluidas (Argentina)

| Comando | Ciudad | Provincia/Región | Radio |
|---------|--------|------------------|-------|
| `buenosAires` | Buenos Aires | Ciudad Autónoma | 50km |
| `mendoza` | Mendoza | Mendoza | 30km |
| `cordoba` | Córdoba | Córdoba | 50km |
| `iguazu` | Puerto Iguazú | Misiones | 30km |
| `salta` | Salta | Salta | 30km |
| `bariloche` | Bariloche | Río Negro | 50km |
| `sanLuis` | San Luis | San Luis | 50km |
| `marDelPlata` | Mar del Plata | Buenos Aires | 30km |
| `carilo` | Cariló | Buenos Aires | 30km |

## 📅 Configuración de Fechas

### Formato de Fechas

Las fechas se configuran como **días desde hoy**:

```bash
SEARCH_START_DATE=30    # Check-in en 30 días
SEARCH_END_DATE=32      # Check-out en 32 días (2 noches de estadía)
```

### Ejemplos de Configuración de Fechas

```bash
# Test para la próxima semana (7 días, 1 noche)
SEARCH_START_DATE=7
SEARCH_END_DATE=8

# Test para el próximo mes (30 días, 3 noches)
SEARCH_START_DATE=30
SEARCH_END_DATE=33

# Test para dentro de 2 meses (60 días, 1 semana)
SEARCH_START_DATE=60
SEARCH_END_DATE=67
```

### ¿Por Qué Días Relativos?

- **Flexibilidad**: Las fechas siempre están en el futuro
- **Automatización**: Perfecto para tests programados
- **Consistencia**: Misma duración de estadía en todos los tests

## 🔧 Métodos de Configuración

### 1. Edición Directa del .env

```bash
# Editar archivo
nano .env

# Cambiar valores
SEARCH_LATITUDE=40.7128
SEARCH_LONGITUDE=-74.0060
SEARCH_LOCATION_NAME="New York, NY, USA"
```

### 2. Script de Ubicaciones Predefinidas

```bash
# Cambio rápido
./scripts/set-location.sh madrid

# Resultado:
# ✅ Configuración actualizada en .env:
#    Latitud: 40.4168
#    Longitud: -3.7038
#    Radio: 25000 metros
#    Ubicación: Madrid, España
```

### 3. Variables de Entorno Temporales

```bash
# Solo para esta ejecución
SEARCH_LATITUDE=51.5074 SEARCH_LONGITUDE=-0.1278 npm run dev

# Múltiples parámetros
SEARCH_LATITUDE=48.8566 \
SEARCH_LONGITUDE=2.3522 \
SEARCH_LOCATION_NAME="Paris, France" \
npm run compare
```

## 🎯 Casos de Uso Específicos

### Test de Diferentes Destinos Argentinos

```bash
# Ciudades principales
./scripts/set-location.sh cordoba
npm run dev

./scripts/set-location.sh mendoza  
npm run dev

./scripts/set-location.sh salta
npm run dev

# Destinos turísticos
./scripts/set-location.sh bariloche
npm run dev

./scripts/set-location.sh iguazu
npm run dev

# Generar reporte comparativo
npm run compare
```

### Test de Temporadas

```bash
# Temporada alta (próximas vacaciones)
SEARCH_START_DATE=15 SEARCH_END_DATE=22 npm run dev

# Temporada baja (en 3 meses)
SEARCH_START_DATE=90 SEARCH_END_DATE=97 npm run dev
```

### Test de Diferentes Duraciones

```bash
# Estadía corta (1 noche)
SEARCH_START_DATE=30 SEARCH_END_DATE=31 npm run dev

# Estadía media (1 semana)  
SEARCH_START_DATE=30 SEARCH_END_DATE=37 npm run dev

# Estadía larga (2 semanas)
SEARCH_START_DATE=30 SEARCH_END_DATE=44 npm run dev
```

## 🔍 Validaciones Implementadas

### Coordenadas
- **Latitud**: Entre -90 y 90 grados
- **Longitud**: Entre -180 y 180 grados
- **Error**: Mensaje claro si están fuera de rango

### Radio de Búsqueda
- **Mínimo**: Mayor que 0
- **Recomendado**: Entre 5,000 y 100,000 metros
- **Error**: Si es negativo o cero

### Fechas
- **Validación**: Automática al generar fechas futuras
- **Formato**: Se convierte automáticamente a DD/MM/YYYY

## 📊 Impacto en los Resultados

### Factores que Afectan los Resultados

1. **Ubicación Geográfica**
   - Ciudades grandes: Más hoteles, más variedad
   - Ciudades pequeñas: Menos hoteles, mayor precisión

2. **Radio de Búsqueda**
   - Radio pequeño (5-15km): Hoteles céntricos
   - Radio grande (25-50km): Incluye periferia

3. **Fechas de Búsqueda**
   - Fechas cercanas: Menos disponibilidad
   - Fechas lejanas: Más disponibilidad

4. **Duración de Estadía**
   - 1-2 noches: Más disponibilidad
   - 1+ semanas: Menos disponibilidad

## 🚨 Troubleshooting

### Error: "Invalid SEARCH_LATITUDE"
```bash
# Verificar rango
echo $SEARCH_LATITUDE  # Debe estar entre -90 y 90

# Corregir
SEARCH_LATITUDE=-34.6036739  # Buenos Aires válido
```

### Error: "No hotels found"
```bash
# Aumentar radio de búsqueda
SEARCH_DISTANCE_RADIUS=75000

# O cambiar ubicación
./scripts/set-location.sh madrid
```

### Muy Pocos Hoteles
```bash
# Aumentar radio
SEARCH_DISTANCE_RADIUS=50000

# O elegir ciudad más grande
./scripts/set-location.sh newYork
```

### Fechas Muy Cercanas
```bash
# Mover fechas más al futuro
SEARCH_START_DATE=45  # En vez de 7
SEARCH_END_DATE=47
```

## 📝 Comandos de Ejemplo

```bash
# Ver configuración actual
grep SEARCH_ .env

# Test rápido con ubicación temporal
SEARCH_LATITUDE=35.6762 SEARCH_LONGITUDE=139.6503 npm run dev

# Cambio permanente a Sídney
./scripts/set-location.sh sydney
npm run compare

# Test con fechas específicas
SEARCH_START_DATE=60 SEARCH_END_DATE=63 npm run dev

# Backup y restaurar configuración
cp .env .env.backup
./scripts/set-location.sh tokyo
npm run dev
cp .env.backup .env  # Restaurar
```

## 🎨 Personalización Avanzada

### Crear Nueva Ubicación Predefinida

Editar `src/config/searchParams.ts`:

```typescript
export const PREDEFINED_LOCATIONS = {
  // ... ubicaciones existentes
  miamI: {
    latitude: 25.7617,
    longitude: -80.1918,
    distance_radius: 35000,
    location_search: "Miami, FL, USA"
  }
};
```

### Configuración Dinámica por Hora

```bash
# Script para cambiar ubicación según la hora
HOUR=$(date +%H)
if [ $HOUR -ge 9 ] && [ $HOUR -le 17 ]; then
    # Horario comercial: Europa
    ./scripts/set-location.sh madrid
else
    # Fuera de horario: Asia
    ./scripts/set-location.sh tokyo
fi

npm run dev
```

---

**💡 Consejo**: Empieza con las ubicaciones predefinidas y luego personaliza según tus necesidades específicas de testing.