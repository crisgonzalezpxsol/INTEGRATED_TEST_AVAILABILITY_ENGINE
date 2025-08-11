import { Hotel, Sku, TestResult } from '../types';

/**
 * Filtra hoteles con disponibilidad supuesta (availability > 0)
 */
export const filterHotelsWithAvailability = (hotels: Hotel[]): Hotel[] => {
  return hotels.filter(hotel => hotel.availability > 0);
};

/**
 * Cuenta SKUs con disponibilidad real en las tarifas
 */
export const countAvailableSkus = (skus: Sku[]): { availableSkus: number; availableRates: number } => {
  let availableSkus = 0;
  let availableRates = 0;

  skus.forEach(sku => {
    const availableRatesInSku = sku.RateList.filter(rate => rate.Availability > 0);
    if (availableRatesInSku.length > 0) {
      availableSkus++;
      availableRates += availableRatesInSku.length;
    }
  });

  return { availableSkus, availableRates };
};

/**
 * Verifica si un hotel tiene disponibilidad real
 */
export const hasRealAvailability = (skus: Sku[]): boolean => {
  return skus.some(sku => 
    sku.RateList.some(rate => rate.Availability > 0)
  );
};

/**
 * Calcula el porcentaje de precisión entre hoteles testeados y hoteles con disponibilidad real
 * @param hotelsTested - Número de hoteles que fueron testeados exitosamente
 * @param hotelsWithRealAvailability - Número de hoteles que tienen disponibilidad real
 */
export const calculateAccuracy = (
  hotelsTested: number,
  hotelsWithRealAvailability: number
): number => {
  if (hotelsTested === 0) return 0; // Si no se testeo ninguno, no hay precisión
  return Math.round((hotelsWithRealAvailability / hotelsTested) * 100);
};

/**
 * Genera un ID único para el test
 */
export const generateTestId = (environment: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${environment}_${timestamp}_${random}`;
};

/**
 * Valida los parámetros de búsqueda mínimos requeridos
 */
export const validateSearchParams = (params: any): string[] => {
  const errors: string[] = [];
  
  if (!params.latitude || typeof params.latitude !== 'number') {
    errors.push('latitude is required and must be a number');
  }
  
  if (!params.longitude || typeof params.longitude !== 'number') {
    errors.push('longitude is required and must be a number');
  }
  
  if (!params.start || typeof params.start !== 'string') {
    errors.push('start date is required and must be a string (DD/MM/YYYY)');
  }
  
  if (!params.end || typeof params.end !== 'string') {
    errors.push('end date is required and must be a string (DD/MM/YYYY)');
  }
  
  if (!params.location_search || typeof params.location_search !== 'string') {
    errors.push('location_search is required and must be a string');
  }
  
  return errors;
};

/**
 * Crea un resumen de los resultados del test
 */
export const createTestSummary = (result: TestResult): string => {
  const { comparison, hotelsAvailability, queryList6Results } = result;
  
  return `
Test Summary - ${result.environment.toUpperCase()}
=====================================
Test ID: ${result.testId}
Duration: ${result.duration}ms
Timestamp: ${result.timestamp.toISOString()}

Search Insert: ${result.searchInsert.success ? '✅' : '❌'} (${result.searchInsert.duration}ms)
Hotels Availability: ${hotelsAvailability.success ? '✅' : '❌'} (${hotelsAvailability.duration}ms)

Hotels Analysis:
- Total hotels returned: ${comparison.totalHotelsFromAvailability}
- Hotels with supposed availability: ${comparison.hotelsWithSupposedAvailability}
- Hotels tested in list6: ${comparison.hotelsTestedInList6}
- Hotels with real availability: ${comparison.hotelsWithRealAvailability}
- Accuracy: ${comparison.accuracyPercentage}% (${comparison.hotelsWithRealAvailability}/${comparison.hotelsTestedInList6} tested hotels)

Discrepancies: ${comparison.discrepancies.length}
${comparison.discrepancies.map(d => 
  `- ${d.hotelName} (ID: ${d.hotelId}): Supposed=${d.supposedAvailability}, Real=${d.realAvailability}, Rates=${d.availableRates}`
).join('\n')}

Query List6 Results:
${queryList6Results.map(r => 
  `- ${r.hotelName}: ${r.success ? '✅' : '❌'} (${r.duration}ms) - SKUs: ${r.skuCount}, Available: ${r.availableSkuCount}, Rates: ${r.availableRatesCount}`
).join('\n')}
`;
};