import { generateTestDates, formatDateForApi } from '../utils/dateHelper';

export interface SearchParams {
  latitude: number;
  longitude: number;
  distance_radius: number;
  location_search: string;
  start: string;
  end: string;
}

/**
 * Carga los parámetros de búsqueda desde las variables de entorno
 */
export const getSearchParamsFromEnv = (): SearchParams => {
  // Valores por defecto (Buenos Aires)
  const defaultLatitude = -34.6036739;
  const defaultLongitude = -58.3821215;
  const defaultRadius = 50000;
  const defaultLocation = "Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina";
  const defaultStartDays = 30;
  const defaultEndDays = 32;

  // Obtener valores del environment
  const latitude = process.env.SEARCH_LATITUDE 
    ? parseFloat(process.env.SEARCH_LATITUDE) 
    : defaultLatitude;
    
  const longitude = process.env.SEARCH_LONGITUDE 
    ? parseFloat(process.env.SEARCH_LONGITUDE) 
    : defaultLongitude;
    
  const distance_radius = process.env.SEARCH_DISTANCE_RADIUS 
    ? parseInt(process.env.SEARCH_DISTANCE_RADIUS) 
    : defaultRadius;
    
  const location_search = process.env.SEARCH_LOCATION_NAME 
    ? process.env.SEARCH_LOCATION_NAME.replace(/"/g, '') // Remover comillas si existen
    : defaultLocation;

  // Manejar fechas
  let start: string;
  let end: string;

  if (process.env.SEARCH_START && process.env.SEARCH_END) {
    // Usar fechas absolutas (YYYY-MM-DD)
    start = process.env.SEARCH_START;
    end = process.env.SEARCH_END;
  } else if (process.env.SEARCH_START_DATE && process.env.SEARCH_END_DATE) {
    // Usar días relativos desde hoy
    const startDays = parseInt(process.env.SEARCH_START_DATE);
    const endDays = parseInt(process.env.SEARCH_END_DATE);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + startDays);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + endDays);
    
    start = formatDateForApi(startDate);
    end = formatDateForApi(endDate);
  } else {
    // Usar fechas por defecto
    const dates = generateTestDates(defaultStartDays, defaultEndDays - defaultStartDays);
    start = dates.start;
    end = dates.end;
  }

  // Validaciones
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid SEARCH_LATITUDE: ${process.env.SEARCH_LATITUDE}. Must be between -90 and 90.`);
  }
  
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid SEARCH_LONGITUDE: ${process.env.SEARCH_LONGITUDE}. Must be between -180 and 180.`);
  }
  
  if (isNaN(distance_radius) || distance_radius <= 0) {
    throw new Error(`Invalid SEARCH_DISTANCE_RADIUS: ${process.env.SEARCH_DISTANCE_RADIUS}. Must be a positive number.`);
  }

  return {
    latitude,
    longitude,
    distance_radius,
    location_search,
    start,
    end
  };
};

/**
 * Configuraciones predefinidas para diferentes ciudades argentinas
 */
export const PREDEFINED_LOCATIONS = {
  buenosAires: {
    latitude: -34.6036739,
    longitude: -58.3821215,
    distance_radius: 50000,
    location_search: "Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina"
  },
  mendoza: {
    latitude: -32.8894587,
    longitude: -68.8458386,
    distance_radius: 30000,
    location_search: "Mendoza, Capital, Mendoza, Argentina"
  },
  cordoba: {
    latitude: -31.420083299999995,
    longitude: -64.1887761,
    distance_radius: 50000,
    location_search: "Córdoba, Argentina"
  },
  iguazu: {
    latitude: -25.5965209,
    longitude: -54.575030899999994,
    distance_radius: 30000,
    location_search: "Puerto Iguazú, Misiones, Argentina"
  },
  salta: {
    latitude: -24.782126899999998,
    longitude: -65.4231976,
    distance_radius: 30000,
    location_search: "Salta, Argentina"
  },
  bariloche: {
    latitude: -41.1334722,
    longitude: -71.3102778,
    distance_radius: 50000,
    location_search: "Bariloche, Río Negro, Argentina"
  },
  sanLuis: {
    latitude: -33.301726699999996,
    longitude: -66.3377522,
    distance_radius: 50000,
    location_search: "San Luis, Argentina"
  },
  marDelPlata: {
    latitude: -38.0054771,
    longitude: -57.542610599999996,
    distance_radius: 30000,
    location_search: "Mar del Plata, Provincia de Buenos Aires, Argentina"
  },
  carilo: {
    latitude: -37.164258,
    longitude: -56.9030558,
    distance_radius: 30000,
    location_search: "Cariló, Provincia de Buenos Aires, Argentina"
  }
};

/**
 * Aplica una configuración predefinida de ubicación
 */
export const applyPredefinedLocation = (locationKey: keyof typeof PREDEFINED_LOCATIONS): Partial<SearchParams> => {
  const location = PREDEFINED_LOCATIONS[locationKey];
  if (!location) {
    throw new Error(`Unknown predefined location: ${locationKey}. Available: ${Object.keys(PREDEFINED_LOCATIONS).join(', ')}`);
  }
  return location;
};