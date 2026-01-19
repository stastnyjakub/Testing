import * as Sentry from '@sentry/node';
import axios from 'axios';

import env from '@/env';
import { is2xx } from '@/utils';

import { TFioBankTransaction, TGetAccountTransactionsArgs, TGetAccountTransactionsResponseBody } from './types';

export class FioBankFacade {
  private readonly API_TOKEN = env().FIO_BANK_API_KEY;
  private readonly MAX_RECORD_AGE_IN_DAYS = 90;

  public async getAccountTransactions({
    dateFrom,
    dateTo,
    format,
  }: TGetAccountTransactionsArgs): Promise<TFioBankTransaction[]> {
    if (dateTo.isBefore(dateFrom)) {
      throw new Error('Date from must be before date to');
    }
    if (dateFrom.isSameOrBefore(dateTo.clone().subtract(this.MAX_RECORD_AGE_IN_DAYS, 'days'))) {
      throw new Error('Date from must be within the last 90 days');
    }

    const url = `https://fioapi.fio.cz/v1/rest/periods/${this.API_TOKEN}/${this.formatDate(
      dateFrom,
    )}/${this.formatDate(dateTo)}/transactions.${format.toLowerCase()}`;

    const response = await axios.request({
      method: 'GET',
      url: url,
    });

    const responseStatusToErrorMessage = {
      404: 'Invalid URL structure',
      409: 'Too many requests',
      422: 'Invalid date range',
      413: 'Too many records to download',
      500: 'Non active/existing token',
    } as Record<number, string>;

    if (is2xx(response.status)) {
      return (response.data as TGetAccountTransactionsResponseBody).accountStatement.transactionList.transaction;
    }

    // Handle known errors
    if (responseStatusToErrorMessage[response.status]) {
      const error = new Error(responseStatusToErrorMessage[response.status], { cause: response });
      Sentry.captureException(error);
      throw error;
    }

    // Handle unknown errors
    const error = new Error('Unknown FIO bank API error', { cause: response });
    Sentry.captureException(error);
    throw error;
  }

  // Format date according to FIO API requirements
  private formatDate(date: moment.Moment): string {
    return date.format('YYYY-MM-DD');
  }
}
