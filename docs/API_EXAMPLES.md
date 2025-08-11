# 🔗 Ejemplos de APIs - Hotel Availability Testing

## 1. Search Insert (API1)

### Request
```bash
curl --location 'https://api-1-eb-web.pxsol.io/search/insert' \
--header 'accept: application/json, text/javascript, */*; q=0.01' \
--header 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
--data 'location_google_search=Buenos+Aires%2C+Argentina&latitude=-34.6036739&longitude=-58.3821215&distance_radius=50000&location_search=Buenos+Aires&SearchType=lat_lng&Start=24%2F09%2F2025&End=26%2F09%2F2025&PartyType=double&MaxRooms=2&Nights=1&Channel=2&RateType=auto&Pos=ROOMFARES&Lng=en&Currency=USD&MaxAgeChildrenNumber=17&MaxAgeBabiesNumber=2&ReturnUrl=NoReturn&Tag=PmsLink&Source=Contact+Form&ProductTimezone=America%2FArgentina%2FBuenos_Aires&Type=&Device=Computer&tag=PmsLink&UserType=&AgreementType=&GroupsForm=1%3A2%2C0%2C0&SkuID=&MinNights=0'
```

### Response
```json
{
  "Time": "2025-08-10 12:56:02",
  "SearchID": 46322997,
  "Response": 1,
  "Pos": "ROOMFARES",
  "Currency": "USD",
  "IP": "142.111.29.179",
  "Lng": "en",
  "ProductID": 0,
  "ListID": 0,
  "Location": "",
  "Tag": "PmsLink",
  "SearchType": "lat_lng",
  "latitude": "-34.6036739",
  "longitude": "-58.3821215",
  "distance_radius": "50000",
  "searchId": 46322997,
  "returnUrl": "https://www.roomfares.com/list.html?search=OK&pos=ROOMFARES&SearchID=46322997...",
  "metadata": {
    "id": 11741664,
    "px_user_id": "NN"
  }
}
```

### Campos Clave
- **SearchID**: Identificador único para usar en siguientes consultas
- **Response**: 1 = Éxito, 0 = Error
- **latitude/longitude**: Coordenadas de búsqueda
- **distance_radius**: Radio de búsqueda en metros

## 2. Hotels Availability (API Integration)

### Request
```bash
curl --location 'https://gateway-prod.pxsol.com/v2/hotels/availability?search_definition_id=46322969&currency=USD&lat=-34.6036739&lng=-58.3821215&distance_radius=50000&search_type=lat_lng&pos=ROOMFARES&order_by=distance&current_page=1' \
--header 'accept: application/json' \
--header 'authorization: Bearer 114|LuhhnXez3aq5tl9CGzdBH0NoNLA4HkMg9777vD5Nc5926620'
```

**Nota**: El framework toma automáticamente el token de la variable de entorno `AUTHORIZATION_API_INTEGRATION`.

### Response (Estructura)
```json
{
  "data": {
    "hotels": [
      {
        "position": 1,
        "provider": "Hyperguest",
        "hotel_id": 12724,
        "name": "Broadway Hotel & Suites",
        "type": "Hotel",
        "sub_type": "ApartHotel",
        "stars": 4,
        "availability": 2,
        "address": "Av. Corrientes, 1173, 1043 Buenos Aires, Argentina",
        "longitude": -58.38329,
        "latitude": -34.60369,
        "distance_from_search_coordinate": 106.96,
        "country": "Argentina",
        "state": "CABA",
        "plaza": "Buenos Aires City"
      }
    ]
  }
}
```

### Campos Clave
- **hotel_id**: ID único del hotel para usar en Query List6
- **availability**: Número de habitaciones con disponibilidad supuesta
- **distance_from_search_coordinate**: Distancia en metros del punto de búsqueda

### Filtros Aplicados en el Framework
```typescript
// Hoteles con disponibilidad supuesta
const availableHotels = hotels.filter(hotel => hotel.availability > 0);
```

## 3. Query List6 (API1)

### Request
```bash
curl --location 'https://api-1-eb-web.pxsol.io/query/list6?search=OK&pos=ROOMFARES&lng=en&SearchID=45216646&ProductID=12724&Sku=1&Currency=USD&Email=NN&Tag=PmsLink&order_rooms=recommended'
```

