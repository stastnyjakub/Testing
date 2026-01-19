import { Moment } from 'moment';

import { TGetMetricsQuery } from './request';

export type TGetMetricsBaseArgs = {
  startDate: Moment;
  endDate: Moment;
};

export type TGetMetricsForEmployee = TGetMetricsQuery & {
  userId: number;
};
export type TGetMetricsForAdmin = TGetMetricsQuery;

export type TGetCommissionsMetrics = Omit<TGetMetricsQuery, 'startDate' | 'endDate'> & TGetMetricsBaseArgs;
export type TGetInvoiceMetricsArgs = Omit<TGetMetricsQuery, 'startDate' | 'endDate'> & TGetMetricsBaseArgs;
export type TGetTrendMetricsArgs = Omit<TGetMetricsQuery, 'startDate' | 'endDate'> & TGetMetricsBaseArgs;
export type TGetCarrierMetricsArgs = TGetMetricsBaseArgs;
export type TGetCustomerMetricsArgs = TGetMetricsBaseArgs;
export type TGetEmployeesMetricsArgs = TGetMetricsBaseArgs;
