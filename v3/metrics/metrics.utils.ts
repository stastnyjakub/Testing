import { Moment } from 'moment';

import { timestamp } from '@/utils';

/**
 * This filter only returns commissions that could be considered completed, we need to check the last discharge date
 * @param startDate - unix timestamp in seconds
 * @param endDate - unix timestamp in seconds
 * @returns - filter object
 */
export const getCompletedCommissionFilter = (startDate: Moment, endDate: Moment) => {
  return {
    commissiondischarge: {
      some: {
        date: {
          // We need to multiply the date by 1000 because the date is in seconds and in the database it is in milliseconds
          gte: startDate.unix() * 1000,
          lte: endDate.unix() * 1000,
        },
      },
    },
  };
};

/**
 * Completed commissions are those with last discharge date between the start and end date
 * @param commissions - array of commissions to be filtered
 * @param startDate - moment instance
 * @param endDate - moment instance
 * @returns - array of commissions that have been completed between the start and end date
 */
export const filterCompletedCommissions = <
  T extends {
    commissiondischarge: {
      date: number | bigint;
    }[];
  },
>(
  commissions: T[],
  startDate: Moment,
  endDate: Moment,
): T[] => {
  return commissions.filter(({ commissiondischarge }) => {
    if (!commissiondischarge.length) {
      return false;
    }
    const lastDischarge = commissiondischarge.sort((a, b) => Number(b.date) - Number(a.date))[0];
    const lastDischargeDate = timestamp(Number(lastDischarge.date));
    if (lastDischargeDate === null) {
      return false;
    }
    return lastDischargeDate.isBetween(startDate, endDate, 'days', '[]');
  });
};

export const prepareCommissionsForCompletionFiltering = <
  T extends {
    commissiondischarge: {
      date: number | bigint | null | undefined;
    }[];
  },
>(
  commissions: T[],
): (Omit<T, 'commissiondischarge'> & { commissiondischarge: { date: number }[] })[] => {
  return commissions.map(({ commissiondischarge, ...commision }) => ({
    ...commision,
    commissiondischarge: commissiondischarge.map(({ date, ...discharge }) => ({
      ...discharge,
      date: Number(date),
    })),
  }));
};
