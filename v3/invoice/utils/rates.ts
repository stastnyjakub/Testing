import axios, { AxiosResponse } from 'axios';
import moment from 'moment';

import env from '@/env';

import prisma from '../../db/client';
import { DataFixerResponse } from '../invoice.interface';

enum RATE_CALLBACK_VALUE {
  EUR = 24,
}

export const getRate = async (date: string, currency: string): Promise<number> => {
  if (currency === 'CZK') return 1;
  const issueDate = convertToDate(String(date));

  // Check if rate is already cached
  const cachedRate = await prisma.rate_history.findFirst({
    where: {
      base: currency,
      date: issueDate.format('YYYY-MM-DD'),
    },
  });
  if (cachedRate) {
    return Number(cachedRate.value);
  }

  // Fetch rate from fixer.io
  const { data }: AxiosResponse<DataFixerResponse> = await axios.get(
    `http://data.fixer.io/api/${
      issueDate.toISOString().split('T')[0]
    }?access_key=${env().DATA_FIXER_API_KEY}&base=${currency}&symbols=CZK`,
  );

  // If fixer.io succeeds, cache the rate and return the value
  if (data.success) {
    const createdRateHistory = await prisma.rate_history.create({
      data: {
        base: currency,
        target: 'CZK',
        value: data.rates.CZK as number,
        date: issueDate.format('YYYY-MM-DD'),
        timestamp: issueDate.unix(),
      },
    });
    return Number(createdRateHistory.value);
  }

  // If fixer.io fails, return fallback value if available
  const latestCache = await prisma.rate_history.findFirst({
    where: {
      base: currency,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
  if (latestCache) {
    return Number(latestCache.value);
  }

  // If no cache is available, return fallback value
  return RATE_CALLBACK_VALUE?.[currency as keyof typeof RATE_CALLBACK_VALUE]
    ? RATE_CALLBACK_VALUE[currency as keyof typeof RATE_CALLBACK_VALUE]
    : RATE_CALLBACK_VALUE.EUR;
};

export const convertToDate = (date: string) => {
  if (Number.isNaN(Number(date))) {
    const splitDate = date.toString().split('.');
    date = (moment(`${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`).unix() * 1000).toString();
  }
  return moment.unix(Math.floor(Number(date) / 1000));
};
