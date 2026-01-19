import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';

import * as attachmentService from '@/attachment/attachment.service';
import { getAttachmentBucketUrl } from '@/attachment/attachment.utils';
import { EAttachmentType } from '@/attachment/types';
import { Entity, HttpException, NotFoundException } from '@/errors';
import { TMail } from '@/mail/mail.interface';
import * as mailService from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import * as userService from '@/user/user.service';
import { generateGeneralEmailBody, performTransaction } from '@/utils';

import { TMailInvoiceRequestBody } from '../types';

export type TMailInvoiceArgs = TMailInvoiceRequestBody & {
  invoiceId: number;
  senderId: number;
  withDeliveryNotes?: boolean;
};
export const mailInvoice = async ({
  emails,
  lang,
  message,
  invoiceId,
  senderId,
  withDeliveryNotes = false,
}: TMailInvoiceArgs) => {
  const invoiceAttachments = await attachmentService.listAttachments({
    invoiceId,
    withCommissionsDeliveryNotes: withDeliveryNotes,
  });

  if (invoiceAttachments.length === 0) {
    throw new HttpException(400, 'invoice.noAttachmentsToSend');
  }

  // Get the invoice attachment, this attachment is mandatory
  const invoiceAttachment = invoiceAttachments.find((attachment) => attachment.type === EAttachmentType.INVOICE);
  if (!invoiceAttachment) throw new NotFoundException(Entity.ATTACHMENT);

  const mailAttachments: TMail['attachments'] = [];
  for (const { fileName, name } of invoiceAttachments) {
    mailAttachments.push({
      name,
      path: getAttachmentBucketUrl(fileName),
    });
  }

  const subject = t('invoiceEmail.subject', lang, { invoiceName: invoiceAttachment.name });
  const sender = await userService.getQaplineUserInfoForEmail(senderId);
  const emailBody = await generateGeneralEmailBody({
    lang,
    message,
    sender,
    title: subject,
  });

  const { successfulEmails, rejectedEmails } = await mailService.sendMail({
    to: emails,
    subject: t('invoiceEmail.subject', lang, { invoiceName: invoiceAttachment.name }),
    body: emailBody,
    attachments: mailAttachments,
    sender,
  });

  if (successfulEmails.length) {
    // Marking the invoice as sent is not crucial to the email sending process
    // If it fails, we don't want to throw an error
    try {
      await updateInvoiceSentStatus({ invoiceId, sent: true });
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  return {
    successfulEmails,
    rejectedEmails,
  };
};

export type TUpdateInvoiceSentStatusArgs = {
  invoiceId: number;
  sent: boolean;
  transactionClient?: Prisma.TransactionClient;
};
/**
 * Updates the invoice and the invoice attachment sent status
 */
export const updateInvoiceSentStatus = async ({ invoiceId, sent, transactionClient }: TUpdateInvoiceSentStatusArgs) => {
  // We need to mark two things as sent:
  // 1. The invoice itself
  // 2. The invoice attachment that is sent
  await performTransaction(
    async (transactionClient) => {
      const invoiceUpdatePromise = transactionClient.invoice.update({
        where: { invoice_id: invoiceId },
        data: { invoiceSent: sent },
      });
      const invoiceAttachmentUpdatePromise = attachmentService.updateInvoiceAttachmentSentStatus({
        invoiceId,
        sent,
        transactionClient,
      });

      await Promise.all([invoiceUpdatePromise, invoiceAttachmentUpdatePromise]);
    },
    undefined,
    transactionClient,
  );
};
