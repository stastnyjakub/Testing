import { Prisma } from '@prisma/client';

import { EAuthRole } from '@/auth/types';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import * as userService from '@/user/user.service';

import { getCustomerUser } from '../getCustomerUser/getCustomerUser.service';

export type TUpdateCustomerUserArgs = {
  customerUserId: number;
  name?: string;
  surname?: string;
  phone?: string | null;
  password?: string;
  passwordHash?: string;
  role?: EAuthRole.Customer | EAuthRole.CustomerOwner;
};
export const updateCustomerUser = async (
  { customerUserId, name, surname, password, passwordHash, role }: TUpdateCustomerUserArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerUser = await getCustomerUser({ customerUserId });
  if (!customerUser) throw new NotFoundException(Entity.CUSTOMER_USER);

  await userService.updateUser(
    {
      userId: customerUser.user_id,
      name,
      surname,
      passwordHash,
      password,
      role,
    },
    transactionClient,
  );
  const updatedCustomerUser = await getCustomerUser({ customerUserId }, transactionClient);

  return updatedCustomerUser;
};
