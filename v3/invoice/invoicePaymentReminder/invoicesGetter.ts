import moment from 'moment';

import prisma from '@/db/client';
import { ECurrency } from '@/types';

import { EPaymentStatus } from '../types';
import { calculateTotalPriceInCZKForInvoice } from '../utils/calculateTotalPriceForInvoice';

import { MIN_UNPAID_INVOICE_DUE_DATE } from './invoicePaymentReminder.constants';

export const getUnpaidInvoicesAfterDueDate = async () => {
  const unpaidInvoices = await prisma.invoice.findMany({
    select: {
      invoice_id: true,
      dueDate: true,
      issueDate: true,
      invoiceNumber: true,
      paymentReminderCount: true,
      commission: {
        select: {
          commission_id: true,
          customer_id: true,
          customer: {
            select: {
              customer_id: true,
              billingEmail: true,
              countryCode: true,
            },
          },
          exchangeRateCustomer: true,
          currencyCustomer: true,
          priceCustomer: true,
          vat: true,
        },
      },
    },
    where: {
      // we need to check both paymentStatus and paid attribute,
      // because invoice can be manually marked as paid but paymentStatus can be still UNPAID
      paymentStatus: EPaymentStatus.UNPAID,
      paid: false,

      // we only want to check invoices with CZK currency
      // Foreign currency invoices are currently not tracked
      commission: {
        some: {
          currencyCustomer: ECurrency.CZK,
        },
      },

      // if the invoice is already notified 2 times, we don't want to notify again
      paymentReminderCount: {
        lt: 2,
      },
      dueDate: {
        gt: MIN_UNPAID_INVOICE_DUE_DATE,
        lt: moment().startOf('day').unix() * 1000, // Convert to milliseconds
      },
    },
  });
  const unpaidInvoicesWithPrice = unpaidInvoices.map((invoice) => {
    // Add total price to invoice
    const invoicePrice = calculateTotalPriceInCZKForInvoice({
      commissions: invoice.commission.map((commission) => ({
        ...commission,
        priceCustomer: Number(commission.priceCustomer),
        exchangeRateCustomer: Number(commission.exchangeRateCustomer),
        vat: Number(commission.vat),
        currencyCustomer: commission.currencyCustomer as ECurrency,
      })),
    });

    return {
      ...invoice,
      price: invoicePrice,
    };
  });
  return unpaidInvoicesWithPrice;
};
