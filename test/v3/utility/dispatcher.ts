import { dispatcher } from '@prisma/client';
import prisma from '../../../v3/db/client';

export const createMockDispatcher = async (carrier_id: number): Promise<dispatcher> => {
  const dispatcher = await prisma.dispatcher.create({
    data: {
      carrier_id,
    },
  });
  return dispatcher;
};
