import { Prisma } from '@prisma/client';

import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

import { getRegistration } from '../getRegistration/getRegistration.service';

export const deleteRegistration = async (
  customerRegistrationId: number,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerRegistration = await getRegistration({ customerRegistrationId });
  if (!customerRegistration) {
    throw new NotFoundException(Entity.CUSTOMER_REGISTRATION);
  }

  await transactionClient.customerRegistration.delete({
    where: {
      customerRegistration_id: customerRegistrationId,
    },
  });
};
