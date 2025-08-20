/**
 * Formatea una fecha para los parámetros de la API (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Genera fechas para un test (por defecto: mañana como check-in, pasado mañana como check-out)
 */
export const generateTestDates = (daysFromNow: number = 1, nights: number = 1): { start: string; end: string } => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + daysFromNow);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + nights);
  
  return {
    start: formatDateForApi(startDate),
    end: formatDateForApi(endDate)
  };
};

/**
 * Calcula la duración entre dos fechas
 */
export const calculateDuration = (startTime: Date, endTime: Date): number => {
  return endTime.getTime() - startTime.getTime();
};