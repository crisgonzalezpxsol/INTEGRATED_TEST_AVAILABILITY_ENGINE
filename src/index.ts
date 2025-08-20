#!/usr/bin/env node

import dotenv from 'dotenv';
import { HotelAvailabilityTestService } from './services/hotelAvailabilityTestService';
import { ReportingService } from './services/reportingService';
import { getEnvironment } from './config/environments';
import { getSearchParamsFromEnv } from './config/searchParams';
import { createTestSummary } from './utils/testHelper';
import { TestConfig } from './types';
import logger from './config/logger';

// Cargar variables de entorno
dotenv.config();

// Los parámetros de búsqueda ahora se cargan dinámicamente desde el environment

/**
 * Función principal para ejecutar un test individual
 */
async function runSingleTest(environmentName: string, customSearchParams?: any): Promise<void> {
  try {
    // Cargar parámetros de búsqueda desde environment o usar los personalizados
    const searchParams = customSearchParams || getSearchParamsFromEnv();
    
    logger.info('Starting hotel availability flow test', {
      environment: environmentName,
      searchParams
    });

    const environment = getEnvironment(environmentName);
    const config: TestConfig = {
      environment,
      searchParams,
      maxHotelsToTest: process.env.MAX_HOTELS_TO_TEST ? parseInt(process.env.MAX_HOTELS_TO_TEST) : 5,
      timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
      retries: parseInt(process.env.MAX_RETRIES || '3')
    };

    const testService = new HotelAvailabilityTestService(config);
    const reportingService = new ReportingService();

    // Ejecutar el test
    const result = await testService.runCompleteFlowTest();

    // Guardar resultados
    const jsonPath = await reportingService.saveTestResult(result);
    const textPath = await reportingService.generateTextReport(result);

    // Mostrar resumen en consola
    console.log(createTestSummary(result));
    console.log(`\nReportes guardados:`);
    console.log(`- JSON: ${jsonPath}`);
    console.log(`- Texto: ${textPath}`);

  } catch (error) {
    logger.error('Test execution failed', {
      environment: environmentName,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.error(`❌ Error ejecutando el test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Función para ejecutar tests comparativos entre entornos
 */
async function runComparisonTest(): Promise<void> {
  try {
    logger.info('Starting comparison test between environments');

    const reportingService = new ReportingService();
    const devResults = [];
    const prodResults = [];

    // Ejecutar test en desarrollo
    console.log('🔄 Ejecutando test en DESARROLLO...');
    const searchParams = getSearchParamsFromEnv();
    const devConfig: TestConfig = {
      environment: getEnvironment('development'),
      searchParams,
      maxHotelsToTest: process.env.MAX_HOTELS_TO_TEST ? parseInt(process.env.MAX_HOTELS_TO_TEST) : 3,
      timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000')
    };
    const devTestService = new HotelAvailabilityTestService(devConfig);
    const devResult = await devTestService.runCompleteFlowTest();
    devResults.push(devResult);

    // Ejecutar test en producción
    console.log('🔄 Ejecutando test en PRODUCCIÓN...');
    const prodConfig: TestConfig = {
      environment: getEnvironment('production'),
      searchParams,
      maxHotelsToTest: process.env.MAX_HOTELS_TO_TEST ? parseInt(process.env.MAX_HOTELS_TO_TEST) : 3,
      timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000')
    };
    const prodTestService = new HotelAvailabilityTestService(prodConfig);
    const prodResult = await prodTestService.runCompleteFlowTest();
    prodResults.push(prodResult);

    // Generar reportes
    await reportingService.saveTestResult(devResult);
    await reportingService.saveTestResult(prodResult);
    
    const comparisonPath = await reportingService.generateComparisonReport(devResults, prodResults);
    const csvPath = await reportingService.generateCSVReport([devResult, prodResult]);

    console.log('\n📊 COMPARACIÓN COMPLETADA:');
    console.log(`\nDESARROLLO: ${devResult.comparison.accuracyPercentage}% precisión (${devResult.duration}ms)`);
    console.log(`PRODUCCIÓN: ${prodResult.comparison.accuracyPercentage}% precisión (${prodResult.duration}ms)`);
    console.log(`\nReportes generados:`);
    console.log(`- Comparación: ${comparisonPath}`);
    console.log(`- CSV: ${csvPath}`);

  } catch (error) {
    logger.error('Comparison test failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.error(`❌ Error ejecutando test comparativo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Función principal CLI
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'server':
      // Ejecutar el servidor HTTP explícitamente
      await import('./server');
      break;
    case 'dev':
    case 'development':
      await runSingleTest('development');
      break;
      
    case 'prod':
    case 'production':
      await runSingleTest('production');
      break;
      
    case 'compare':
    case 'comparison':
      await runComparisonTest();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log(`
🏨 Hotel Availability Flow Testing Framework

Uso:
  npm run dev                    - Ejecutar test en desarrollo
  npm run start dev              - Ejecutar test en desarrollo  
  npm run start prod             - Ejecutar test en producción
  npm run start compare          - Ejecutar test comparativo entre entornos
  npm run start help             - Mostrar esta ayuda

Ejemplos:
  npm run dev                    # Test rápido en desarrollo
  npm run start compare          # Comparar desarrollo vs producción

El framework ejecuta el siguiente flujo:
1. 🔍 Search Insert - Registra búsqueda y obtiene SearchID
2. 🏨 Hotels Availability - Obtiene hoteles con disponibilidad supuesta
3. 🛏️  Query List6 - Verifica disponibilidad real por hotel
4. 📊 Comparación - Analiza precisión entre disponibilidad supuesta vs real

Configuración:
- Copia env.example a .env para configurar endpoints, tokens y parámetros de búsqueda
- Personaliza ubicación con SEARCH_LATITUDE, SEARCH_LONGITUDE, etc.
- Los resultados se guardan en ./reports/
- Los logs se guardan en ./logs/

Parámetros de Búsqueda Configurables:
- SEARCH_LATITUDE / SEARCH_LONGITUDE: Coordenadas de búsqueda
- SEARCH_DISTANCE_RADIUS: Radio en metros
- SEARCH_LOCATION_NAME: Nombre de la ubicación
- SEARCH_START_DATE / SEARCH_END_DATE: Días desde hoy para check-in/out
      `);
      break;
      
    default:
      // Si no hay comando y estamos en un entorno con PORT (Render/Heroku), iniciar el servidor HTTP
      if (!command && process.env.PORT) {
        await import('./server');
        break;
      }
      console.log(`❌ Comando desconocido: ${command || 'ninguno'}`);
      console.log('Usa "npm run start help" para ver los comandos disponibles');
      process.exit(1);
  }
}

// Ejecutar función principal
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

export { HotelAvailabilityTestService, ReportingService };