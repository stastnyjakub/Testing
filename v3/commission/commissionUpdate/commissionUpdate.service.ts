import { Prisma } from '@prisma/client';

import { CommissionBodyUpdate } from '@/commission/commission.interface';
import { USERS } from '@/config/constants';
import { Entity, NotFoundException } from '@/errors';
import * as userService from '@/user/user.service';
import { createCommissionQId, performTransaction } from '@/utils';

import { ECommissionState } from '../types';

export const updateCommission = async (
  id: number,
  commission: Prisma.commissionUncheckedUpdateInput,
  commissionDischarges: CommissionBodyUpdate['commissionDischarges'],
  commissionLoadings: CommissionBodyUpdate['commissionLoadings'],
  commissionItems: CommissionBodyUpdate['commissionItems'],
  transactionClient?: Prisma.TransactionClient,
) => {
  if (transactionClient) {
    return await updateCommissionTransaction(
      transactionClient,
      id,
      commission,
      commissionDischarges,
      commissionLoadings,
      commissionItems,
    );
  }
  return await performTransaction(async (transaction) => {
    return await updateCommissionTransaction(
      transaction,
      id,
      commission,
      commissionDischarges,
      commissionLoadings,
      commissionItems,
    );
  });
};

const updateCommissionTransaction = async (
  transaction: Prisma.TransactionClient,
  id: number,
  commission: Prisma.commissionUncheckedUpdateInput,
  commissionDischarges: CommissionBodyUpdate['commissionDischarges'],
  commissionLoadings: CommissionBodyUpdate['commissionLoadings'],
  commissionItems: CommissionBodyUpdate['commissionItems'],
) => {
  let createdLoadings: any[] = [];
  if (commissionLoadings.toCreate) {
    createdLoadings = await Promise.all(
      commissionLoadings.toCreate.map(
        async (loading) =>
          await transaction.commissionloading.create({
            data: {
              ...loading,
              commission_id: id,
            },
          }),
      ),
    );
  }

  let createdDischarges: any[] = [];
  if (commissionDischarges.toCreate) {
    createdDischarges = await Promise.all(
      commissionDischarges.toCreate.map(
        async (discharge) =>
          await transaction.commissiondischarge.create({
            data: {
              ...discharge,
              commission_id: id,
            },
          }),
      ),
    );
  }

  if (commissionItems.toCreate) {
    for (const { dischargeIdx, loadingIdx, ...item } of commissionItems.toCreate) {
      await transaction.commissionitem.create({
        data: {
          ...item,
          commission_id: id,
          commissionLoading_id:
            loadingIdx !== undefined ? createdLoadings[loadingIdx].commissionLoading_id : item.commissionLoading_id,
          commissionDischarge_id:
            dischargeIdx !== undefined
              ? createdDischarges[dischargeIdx].commissionDischarge_id
              : item.commissionDischarge_id,
        },
      });
    }
  }
  if (commission.state === ECommissionState.Complete && !commission.number) {
    const aggregate = await transaction.commission.aggregate({
      _max: {
        number: true,
      },
    });

    const number = aggregate._max.number ? aggregate._max.number + 1 : 1;

    commission = { ...commission, number };
  }
  if (commission.state === ECommissionState.Complete) {
    const carrierAssignedBy = await userService.getUser({
      userId: Number(commission.carrierAssignedBy_id) || USERS.System.id,
    });
    if (!carrierAssignedBy) throw new NotFoundException(Entity.USER);

    const qid = createCommissionQId(
      commission.relation as string,
      commission.week as number,
      commission.number as number,
      carrierAssignedBy.number,
      commission.year as number,
    );
    commission = { ...commission, qid };
  }
  return await transaction.commission.update({
    where: { commission_id: id },
    data: {
      ...commission,
      commissionitem: {
        update: commissionItems.toUpdate
          ? commissionItems.toUpdate.map(({ loadingIdx, dischargeIdx, commissionItem_id, ...data }) => {
              if (loadingIdx !== undefined)
                data.commissionLoading_id = createdLoadings[loadingIdx].commissionLoading_id;
              if (dischargeIdx !== undefined)
                data.commissionDischarge_id = createdDischarges[dischargeIdx].commissionDischarge_id;
              return { where: { commissionItem_id }, data };
            })
          : undefined,
        deleteMany: commissionItems.toDelete ? commissionItems.toDelete : [],
      },
      commissionloading: {
        update: commissionLoadings.toUpdate
          ? commissionLoadings.toUpdate.map(({ commissionLoading_id, ...data }) => {
              return { where: { commissionLoading_id }, data };
            })
          : undefined,
        deleteMany: commissionLoadings.toDelete ? commissionLoadings.toDelete : [],
      },
      commissiondischarge: {
        update: commissionDischarges.toUpdate
          ? commissionDischarges.toUpdate.map(({ commissionDischarge_id, ...data }) => {
              return { where: { commissionDischarge_id }, data };
            })
          : undefined,
        deleteMany: commissionDischarges.toDelete ? commissionDischarges.toDelete : [],
      },
    },
    include: {
      commissionitem: true,
      commissiondischarge: true,
      commissionloading: true,
    },
  });
};
