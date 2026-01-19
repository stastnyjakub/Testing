import { Dispatcher, Prisma } from '@prisma/client';

import { Entity, NotFoundException } from '@/errors';
import { EPrismaClientErrorCodes } from '@/types';

export type TDeleteDispatcherArgs = {
  dispatcherId: number;
  transactionClient: Prisma.TransactionClient;
};
export const deleteDispatcher = async ({ dispatcherId, transactionClient }: TDeleteDispatcherArgs) => {
  try {
    const deletedDispatcher = await transactionClient.dispatcher.delete({
      where: { dispatcher_id: dispatcherId },
    });
    await transactionClient.vehicle.deleteMany({
      where: { dispatcher_id: dispatcherId },
    });
    await transactionClient.place.deleteMany({
      where: { dispatcher_id: dispatcherId },
    });

    return deletedDispatcher;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.RecordNotFound) {
        throw new NotFoundException(Entity.DISPATCHER);
      }
    }
    throw error;
  }
};

export type TDeleteDispatchersArgs = {
  transactionClient: Prisma.TransactionClient;
};
export async function deleteDispatchers(
  args: TDeleteDispatchersArgs & { dispatcherIds: number[] },
): Promise<Pick<Dispatcher, 'dispatcher_id'>[]>;
export async function deleteDispatchers(
  args: TDeleteDispatchersArgs & { carrierId: number },
): Promise<Pick<Dispatcher, 'dispatcher_id'>[]>;
export async function deleteDispatchers({
  dispatcherIds,
  carrierId,
  transactionClient,
}: TDeleteDispatchersArgs & {
  dispatcherIds?: number[];
  carrierId?: number;
}) {
  try {
    const whereCondition: Prisma.DispatcherDeleteManyArgs['where'] = {};

    if (dispatcherIds) {
      whereCondition.dispatcher_id = {
        in: dispatcherIds,
      };
    }
    if (carrierId) {
      whereCondition.carrier_id = carrierId;
    }

    if (Object.keys(whereCondition).length === 0) {
      throw new Error('You must provide some condition to delete dispatchers');
    }

    const dispatchersToBeDeleted = await transactionClient.dispatcher.findMany({
      where: whereCondition,
      select: { dispatcher_id: true },
    });
    const deletionPromises = dispatchersToBeDeleted.map(({ dispatcher_id }) => {
      return deleteDispatcher({ dispatcherId: dispatcher_id, transactionClient });
    });

    await Promise.all(deletionPromises);

    return dispatchersToBeDeleted;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.RecordNotFound) {
        throw new NotFoundException(Entity.DISPATCHER);
      }
    }
    throw error;
  }
}
