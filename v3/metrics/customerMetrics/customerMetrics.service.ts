import * as Sentry from '@sentry/node';

import prisma from '@/db/client';
import { AsyncReturnType } from '@/types';
import { groupBy } from '@/utils';
import { getMedian } from '@/utils/math';

import {
  filterCompletedCommissions,
  getCompletedCommissionFilter,
  prepareCommissionsForCompletionFiltering,
} from '../metrics.utils';
import { TGetCustomerMetricsArgs } from '../types';

export const getCustomerMetrics = async ({
  startDate,
  endDate,
}: TGetCustomerMetricsArgs): Promise<{
  new: number | null;
  active: number | null;
  avgCommissionCount: number | null;
  medianCommissionCount: number | null;
}> => {
  const results: AsyncReturnType<typeof getCustomerMetrics> = {
    new: null,
    active: null,
    avgCommissionCount: null,
    medianCommissionCount: null,
  };

  try {
    const newCustomers = await prisma.customer.aggregate({
      _count: true,
      where: {
        tsAdded: {
          gte: startDate.unix(),
          lte: endDate.unix(),
        },
      },
    });
    results.new = newCustomers._count;

    const groupedCommissions = await getCompletedCommissionsGroupedByCustomer({ startDate, endDate });
    results.active = Object.keys(groupedCommissions).length;

    if (Object.keys(groupedCommissions).length > 0) {
      // Get array of commission counts per customer
      const commissionCountPerCustomer = Object.values(groupedCommissions).map((commissions) => commissions.length);

      // Sum of all commission counts and divide by the number of customers to get the average
      const avgCommissionCountForCustomer =
        commissionCountPerCustomer.reduce((prev, count) => prev + count, 0) / commissionCountPerCustomer.length;
      results.avgCommissionCount = avgCommissionCountForCustomer;

      const medianCommissionCountForCustomer = getMedian(commissionCountPerCustomer.sort((a, b) => a - b));
      results.medianCommissionCount = medianCommissionCountForCustomer;
    } else {
      results.avgCommissionCount = 0;
      results.medianCommissionCount = 0;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  return results;
};

export const getCompletedCommissionsGroupedByCustomer = async ({ startDate, endDate }: TGetCustomerMetricsArgs) => {
  const considerableCommissions = await prisma.commission.findMany({
    select: {
      customer_id: true,
      commission_id: true,
      commissiondischarge: {
        select: {
          date: true,
        },
      },
    },
    where: {
      deleted: false,
      ...getCompletedCommissionFilter(startDate, endDate),
    },
  });
  const considerableCommissionsTransformed = prepareCommissionsForCompletionFiltering(considerableCommissions);

  const completedCommissions = filterCompletedCommissions(considerableCommissionsTransformed, startDate, endDate);
  const groupedCommissions = groupBy(completedCommissions, 'customer_id');

  return groupedCommissions;
};
