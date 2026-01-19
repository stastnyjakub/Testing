import moment from 'moment';

import { countryCodeToLanguageCode } from '@/carrier/carrier.interface';
import prisma from '@/db/client';
import { ECurrency, Lang } from '@/types';
import { ELanguageCallbackContext, getLanguageCallback, timestamp } from '@/utils';

import { sendInvoicePaymentRemindersToCustomers, TSendInvoicePaymentRemindersToCustomersArgs } from './emailReminder';
import { getUnpaidInvoicesAfterDueDate } from './invoicesGetter';

export const checkForUnpaidInvoices = async () => {
  const unpaidInvoices = await getUnpaidInvoicesAfterDueDate();
  const invoicesWithOverduePayments: TSendInvoicePaymentRemindersToCustomersArgs['invoices'] = [];

  for (const invoice of unpaidInvoices) {
    const { customer } = invoice.commission[0];
    if (!customer) continue;

    const { customer_id, billingEmail, countryCode } = customer;
    if (!customer_id || !billingEmail || !countryCode) continue;

    const dueDate = timestamp(Number(invoice.dueDate));
    const issueDate = timestamp(Number(invoice.issueDate));
    if (dueDate === null || issueDate === null) continue;

    const transformedInvoice: TSendInvoicePaymentRemindersToCustomersArgs['invoices'][number] = {
      customerId: customer_id,
      customerEmail: billingEmail,
      customerLang:
        (countryCodeToLanguageCode[countryCode as keyof typeof countryCodeToLanguageCode] as Lang) ||
        getLanguageCallback(ELanguageCallbackContext.MAILING),

      invoiceId: invoice.invoice_id,
      dueDate,
      issueDate,
      invoiceNumber: Number(invoice.invoiceNumber),
      price: invoice.price.withVat,
      currency: ECurrency.CZK,
      attempt: 'first',
    };

    // Second reminder is sent after 30 days
    // If the invoice is 30 days overdue and the reminder count is 1, we send the second reminder
    const oneMonthOverdueDate = transformedInvoice.dueDate.clone().add(1, 'month');
    if (moment().isAfter(oneMonthOverdueDate, 'days') && invoice.paymentReminderCount === 1) {
      invoicesWithOverduePayments.push({ ...transformedInvoice, attempt: 'repeated' });
      continue;
    }

    // First reminder is sent after 3 days
    // If the invoice is 3 days overdue and the reminder count is 0, we send the first reminder
    const threeDaysOverdueDate = transformedInvoice.dueDate.clone().add(3, 'days');
    if (moment().isAfter(threeDaysOverdueDate, 'days') && invoice.paymentReminderCount === 0) {
      invoicesWithOverduePayments.push({ ...transformedInvoice, attempt: 'first' });
      continue;
    }
  }
  if (invoicesWithOverduePayments.length) {
    await sendInvoicePaymentRemindersToCustomers({ invoices: invoicesWithOverduePayments });
  }
};

export const increaseInvoicePaymentReminderCount = async (invoiceId: number) => {
  await prisma.invoice.update({
    where: {
      invoice_id: invoiceId,
    },
    data: {
      paymentReminderCount: {
        increment: 1,
      },
    },
  });
};
