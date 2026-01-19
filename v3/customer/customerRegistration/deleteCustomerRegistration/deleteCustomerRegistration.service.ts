import { Prisma } from '@prisma/client';

import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

import { getCustomerRegistration } from '../getCustomerRegistration/getCustomerRegistration.service';

export const deleteCustomerRegistration = async (
  customerRegistrationId: number,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerRegistration = await getCustomerRegistration({ customerRegistrationId });
  if (!customerRegistration) {
    throw new NotFoundException(Entity.CUSTOMER_REGISTRATION);
  }

  await transactionClient.customerRegistration.delete({
    where: {
      customerRegistration_id: customerRegistrationId,
    },
  });
};
