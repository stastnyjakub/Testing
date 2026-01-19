import { Prisma } from '@prisma/client';

import { TUpdateAttachmentData } from '../types';

export const getUpdatedAttachmentData = ({
  name,
  type,
  commissionId,
  invoiceId,
  sent,
}: Pick<TUpdateAttachmentData, 'name' | 'type' | 'commissionId' | 'invoiceId' | 'sent'>) => {
  const data: Prisma.AttachmentUpdateInput = {
    name,
    type,
    sent,
  };

  if (commissionId) {
    data.commission = {
      connect: {
        commission_id: commissionId,
      },
    };
  }
  if (invoiceId) {
    data.invoice = {
      connect: {
        invoice_id: invoiceId,
      },
    };
  }

  return data;
};
