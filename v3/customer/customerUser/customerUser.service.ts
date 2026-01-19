import * as customerService from '@/customer/customer.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import * as userService from '@/user/user.service';
import { getUserSelect } from '@/user/user.utils';
import { performTransaction } from '@/utils';

import { getCustomerUser } from './getCustomerUser/getCustomerUser.service';

export type TListCustomerUsersArgs = {
  customerId: number;
};
export const listCustomerUsers = async ({ customerId }: TListCustomerUsersArgs) => {
  const customer = await customerService.getCustomer({ customerId });
  if (!customer) throw new NotFoundException(Entity.CUSTOMER);

  const customerUsers = await prisma.customerUser.findMany({
    where: {
      customer_id: customerId,
    },
    include: {
      user: { select: getUserSelect() },
    },
  });

  return customerUsers;
};

export const deleteCustomerUser = async (customerUserId: number) => {
  const customerUser = await getCustomerUser({ customerUserId });
  if (!customerUser) throw new NotFoundException(Entity.CUSTOMER_USER);

  await performTransaction(async (transactionClient) => {
    const { user_id } = await transactionClient.customerUser.delete({
      where: { customerUser_id: customerUserId },
    });
    await userService.deleteUser(user_id, transactionClient);
  });
};

export * from './createCustomerUser/createCustomerUser.service';
export * from './getCustomerUser/getCustomerUser.service';
export * from './onboardCustomerUser/onboardCustomerUser.service';
