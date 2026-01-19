import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';

import { deleteAttachmentFile } from '@/attachment/attachmentFile/attachmentFile.service';
import {
  EAttachmentType,
  TAttachment,
  TCheckInvoiceAttachmentExistsArgs,
  TGetAttachmentIncludeArgs,
  TInvoiceAttachmentCustomerEmail,
  TMailAttachmentData,
  TUpdateInvoiceAttachmentSentStatusArgs,
} from '@/attachment/types';
import prisma from '@/db/client';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as invoiceService from '@/invoice/invoice.service';
import * as mailService from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import { EPrismaClientErrorCodes } from '@/types/prisma';
import * as userService from '@/user/user.service';
import { getUserSelect } from '@/user/user.utils';
import { generateGeneralEmailBody } from '@/utils';

import { getAttachmentBucketUrl } from './attachment.utils';

/**
 * @throws If attachment does not exist {NotFoundException}
 */
export const getAttachment = async (
  attachmentId: number,
  includeArgs?: TGetAttachmentIncludeArgs,
): Promise<TAttachment> => {
  const { uploadedBy, invoiceEmailData, ...restIncludeArgs } = includeArgs || {};
  const attachment: TAttachment | null = await prisma.attachment.findUnique({
    where: {
      attachment_id: attachmentId,
    },
    include:
      restIncludeArgs && uploadedBy
        ? {
            ...restIncludeArgs,
            ...(uploadedBy
              ? {
                  uploadedBy: {
                    select: getUserSelect(),
                  },
                }
              : {}),
          }
        : undefined,
  });
  if (!attachment) throw new NotFoundException(Entity.ATTACHMENT);

  if (invoiceEmailData && attachment.invoice_id && attachment.type === EAttachmentType.INVOICE) {
    const [customerEmail]: TInvoiceAttachmentCustomerEmail[] = await prisma.$queryRawUnsafe(
      `
      SELECT
        CUSTOMER.EMAIL,
        COMPLETE_INVOICE.LANGUAGE
      FROM
        COMPLETE_INVOICE
      INNER JOIN 
        CUSTOMER ON CUSTOMER.CUSTOMER_ID = COMPLETE_INVOICE.CUSTOMER_ID
      WHERE
        COMPLETE_INVOICE.INVOICE_ID = $1
    `,
      attachment.invoice_id,
    );
    attachment.invoiceCustomerEmail = customerEmail?.email || null;
    attachment.invoiceLanguage = customerEmail?.language || null;
  }
  if (!attachment) {
    throw new NotFoundException(Entity.ATTACHMENT);
  }
  return attachment;
};

/**
 * Include attachmentId to ignore this attachment during check
 */
export const getInvoiceAttachment = async (
  { commissionId, invoiceId, attachmentId }: TCheckInvoiceAttachmentExistsArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const attachment = await transactionClient.attachment.findFirst({
    where: {
      commission_id: commissionId,
      invoice_id: invoiceId,
      type: EAttachmentType.INVOICE,
      ...(attachmentId
        ? {
            attachment_id: {
              not: attachmentId,
            },
          }
        : {}),
      deleted: false,
    },
  });
  return attachment;
};

export const getInvoiceAttachmentOrThrow = async (
  args: TCheckInvoiceAttachmentExistsArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const attachment = await getInvoiceAttachment(args, transactionClient);
  if (attachment) {
    throw new HttpException(400, 'attachment.invoiceAlreadyExists');
  }
  return false;
};

/**
 * @throws If attachment does not exist {NotFoundException}
 */
export const removeAttachment = async (attachmentId: number, transactionClient: Prisma.TransactionClient = prisma) => {
  try {
    const deletedAttachment = await transactionClient.attachment.delete({
      where: {
        attachment_id: attachmentId,
      },
    });

    // Do not care about the error here, not critical for deleting attachment
    deleteAttachmentFile(deletedAttachment.fileName).catch((error) => {
      console.error(error);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.OperationDependsOnMissingRecords) {
        throw new NotFoundException(Entity.ATTACHMENT);
      }
    }
    throw error;
  }
};

/**
 * @throws If attachment type is not invoice {HttpException}
 * @throws If mail sending fails {HttpException}
 * @throws If attachment does not exist {NotFoundException}
 * @throws If user does not exist {NotFoundException}
 */
export const mailAttachment = async ({ attachmentId, emails, message, senderId, lang }: TMailAttachmentData) => {
  const { type, name, fileName, invoice_id } = await getAttachment(attachmentId);
  if (type !== EAttachmentType.INVOICE) {
    throw new HttpException(400, 'attachment.mailNotAllowed');
  }

  const sender = await userService.getQaplineUserInfoForEmail(senderId);
  if (!sender) throw new NotFoundException(Entity.USER);
  const subject = t('invoiceEmail.subject', lang, { invoiceName: name });

  const emailBody = await generateGeneralEmailBody({
    lang,
    sender,
    message,
    title: subject,
  });

  const { rejectedEmails, successfulEmails } = await mailService.sendMail({
    sender,
    to: emails,
    subject,
    body: emailBody,
    attachments: [{ path: getAttachmentBucketUrl(fileName), name: name }],
  });

  if (successfulEmails.length) {
    try {
      if (invoice_id) {
        await invoiceService.updateInvoiceSentStatus({
          sent: true,
          invoiceId: invoice_id,
        });
      } else {
        await updateInvoiceAttachmentSentStatus({
          sent: true,
          attachmentId,
        });
      }
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      throw new HttpException(500, 'attachment.succeededButNotMarkedAsSent');
    }
  }

  return {
    successfulEmails,
    rejectedEmails,
  };
};

export const updateInvoiceAttachmentSentStatus = async ({
  sent,
  transactionClient = prisma,
  ...args
}: TUpdateInvoiceAttachmentSentStatusArgs) => {
  if (!('attachmentId' in args) && !('invoiceId' in args)) {
    throw new Error('attachmentId or invoiceId is required');
  }
  await transactionClient.attachment.updateMany({
    where: {
      attachment_id: 'attachmentId' in args ? args.attachmentId : undefined,
      invoice_id: 'invoiceId' in args ? args.invoiceId : undefined,
      type: EAttachmentType.INVOICE,
    },
    data: {
      sent,
    },
  });
};

export * from './attachmentFile/attachmentFile.service';
export * from './uploadFiles/uploadFiles.service';
export * from './createAttachment/createAttachment.service';
export * from './updateAttachment/updateAttachment.service';
export * from './listAttachments/listAttachments.service';
export * from './compressionJob/compressionJob.service';
