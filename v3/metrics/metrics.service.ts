export * from './carrierMetrics/carrierMetrics.service';
export * from './commissionMetrics/commissionMetrics.service';
export * from './customerMetrics/customerMetrics.service';
export * from './invoiceMetrics/invoiceMetrics.service';

import { omitObjectValues, timestamp } from '@/utils';

import { getCarrierMetrics } from './carrierMetrics/carrierMetrics.service';
import { getCustomerMetrics } from './customerMetrics/customerMetrics.service';
import { getEmployeesMetrics } from './employeeMetrics/employeeMetrics.service';
import { getTrendMetrics } from './trendMetrics/trendMetrics.service';
import { getInvoiceMetrics } from './metrics.service';
import { getCommissionsMetrics } from './metrics.service';
import { TGetMetricsForAdmin, TGetMetricsForEmployee, TGetMetricsQuery } from './types';

export const getMetrics = async ({ startDate, endDate, ...args }: TGetMetricsQuery) => {
  // Convert dates to unix timestamps so it does not matter if the date is in seconds or milliseconds
  const startDateMoment = timestamp(startDate);
  const endDateMoment = timestamp(endDate);

  if (startDateMoment === null || endDateMoment === null) {
    throw new Error('Invalid startDate or endDate');
  }

  const extendedArgs = {
    ...args,
    startDate: startDateMoment,
    endDate: endDateMoment,
  };

  const carrierMetricsPromise = getCarrierMetrics(extendedArgs);
  const customerMetricsPromise = getCustomerMetrics(extendedArgs);
  const commissionMetricsPromise = getCommissionsMetrics(extendedArgs);
  const invoiceMetricsPromise = getInvoiceMetrics(extendedArgs);
  const employeeMetricsPromise = getEmployeesMetrics(extendedArgs);
  const trendMetricsPromise = getTrendMetrics(extendedArgs);

  const [carrierMetrics, customerMetrics, commissionMetrics, invoiceMetrics, employeeMetrics, trendMetrics] =
    await Promise.allSettled([
      carrierMetricsPromise,
      customerMetricsPromise,
      commissionMetricsPromise,
      invoiceMetricsPromise,
      employeeMetricsPromise,
      trendMetricsPromise,
    ]);

  return {
    carrier: carrierMetrics.status === 'fulfilled' ? carrierMetrics.value : null,
    customer: customerMetrics.status === 'fulfilled' ? customerMetrics.value : null,
    commission: commissionMetrics.status === 'fulfilled' ? commissionMetrics.value : null,
    invoice: invoiceMetrics.status === 'fulfilled' ? invoiceMetrics.value : null,
    employees: employeeMetrics.status === 'fulfilled' ? employeeMetrics.value : null,
    trends: trendMetrics.status === 'fulfilled' ? trendMetrics.value : null,
  };
};

export const getMetricForAdmin = async (args: TGetMetricsForAdmin) => {
  const metrics = await getMetrics(args);
  return metrics;
};

export const getMetricsForEmployee = async (args: TGetMetricsForEmployee) => {
  const metrics = await getMetrics(args);

  const {
    employees: _,
    carrier: carrierMetrics,
    commission: commissionMetrics,
    customer: customerMetrics,
    ...restMetrics
  } = metrics;

  // Remove metrics that are not meant for employees
  return {
    ...restMetrics,
    carrier: carrierMetrics && omitObjectValues(carrierMetrics, 'avgCommissionCount', 'medianCommissionCount'),
    commission:
      commissionMetrics &&
      omitObjectValues(
        commissionMetrics,
        'avgRevenue',
        'avgCosts',
        'avgProfit',
        'avgRevenueForOneLoadingMeter',
        'avgCostsForOneLoadingMeter',
        'avgProfitForOneLoadingMeter',
      ),
    customer: customerMetrics && omitObjectValues(customerMetrics, 'avgCommissionCount', 'medianCommissionCount'),
  };
};
