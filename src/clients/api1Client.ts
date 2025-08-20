import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { SearchInsertRequest, SearchInsertResponse, QueryList6Request, QueryList6Response } from '../types';
import logger from '../config/logger';

export class Api1Client {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
      }
    });

    // Interceptor para logging de requests
    this.client.interceptors.request.use((config) => {
      logger.debug('API1 Request', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL
      });
      return config;
    });

    // Interceptor para logging de responses
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API1 Response', {
          status: response.status,
          url: response.config.url,
          duration: Date.now() - (response.config as any).startTime
        });
        return response;
      },
      (error) => {
        logger.error('API1 Error', {
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
   * Inserta una nueva búsqueda y retorna el SearchID
   */
  async searchInsert(params: Partial<SearchInsertRequest>): Promise<SearchInsertResponse> {
    const startTime = Date.now();
    
    // Parámetros por defecto
    const defaultParams: SearchInsertRequest = {
      location_google_search: params.location_search || '',
      latitude: params.latitude || 0,
      longitude: params.longitude || 0,
      distance_radius: params.distance_radius || 50000,
      location_search: params.location_search || '',
      SearchType: 'lat_lng',
      Start: params.Start || '',
      End: params.End || '',
      PartyType: 'double',
      MaxRooms: 2,
      Nights: 1,
      Channel: 2,
      RateType: 'auto',
      Pos: 'ROOMFARES',
      Lng: 'en',
      Currency: 'USD',
      MaxAgeChildrenNumber: 17,
      MaxAgeBabiesNumber: 2,
      ReturnUrl: 'NoReturn',
      FromUrl: '',
      Tag: 'PmsLink',
      Source: 'Contact Form',
      ProductTimezone: 'America/Argentina/Buenos_Aires',
      Type: '',
      Device: 'Computer',
      tag: 'PmsLink',
      UserType: '',
      AgreementType: '',
      GroupsForm: '1:2,0,0',
      SkuID: '',
      MinNights: 0,
      ...params
    };

    // Convertir a URLSearchParams para envío como form-data
    const formData = new URLSearchParams();
    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    };

    (config as any).startTime = startTime;

    try {
      const response = await this.client.post<SearchInsertResponse>('/search/insert', formData, config);
      
      logger.info('Search Insert Success', {
        searchId: response.data.SearchID,
        duration: Date.now() - startTime
      });

      return response.data;
    } catch (error) {
      logger.error('Search Insert Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Consulta detalles de un hotel específico y sus habitaciones
   */
  async queryList6(params: QueryList6Request): Promise<QueryList6Response> {
    const startTime = Date.now();
    
    const queryParams = new URLSearchParams({
      search: params.search,
      pos: params.pos,
      lng: params.lng,
      SearchID: String(params.SearchID),
      ProductID: String(params.ProductID),
      Sku: String(params.Sku),
      Currency: params.Currency,
      Email: params.Email,
      Tag: params.Tag,
      order_rooms: params.order_rooms
    });

    const config: AxiosRequestConfig = {};
    (config as any).startTime = startTime;

    try {
      const fullUrl = `${this.client.defaults.baseURL}/query/list6?${queryParams.toString()}`;
      console.log(`🔗 List6 URL: ${fullUrl}`);
      
      const response = await this.client.get<QueryList6Response>(`/query/list6?${queryParams.toString()}`, config);
      
      logger.info('Query List6 Success', {
        productId: params.ProductID,
        skuCount: response.data.ProductList?.[0]?.SkuList?.length || 0,
        duration: Date.now() - startTime,
        url: fullUrl
      });

      return response.data;
    } catch (error) {
      logger.error('Query List6 Failed', {
        productId: params.ProductID,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
      throw error;
    }
  }
}