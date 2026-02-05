import { Prisma } from '@prisma/client';

import prisma from '@/db/client';

import { createCustomer, TCreateCustomerArgs } from '../createCustomer/createCustomer.service';
import { TUpdateCustomerArgs, updateCustomer } from '../updateCustomer/updateCustomer.service';

export const upsertCustomer = async (
  args: TCreateCustomerArgs | TUpdateCustomerArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  if ('customerId' in args) {
    return await updateCustomer(args, transactionClient);
  }

  return await createCustomer(args, transactionClient);
};
