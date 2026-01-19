import { commission, Prisma } from '@prisma/client';
import moment from 'moment';

import { EAttachmentType } from '@/attachment/types';
import { TListCommissionNumberArgs } from '@/commission/types';
import prisma from '@/db/client';
import { HttpException } from '@/errors';
import { getUserSelect } from '@/user/user.utils';
import { convertAgeToSeconds } from '@/utils';

export const getOneCommission = async (id: number) => {
  const foundCommission = await prisma.commission.findFirst({
    where: {
      commission_id: id,
      deleted: false,
    },
    include: {
      addedBy: {
        select: getUserSelect(),
      },
      carrierAssignedBy: {
        select: getUserSelect(),
      },
      commissionPriceEstimations: {
        select: {
          maxPrice: true,
          minPrice: true,
        },
      },
      commissiondischarge: {
        include: {
          location: true,
        },
      },
      commissionloading: {
        include: {
          location: true,
        },
      },
      attachments: {
        where: {
          type: EAttachmentType.INVOICE,
          deleted: false,
        },
        select: {
          name: true,
        },
      },
      commissionitem: true,
      enquiry: true,
    },
  });
  return foundCommission;
};

export const getCommissionByQId = async (qid: string, include?: Prisma.commissionInclude) => {
  const commission = await prisma.commission.findFirst({
    where: {
      qid: {
        equals: qid,
      },
    },
    include,
  });
  return commission;
};

export const getCommissionExists = async (id: number, transactionClient: Prisma.TransactionClient = prisma) => {
  const foundCommission = await transactionClient.commission.findFirst({
    where: {
      commission_id: id,
      deleted: false,
    },
  });
  return !!foundCommission;
};

export const removeCommission = async (id: number): Promise<commission> => {
  const deletedCommission = await prisma.commission.update({
    where: {
      commission_id: id,
    },
    data: { deleted: true, tsDeleted: moment().unix() },
    include: {
      commissionitem: true,
      commissionloading: true,
      commissiondischarge: true,
    },
  });
  return deletedCommission;
};

/**
 *
 * @throws If age is specified but invalid {HttpException}
 */
export const listCommissionNumbers = async (
  args: TListCommissionNumberArgs,
): Promise<Pick<commission, 'commission_id' | 'number'>[]> => {
  let counter = 1;
  const values = [];

  if (args.search) {
    values.push(`%${args.search}%`);
  }
  if (args.age) {
    const seconds = convertAgeToSeconds(args.age);
    if (!seconds) {
      throw new HttpException(400, 'Invalid age');
    }
    // Convert seconds to milliseconds
    const dateInPast = moment().subtract(seconds, 'seconds').unix() * 1000;
    values.push(dateInPast);
  }

  const results: Pick<commission, 'commission_id' | 'number'>[] = await prisma.$queryRawUnsafe(
    `
    SELECT 
      commission_id,
      number
    FROM 
      commission
    WHERE
      deleted = false
      AND number IS NOT NULL
      ${args.search ? `AND number::text ILIKE $${counter++}` : ''}
      ${args.age ? `AND "orderDate" >= $${counter++}::bigint` : ''}
    ORDER BY
      number DESC
    ;`,
    ...values,
  );
  return results;
};

export * from './commissionCreate/commissionCreate.service';
export * from './commissionUpdate/commissionUpdate.service';
export * from './commissionList/commissionList.service';
export * from './summary/summary.service';
