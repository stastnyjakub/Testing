import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';
import moment from 'moment';

import {
  getInvoiceAttachment,
  getInvoiceAttachmentOrThrow,
  queueCompressionJob,
  removeAttachment,
} from '@/attachment/attachment.service';
import { deleteAttachmentFile, saveAttachmentFileOrThrow } from '@/attachment/attachmentFile/attachmentFile.service';
import { EAttachmentType, TCreateAttachmentData } from '@/attachment/types';
import * as commissionService from '@/commission/commission.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import * as invoiceService from '@/invoice/invoice.service';

export const createOrReplaceInvoiceAttachment = async (
  data: TCreateAttachmentData,
  transactionClient: Prisma.TransactionClient,
) => {
  const { commissionId, invoiceId } = data;
  const existingInvoiceAttachment = await getInvoiceAttachment({ commissionId, invoiceId }, transactionClient);
  if (existingInvoiceAttachment) {
    await removeAttachment(existingInvoiceAttachment.attachment_id, transactionClient);
  }
  const newAttachment = await createAttachment(data, transactionClient);
  return newAttachment;
};

/**
 * @throws If commission does not exist {NotFoundException}
 * @throws If attachment with type invoice already exists for the commission {HttpException}
 * @throws If file saving failed {HttpException}
 * @throws If invoice does not exist {NotFoundException}
 */
export const createAttachment = async (
  data: TCreateAttachmentData,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const { name, type, userId, file, commissionId, invoiceId } = data;

  if (data.commissionId) {
    await validateCreateAttachmentForCommission(data, transactionClient);
  }
  if (data.invoiceId) {
    await validateCreateAttachmentForInvoice(data, transactionClient);
  }

  if (file.buffer) {
    await saveAttachmentFileOrThrow(file);
  }

  try {
    const attachment = await transactionClient.attachment.create({
      data: {
        name,
        type,
        fileName: file.filename,
        mimeType: file.mimetype,
        tsAdded: moment().unix(),
        ...(commissionId
          ? {
              commission: {
                connect: {
                  commission_id: commissionId,
                },
              },
            }
          : {}),
        ...(invoiceId
          ? {
              invoice: {
                connect: {
                  invoice_id: invoiceId,
                },
              },
            }
          : {}),
        ...(userId
          ? {
              uploadedBy: {
                connect: {
                  user_id: userId,
                },
              },
            }
          : {}),
      },
    });

    // Error in queuing compression job is not critical
    // and should not block the attachment creation
    queueCompressionJob(attachment.attachment_id).catch((error) =>
      Sentry.captureException(error, {
        extra: {
          description: 'Error while queuing compression job',
          attachmentId: attachment.attachment_id,
        },
      }),
    );

    return attachment;
  } catch (error) {
    await deleteAttachmentFile(file.filename);
  }
};

/**
 * @throws If commission does not exist {NotFoundException}
 * @throws If attachment with type invoice already exists for the commission {HttpException}
 */
const validateCreateAttachmentForCommission = async (
  { commissionId, type }: TCreateAttachmentData,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  if (!commissionId) {
    throw new Error('Commission ID is required for creating an attachment');
  }
  const commissionExists = await commissionService.getCommissionExists(commissionId, transactionClient);
  if (!commissionExists) {
    throw new NotFoundException(Entity.COMMISSION);
  }

  if (type === EAttachmentType.INVOICE) {
    await getInvoiceAttachmentOrThrow({ commissionId }, transactionClient);
  }
};

/**
 * @throws If invoice does not exist {NotFoundException}
 */
const validateCreateAttachmentForInvoice = async (
  { invoiceId, type }: TCreateAttachmentData,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  if (!invoiceId) {
    throw new Error('Invoice ID is required for creating an attachment');
  }
  const invoiceExists = await invoiceService.getInvoiceExists(invoiceId, transactionClient);
  if (!invoiceExists) {
    throw new NotFoundException(Entity.INVOICE);
  }

  if (type === EAttachmentType.INVOICE) {
    await getInvoiceAttachmentOrThrow({ invoiceId }, transactionClient);
  }
};
