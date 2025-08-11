import { HotelAvailabilityTestService } from '../services/hotelAvailabilityTestService';
import { TestConfig } from '../types';
import { getEnvironment } from '../config/environments';

describe('HotelAvailabilityTestService', () => {
  let testConfig: TestConfig;

  beforeEach(() => {
    testConfig = {
      environment: getEnvironment('development'),
      searchParams: {
        latitude: -34.6036739,
        longitude: -58.3821215,
        distance_radius: 50000,
        start: '01/01/2025',
        end: '02/01/2025',
        location_search: 'Buenos Aires, Argentina'
      },
      maxHotelsToTest: 2,
      timeout: 10000
    };
  });

  describe('constructor', () => {
    it('should create service with valid config', () => {
      const service = new HotelAvailabilityTestService(testConfig);
      expect(service).toBeInstanceOf(HotelAvailabilityTestService);
    });
  });

  describe('runCompleteFlowTest', () => {
    it('should validate search parameters', async () => {
      const invalidConfig = {
        ...testConfig,
        searchParams: {
          ...testConfig.searchParams,
          latitude: undefined as any
        }
      };

      const service = new HotelAvailabilityTestService(invalidConfig);
      
      await expect(service.runCompleteFlowTest()).rejects.toThrow('Invalid search parameters');
    });
  });
});