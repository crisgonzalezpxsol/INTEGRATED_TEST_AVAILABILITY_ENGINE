import fs from 'fs/promises';
import path from 'path';
import { TestResult } from '../types';
import { createTestSummary } from '../utils/testHelper';
import logger from '../config/logger';

export class ReportingService {
  private reportsDir: string;

  constructor(reportsDir: string = 'reports') {
    this.reportsDir = reportsDir;
  }

  /**
   * Guarda los resultados del test en formato JSON
   */
  async saveTestResult(result: TestResult): Promise<string> {
    try {
      // Crear directorio de reportes si no existe
      await fs.mkdir(this.reportsDir, { recursive: true });

      const timestamp = result.timestamp.toISOString().replace(/[:.]/g, '-');
      const filename = `test-result-${result.environment}-${timestamp}.json`;
      const filepath = path.join(this.reportsDir, filename);

      await fs.writeFile(filepath, JSON.stringify(result, null, 2));

      logger.info('Test result saved', { filepath });
      return filepath;

    } catch (error) {
      logger.error('Failed to save test result', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Genera y guarda un reporte en texto plano
   */
  async generateTextReport(result: TestResult): Promise<string> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });

      const timestamp = result.timestamp.toISOString().replace(/[:.]/g, '-');
      const filename = `test-summary-${result.environment}-${timestamp}.txt`;
      const filepath = path.join(this.reportsDir, filename);

      const summary = createTestSummary(result);
      await fs.writeFile(filepath, summary);

      logger.info('Text report generated', { filepath });
      return filepath;

    } catch (error) {
      logger.error('Failed to generate text report', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Genera un reporte CSV con métricas clave
   */
  async generateCSVReport(results: TestResult[]): Promise<string> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `test-metrics-${timestamp}.csv`;
      const filepath = path.join(this.reportsDir, filename);

      const headers = [
        'Test ID',
        'Environment',
        'Timestamp',
        'Total Duration (ms)',
        'Search Insert Success',
        'Search Insert Duration (ms)',
        'Hotels Availability Success',
        'Hotels Availability Duration (ms)',
        'Total Hotels',
        'Hotels with Supposed Availability',
        'Hotels Tested',
        'Hotels with Real Availability',
        'Accuracy (%)',
        'Discrepancies Count',
        'Average List6 Duration (ms)'
      ];

      const rows = results.map(result => {
        const avgList6Duration = result.queryList6Results.length > 0
          ? Math.round(result.queryList6Results.reduce((sum, r) => sum + r.duration, 0) / result.queryList6Results.length)
          : 0;

        return [
          result.testId,
          result.environment,
          result.timestamp.toISOString(),
          result.duration,
          result.searchInsert.success ? 'Yes' : 'No',
          result.searchInsert.duration,
          result.hotelsAvailability.success ? 'Yes' : 'No',
          result.hotelsAvailability.duration,
          result.comparison.totalHotelsFromAvailability,
          result.comparison.hotelsWithSupposedAvailability,
          result.comparison.hotelsTestedInList6,
          result.comparison.hotelsWithRealAvailability,
          result.comparison.accuracyPercentage,
          result.comparison.discrepancies.length,
          avgList6Duration
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      await fs.writeFile(filepath, csvContent);

      logger.info('CSV report generated', { filepath, recordCount: results.length });
      return filepath;

    } catch (error) {
      logger.error('Failed to generate CSV report', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Genera un reporte comparativo entre entornos
   */
  async generateComparisonReport(devResults: TestResult[], prodResults: TestResult[]): Promise<string> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `environment-comparison-${timestamp}.txt`;
      const filepath = path.join(this.reportsDir, filename);

      const devAvg = this.calculateAverageMetrics(devResults);
      const prodAvg = this.calculateAverageMetrics(prodResults);

      const report = `
Environment Comparison Report
============================
Generated: ${new Date().toISOString()}

DEVELOPMENT ENVIRONMENT
-----------------------
Tests executed: ${devResults.length}
Average accuracy: ${devAvg.accuracy}%
Average total duration: ${devAvg.totalDuration}ms
Average search insert duration: ${devAvg.searchInsertDuration}ms
Average hotels availability duration: ${devAvg.hotelsAvailabilityDuration}ms
Average list6 duration: ${devAvg.list6Duration}ms
Average hotels tested: ${devAvg.hotelsTestedCount}
Average discrepancies: ${devAvg.discrepanciesCount}

PRODUCTION ENVIRONMENT
----------------------
Tests executed: ${prodResults.length}
Average accuracy: ${prodAvg.accuracy}%
Average total duration: ${prodAvg.totalDuration}ms
Average search insert duration: ${prodAvg.searchInsertDuration}ms
Average hotels availability duration: ${prodAvg.hotelsAvailabilityDuration}ms
Average list6 duration: ${prodAvg.list6Duration}ms
Average hotels tested: ${prodAvg.hotelsTestedCount}
Average discrepancies: ${prodAvg.discrepanciesCount}

COMPARISON
----------
Accuracy difference: ${prodAvg.accuracy - devAvg.accuracy}% (${prodAvg.accuracy > devAvg.accuracy ? 'PROD better' : 'DEV better'})
Performance difference: ${devAvg.totalDuration - prodAvg.totalDuration}ms (${prodAvg.totalDuration < devAvg.totalDuration ? 'PROD faster' : 'DEV faster'})
Discrepancies difference: ${prodAvg.discrepanciesCount - devAvg.discrepanciesCount} (${prodAvg.discrepanciesCount < devAvg.discrepanciesCount ? 'PROD better' : 'DEV better'})
`;

      await fs.writeFile(filepath, report);

      logger.info('Comparison report generated', { filepath });
      return filepath;

    } catch (error) {
      logger.error('Failed to generate comparison report', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Calcula métricas promedio de un conjunto de resultados
   */
  private calculateAverageMetrics(results: TestResult[]) {
    if (results.length === 0) {
      return {
        accuracy: 0,
        totalDuration: 0,
        searchInsertDuration: 0,
        hotelsAvailabilityDuration: 0,
        list6Duration: 0,
        hotelsTestedCount: 0,
        discrepanciesCount: 0
      };
    }

    const totals = results.reduce((acc, result) => {
      const avgList6Duration = result.queryList6Results.length > 0
        ? result.queryList6Results.reduce((sum, r) => sum + r.duration, 0) / result.queryList6Results.length
        : 0;

      return {
        accuracy: acc.accuracy + result.comparison.accuracyPercentage,
        totalDuration: acc.totalDuration + result.duration,
        searchInsertDuration: acc.searchInsertDuration + result.searchInsert.duration,
        hotelsAvailabilityDuration: acc.hotelsAvailabilityDuration + result.hotelsAvailability.duration,
        list6Duration: acc.list6Duration + avgList6Duration,
        hotelsTestedCount: acc.hotelsTestedCount + result.comparison.hotelsTestedInList6,
        discrepanciesCount: acc.discrepanciesCount + result.comparison.discrepancies.length
      };
    }, {
      accuracy: 0,
      totalDuration: 0,
      searchInsertDuration: 0,
      hotelsAvailabilityDuration: 0,
      list6Duration: 0,
      hotelsTestedCount: 0,
      discrepanciesCount: 0
    });

    return {
      accuracy: Math.round(totals.accuracy / results.length),
      totalDuration: Math.round(totals.totalDuration / results.length),
      searchInsertDuration: Math.round(totals.searchInsertDuration / results.length),
      hotelsAvailabilityDuration: Math.round(totals.hotelsAvailabilityDuration / results.length),
      list6Duration: Math.round(totals.list6Duration / results.length),
      hotelsTestedCount: Math.round(totals.hotelsTestedCount / results.length),
      discrepanciesCount: Math.round(totals.discrepanciesCount / results.length)
    };
  }
}