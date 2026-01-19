import moduleAlias from 'module-alias';
moduleAlias.addAlias('@', __dirname + '/../../');
moduleAlias.addAlias('@templates', __dirname + '/../../../templates/');

import * as Sentry from '@sentry/node';
import { parentPort } from 'worker_threads';

import env from '@/env';
import * as invoiceService from '@/invoice/invoice.service';
import { Environment, getEnvironment } from '@/utils/getEnvironment';

(async () => {
  if (env().CRON_CHECK_INVOICE_PAYMENTS_ENABLED !== true) {
    if (parentPort) parentPort.postMessage('done - not enabled');
    else process.exit(0);
    return;
  }

  try {
    await invoiceService.queueInvoicePaymentsJob();
  } catch (error) {
    console.log('Error in invoice payments cron job: ', error);
    if (getEnvironment() === Environment.DEV) {
      console.error(error);
    }
    Sentry.captureException(error);
  }

  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
