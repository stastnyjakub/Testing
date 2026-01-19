import { getAttachment } from '@/attachment/attachment.service';
import { TUpdateAttachmentData } from '@/attachment/types';
import * as invoiceService from '@/invoice/invoice.service';
import { performTransaction } from '@/utils';

import { getUpdatedAttachmentData } from './updateAttachment.utils';
import {
  validateUpdateAttachmentForCommission,
  validateUpdateAttachmentForInvoice,
} from './updateAttachment.validation';

export const updateAttachment = async (data: TUpdateAttachmentData) => {
  const { attachmentId, commissionId, invoiceId, name, sent, type } = data;
  const attachment = await getAttachment(attachmentId);

  if (attachment.commission_id) {
    await validateUpdateAttachmentForCommission(data, attachment);
  }
  if (attachment.invoice_id) {
    await validateUpdateAttachmentForInvoice(data, attachment);
  }

  const updatedAttachment = await performTransaction(async (transactionClient) => {
    const updatedAttachment = await transactionClient.attachment.update({
      where: {
        attachment_id: attachmentId,
      },
      data: getUpdatedAttachmentData({ name, type, commissionId, invoiceId, sent }),
    });

    if (sent !== undefined && attachment.invoice_id) {
      await invoiceService.updateInvoiceSentStatus({
        invoiceId: attachment.invoice_id,
        sent,
        transactionClient,
      });
    }

    return updatedAttachment;
  });

  return updatedAttachment;
};
