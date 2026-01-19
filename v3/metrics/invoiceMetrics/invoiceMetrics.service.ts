import * as Sentry from '@sentry/node';
import moment from 'moment';

import { calculateCommissionPrice } from '@/commission/commission.utils';
import prisma from '@/db/client';
import { AsyncReturnType, ECurrency } from '@/types';
import { timestamp } from '@/utils';

import { TGetInvoiceMetricsArgs } from '../types';

export const getInvoiceMetrics = async (
  args: TGetInvoiceMetricsArgs,
): Promise<{
  total: number | null;
  paid: number | null;
  unpaidInDueDate: number | null;
  unpaidPastDueDate: number | null;
}> => {
  const results: AsyncReturnType<typeof getInvoiceMetrics> = {
    total: null,
    paid: null,
    unpaidInDueDate: null,
    unpaidPastDueDate: null,
  };

  try {
    const filteredInvoices = await getFilteredInvoices(args);

    const allInvoicesPrice = filteredInvoices.reduce<number>((prev, { price }) => prev + price, 0);
    results.total = allInvoicesPrice;

    const paidInvoicesPrice = filteredInvoices.reduce<number>((prev, { price, paid }) => {
      if (paid) {
        return prev + price;
      }
      return prev;
    }, 0);
    results.paid = paidInvoicesPrice;

    const unpaidInvoicesInDueDatePrice = filteredInvoices.reduce<number>((prev, { price, paid, dueDate }) => {
      if (!paid && moment().isSameOrBefore(timestamp(Number(dueDate)))) {
        return prev + price;
      }
      return prev;
    }, 0);
    results.unpaidInDueDate = unpaidInvoicesInDueDatePrice;

    const unpaidInvoicesPastDueDatePrice = filteredInvoices.reduce<number>((prev, { price, paid, dueDate }) => {
      if (!paid && moment().isAfter(timestamp(Number(dueDate)))) {
        return prev + price;
      }
      return prev;
    }, 0);
    results.unpaidPastDueDate = unpaidInvoicesPastDueDatePrice;
  } catch (error) {
    Sentry.captureException(error);
  }

  return results;
};

const getFilteredInvoices = async ({ startDate, endDate, carrierId, customerId, userId }: TGetInvoiceMetricsArgs) => {
  const filteredInvoices = await prisma.invoice.findMany({
    where: {
      issueDate: {
        // We need to multiply the date by 1000 because the date is in seconds and in the database it is in milliseconds
        gte: startDate.unix() * 1000,
        lte: endDate.unix() * 1000,
      },
      commission: {
        some: {
          carrier_id: carrierId,
          customer_id: customerId,
          addedBy_id: userId,
          deleted: false,
        },
      },
    },
    select: {
      invoice_id: true,
      paid: true,
      issueDate: true,
      dueDate: true,
      commission: {
        select: {
          priceCustomer: true,
          currencyCustomer: true,
          exchangeRateCustomer: true,
        },
        where: {
          deleted: false,
        },
      },
    },
  });
  // Calculate the price of the invoice from commissions and add it to the invoice object
  const filteredInvoicesWithPrice = filteredInvoices.map((invoice) => {
    const invoicePrice = invoice.commission.reduce<number>(
      (prev, { currencyCustomer, exchangeRateCustomer, priceCustomer }) => {
        const priceCustomerNumber = Number(priceCustomer);
        const exchangeRateCustomerNumber = Number(exchangeRateCustomer);

        if (!priceCustomerNumber) return prev;
        return (
          prev +
          calculateCommissionPrice({
            customerPrice: priceCustomerNumber,
            customerCurrency: currencyCustomer as ECurrency,
            exchangeRateCustomer: exchangeRateCustomerNumber,
          }).withoutVat
        );
      },
      0,
    );

    return {
      ...invoice,
      price: invoicePrice,
    };
  });
  return filteredInvoicesWithPrice;
};
