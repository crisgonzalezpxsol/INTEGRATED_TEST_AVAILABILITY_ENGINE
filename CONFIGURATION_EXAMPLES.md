# 🔧 Ejemplos de Configuración - Hotel Availability Testing

## 🎯 Configurar Número de Hoteles a Testear

### Escenarios Comunes

#### 1. Test Rápido (5 hoteles) - Por Defecto
```bash
# Usar configuración por defecto
npm run dev
```

#### 2. Test Completo (15-20 hoteles)
```bash
# Opción A: Cambiar en .env
echo "MAX_HOTELS_TO_TEST=15" >> .env
npm run dev

# Opción B: Variable temporal
MAX_HOTELS_TO_TEST=20 npm run dev
```

#### 3. Test Exhaustivo (Todos los hoteles disponibles)
```bash
# Sin límite (usar con cuidado)
MAX_HOTELS_TO_TEST=999 npm run dev
```

#### 4. Test Mínimo (Solo 2 hoteles para debugging)
```bash
MAX_HOTELS_TO_TEST=2 npm run dev
```

## ⏱️ Estimación de Tiempos

| Hoteles | Tiempo Estimado | Uso Recomendado |
|---------|-----------------|-----------------|
| 2-3     | 30-60 segundos  | Debugging rápido |
| 5       | 1-2 minutos     | Test estándar |
| 10      | 2-4 minutos     | Test completo |
| 15-20   | 4-8 minutos     | Test exhaustivo |
| 25+     | 8+ minutos      | Test nocturno/CI |

## 🎛️ Configuraciones Predefinidas

### Para Desarrollo Local
```bash
# .env para desarrollo
MAX_HOTELS_TO_TEST=5
MAX_PAGES_TO_SCAN=3
DEFAULT_TIMEOUT=30000
MAX_RETRIES=3
LOG_LEVEL=info
```

### Para CI/CD
```bash
# .env para integración continua
MAX_HOTELS_TO_TEST=10
MAX_PAGES_TO_SCAN=8
DEFAULT_TIMEOUT=45000
MAX_RETRIES=5
LOG_LEVEL=warn
```

### Para Monitoreo Producción
```bash
# .env para monitoreo
MAX_HOTELS_TO_TEST=15
MAX_PAGES_TO_SCAN=12
DEFAULT_TIMEOUT=60000
MAX_RETRIES=3
LOG_LEVEL=error
```

## 🚀 Comandos Útiles

### Test con Diferentes Configuraciones
```bash
# Test rápido
MAX_HOTELS_TO_TEST=3 npm run dev

# Test medio
MAX_HOTELS_TO_TEST=8 npm run dev  

# Test completo
MAX_HOTELS_TO_TEST=15 npm run dev

# Test comparativo con más hoteles
MAX_HOTELS_TO_TEST=10 npm run compare
```

### Configuración Temporal vs Permanente

**Temporal (solo para esta ejecución):**
```bash
MAX_HOTELS_TO_TEST=12 npm run dev
```

**Permanente (editar .env):**
```bash
# Editar archivo
nano .env

# Cambiar línea:
MAX_HOTELS_TO_TEST=12

# Ejecutar normalmente
npm run dev
```

## 📊 Consideraciones de Performance

### Factores que Afectan el Tiempo

1. **Número de Hoteles**: Cada hotel = 1 request adicional a query/list6
2. **Latencia de Red**: Desarrollo vs Producción
3. **Carga del Servidor**: Horarios pico vs valle
4. **Complejidad de Respuesta**: Hoteles con muchas habitaciones

### Recomendaciones por Caso de Uso

#### 🔧 Desarrollo y Debugging
- **Hoteles**: 2-5
- **Timeout**: 30s
- **Log Level**: debug

#### 🧪 Testing y QA  
- **Hoteles**: 8-12
- **Timeout**: 45s
- **Log Level**: info

#### 📊 Monitoreo Producción
- **Hoteles**: 10-15
- **Timeout**: 60s
- **Log Level**: warn

#### 🔍 Análisis Profundo
- **Hoteles**: 20+
- **Timeout**: 90s
- **Log Level**: info

## 🎯 Configuración Inteligente

### Configuración Basada en Hora del Día
```bash
# Script para ajustar según la hora
HOUR=$(date +%H)
if [ $HOUR -ge 9 ] && [ $HOUR -le 18 ]; then
    # Horario comercial: test más ligero
    export MAX_HOTELS_TO_TEST=5
else
    # Fuera de horario: test completo
    export MAX_HOTELS_TO_TEST=15
fi

npm run dev
```

### Configuración Basada en Día de la Semana
```bash
# Lunes a Viernes: test rápido
# Fines de semana: test completo
DAY=$(date +%u)
if [ $DAY -le 5 ]; then
    export MAX_HOTELS_TO_TEST=5
else
    export MAX_HOTELS_TO_TEST=20
fi

npm run dev
```

## 🔄 Automatización

### Cron Job para Tests Regulares
```bash
# Test diario a las 6 AM con 10 hoteles
0 6 * * * cd /path/to/project && MAX_HOTELS_TO_TEST=10 npm run compare >> logs/daily.log 2>&1

# Test cada 4 horas con 5 hoteles
0 */4 * * * cd /path/to/project && MAX_HOTELS_TO_TEST=5 npm run dev >> logs/hourly.log 2>&1
```

### Script de Test Escalonado
```bash
#!/bin/bash
# test_escalado.sh

echo "🚀 Iniciando test escalonado..."

echo "📊 Test rápido (3 hoteles)..."
MAX_HOTELS_TO_TEST=3 npm run dev

echo "📊 Test medio (8 hoteles)..."
MAX_HOTELS_TO_TEST=8 npm run dev

echo "📊 Test completo (15 hoteles)..."
MAX_HOTELS_TO_TEST=15 npm run dev

echo "✅ Test escalonado completado"
```

---

**💡 Consejo**: Empieza siempre con pocos hoteles (3-5) para verificar que todo funciona, luego aumenta gradualmente según tus necesidades.