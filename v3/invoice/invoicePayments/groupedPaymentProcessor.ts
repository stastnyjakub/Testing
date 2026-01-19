import prisma from '@/db/client';
import { EPaymentStatus, TProcessGroupedInvoicePaymentArgs } from '@/invoice/types';

import { notifyAdminsAboutGroupedPayment } from './emailNotification';
import { getTotalPriceFromInvoiceCommissions } from './invoicePayments.utils';

export const processGroupedInvoicePayment = async ({
  incomeTransaction,
  invoiceIds,
}: TProcessGroupedInvoicePaymentArgs) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      invoice_id: {
        in: invoiceIds,
      },
    },
    select: {
      invoiceNumber: true,
      invoice_id: true,
      commission: true,
    },
  });

  const invoicesWithPrice = invoices.map((invoice) => {
    const price = getTotalPriceFromInvoiceCommissions(invoice.commission);
    return {
      ...invoice,
      invoicePrice: price,
    };
  });

  const totalPriceWithVat = invoicesWithPrice.reduce((acc, invoice) => {
    return acc + invoice.invoicePrice.withVat;
  }, 0);

  const invoicePaymentStatus = (() => {
    if (incomeTransaction.amount === totalPriceWithVat) return EPaymentStatus.PAID;
    if (incomeTransaction.amount < totalPriceWithVat) return EPaymentStatus.UNDERPAID;
    if (incomeTransaction.amount > totalPriceWithVat) return EPaymentStatus.OVERPAID;
    return EPaymentStatus.UNPAID;
  })();

  // If grouped payment fully covers all invoices, mark them as paid
  if (invoicePaymentStatus === EPaymentStatus.PAID) {
    for (const invoice of invoicesWithPrice) {
      await prisma.invoice.update({
        where: { invoice_id: invoice.invoice_id },
        data: {
          paid: true,
          paymentStatus: invoicePaymentStatus,
          paidAmount: invoice.invoicePrice.withVat,
          paymentConfirmationDate: incomeTransaction.date.unix(),
        },
      });
    }
    return;
  }

  await notifyAdminsAboutGroupedPayment({
    invoices,
    transaction: incomeTransaction,
  });

  // Update payment confirmation date for all invoices
  // Grouped payments require manual confirmation so we don't update payment status
  await prisma.invoice.updateMany({
    where: { invoice_id: { in: invoiceIds } },
    data: {
      paymentConfirmationDate: incomeTransaction.date.unix(),
    },
  });
};
