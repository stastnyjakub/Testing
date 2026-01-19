import { Attachment } from '@prisma/client';

import { createAttachment, createOrReplaceInvoiceAttachment } from '@/attachment/attachment.service';
import { EAttachmentType, TAttachmentFile } from '@/attachment/types';
import * as commissionService from '@/commission/commission.service';
import { Entity, NotFoundException } from '@/errors';
import { performTransaction } from '@/utils';

import { ATTACH_OR_REPLACE_INVOICE_TRANSACTION_TIMEOUT } from './uploadFiles.constants';
import { buildFileUploadResultsMap, processFileUploadPromiseResults } from './uploadFiles.utils';

/**
 * @throws If commission does not exist {NotFoundException}
 */
export const uploadFilesToCommission = async (
  commissionId: number,
  invoice?: TAttachmentFile,
  deliveryNotes?: TAttachmentFile[],
) => {
  const commission = await commissionService.getCommissionExists(commissionId);
  if (!commission) {
    throw new NotFoundException(Entity.COMMISSION);
  }

  const fileUploadResultsMap = buildFileUploadResultsMap([...(invoice ? [invoice] : []), ...(deliveryNotes || [])]);
  const promises: (Promise<Attachment | undefined> | Promise<Promise<Attachment | undefined> | undefined>)[] = [];
  if (invoice) {
    promises.push(
      performTransaction(async (transactionClient) => {
        return createOrReplaceInvoiceAttachment(
          {
            commissionId,
            name: invoice.originalname,
            type: EAttachmentType.INVOICE,
            userId: 0,
            file: invoice,
          },
          transactionClient,
        );
      }, ATTACH_OR_REPLACE_INVOICE_TRANSACTION_TIMEOUT),
    );
  }
  if (deliveryNotes && deliveryNotes.length > 0) {
    deliveryNotes.forEach((deliveryNote) => {
      promises.push(
        createAttachment({
          commissionId,
          name: deliveryNote.originalname,
          type: EAttachmentType.DELIVERY_NOTE,
          userId: 0,
          file: deliveryNote,
        }),
      );
    });
  }

  const promiseResults = await Promise.allSettled(promises);
  return processFileUploadPromiseResults(promiseResults, fileUploadResultsMap);
};
