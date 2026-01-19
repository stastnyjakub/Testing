import env from '@/env';

export enum Environment {
  DEV = 'development',
  PROD = 'production',
}
export const getEnvironment = () => {
  if (process.env.ENVIRONMENT === 'dev') return Environment.DEV;
  if (process.env.ENVIRONMENT === 'prod') return Environment.PROD;
  console.warn('Unknown environment, defaulting to development');
  return Environment.DEV;
};

export const isDebugMode = () => {
  if (env().DEBUG === true) {
    return true;
  } else {
    return false;
  }
};
