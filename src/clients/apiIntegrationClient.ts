import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HotelsAvailabilityRequest, HotelsAvailabilityResponse, Hotel } from '../types';
import logger from '../config/logger';

export class ApiIntegrationClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
      }
    });

    // Interceptor para logging de requests
    this.client.interceptors.request.use((config) => {
      logger.debug('API Integration Request', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL
      });
      return config;
    });

    // Interceptor para logging de responses
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Integration Response', {
          status: response.status,
          url: response.config.url,
          duration: Date.now() - (response.config as any).startTime
        });
        return response;
      },
      (error) => {
        logger.error('API Integration Error', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data
        });
        throw error;
      }
    );
  }

  /**
   * Consulta hoteles con disponibilidad basado en los parámetros de búsqueda
   */
  async getHotelsAvailability(params: Partial<HotelsAvailabilityRequest>, authToken?: string): Promise<HotelsAvailabilityResponse> {
    const startTime = Date.now();
    
    const queryParams = new URLSearchParams({
      search_definition_id: String(params.search_definition_id),
      currency: params.currency || 'USD',
      lat: String(params.lat),
      lng: String(params.lng),
      distance_radius: String(params.distance_radius),
      search_type: params.search_type || 'lat_lng',
      pos: params.pos || 'ROOMFARES',
      order_by: params.order_by || 'distance',
      current_page: String(params.current_page || 1)
    });

    // Agregar pxsol_auth_token si está disponible
    if (params.pxsol_auth_token) {
      queryParams.append('pxsol_auth_token', params.pxsol_auth_token);
    }

    const config: AxiosRequestConfig = {
      headers: {}
    };

    // Usar token de parámetro o variable de entorno
    const tokenToUse = authToken || process.env.AUTHORIZATION_API_INTEGRATION;
    
    // Agregar Authorization header si está disponible
    if (tokenToUse) {
      // Si el token ya incluye "Bearer", usarlo tal como está
      config.headers!['Authorization'] = tokenToUse.startsWith('Bearer ') 
        ? tokenToUse 
        : `Bearer ${tokenToUse}`;
    }

    (config as any).startTime = startTime;

    try {
      const response = await this.client.get<HotelsAvailabilityResponse>(`/v2/hotels/availability?${queryParams.toString()}`, config);
      
      const hotelsCount = response.data.data?.hotels?.length || 0;
      const availableHotelsCount = response.data.data?.hotels?.filter(hotel => hotel.availability > 0).length || 0;
      
      logger.info('Hotels Availability Success', {
        searchDefinitionId: params.search_definition_id,
        hotelsCount,
        availableHotelsCount,
        duration: Date.now() - startTime
      });

      return response.data;
    } catch (error) {
      logger.error('Hotels Availability Failed', {
        searchDefinitionId: params.search_definition_id,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Obtiene hoteles de múltiples páginas hasta alcanzar el límite especificado
   */
  async getHotelsFromMultiplePages(
    params: Partial<HotelsAvailabilityRequest>, 
    maxHotels: number = 50,
    authToken?: string
  ): Promise<{ hotels: Hotel[], totalPages: number, totalHotels: number }> {
    const allHotels: Hotel[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalHotels = 0;

    try {
      do {
        const pageParams = { ...params, current_page: currentPage };
        const response = await this.getHotelsAvailability(pageParams, authToken);
        
        // Actualizar información de paginación
        totalPages = response.meta.total_pages;
        totalHotels = response.meta.total_hotels;
        
        // Agregar hoteles de esta página
        allHotels.push(...response.data.hotels);
        
        logger.info('Page processed', {
          currentPage,
          totalPages,
          hotelsInPage: response.meta.this_page_hotels,
          totalCollected: allHotels.length,
          maxHotels
        });

        currentPage++;

        // Verificar límites de parada
        const maxPagesToScan = process.env.MAX_PAGES_TO_SCAN ? parseInt(process.env.MAX_PAGES_TO_SCAN) : 10;
        
        // Parar si ya tenemos suficientes hoteles, llegamos a la última página, o al límite de páginas
        if (allHotels.length >= maxHotels || currentPage > totalPages || currentPage > maxPagesToScan) {
          if (currentPage > maxPagesToScan) {
            logger.info('Stopped due to max pages limit', { maxPagesToScan, currentPage });
          }
          break;
        }

        // Pequeña pausa entre requests para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } while (currentPage <= totalPages);

      // Limitar al número máximo solicitado
      const limitedHotels = allHotels.slice(0, maxHotels);

      logger.info('Multi-page fetch completed', {
        totalPagesProcessed: currentPage - 1,
        totalHotelsCollected: limitedHotels.length,
        totalAvailable: totalHotels,
        totalPages
      });

      return {
        hotels: limitedHotels,
        totalPages,
        totalHotels
      };

    } catch (error) {
      logger.error('Multi-page fetch failed', {
        currentPage,
        totalCollected: allHotels.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Método helper para obtener solo los hoteles con disponibilidad de múltiples páginas
   */
  async getAvailableHotelsFromMultiplePages(
    params: Partial<HotelsAvailabilityRequest>, 
    maxHotels: number = 50,
    authToken?: string
  ) {
    const result = await this.getHotelsFromMultiplePages(params, maxHotels, authToken);
    const availableHotels = result.hotels.filter(hotel => hotel.availability > 0);
    
    return {
      ...result,
      hotels: availableHotels,
      availableHotelsCount: availableHotels.length
    };
  }

  /**
   * Método helper para obtener solo los hoteles con disponibilidad (página única - mantenido para compatibilidad)
   */
  async getAvailableHotels(params: Partial<HotelsAvailabilityRequest>, authToken?: string) {
    const response = await this.getHotelsAvailability(params, authToken);
    return response.data.hotels.filter(hotel => hotel.availability > 0);
  }
}