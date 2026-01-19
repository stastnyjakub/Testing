import { Dispatcher } from '@prisma/client';

import prisma from '@/db/client';

export type TListDispatchersArgs = {
  limit?: number;
  offset?: number;
  search?: string;
  carrierId?: number;
  deleted?: boolean;
};
export const listDispatchers = async (args: TListDispatchersArgs = {}) => {
  const { limit, offset, search: _search, carrierId, deleted } = args;

  const readPromises: [Promise<Dispatcher[]>, Promise<number>] = [
    prisma.dispatcher.findMany({
      where: {
        carrier_id: carrierId,
        deleted,
      },
      take: limit,
      skip: offset,
    }),
    prisma.dispatcher.count({
      where: {
        carrier_id: carrierId,
        deleted,
      },
    }),
  ];
  const [dispatchers, totalRows] = await Promise.all(readPromises);

  return { dispatchers, totalRows };
};
