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
import { TGetCarrierMetricsArgs } from '../types';

export const getCarrierMetrics = async ({
  startDate,
  endDate,
}: TGetCarrierMetricsArgs): Promise<{
  new: number | null;
  active: number | null;
  avgCommissionCount: number | null;
  medianCommissionCount: number | null;
}> => {
  const results: AsyncReturnType<typeof getCarrierMetrics> = {
    new: null,
    active: null,
    avgCommissionCount: null,
    medianCommissionCount: null,
  };

  try {
    const newCarriers = await prisma.carrier.aggregate({
      _count: true,
      where: {
        tsAdded: {
          // We need to multiply the date by 1000 because the date is in seconds and in the database it is in milliseconds
          gte: startDate ? startDate.unix() * 1000 : undefined,
          lte: endDate ? endDate.unix() * 1000 : undefined,
        },
      },
    });
    results.new = newCarriers._count;

    const groupedCommissions = await getCompletedCommissionsGroupedByCarrier({ startDate, endDate });
    results.active = Object.keys(groupedCommissions).length;

    if (Object.keys(groupedCommissions).length > 0) {
      // Get array of commission counts per carrier
      const commissionCountPerCarrier = Object.values(groupedCommissions).map((commissions) => commissions.length);

      // Sum of all commission counts and divide by the number of carriers to get the average
      const avgCommissionCountForCarrier =
        commissionCountPerCarrier.reduce((prev, count) => prev + count, 0) / commissionCountPerCarrier.length;
      results.avgCommissionCount = avgCommissionCountForCarrier;

      const medianCommissionCountForCarrier = getMedian(commissionCountPerCarrier.sort((a, b) => a - b));
      results.medianCommissionCount = medianCommissionCountForCarrier;
    } else {
      results.avgCommissionCount = 0;
      results.medianCommissionCount = 0;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  return results;
};

export const getCompletedCommissionsGroupedByCarrier = async ({ startDate, endDate }: TGetCarrierMetricsArgs) => {
  const considerableCommissions = await prisma.commission.findMany({
    select: {
      carrier_id: true,
      commission_id: true,
      commissiondischarge: {
        select: {
          date: true,
        },
      },
    },
    where: {
      ...getCompletedCommissionFilter(startDate, endDate),
      deleted: false,
    },
  });
  const considerableCommissionsTransformed = prepareCommissionsForCompletionFiltering(considerableCommissions);

  const completedCommissions = filterCompletedCommissions(considerableCommissionsTransformed, startDate, endDate);
  const groupedCommissions = groupBy(completedCommissions, 'carrier_id');

  return groupedCommissions;
};
