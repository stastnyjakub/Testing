import { Prisma } from '@prisma/client';

import { USERS } from '@/config/constants';
import { Entity, NotFoundException } from '@/errors';
import * as userService from '@/user/user.service';
import { createCommissionQId, performTransaction } from '@/utils';

import { ECommissionState, TCreateCommissionArgs } from '../types';

export const createCommission = async (
  {
    commission,
    commissionDischarges,
    commissionItems,
    commissionLoadings,
    userId = USERS.System.id,
  }: TCreateCommissionArgs,
  transactionClient?: Prisma.TransactionClient,
) => {
  const runCreateCommission = async (transaction: Prisma.TransactionClient) => {
    const addedBy = await userService.getUser({ userId });
    if (!addedBy) throw new NotFoundException(Entity.USER);

    const carrierAssignedBy = commission.carrierAssignedBy_id
      ? await userService.getUser({ userId: commission.carrierAssignedBy_id })
      : null;

    if (commission.state === ECommissionState.Complete && !commission.number && !commission.qid) {
      const aggregate = await transaction.commission.aggregate({
        _max: {
          number: true,
        },
      });

      const number = aggregate._max.number ? aggregate._max.number + 1 : 1;
      if (!carrierAssignedBy) {
        throw new Error('Carrier assigned by is required to complete the commission');
      }
      const qid = createCommissionQId(
        commission.relation as string,
        commission.week as number,
        number,
        carrierAssignedBy.number,
        commission.year as number,
      );
      commission = { ...commission, number, qid };
    }
    const newCommission = await transaction.commission.create({
      data: { ...commission, addedBy_id: addedBy.user_id, deleted: false },
    });

    const createdLoadings = await Promise.all(
      commissionLoadings.map(
        async (loading) =>
          await transaction.commissionloading.create({
            data: {
              ...loading,
              commission_id: newCommission.commission_id,
            },
          }),
      ),
    );

    const createdDischarges = await Promise.all(
      commissionDischarges.map(
        async (discharge) =>
          await transaction.commissiondischarge.create({
            data: {
              ...discharge,
              commission_id: newCommission.commission_id,
            },
          }),
      ),
    );

    for (const { dischargeIdx, loadingIdx, ...item } of commissionItems) {
      await transaction.commissionitem.create({
        data: {
          ...item,
          commission_id: newCommission.commission_id,
          commissionLoading_id: createdLoadings[loadingIdx].commissionLoading_id,
          commissionDischarge_id: createdDischarges[dischargeIdx].commissionDischarge_id,
        },
      });
    }

    return await transaction.commission.findFirst({
      where: { commission_id: newCommission.commission_id },
      include: {
        commissiondischarge: true,
        commissionloading: true,
        commissionitem: true,
      },
    });
  };

  const createdCommission = transactionClient
    ? await runCreateCommission(transactionClient)
    : await performTransaction(async (transaction) => await runCreateCommission(transaction));

  return createdCommission;
};
