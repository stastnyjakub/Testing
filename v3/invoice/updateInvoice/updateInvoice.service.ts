import { commission, invoice, Prisma } from '@prisma/client';

import { Entity, NotFoundException } from '@/errors';
import { performTransaction } from '@/utils';

import { findOneInvoice } from '../invoice.service';

export type TUpdateInvoiceArgs = {
  invoiceId: number;
  invoice: Prisma.invoiceUpdateInput;
  commission?: commission[];
  transactionClient?: Prisma.TransactionClient;
};
export const updateInvoice = async ({
  invoice,
  invoiceId,
  commission,
  transactionClient,
}: TUpdateInvoiceArgs): Promise<invoice> => {
  const commissionsIds = commission?.map(({ commission_id }) => ({
    commission_id,
  }));

  const existingInvoice = await findOneInvoice(invoiceId);
  if (!existingInvoice) throw new NotFoundException(Entity.INVOICE);

  const updatedInvoice = await performTransaction(
    async (transactionClient) => {
      const updatedInvoice = await transactionClient.invoice.update({
        where: { invoice_id: invoiceId },
        data: {
          ...invoice,
          commission: {
            set: commissionsIds,
          },
        },
        include: {
          commission: true,
        },
      });

      const commissionUpdatePromises = commission?.map(async ({ commission_id, vat }) => {
        return transactionClient.commission.update({
          where: { commission_id },
          data: {
            vat,
          },
        });
      });
      commissionUpdatePromises && (await Promise.all(commissionUpdatePromises));

      return updatedInvoice;
    },
    undefined,
    transactionClient,
  );

  return updatedInvoice;
};
