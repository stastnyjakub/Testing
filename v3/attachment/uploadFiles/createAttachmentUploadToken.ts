import jwt from 'jsonwebtoken';
import moment from 'moment';

import { EAuthRole, TAttachmentsUploaderAuthTokenPayload } from '@/auth/types';
import * as commissionService from '@/commission/commission.service';
import prisma from '@/db/client';
import env from '@/env';
import { Entity, NotFoundException } from '@/errors';

export const createAttachmentUploadToken = async (commissionId: number) => {
  const commission = await commissionService.getOneCommission(commissionId);
  if (!commission) {
    throw new NotFoundException(Entity.COMMISSION);
  }

  // Get user used to upload attachments
  const attachmentsUploader = await prisma.user.findFirst({
    where: {
      userRoles: {
        some: {
          role: {
            name: EAuthRole.AttachmentsUploader,
          },
        },
      },
    },
  });
  if (!attachmentsUploader) throw new NotFoundException(Entity.USER);

  const payload: TAttachmentsUploaderAuthTokenPayload = {
    role: EAuthRole.AttachmentsUploader,
    commissionId,
    commissionQId: commission.qid,
    userId: attachmentsUploader.user_id,
  };
  const uploadToken = jwt.sign(payload, env().QL_JWT_PRIVATE_KEY, {
    expiresIn: '60 days',
  });

  const uploadTokenEntity = await prisma.uploadToken.create({
    data: {
      token: uploadToken,
      tsAdded: moment().unix(),
      commission: {
        connect: {
          commission_id: commissionId,
        },
      },
    },
  });
  return uploadTokenEntity;
};
