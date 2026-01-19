import { Prisma } from '@prisma/client';

import * as customerService from '@/customer/customer.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

export type TCreateCustomerContactArgs = {
  customerId: number;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  surname?: string | null;
};
export const createCustomerContact = async (
  { customerId, ...args }: TCreateCustomerContactArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customer = await customerService.getCustomer({ customerId });
  if (!customer) throw new NotFoundException(Entity.CUSTOMER);

  const createdContact = await transactionClient.customerContact.create({
    data: {
      customer_id: customerId,
      ...args,
    },
  });

  return createdContact;
};
