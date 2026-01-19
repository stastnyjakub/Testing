import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import moment from 'moment';

import { ECronState } from '@/cron/types';
import prisma from '@/db/client';
import { Entity, HttpException, NotFoundException } from '@/errors';
import { EPrismaClientErrorCodes } from '@/types';

import {
  TCreateCommissionPriceEstimationEntityArgs,
  TGetCommissionPriceEstimationEntityArgs,
  TUpdateCommissionPriceEstimationEntityArgs,
} from './types';

export const getEstimationEntity = async ({ code, id }: TGetCommissionPriceEstimationEntityArgs) => {
  if (!code && !id) {
    return null;
  }

  const estimationEntity = await prisma.commissionPriceEstimation.findUnique({
    where: {
      commissionPriceEstimation_id: id,
      code,
    },
  });

  return estimationEntity;
};

export const getEstimationEntityOrThrow: typeof getEstimationEntity = async (args) => {
  const estimationEntity = await getEstimationEntity(args);
  if (!estimationEntity) {
    throw new NotFoundException(Entity.COMMISSION_PRICE_ESTIMATION);
  }
  return estimationEntity;
};

export const createEstimationEntity = async ({
  commissionId,
  customerId,
  parameters,
  ...args
}: TCreateCommissionPriceEstimationEntityArgs) => {
  try {
    const estimationEntity = await prisma.commissionPriceEstimation.create({
      data: {
        ...args,
        code: randomUUID(),
        customer: customerId ? { connect: { customer_id: customerId } } : undefined,
        commission: commissionId ? { connect: { commission_id: commissionId } } : undefined,
        tsAdded: moment().valueOf(),
        parameters: parameters ?? {},
      },
    });

    return estimationEntity;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.OperationDependsOnMissingRecords) {
        throw new NotFoundException(Entity.GLOBAL);
      }
    }
    throw error;
  }
};

export const updateEstimationEntity = async (
  {
    commissionPriceEstimation_id,
    code,
    commissionId,
    customerId,
    parameters,
    ...args
  }: TUpdateCommissionPriceEstimationEntityArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  if (!commissionPriceEstimation_id && !code) {
    throw new HttpException(400, 'commissionPriceEstimation.missingUniqueIdentifier');
  }

  try {
    const updatedEstimationEntity = await transactionClient.commissionPriceEstimation.update({
      where: { commissionPriceEstimation_id: commissionPriceEstimation_id, code },
      data: {
        ...args,
        customer: customerId ? { connect: { customer_id: customerId } } : undefined,
        commission: commissionId ? { connect: { commission_id: commissionId } } : undefined,
        parameters: parameters ?? {},
      },
    });

    return updatedEstimationEntity;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.OperationDependsOnMissingRecords) {
        console.error(error);
        throw new NotFoundException(Entity.GLOBAL);
      }
    }
    throw error;
  }
};

export const updateEstimationsCronState = async (codes: string[], cronState: ECronState, sentEmail = false) => {
  await prisma.commissionPriceEstimation.updateMany({
    where: {
      code: {
        in: codes,
      },
    },
    data: {
      cronState,
      emailSentDate: sentEmail ? moment().valueOf() : undefined,
    },
  });
};
