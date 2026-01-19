import * as Sentry from '@sentry/node';

import { calculateCommissionPrice } from '@/commission/commission.utils';
import prisma from '@/db/client';
import { AsyncReturnType, ECurrency } from '@/types';
import { getUserSelect } from '@/user/user.utils';
import { groupBy } from '@/utils';

import {
  filterCompletedCommissions,
  getCompletedCommissionFilter,
  prepareCommissionsForCompletionFiltering,
} from '../metrics.utils';
import { TGetEmployeesMetricsArgs } from '../types';

export const getEmployeesMetrics = async ({
  startDate,
  endDate,
}: TGetEmployeesMetricsArgs): Promise<
  {
    userId: number;
    userName: string;
    userSurname: string;

    revenue: number | null;
    completedCommissions: number | null;
    processedCustomers: number | null;
    canceledCommissions: number | null;
    avgCarriersAssignedPerDay: number | null;
  }[]
> => {
  const results: AsyncReturnType<typeof getEmployeesMetrics> = [];

  try {
    const completedCommissionsWithPrice = await getFilteredCommissions({ startDate, endDate });
    const commissionsGroupedByEmployee = groupBy(completedCommissionsWithPrice, 'addedBy_id');

    if (Object.keys(commissionsGroupedByEmployee).length === 0) {
      return results;
    }

    for (const [_, commissions] of Object.entries(commissionsGroupedByEmployee)) {
      const user = commissions[0].addedBy;
      if (!user) {
        continue;
      }

      const revenue = commissions.reduce<number>((prev, { price }) => prev + price.withoutVat, 0);
      const completedCommissions = commissions.length;
      const processedCustomers = new Set(commissions.map(({ customer_id }) => customer_id)).size;
      const avgCarriersAssignedPerDay = commissions.length / endDate.diff(startDate, 'days');
      const canceledCommissions = await prisma.commission.count({
        where: {
          addedBy_id: user.user_id,
          deleted: true,
          tsDeleted: {
            gte: startDate.unix(),
            lte: endDate.unix(),
          },
        },
      });

      const roundedAvgCarriersAssignedPerDay = avgCarriersAssignedPerDay;

      results.push({
        completedCommissions,
        processedCustomers,
        canceledCommissions,
        userId: user.user_id,
        userName: user.name,
        userSurname: user.surname,
        revenue: revenue,
        avgCarriersAssignedPerDay: roundedAvgCarriersAssignedPerDay,
      });
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  return results;
};

const getFilteredCommissions = async ({ startDate, endDate }: TGetEmployeesMetricsArgs) => {
  const considerableCommissions = await prisma.commission.findMany({
    select: {
      commission_id: true,
      priceCustomer: true,
      exchangeRateCustomer: true,
      currencyCustomer: true,
      addedBy_id: true,
      customer_id: true,
      addedBy: {
        select: getUserSelect(),
      },
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
  const completedCommissionsWithPrice = completedCommissions.map((commission) => {
    return {
      ...commission,
      price: calculateCommissionPrice({
        customerPrice: Number(commission.priceCustomer),
        customerCurrency: commission.currencyCustomer as ECurrency,
        exchangeRateCustomer: Number(commission.exchangeRateCustomer),
      }),
    };
  });
  return completedCommissionsWithPrice;
};
