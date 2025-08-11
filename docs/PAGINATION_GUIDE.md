# 📄 Guía de Paginación - API Integration

## 🎯 ¿Por Qué Paginación?

La API Integration (`/v2/hotels/availability`) está paginada y retorna máximo **50 hoteles por página**. Para obtener una muestra más completa y representativa de hoteles, el framework ahora escanea automáticamente múltiples páginas.

## 📊 Información de Paginación

### Estructura de Respuesta
```json
{
  "data": {
    "hotels": [...]
  },
  "meta": {
    "total_hotels": 189,      // Total de hoteles disponibles
    "per_page": 50,           // Hoteles por página (máximo)
    "current_page": 1,        // Página actual
    "total_pages": 4,         // Total de páginas disponibles
    "this_page_hotels": 50    // Hoteles en esta página específica
  }
}
```

## ⚙️ Configuración de Paginación

### Variables de Entorno

```bash
# Número máximo de páginas a escanear (por defecto 10)
MAX_PAGES_TO_SCAN=10

# Número de hoteles a testear finalmente (por defecto 5)
MAX_HOTELS_TO_TEST=5
```

### Lógica de Funcionamiento

1. **Escaneo Inteligente**: El framework obtiene `MAX_HOTELS_TO_TEST × 3` hoteles de la API
2. **Múltiples Páginas**: Escanea hasta `MAX_PAGES_TO_SCAN` páginas
3. **Filtrado**: De todos los hoteles obtenidos, filtra los que tienen `availability > 0`
4. **Selección Final**: Toma los primeros `MAX_HOTELS_TO_TEST` hoteles para testear

## 🔄 Ejemplos de Configuración

### Configuración Conservadora (Rápida)
```bash
MAX_PAGES_TO_SCAN=3          # Solo 3 páginas (150 hoteles máx)
MAX_HOTELS_TO_TEST=5         # Testear 5 hoteles
# Tiempo estimado: 1-2 minutos
```

### Configuración Estándar (Balanceada)
```bash
MAX_PAGES_TO_SCAN=10         # 10 páginas (500 hoteles máx)
MAX_HOTELS_TO_TEST=10        # Testear 10 hoteles
# Tiempo estimado: 3-5 minutos
```

### Configuración Exhaustiva (Completa)
```bash
MAX_PAGES_TO_SCAN=20         # 20 páginas (1000 hoteles máx)
MAX_HOTELS_TO_TEST=20        # Testear 20 hoteles
# Tiempo estimado: 8-15 minutos
```

## 📈 Beneficios de la Paginación

### Antes (Solo Página 1)
- ✅ Rápido (1 request)
- ❌ Solo 50 hoteles máximo
- ❌ Sesgado hacia hoteles más cercanos
- ❌ Muestra limitada

### Ahora (Múltiples Páginas)
- ✅ Muestra más representativa
- ✅ Mejor diversidad de hoteles
- ✅ Más opciones para testear
- ✅ Mejor detección de problemas
- ⚠️ Más tiempo de ejecución

## 🎯 Casos de Uso Específicos

### 1. Desarrollo Local - Test Rápido
```bash
MAX_PAGES_TO_SCAN=2
MAX_HOTELS_TO_TEST=3
npm run dev
```
**Resultado**: ~100 hoteles escaneados, 3 testeados

### 2. QA - Test Medio
```bash
MAX_PAGES_TO_SCAN=5
MAX_HOTELS_TO_TEST=8
npm run dev
```
**Resultado**: ~250 hoteles escaneados, 8 testeados

### 3. Producción - Test Completo
```bash
MAX_PAGES_TO_SCAN=15
MAX_HOTELS_TO_TEST=15
npm run compare
```
**Resultado**: ~750 hoteles escaneados, 15 testeados por entorno

### 4. Análisis Exhaustivo - Fin de Semana
```bash
MAX_PAGES_TO_SCAN=25
MAX_HOTELS_TO_TEST=30
npm run compare
```
**Resultado**: ~1250 hoteles escaneados, 30 testeados por entorno

## 🚦 Control de Rate Limiting

### Medidas Implementadas
- **Pausa entre páginas**: 100ms entre cada request
- **Límite de páginas**: Configurable con `MAX_PAGES_TO_SCAN`
- **Logging detallado**: Monitoreo de progreso por página
- **Manejo de errores**: Continúa con páginas parciales si hay fallos

### Ejemplo de Log
```
info: Page processed {
  "currentPage": 3,
  "totalPages": 8,
  "hotelsInPage": 45,
  "totalCollected": 135,
  "maxHotels": 150
}
```

## 📊 Métricas de Paginación

### En los Reportes
Los reportes ahora incluyen información de paginación:

```json
{
  "hotelsAvailability": {
    "success": true,
    "hotelsCount": 247,
    "availableHotelsCount": 89,
    "paginationInfo": {
      "totalPages": 8,
      "totalHotelsAvailable": 387,
      "hotelsCollected": 247
    }
  }
}
```

### Interpretación
- **totalHotelsAvailable**: Total de hoteles en el sistema
- **hotelsCollected**: Hoteles que el framework obtuvo
- **totalPages**: Páginas totales disponibles
- **hotelsCount**: Hoteles finales después de filtros

## ⚡ Optimizaciones

### 1. Parada Inteligente
El framework para de escanear cuando:
- Alcanza `MAX_HOTELS_TO_TEST × 3` hoteles
- Llega a `MAX_PAGES_TO_SCAN` páginas
- Procesa todas las páginas disponibles

### 2. Filtrado Eficiente
- Filtra hoteles con `availability > 0` en tiempo real
- Ordena por distancia (más cercanos primero)
- Selecciona los mejores candidatos para testing

### 3. Logging Optimizado
- Progreso en tiempo real
- Métricas por página
- Información de parada temprana

## 🔧 Troubleshooting

### Error: "Too Many Requests"
```bash
# Reducir páginas y agregar más pausa
MAX_PAGES_TO_SCAN=3
# Editar src/clients/apiIntegrationClient.ts línea 163:
# setTimeout(resolve, 500); // Aumentar de 100ms a 500ms
```

### Error: "Request Timeout"
```bash
# Aumentar timeout
DEFAULT_TIMEOUT=60000
MAX_PAGES_TO_SCAN=5
```

### Muy Lento
```bash
# Configuración más conservadora
MAX_PAGES_TO_SCAN=3
MAX_HOTELS_TO_TEST=5
```

## 📝 Comandos de Ejemplo

```bash
# Test rápido con paginación mínima
MAX_PAGES_TO_SCAN=2 MAX_HOTELS_TO_TEST=3 npm run dev

# Test balanceado
MAX_PAGES_TO_SCAN=8 MAX_HOTELS_TO_TEST=10 npm run dev

# Test exhaustivo (usar con cuidado)
MAX_PAGES_TO_SCAN=20 MAX_HOTELS_TO_TEST=25 npm run compare

# Ver configuración actual
echo "Páginas: $(grep MAX_PAGES_TO_SCAN .env)"
echo "Hoteles: $(grep MAX_HOTELS_TO_TEST .env)"
```

---

**💡 Recomendación**: Empieza con configuración conservadora y aumenta gradualmente según tus necesidades y los tiempos de respuesta de las APIs.