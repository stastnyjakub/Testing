import prisma from '@/db/client';

import { TGetInvoicesWithoutPaymentConfirmationByNumbersArgs } from '../types';

export const getInvoicesWithoutPaymentConfirmationByNumbers = async ({
  invoiceNumbers,
}: TGetInvoicesWithoutPaymentConfirmationByNumbersArgs) => {
  const invoices = await prisma.invoice.findMany({
    select: {
      invoice_id: true,
      invoiceNumber: true,
    },
    where: {
      invoiceNumber: {
        in: invoiceNumbers,
      },
      paymentConfirmationDate: null,
    },
  });

  return invoices;
};
