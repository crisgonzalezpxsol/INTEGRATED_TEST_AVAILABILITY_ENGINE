import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getEnvironment } from './config/environments';
import { HotelAvailabilityTestService } from './services/hotelAvailabilityTestService';
import { ReportingService } from './services/reportingService';
import { formatDateForApi } from './utils/dateHelper';
import logger from './config/logger';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const runFlow = async (params: Record<string, unknown>, res: Response) => {
  try {
    const {
      env = 'production',
      latitude,
      longitude,
      distance_radius,
      start_days,
      end_days,
      location_search,
      token,
      max_hotels_to_test,
      timeout
    } = params || {};

    if (latitude === undefined || isNaN(Number(latitude))) {
      return res.status(400).json({ error: 'latitude is required and must be a number' });
    }
    if (longitude === undefined || isNaN(Number(longitude))) {
      return res.status(400).json({ error: 'longitude is required and must be a number' });
    }
    if (distance_radius === undefined || isNaN(Number(distance_radius))) {
      return res.status(400).json({ error: 'distance_radius is required and must be a number' });
    }
    if (start_days === undefined || isNaN(Number(start_days))) {
      return res.status(400).json({ error: 'start_days is required and must be a number (days from today)' });
    }

    const startOffset = Number(start_days);
    const endOffset = end_days !== undefined && !isNaN(Number(end_days))
      ? Number(end_days)
      : startOffset + 2;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + startOffset);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + endOffset);

    const envName = typeof env === 'string' ? env : 'production';
    const tokenStr = typeof token === 'string' ? token : undefined;
    const locationName = typeof location_search === 'string' ? location_search : 'API Request';
    const environment = getEnvironment(envName);

    const config = {
      environment,
      searchParams: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        distance_radius: Number(distance_radius),
        start: formatDateForApi(startDate),
        end: formatDateForApi(endDate),
        location_search: locationName
      },
      maxHotelsToTest: max_hotels_to_test ? Number(max_hotels_to_test) : undefined,
      timeout: timeout ? Number(timeout) : undefined,
      authToken: tokenStr
    };

    logger.info('HTTP API flow request', { env: envName, params: config.searchParams });

    const testService = new HotelAvailabilityTestService(config);
    const reportingService = new ReportingService();

    const result = await testService.runCompleteFlowTest();

    const jsonPath = await reportingService.saveTestResult(result);
    const textPath = await reportingService.generateTextReport(result);

    res.json({
      ok: true,
      result,
      reports: {
        json: jsonPath,
        text: textPath
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('HTTP API flow request failed', { message });
    res.status(500).json({ ok: false, error: message });
  }
};

app.post('/api/flow', async (req: Request, res: Response) => {
  await runFlow(req.body, res);
});

app.get('/api/flow', async (req: Request, res: Response) => {
  const params = Object.fromEntries(
    Object.entries(req.query as Record<string, unknown>)
      .map(([k, v]) => [k, Array.isArray(v) ? (v[0] as unknown) : v])
  );
  await runFlow(params, res);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`HTTP API server listening on port ${PORT}`);
});


