import { 
  filterHotelsWithAvailability, 
  countAvailableSkus, 
  hasRealAvailability, 
  calculateAccuracy, 
  validateSearchParams 
} from '../utils/testHelper';
import { Hotel, Sku } from '../types';

describe('testHelper', () => {
  describe('filterHotelsWithAvailability', () => {
    it('should filter hotels with availability > 0', () => {
      const hotels: Hotel[] = [
        { availability: 0, hotel_id: 1, name: 'Hotel 1' } as Hotel,
        { availability: 2, hotel_id: 2, name: 'Hotel 2' } as Hotel,
        { availability: 1, hotel_id: 3, name: 'Hotel 3' } as Hotel,
      ];

      const result = filterHotelsWithAvailability(hotels);
      
      expect(result).toHaveLength(2);
      expect(result[0].hotel_id).toBe(2);
      expect(result[1].hotel_id).toBe(3);
    });
  });

  describe('calculateAccuracy', () => {
    it('should calculate accuracy percentage correctly', () => {
      expect(calculateAccuracy(10, 8)).toBe(80);  // 8 de 10 testeados = 80%
      expect(calculateAccuracy(5, 5)).toBe(100);  // 5 de 5 testeados = 100%
      expect(calculateAccuracy(10, 0)).toBe(0);   // 0 de 10 testeados = 0%
    });

    it('should return 0% when no hotels tested', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);    // No se testeo ninguno = 0%
    });

    it('should handle edge cases correctly', () => {
      expect(calculateAccuracy(1, 1)).toBe(100);  // 1 de 1 = 100%
      expect(calculateAccuracy(3, 2)).toBe(67);   // 2 de 3 = 67%
    });
  });

  describe('validateSearchParams', () => {
    it('should return no errors for valid params', () => {
      const params = {
        latitude: -34.6,
        longitude: -58.3,
        start: '01/01/2025',
        end: '02/01/2025',
        location_search: 'Buenos Aires'
      };

      const errors = validateSearchParams(params);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid params', () => {
      const params = {
        latitude: 'invalid',
        longitude: -58.3,
        start: null,
        end: '02/01/2025'
      };

      const errors = validateSearchParams(params);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('latitude'))).toBe(true);
      expect(errors.some(error => error.includes('start'))).toBe(true);
    });
  });
});