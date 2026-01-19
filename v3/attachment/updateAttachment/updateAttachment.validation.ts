import { Attachment } from '@prisma/client';

import { getInvoiceAttachmentOrThrow } from '@/attachment/attachment.service';
import { EAttachmentType, TUpdateAttachmentData } from '@/attachment/types';
import * as commissionService from '@/commission/commission.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as invoiceService from '@/invoice/invoice.service';

/**
 *
 * @throws If invoiceId is provided for attachment with commission_id {HttpException}
 * @throws If attachment with type invoice already exists for the commission {HttpException}
 * @throws If commission does not exist {NotFoundException}
 */
export const validateUpdateAttachmentForCommission = async (
  { attachmentId, commissionId, invoiceId, type }: TUpdateAttachmentData,
  attachment: Attachment,
) => {
  if (attachment.commission_id && invoiceId) {
    throw new HttpException(400, 'attachment.invoiceIdNotAllowed');
  }

  if (commissionId && type === EAttachmentType.INVOICE && attachment.commission_id !== commissionId) {
    await getInvoiceAttachmentOrThrow({ commissionId, attachmentId });
  }

  if (commissionId && attachment.commission_id !== commissionId) {
    const commissionExists = await commissionService.getCommissionExists(commissionId);
    if (!commissionExists) {
      throw new NotFoundException(Entity.COMMISSION);
    }
  }
};

/**
 * @throws If attachment with type invoice already exists for the commission {HttpException}
 * @throws If attachment with type invoice already exists for the invoice {HttpException}
 * @throws If invoice does not exist {NotFoundException}
 */
export const validateUpdateAttachmentForInvoice = async (
  { commissionId, invoiceId, type }: TUpdateAttachmentData,
  attachment: Attachment,
) => {
  if (attachment.invoice_id && commissionId) {
    throw new HttpException(400, 'attachment.commissionIdNotAllowed');
  }

  if (invoiceId && type === EAttachmentType.INVOICE && attachment.invoice_id !== invoiceId) {
    await getInvoiceAttachmentOrThrow({ invoiceId });
  }

  if (invoiceId && attachment.invoice_id !== invoiceId) {
    const invoice = await invoiceService.getInvoiceExists(invoiceId);
    if (!invoice) {
      throw new NotFoundException(Entity.INVOICE);
    }
  }
};
