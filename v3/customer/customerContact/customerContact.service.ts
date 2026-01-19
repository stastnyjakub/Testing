import { Prisma } from '@prisma/client';

import * as customerService from '@/customer/customer.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

import { getCustomerContact } from './getCustomerContact/getCustomerContact.service';

export type TListCustomerContactsArgs = {
  customerId: number;
};
export const listCustomerContacts = async ({ customerId }: TListCustomerContactsArgs) => {
  const customer = await customerService.getCustomer({ customerId });
  if (!customer) throw new NotFoundException(Entity.CUSTOMER);

  const customerContacts = await prisma.customerContact.findMany({
    where: {
      customer_id: customerId,
    },
  });

  return customerContacts;
};

export type TDeleteCustomerContactArgs = {
  customerContactId: number;
};
export const deleteCustomerContact = async (
  { customerContactId }: TDeleteCustomerContactArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerContact = await getCustomerContact(customerContactId);
  if (!customerContact) throw new NotFoundException(Entity.CUSTOMER_CONTACT);

  const deletedContact = await transactionClient.customerContact.delete({
    where: {
      customerContact_id: customerContactId,
    },
  });

  return deletedContact;
};

export * from './createCustomerContact/createCustomerContact.service';
export * from './updateCustomerContact/updateCustomerContact.service';
export * from './getCustomerContact/getCustomerContact.service';
