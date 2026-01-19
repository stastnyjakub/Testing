import { Customer, CustomerContact, location, Prisma } from '@prisma/client';
import moment from 'moment';

import prisma from '../db/client';

import { TCreateCustomerArgs } from './types/arguments';
import { CustomerBodyUpdate } from './customer.interface';
import { getCustomerType } from './customer.utils';

export const createCustomerOld = async (
  { customer, customerContacts, locations }: TCreateCustomerArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const createdCustomer = await transactionClient.customer.create({
    data: {
      ...customer,
      customerContacts: {
        createMany: customerContacts ? { data: customerContacts } : undefined,
      },
      location: {
        createMany: locations ? { data: locations } : undefined,
      },
      tsAdded: moment().unix(),
    },
    include: {
      customerContacts: true,
      location: true,
    },
  });
  return createdCustomer;
};

export const updateCustomerOld = async (
  id: number,
  customer: Prisma.CustomerUpdateInput,
  customercontacts: CustomerBodyUpdate['customerContacts'],
  location: CustomerBodyUpdate['locations'],
): Promise<
  Customer & {
    customerContacts: CustomerContact[];
    location: location[];
  }
> => {
  let updatedCustomer = await prisma.customer.update({
    where: { customer_id: id },
    data: {
      ...customer,
      customerContacts: {
        createMany: customercontacts.toCreate ? { data: customercontacts.toCreate } : undefined,

        update: customercontacts.toUpdate
          ? customercontacts.toUpdate.map((contact) => {
              const { customerContact_id, customer_id: _, ...data } = contact;
              return { where: { customerContact_id }, data };
            })
          : undefined,
        deleteMany: customercontacts.toDelete ? customercontacts.toDelete : [],
      },
      location: {
        createMany: location.toCreate ? { data: location.toCreate } : undefined,
        update: location.toUpdate
          ? location.toUpdate.map((loading) => {
              const { location_id, customer_id: _, ...data } = loading;
              return { where: { location_id }, data };
            })
          : undefined,
        deleteMany: location.toDelete ? location.toDelete : [],
      },
      tsEdited: moment().unix(),
    },
    include: {
      customerContacts: true,
      location: true,
    },
  });

  const customerType = getCustomerType(updatedCustomer);
  if (updatedCustomer.type !== customerType) {
    updatedCustomer = await prisma.customer.update({
      where: {
        customer_id: id,
      },
      data: {
        type: customerType,
      },
      include: {
        customerContacts: true,
        location: true,
      },
    });
  }

  return updatedCustomer;
};

export const removeCustomer = async (id: number): Promise<void> => {
  await prisma.customer.delete({
    where: {
      customer_id: id,
    },
    include: {
      customerContacts: true,
      location: true,
    },
  });
  return;
};

export const getCustomersList = async () => {
  const customers = await prisma.customer.findMany({
    select: {
      name: true,
      customer_id: true,
    },
  });

  return {
    data: customers,
    totalRows: customers.length,
  };
};

export * from './enquiryForm/enquiryForm.service';
export * from './listCustomers/listCustomers.service';
export * from './updateCustomer/updateCustomer.service';
export * from './profilePicture/profilePicture.service';
export * from './getCustomer/getCustomer.service';
export * from './createCustomer/createCustomer.service';
export * from './upsertCustomer/upsertCustomer.service';
