import * as Sentry from '@sentry/node';

import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import { EPaymentStatus, TProcessInvoicePaymentUpdateArgs } from '@/invoice/types';

import { notifyAdminsAboutNotMatchingPayment } from './emailNotification';
import { getTotalPriceFromInvoiceCommissions } from './invoicePayments.utils';

export const processInvoicePaymentUpdate = async ({
  incomeTransaction,
  invoiceId,
}: TProcessInvoicePaymentUpdateArgs) => {
  const invoice = await prisma.invoice.findUnique({
    where: { invoice_id: invoiceId },
    select: {
      invoiceNumber: true,
      commission: true,
    },
  });
  if (!invoice) throw new NotFoundException(Entity.INVOICE);

  // Calculate total price for the invoice based on assigned commissions
  const { withVat: totalPriceWithVat } = getTotalPriceFromInvoiceCommissions(invoice.commission);

  const invoicePaymentStatus = (() => {
    if (incomeTransaction.amount === totalPriceWithVat) return EPaymentStatus.PAID;
    if (incomeTransaction.amount < totalPriceWithVat) return EPaymentStatus.UNDERPAID;
    if (incomeTransaction.amount > totalPriceWithVat) return EPaymentStatus.OVERPAID;
    return EPaymentStatus.UNPAID;
  })();

  // Check if the invoice has been fully paid, if not, notify the admins
  if (invoicePaymentStatus !== EPaymentStatus.PAID) {
    notifyAdminsAboutNotMatchingPayment({
      invoiceId: invoiceId,
      invoiceNumber: Number(invoice.invoiceNumber),
    }).catch((error) => {
      Sentry.captureException(error);
    });
  }

  await prisma.invoice.update({
    where: { invoice_id: invoiceId },
    data: {
      paid: [EPaymentStatus.OVERPAID, EPaymentStatus.PAID].includes(invoicePaymentStatus),
      paymentStatus: invoicePaymentStatus,
      paidAmount: incomeTransaction.amount,
      paymentConfirmationDate: incomeTransaction.date.unix(),
    },
  });
};
