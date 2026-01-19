import { CloudTasksClient } from '@google-cloud/tasks';
import * as Sentry from '@sentry/node';
import moment from 'moment';

import { BankService } from '@/bank/bank.service';
import { routes } from '@/config/routes';
import env from '@/env';
import { loggerService } from '@/logging/logging.service';

import { processGroupedInvoicePayment } from './groupedPaymentProcessor';
import { processInvoicePaymentUpdate } from './inovicePaymentProcessor';
import { extractVariableSymbolsFromTransactions, groupInvoicesWithTransactions } from './invoicePayments.utils';
import { getInvoicesWithoutPaymentConfirmationByNumbers } from './invoicesGetter';

// In summary, this function checks income transactions from bank accounts and updates invoices based on the transactions.
// It pairs invoices by variableSymbol with income transactions and updates the invoices.
export const checkIncomeTransactionsAndUpdatePaidInvoices = async () => {
  // Get all income transactions for given interval from all bank accounts
  const incomeTransactions = await BankService.getIncomeTransactions({
    dateFrom: moment().subtract(2, 'months'),
    dateTo: moment(),
  });
  if (incomeTransactions.length === 0) {
    return [];
  }

  // Get all variable symbols from income transactions
  // variableSymbol is a number, but it can be null so we need to filter it out
  const variableSymbols = extractVariableSymbolsFromTransactions(incomeTransactions);

  const invoices = await getInvoicesWithoutPaymentConfirmationByNumbers({
    invoiceNumbers: variableSymbols,
  });

  // Pair invoices by variableSymbol with income transactions
  // Update the invoices based on the income transactions
  const groupedInvoices = groupInvoicesWithTransactions(invoices, incomeTransactions);

  const invoiceUpdatePromises = groupedInvoices.map(async ({ transaction, invoices }) => {
    if (invoices.length > 1) {
      return processGroupedInvoicePayment({
        incomeTransaction: transaction,
        invoiceIds: invoices.map(({ invoice_id }) => invoice_id),
      });
    }

    const { invoice_id } = invoices[0];
    return processInvoicePaymentUpdate({
      incomeTransaction: transaction,
      invoiceId: invoice_id,
    });
  });

  const results = await Promise.allSettled(invoiceUpdatePromises);

  // Capture exceptions for rejected promises
  for (const result of results) {
    if (result.status === 'rejected') {
      Sentry.captureException(result.reason);
    }
  }

  return results;
};

export const queueInvoicePaymentsJob = async () => {
  if (env().SERVER_URL.includes('localhost')) {
    loggerService.info(`Skipping Google Cloud Tasks queue for 'localhost' environment. Invoice Payments Job`);
    return;
  }

  const tasksClient = new CloudTasksClient();
  const parent = tasksClient.queuePath(env().GCLOUD_PROJECT_ID, 'europe-west3', 'invoice-payments');
  const [response] = await tasksClient.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: 'POST',
        url: `${env().SERVER_URL}${routes.v3.job.invoicePayments}`,
        headers: {
          'x-api-key': env().JOB_API_KEY,
        },
      },
    },
  });
  return response;
};
