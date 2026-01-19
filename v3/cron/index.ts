import tsWorker from '@breejs/ts-worker';
import * as Sentry from '@sentry/node';
import Bree from 'bree';
import path from 'path';

import { Environment, getEnvironment } from '@/utils/getEnvironment';
Bree.extend(tsWorker);

export const breeInstance = new Bree({
  logger: console,
  root: path.join(__dirname, 'jobs'),
  jobs: [
    {
      name: 'notifyUnconvertedCustomers',
      interval: '15 minutes',
    },
    {
      name: 'invoicePayments',
      interval: '2 hours',
    },
    {
      name: 'checkUnpaidInvoices',
      interval: '1 day',
    },
  ],
  defaultExtension: 'js',
  errorHandler: (error, workerMetadata) => {
    if (getEnvironment() === Environment.DEV) {
      console.error(error);
    }
    Sentry.captureException(error, workerMetadata);
  },
});

export default {
  instance: breeInstance,
  start: () => {
    breeInstance.start();
    process.on('SIGINT', async () => {
      await breeInstance.stop();
      process.exit(0);
    });
  },
};
