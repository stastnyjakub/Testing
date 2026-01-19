import * as Sentry from '@sentry/node';

import { calculateCommissionCosts, calculateCommissionPrice } from '@/commission/commission.utils';
import prisma from '@/db/client';
import { AsyncReturnType, ECurrency } from '@/types';

import {
  filterCompletedCommissions,
  getCompletedCommissionFilter,
  prepareCommissionsForCompletionFiltering,
} from '../metrics.utils';
import { TGetCommissionsMetrics } from '../types';

export const getCommissionsMetrics = async (
  args: TGetCommissionsMetrics,
): Promise<{
  completed: number | null;
  new: number | null;
  canceled: number | null;

  revenue: number | null;
  costs: number | null;
  profit: number | null;

  avgRevenue: number | null;
  avgCosts: number | null;
  avgProfit: number | null;
  avgMarginPercent: number | null;

  avgRevenueForOneLoadingMeter: number | null;
  avgCostsForOneLoadingMeter: number | null;
  avgProfitForOneLoadingMeter: number | null;
}> => {
  const results: AsyncReturnType<typeof getCommissionsMetrics> = {
    completed: null,
    new: null,
    canceled: null,

    revenue: null,
    costs: null,
    profit: null,

    avgRevenue: null,
    avgCosts: null,
    avgProfit: null,
    avgMarginPercent: null,

    avgRevenueForOneLoadingMeter: null,
    avgCostsForOneLoadingMeter: null,
    avgProfitForOneLoadingMeter: null,
  };

  try {
    const newCommissionsCount = await getNewCommissionsCount(args);
    results.new = newCommissionsCount;

    const completedCommissionsCount = await getCompletedCommissionsCount(args);
    results.completed = completedCommissionsCount;

    const canceledCommissionsCount = await getCanceledCommissionsCount(args);
    results.canceled = canceledCommissionsCount;

    const filteredCommissions = await getFilteredCommissions(args);
    if (filteredCommissions.length === 0) {
      return results;
    }

    const revenue = filteredCommissions.reduce<number>((prev, { price }) => prev + price, 0);
    results.revenue = revenue;

    const costs = filteredCommissions.reduce<number>((prev, { costs }) => prev + costs, 0);
    results.costs = costs;

    const profit = revenue - costs;
    results.profit = profit;

    const avgRevenue = revenue / filteredCommissions.length;
    results.avgRevenue = avgRevenue;

    const avgCosts = costs / filteredCommissions.length;
    results.avgCosts = avgCosts;
    const avgProfit = profit / filteredCommissions.length;
    results.avgProfit = avgProfit;

    // If profit is zero, margin is zero as well
    if (avgRevenue > 0) {
      const avgMarginPercent = (avgProfit / avgRevenue) * 100;
      results.avgMarginPercent = avgMarginPercent;
    } else {
      results.avgMarginPercent = 0;
    }

    // We need to filter out the commissions that don't have loading meters and therefore don't have a price per loading meter
    const commissionsWithValidLoadingMeters = filteredCommissions.filter(
      ({ pricePerLoadingMeter }) => pricePerLoadingMeter,
    );
    if (commissionsWithValidLoadingMeters.length > 0) {
      const avgLoadingMeters =
        commissionsWithValidLoadingMeters.reduce<number>((prev, { loadingMeters }) => prev + loadingMeters, 0) /
        commissionsWithValidLoadingMeters.length;

      const avgRevenueForOneLoadingMeter = avgRevenue / avgLoadingMeters;
      results.avgRevenueForOneLoadingMeter = avgRevenueForOneLoadingMeter;

      const avgCostsForOneLoadingMeter = avgCosts / avgLoadingMeters;
      results.avgCostsForOneLoadingMeter = avgCostsForOneLoadingMeter;

      const avgProfitForOneLoadingMeter = avgProfit / avgLoadingMeters;
      results.avgProfitForOneLoadingMeter = avgProfitForOneLoadingMeter;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  return results;
};

const getFilteredCommissions = async ({
  startDate,
  endDate,
  carrierId,
  customerId,
  userId,
}: TGetCommissionsMetrics) => {
  const considerableCommissions = await prisma.commission.findMany({
    where: {
      ...getCompletedCommissionFilter(startDate, endDate),
      carrier_id: carrierId,
      customer_id: customerId,
      addedBy_id: userId,
      deleted: false,
    },
    select: {
      commission_id: true,

      priceCustomer: true,
      currencyCustomer: true,
      exchangeRateCustomer: true,

      priceCarrier: true,
      currencyCarrier: true,
      exchangeRateCarrier: true,

      commissionitem: {
        select: {
          loadingMeters: true,
        },
      },
      commissiondischarge: {
        select: {
          date: true,
        },
      },
    },
  });
  const considerableCommissionsTransformed = considerableCommissions.map(({ commissiondischarge, ...commision }) => ({
    ...commision,
    commissiondischarge: commissiondischarge.map(({ date, ...discharge }) => ({
      ...discharge,
      date: Number(date),
    })),
  }));

  const filteredCommissions = filterCompletedCommissions(considerableCommissionsTransformed, startDate, endDate);

  const commissionsWithPrice = filteredCommissions.map((commission) => {
    const priceCustomerNumber = Number(commission.priceCustomer);
    const exchangeRateCustomerNumber = Number(commission.exchangeRateCustomer);
    const currencyCustomer = commission.currencyCustomer as ECurrency;

    return {
      ...commission,
      price: calculateCommissionPrice({
        customerPrice: priceCustomerNumber,
        customerCurrency: currencyCustomer,
        exchangeRateCustomer: exchangeRateCustomerNumber,
      }).withoutVat,
    };
  });

  const commissionsWithCosts = commissionsWithPrice.map((commission) => {
    const priceCarrierNumber = Number(commission.priceCarrier);
    const exchangeRateCarrierNumber = Number(commission.exchangeRateCarrier);
    const currencyCarrier = commission.currencyCarrier as ECurrency;

    return {
      ...commission,
      costs: calculateCommissionCosts({
        carrierPrice: priceCarrierNumber,
        carrierCurrency: currencyCarrier,
        exchangeRateCarrier: exchangeRateCarrierNumber,
      }).withoutVat,
    };
  });

  const commissionsWithLoadingMeters = commissionsWithCosts.map((commission) => {
    const totalLoadingMeters = commission.commissionitem.reduce<number>((prev, { loadingMeters }) => {
      if (!loadingMeters) {
        return prev;
      }
      return prev + Number(loadingMeters);
    }, 0);
    return {
      ...commission,
      loadingMeters: totalLoadingMeters,
      pricePerLoadingMeter: totalLoadingMeters ? commission.price / totalLoadingMeters : null,
    };
  });

  return commissionsWithLoadingMeters;
};

const getNewCommissionsCount = async ({
  startDate,
  endDate,
  carrierId,
  customerId,
  userId,
}: TGetCommissionsMetrics) => {
  const newCommissionsCount = await prisma.commission.aggregate({
    _count: {
      commission_id: true,
    },
    where: {
      deleted: false,
      orderDate: {
        // We need to multiply the date by 1000 because the date is in seconds and in the database it is in milliseconds
        gte: startDate.unix() * 1000,
        lte: endDate.unix() * 1000,
      },
      carrier_id: carrierId,
      customer_id: customerId,
      addedBy_id: userId,
    },
  });
  return newCommissionsCount._count.commission_id;
};

const getCompletedCommissionsCount = async ({
  startDate,
  endDate,
  carrierId,
  customerId,
  userId,
}: TGetCommissionsMetrics) => {
  const considerableCommissions = await prisma.commission.findMany({
    select: {
      commission_id: true,
      commissiondischarge: {
        select: {
          date: true,
        },
      },
    },
    where: {
      ...getCompletedCommissionFilter(startDate, endDate),
      carrier_id: carrierId,
      customer_id: customerId,
      addedBy_id: userId,
      deleted: false,
    },
  });
  const considerableCommissionsTransformed = prepareCommissionsForCompletionFiltering(considerableCommissions);

  const completedCommissions = filterCompletedCommissions(considerableCommissionsTransformed, startDate, endDate);
  return completedCommissions.length;
};

const getCanceledCommissionsCount = async ({
  startDate,
  endDate,
  carrierId,
  customerId,
  userId,
}: TGetCommissionsMetrics) => {
  const canceledCommissionsCount = await prisma.commission.aggregate({
    _count: {
      commission_id: true,
    },
    where: {
      deleted: true,
      tsDeleted: {
        gte: startDate.unix(),
        lte: endDate.unix(),
      },
      carrier_id: carrierId,
      customer_id: customerId,
      addedBy_id: userId,
    },
  });
  return canceledCommissionsCount._count.commission_id;
};