### Response (Estructura Clave)
```json
{
  "Version": 6,
  "SearchID": 45216646,
  "ProductID": 12724,
  "Currency": "USD",
  "ProductList": [
    {
      "ProductID": 12724,
      "Title": "Broadway Hotel & Suites",
      "SkuList": [
        {
          "SkuID": 50337,
          "Title": "Corner",
          "MaxPersons": 2,
          "RateList": [
            {
              "ID": 26178,
              "Name": "HYPERGUEST BB ARG",
              "Currency": "USD",
              "Availability": 3,
              "RatePerDay": {
                "a0_c0": {
                  "rates_per_day": [
                    {
                      "availability": 3,
                      "rate": 114.95,
                      "date": "2025-09-24",
                      "currency": "USD"
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Validación de Disponibilidad Real
```typescript
// Un hotel tiene disponibilidad real si tiene al menos una tarifa disponible
const hasRealAvailability = (productList: any[]) => {
  return productList.some(product => 
    product.SkuList?.some((sku: any) => 
      sku.RateList?.some((rate: any) => rate.Availability > 0)
    )
  );
};

// Contar tarifas disponibles
const countAvailableRates = (productList: any[]) => {
  let count = 0;
  productList.forEach(product => {
    product.SkuList?.forEach((sku: any) => {
      sku.RateList?.forEach((rate: any) => {
        if (rate.Availability > 0) count++;
      });
    });
  });
  return count;
};
```

## 🔍 Análisis de Discrepancias

### Caso 1: Disponibilidad Confirmada ✅
```json
{
  "hotels_availability": {
    "hotel_id": 12724,
    "availability": 2
  },
  "query_list6": {
    "SkuList": [
      {
        "RateList": [
          { "Availability": 3 },
          { "Availability": 1 }
        ]
      }
    ]
  },
  "result": "MATCH - Disponibilidad confirmada"
}
```

### Caso 2: Falso Positivo ❌
```json
{
  "hotels_availability": {
    "hotel_id": 15623,
    "availability": 1
  },
  "query_list6": {
    "SkuList": [
      {
        "RateList": [
          { "Availability": 0 },
          { "Availability": 0 }
        ]
      }
    ]
  },
  "result": "DISCREPANCY - Falso positivo"
}
```

## 🎯 Parámetros de Test Recomendados

### Buenos Aires (Ejemplo Principal)
```json
{
  "latitude": -34.6036739,
  "longitude": -58.3821215,
  "distance_radius": 50000,
  "location_search": "Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina",
  "start": "24/09/2025",
  "end": "26/09/2025"
}
```

### Madrid (Test Alternativo)
```json
{
  "latitude": 40.4168,
  "longitude": -3.7038,
  "distance_radius": 25000,
  "location_search": "Madrid, España",
  "start": "15/10/2025",
  "end": "17/10/2025"
}
```

### Nueva York (Test Internacional)
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "distance_radius": 30000,
  "location_search": "New York, NY, USA",
  "start": "01/11/2025",
  "end": "03/11/2025"
}
```

## 🚨 Manejo de Errores Comunes

### SearchID Inválido
```json
{
  "error": "Search definition not found",
  "searchId": 46322997,
  "status": 404
}
```

### Hotel No Encontrado
```json
{
  "ProductList": [],
  "SearchID": 45216646,
  "ProductID": 99999
}
```

### Rate Limit Excedido
```json
{
  "error": "Too Many Requests",
  "retry_after": 60,
  "status": 429
}
```

### Timeout
```javascript
// Error manejado por el framework
{
  "error": "Request timeout after 30000ms",
  "endpoint": "/v2/hotels/availability",
  "duration": 30000
}
```

## 📊 Métricas de Performance Esperadas

### Tiempos de Respuesta Típicos

| Endpoint | Desarrollo | Producción |
|----------|------------|------------|
| Search Insert | 800-1500ms | 600-1200ms |
| Hotels Availability | 2000-4000ms | 1500-3000ms |
| Query List6 | 1000-2500ms | 800-2000ms |

### Rangos de Disponibilidad

| Ciudad | Hoteles Típicos | Con Disponibilidad | Precisión Esperada |
|--------|-----------------|--------------------|--------------------|
| Buenos Aires | 20-40 | 60-80% | 85-95% |
| Madrid | 30-60 | 70-85% | 80-90% |
| Nueva York | 50-100 | 50-70% | 75-85% |

---

*Nota: Los ejemplos y métricas pueden variar según la temporada, disponibilidad real y configuración de los sistemas.*