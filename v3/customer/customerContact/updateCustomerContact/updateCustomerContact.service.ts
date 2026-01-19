import { Prisma } from '@prisma/client';

import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

import { getCustomerContact } from '../getCustomerContact/getCustomerContact.service';

export type TUpdateCustomerContactArgs = {
  customerContactId: number;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  surname?: string | null;
};
export const updateCustomerContact = async (
  { customerContactId, ...args }: TUpdateCustomerContactArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerContact = await getCustomerContact(customerContactId);
  if (!customerContact) throw new NotFoundException(Entity.CUSTOMER_CONTACT);

  const updatedContact = await transactionClient.customerContact.update({
    where: {
      customerContact_id: customerContactId,
    },
    data: {
      ...args,
    },
  });

  return updatedContact;
};
