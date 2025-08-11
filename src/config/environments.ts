import { Environment } from '../types';

export const environments: Record<string, Environment> = {
  development: {
    name: 'development',
    api1BaseUrl: 'https://api-1-testing.pxsol.com',
    apiIntegrationBaseUrl: 'https://gateway-dev.pxsol.com',
  },
  production: {
    name: 'production',
    api1BaseUrl: 'https://api-1-eb-web.pxsol.io',
    apiIntegrationBaseUrl: 'https://gateway-prod.pxsol.com',
  },
};

export const getEnvironment = (envName: string): Environment => {
  const env = environments[envName];
  if (!env) {
    throw new Error(`Environment '${envName}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
  }
  return env;
};