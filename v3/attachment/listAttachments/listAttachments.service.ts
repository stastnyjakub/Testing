import { Prisma } from '@prisma/client';

import prisma from '@/db/client';
import * as invoiceService from '@/invoice/invoice.service';
import { getUserSelect } from '@/user/user.utils';

import { EAttachmentType, TListAttachmentIncludeArgs } from '../types';

type TAttachmentWhereInput = Prisma.AttachmentWhereInput & {
  OR: Prisma.AttachmentWhereInput[];
};

export type TListAttachmentsArgs = {
  commissionId?: number;
  invoiceId?: number;
  includeArgs?: TListAttachmentIncludeArgs;
  withCommissionsDeliveryNotes?: boolean;
};
export const listAttachments = async ({
  commissionId,
  invoiceId,
  withCommissionsDeliveryNotes,
  includeArgs: { uploadedBy, ...includeArgs } = {},
}: TListAttachmentsArgs) => {
  const attachmentWhereInput: TAttachmentWhereInput = {
    OR: [
      {
        commission_id: commissionId,
        invoice_id: invoiceId,
      },
    ],
  };
  const attachmentInclude: Prisma.AttachmentInclude = {
    ...includeArgs,
  };

  if (uploadedBy) {
    attachmentInclude.uploadedBy = {
      select: getUserSelect(),
    };
  }

  if (withCommissionsDeliveryNotes && invoiceId) {
    const relatedCommissionIds = await invoiceService.getCommissionIdsForInvoice(invoiceId);
    attachmentWhereInput.OR.push({
      commission_id: {
        in: relatedCommissionIds,
      },
      type: EAttachmentType.DELIVERY_NOTE,
    });
  }

  const attachments = await prisma.attachment.findMany({
    where: attachmentWhereInput,
    include: Object.keys(attachmentInclude).length ? attachmentInclude : undefined,
  });
  return attachments;
};
