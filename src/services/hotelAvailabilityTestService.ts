import { Api1Client, ApiIntegrationClient } from '../clients';
import { TestConfig, TestResult, Hotel } from '../types';
import { 
  generateTestId, 
  validateSearchParams, 
  filterHotelsWithAvailability, 
  hasRealAvailability, 
  countAvailableSkus, 
  calculateAccuracy 
} from '../utils/testHelper';
import { calculateDuration } from '../utils/dateHelper';
import logger from '../config/logger';

export class HotelAvailabilityTestService {
  private api1Client: Api1Client;
  private apiIntegrationClient: ApiIntegrationClient;
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
    this.api1Client = new Api1Client(
      config.environment.api1BaseUrl,
      config.timeout || 30000
    );
    this.apiIntegrationClient = new ApiIntegrationClient(
      config.environment.apiIntegrationBaseUrl,
      config.timeout || 30000
    );
  }

  /**
   * Ejecuta el flujo completo de testing
   */
  async runCompleteFlowTest(): Promise<TestResult> {
    const testId = generateTestId(this.config.environment.name);
    const startTime = new Date();

    logger.info('Starting complete flow test', {
      testId,
      environment: this.config.environment.name,
      searchParams: this.config.searchParams
    });

    // Validar parámetros de búsqueda
    const validationErrors = validateSearchParams(this.config.searchParams);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid search parameters: ${validationErrors.join(', ')}`);
    }

    const result: TestResult = {
      testId,
      environment: this.config.environment.name,
      timestamp: startTime,
      duration: 0,
      searchInsert: {
        success: false,
        duration: 0
      },
      hotelsAvailability: {
        success: false,
        duration: 0
      },
      queryList6Results: [],
      comparison: {
        totalHotelsFromAvailability: 0,
        hotelsWithSupposedAvailability: 0,
        hotelsTestedInList6: 0,
        hotelsWithRealAvailability: 0,
        accuracyPercentage: 0,
        discrepancies: []
      }
    };

    try {
      // Paso 1: Search Insert
      const searchInsertResult = await this.executeSearchInsert();
      result.searchInsert = searchInsertResult;

      if (!searchInsertResult.success || !searchInsertResult.searchId) {
        throw new Error('Search Insert failed, cannot continue with the flow');
      }

      // Paso 2 y 3 paginados: Hotels Availability por página + Query List6 por página
      const paged = await this.executePagedFlow(searchInsertResult.searchId);

      // Armar sección hotelsAvailability con agregados
      result.hotelsAvailability = {
        success: true,
        duration: paged.duration,
        hotelsCount: paged.allHotels.length,
        availableHotelsCount: paged.availableHotelsCount,
        hotels: paged.allHotels,
        paginationInfo: {
          totalPages: paged.totalPages,
          totalHotelsAvailable: paged.totalHotels,
          hotelsCollected: paged.allHotels.length
        }
      } as any;

      result.queryList6Results = paged.queryList6Results;

      const hotelsWithSupposedAvailability = filterHotelsWithAvailability(paged.allHotels);

      // Paso 4: Análisis y comparación
      result.comparison = this.analyzeResults(
        paged.allHotels,
        hotelsWithSupposedAvailability,
        paged.queryList6Results
      );

      const endTime = new Date();
      result.duration = calculateDuration(startTime, endTime);

      logger.info('Complete flow test finished', {
        testId,
        duration: result.duration,
        accuracy: result.comparison.accuracyPercentage,
        discrepancies: result.comparison.discrepancies.length
      });

      return result;

    } catch (error) {
      const endTime = new Date();
      result.duration = calculateDuration(startTime, endTime);
      
      logger.error('Complete flow test failed', {
        testId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: result.duration
      });

      throw error;
    }
  }

  /**
   * Ejecuta availability paginado y corre list6 por página, acumulando resultados
   */
  private async executePagedFlow(searchId: number): Promise<{
    duration: number;
    allHotels: Hotel[];
    queryList6Results: any[];
    totalPages: number;
    totalHotels: number;
    availableHotelsCount: number;
  }> {
    const startTime = new Date();
    const allHotels: Hotel[] = [];
    const queryList6Results: any[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalHotels = 0;
    let testedCount = 0;
    const maxToTest = this.config.maxHotelsToTest;

    do {
      const availability = await this.apiIntegrationClient.getHotelsAvailability({
        search_definition_id: searchId,
        currency: 'USD',
        lat: this.config.searchParams.latitude,
        lng: this.config.searchParams.longitude,
        distance_radius: this.config.searchParams.distance_radius,
        search_type: 'lat_lng',
        pos: 'ROOMFARES',
        order_by: 'distance',
        current_page: currentPage
      }, this.config.authToken);

      const hotels = availability.data.hotels || [];
      allHotels.push(...hotels);

      // Testear TODOS los hoteles en List6 (no solo los que marcan disponibilidad supuesta)
      const hotelsWithAvail = filterHotelsWithAvailability(hotels);
      let hotelsForThisPage = hotels;
      if (typeof maxToTest === 'number') {
        const remaining = maxToTest - testedCount;
        if (remaining <= 0) break;
        hotelsForThisPage = hotels.slice(0, remaining);
      }

      if (hotelsForThisPage.length > 0) {
        const pageResults = await this.executeQueryList6ForHotels(searchId, hotelsForThisPage);
        queryList6Results.push(...pageResults);
        testedCount += hotelsForThisPage.length;
      }

      totalPages = availability.meta.total_pages;
      totalHotels = availability.meta.total_hotels;
      currentPage++;

      if (typeof maxToTest === 'number' && testedCount >= maxToTest) {
        break;
      }
    } while (currentPage <= totalPages);

    const endTime = new Date();
    const availableHotelsCount = allHotels.filter(h => h.availability > 0).length;

    return {
      duration: calculateDuration(startTime, endTime),
      allHotels,
      queryList6Results,
      totalPages,
      totalHotels,
      availableHotelsCount
    };
  }

  /**
   * Ejecuta el paso 1: Search Insert
   */
  private async executeSearchInsert() {
    const startTime = new Date();
    
    try {
      const response = await this.api1Client.searchInsert({
        latitude: this.config.searchParams.latitude,
        longitude: this.config.searchParams.longitude,
        distance_radius: this.config.searchParams.distance_radius,
        Start: this.config.searchParams.start,
        End: this.config.searchParams.end,
        location_search: this.config.searchParams.location_search
      });

      const endTime = new Date();
      return {
        success: true,
        duration: calculateDuration(startTime, endTime),
        searchId: response.SearchID
      };

    } catch (error) {
      const endTime = new Date();
      return {
        success: false,
        duration: calculateDuration(startTime, endTime),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Ejecuta el paso 2: Hotels Availability (con soporte para múltiples páginas)
   */
  private async executeHotelsAvailability(searchId: number) {
    const startTime = new Date();
    
    try {
      // Calcular cuántos hoteles obtener de la API
      // Si maxHotelsToTest no está definido, obtener todos los hoteles disponibles (sin tope)
      const maxHotelsToFetch = this.config.maxHotelsToTest !== undefined
        ? Math.max((this.config.maxHotelsToTest || 0) * 3, 100)
        : Number.MAX_SAFE_INTEGER;
      
      const result = await this.apiIntegrationClient.getHotelsFromMultiplePages({
        search_definition_id: searchId,
        currency: 'USD',
        lat: this.config.searchParams.latitude,
        lng: this.config.searchParams.longitude,
        distance_radius: this.config.searchParams.distance_radius,
        search_type: 'lat_lng',
        pos: 'ROOMFARES',
        order_by: 'distance'
      }, maxHotelsToFetch, this.config.authToken); // Token opcional

      const endTime = new Date();
      const hotels = result.hotels;
      const availableHotelsCount = hotels.filter(hotel => hotel.availability > 0).length;

      logger.info('Hotels Availability with pagination completed', {
        totalPages: result.totalPages,
        totalHotelsAvailable: result.totalHotels,
        hotelsCollected: hotels.length,
        hotelsWithAvailability: availableHotelsCount,
        maxHotelsToTest: this.config.maxHotelsToTest
      });

      return {
        success: true,
        duration: calculateDuration(startTime, endTime),
        hotelsCount: hotels.length,
        availableHotelsCount,
        hotels,
        paginationInfo: {
          totalPages: result.totalPages,
          totalHotelsAvailable: result.totalHotels,
          hotelsCollected: hotels.length
        }
      };

    } catch (error) {
      const endTime = new Date();
      return {
        success: false,
        duration: calculateDuration(startTime, endTime),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Ejecuta el paso 3: Query List6 para múltiples hoteles
   */
  private async executeQueryList6ForHotels(searchId: number, hotels: Hotel[]) {
    const results: any[] = [];
    const concurrencyLimit = this.config.concurrency || (process.env.CONCURRENT_REQUESTS ? parseInt(process.env.CONCURRENT_REQUESTS) : 5);

    let currentIndex = 0;

    const worker = async () => {
      while (true) {
        const index = currentIndex++;
        if (index >= hotels.length) break;

        const hotel = hotels[index];
        const startTime = new Date();
        try {
          const response = await this.api1Client.queryList6({
            search: 'OK',
            pos: 'ROOMFARES',
            lng: 'en',
            SearchID: searchId,
            ProductID: hotel.hotel_id,
            Sku: 1,
            Currency: 'USD',
            Email: 'NN',
            Tag: 'PmsLink',
            order_rooms: 'recommended'
          });

          const endTime = new Date();
          const skus = response.ProductList[0]?.SkuList || [];
          const { availableSkus, availableRates } = countAvailableSkus(skus);

          results.push({
            hotelId: hotel.hotel_id,
            hotelName: hotel.name,
            success: true,
            duration: calculateDuration(startTime, endTime),
            skuCount: skus.length,
            availableSkuCount: availableSkus,
            availableRatesCount: availableRates
          });

        } catch (error) {
          const endTime = new Date();
          results.push({
            hotelId: hotel.hotel_id,
            hotelName: hotel.name,
            success: false,
            duration: calculateDuration(startTime, endTime),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    };

    const workersCount = Math.min(concurrencyLimit, hotels.length);
    const workers = Array.from({ length: workersCount }, () => worker());
    await Promise.all(workers);

    return results;
  }

  /**
   * Analiza los resultados y genera comparaciones
   */
  private analyzeResults(allHotels: Hotel[], hotelsWithSupposedAvailability: Hotel[], queryList6Results: any[]) {
    // Hoteles que fueron exitosamente testeados
    const successfullyTestedHotels = queryList6Results.filter(result => result.success);
    
    // Hoteles con disponibilidad real (de los testeados exitosamente)
    const hotelsWithRealAvailability = successfullyTestedHotels.filter(result =>
      (result.availableRatesCount || 0) > 0
    ).length;

    const discrepancies = [];

    // Matriz de confusión
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    // Analizar discrepancias en los hoteles testeados exitosamente
    for (const queryResult of successfullyTestedHotels) {
      const hotel = allHotels.find(h => h.hotel_id === queryResult.hotelId);
      if (!hotel) continue;

      const hasRealAvail = (queryResult.availableRatesCount || 0) > 0;
      const supposedAvail = hotel.availability || 0;

      if (supposedAvail > 0 && hasRealAvail) truePositives++;
      if (supposedAvail === 0 && !hasRealAvail) trueNegatives++;
      if (supposedAvail > 0 && !hasRealAvail) falsePositives++;
      if (supposedAvail === 0 && hasRealAvail) falseNegatives++;

      // Falso positivo: supuesta disponibilidad pero sin disponibilidad real
      if (supposedAvail > 0 && !hasRealAvail) {
        discrepancies.push({
          hotelId: hotel.hotel_id,
          hotelName: hotel.name,
          supposedAvailability: supposedAvail,
          realAvailability: false,
          availableRates: queryResult.availableRatesCount || 0
        });
      }

      // Falso negativo: sin disponibilidad supuesta pero con disponibilidad real
      if (supposedAvail === 0 && hasRealAvail) {
        discrepancies.push({
          hotelId: hotel.hotel_id,
          hotelName: hotel.name,
          supposedAvailability: supposedAvail,
          realAvailability: true,
          availableRates: queryResult.availableRatesCount || 0
        });
      }
    }

    // Calcular precisión: (TP + TN) / total testeado
    const totalTested = successfullyTestedHotels.length;
    const accuracyPercentage = totalTested > 0
      ? Math.round(((truePositives + trueNegatives) / totalTested) * 100)
      : 0;

    return {
      totalHotelsFromAvailability: allHotels.length,
      hotelsWithSupposedAvailability: hotelsWithSupposedAvailability.length,
      hotelsTestedInList6: successfullyTestedHotels.length,
      hotelsWithRealAvailability,
      accuracyPercentage,
      discrepancies
    };
  }
}