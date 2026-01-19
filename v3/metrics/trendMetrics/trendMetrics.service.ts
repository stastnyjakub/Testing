import { calculateCommissionPrice } from '@/commission/commission.utils';
import prisma from '@/db/client';
import { ECurrency } from '@/types';
import { timestamp } from '@/utils';

import {
  filterCompletedCommissions,
  getCompletedCommissionFilter,
  prepareCommissionsForCompletionFiltering,
} from '../metrics.utils';
import { TGetTrendMetricsArgs } from '../types';

export const getTrendMetrics = async ({
  carrierId,
  customerId,
  userId,
  startDate: startDateArg,
}: TGetTrendMetricsArgs) => {
  // Get first and last day of the year
  const startDate = startDateArg.tz('Europe/Prague').startOf('year');
  const endDate = startDateArg.tz('Europe/Prague').endOf('year');

  const newCustomersPerMonth = await getNewCustomersPerMonth({ startDate, endDate });
  const newCarriersPerMonth = await getNewCarriersPerMonth({ startDate, endDate });
  const { completedCommissionsPerMonth, revenuePerMonth } = await getCommissionMetricsPerMonth({
    startDate,
    endDate,
    carrierId,
    customerId,
    userId,
  });

  return {
    revenuePerMonth: revenuePerMonth,
    completedCommissionsPerMonth: completedCommissionsPerMonth,
    newCustomersPerMonth: newCustomersPerMonth,
    newCarriersPerMonth: newCarriersPerMonth,
  };
};

const getNewCustomersPerMonth = async ({ startDate, endDate }: Pick<TGetTrendMetricsArgs, 'startDate' | 'endDate'>) => {
  const newCustomersPerMonth = new Map<
    string,
    {
      month: number;
      year: number;
      value: number;
    }
  >();
  const newCustomers = await prisma.customer.findMany({
    select: {
      customer_id: true,
      tsAdded: true,
    },
    where: {
      tsAdded: {
        gte: startDate.unix(),
        lte: endDate.unix(),
      },
    },
  });
  for (const customer of newCustomers) {
    const addedDate = timestamp(Number(customer.tsAdded));
    if (addedDate === null) continue;

    const month = addedDate.month();
    const year = addedDate.year();
    const key = `${month}-${year}`;

    if (!newCustomersPerMonth.has(key)) {
      newCustomersPerMonth.set(key, {
        month,
        year,
        value: 0,
      });
    }

    const monthData = newCustomersPerMonth.get(key);
    if (monthData) {
      monthData.value += 1;
      newCustomersPerMonth.set(key, monthData);
    }
  }

  return Array.from(newCustomersPerMonth.values());
};

const getNewCarriersPerMonth = async ({ startDate, endDate }: Pick<TGetTrendMetricsArgs, 'startDate' | 'endDate'>) => {
  const newCarriersPerMonth = new Map<
    string,
    {
      month: number;
      year: number;
      value: number;
    }
  >();

  const newCarriers = await prisma.carrier.findMany({
    select: {
      carrier_id: true,
      tsAdded: true,
    },
    where: {
      tsAdded: {
        // We need to multiply the date by 1000 because the date is in seconds and in the database it is in milliseconds
        gte: startDate.unix() * 1000,
        lte: endDate.unix() * 1000,
      },
    },
  });

  for (const carrier of newCarriers) {
    const addedDate = timestamp(Number(carrier.tsAdded));
    if (addedDate === null) continue;

    const month = addedDate.month();
    const year = addedDate.year();
    const key = `${month}-${year}`;

    if (!newCarriersPerMonth.has(key)) {
      newCarriersPerMonth.set(key, {
        month,
        year,
        value: 0,
      });
    }
    const monthData = newCarriersPerMonth.get(key);
    if (monthData) {
      monthData.value += 1;
      newCarriersPerMonth.set(key, monthData);
    }
  }

  return Array.from(newCarriersPerMonth.values());
};

const getCommissionMetricsPerMonth = async ({
  startDate,
  endDate,
  carrierId,
  customerId,
  userId,
}: TGetTrendMetricsArgs) => {
  const revenuePerMonth = new Map<
    string,
    {
      month: number;
      year: number;
      value: number;
    }
  >();
  const completedCommissionsPerMonth = new Map<
    string,
    {
      month: number;
      year: number;
      value: number;
    }
  >();

  const considerableCommissions = await prisma.commission.findMany({
    select: {
      commission_id: true,
      priceCustomer: true,
      exchangeRateCustomer: true,
      currencyCustomer: true,
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
  const processedCommissions = completedCommissions.map((commission) => {
    return {
      ...commission,
      lastDischargeDate: commission.commissiondischarge.sort((a, b) => Number(b.date) - Number(a.date))[0].date,
      price: calculateCommissionPrice({
        customerPrice: Number(commission.priceCustomer),
        customerCurrency: commission.currencyCustomer as ECurrency,
        exchangeRateCustomer: Number(commission.exchangeRateCustomer),
      }),
    };
  });

  for (const commission of processedCommissions) {
    const lastDischargeDate = timestamp(Number(commission.lastDischargeDate));
    if (lastDischargeDate === null) continue;
    const month = lastDischargeDate.month();
    const year = lastDischargeDate.year();
    const key = `${month}-${year}`;

    if (!revenuePerMonth.has(key)) {
      revenuePerMonth.set(key, {
        month,
        year,
        value: 0,
      });
    }

    const revenueMonthData = revenuePerMonth.get(key);
    if (revenueMonthData) {
      revenueMonthData.value += commission.price.withoutVat;
      revenuePerMonth.set(key, revenueMonthData);
    }

    if (!completedCommissionsPerMonth.has(key)) {
      completedCommissionsPerMonth.set(key, {
        month,
        year,
        value: 0,
      });
    }

    const completedMonthData = completedCommissionsPerMonth.get(key);
    if (completedMonthData) {
      completedMonthData.value += 1;
      completedCommissionsPerMonth.set(key, completedMonthData);
    }
  }

  return {
    revenuePerMonth: Array.from(revenuePerMonth.values()),
    completedCommissionsPerMonth: Array.from(completedCommissionsPerMonth.values()),
  };
};
