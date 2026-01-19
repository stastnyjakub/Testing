import { Customer, CustomerContact, Prisma } from '@prisma/client';

import * as customerContactService from '../customerContact/customerContact.service';

import { TUpdateCustomerArgs } from './updateCustomer.service';

export type TUpdateCustomerContactsArgs = {
  customer: Customer & {
    customerContacts: CustomerContact[];
  };
  customerContacts: NonNullable<TUpdateCustomerArgs['customerContacts']>;
};
export const updateCustomerContacts = async (
  { customer, customerContacts }: TUpdateCustomerContactsArgs,
  transactionClient: Prisma.TransactionClient,
) => {
  const customerContactsToCreate = customerContacts.reduce<customerContactService.TCreateCustomerContactArgs[]>(
    (prev, curr) => {
      if (!('customerContactId' in curr)) {
        prev.push({
          ...curr,
          customerId: customer.customer_id,
        });
      }
      return prev;
    },
    [],
  );

  const customerContactsToUpdate = customerContacts.reduce<customerContactService.TUpdateCustomerContactArgs[]>(
    (prev, curr) => {
      if ('customerContactId' in curr) {
        prev.push({ ...curr });
      }
      return prev;
    },
    [],
  );

  const customerContactsToDelete = customer.customerContacts.filter(
    ({ customerContact_id }) =>
      !customerContactsToUpdate.some(
        ({ customerContactId: contactToUpdateId }) => contactToUpdateId === customerContact_id,
      ),
  );

  const creationPromises = customerContactsToCreate.map((contact) =>
    customerContactService.createCustomerContact(
      {
        ...contact,
      },
      transactionClient,
    ),
  );
  const updatePromises = customerContactsToUpdate.map((contact) =>
    customerContactService.updateCustomerContact(
      {
        ...contact,
      },
      transactionClient,
    ),
  );
  const deletionPromises = customerContactsToDelete.map(({ customerContact_id }) =>
    customerContactService.deleteCustomerContact({ customerContactId: customerContact_id }, transactionClient),
  );

  await Promise.all([...creationPromises, ...updatePromises, ...deletionPromises]);
};
