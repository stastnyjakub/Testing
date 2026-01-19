import jwt from 'jsonwebtoken';

import { TCreateOrGetAttachmentUploadTokenArgs } from '@/attachment/types';
import * as commissionService from '@/commission/commission.service';
import prisma from '@/db/client';
import env from '@/env';

import { createAttachmentUploadToken } from './createAttachmentUploadToken';

/**
 * @throws If commission does not exist {NotFoundException}
 */
export const createOrGetAttachmentUploadToken = async ({
  commissionId,
  renew = false,
}: TCreateOrGetAttachmentUploadTokenArgs) => {
  if (renew) {
    return await createAttachmentUploadToken(commissionId);
  }

  const existingUploadToken = await getAttachmentUploadTokenForCommission(commissionId);

  if (!existingUploadToken) {
    return await createAttachmentUploadToken(commissionId);
  }

  try {
    jwt.verify(existingUploadToken.token, env().QL_JWT_PRIVATE_KEY);
    return existingUploadToken;
  } catch (error) {
    await prisma.uploadToken.update({
      where: {
        uploadtoken_id: existingUploadToken.uploadtoken_id,
      },
      data: {
        active: false,
      },
    });
    return await createAttachmentUploadToken(commissionId);
  }
};

export const getIsAttachmentUploadTokenActive = async (uploadToken: string) => {
  const uploadTokenEntity = await prisma.uploadToken.findFirst({
    where: {
      token: uploadToken,
      active: true,
    },
  });
  if (!uploadTokenEntity || !uploadTokenEntity.active) {
    return false;
  }

  // If commission does not exist or has already been invoiced, the token is invalid
  const commission = await commissionService.getOneCommission(uploadTokenEntity.commission_id);
  if (!commission || commission.invoice_id) {
    return false;
  }

  return true;
};

export const getAttachmentUploadTokenForCommission = async (commissionId: number) => {
  const uploadTokenEntity = await prisma.uploadToken.findFirst({
    where: {
      commission_id: commissionId,
      active: true,
    },
    orderBy: {
      uploadtoken_id: 'desc',
    },
  });
  return uploadTokenEntity;
};

export * from './uploadFilesToCommission';
export * from './uploadFilesToCommission';
