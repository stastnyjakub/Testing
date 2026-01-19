import { Prisma } from '@prisma/client';

import { EAuthRole } from '@/auth/types';
import * as customerService from '@/customer/customer.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as userService from '@/user/user.service';
import { getUserSelect } from '@/user/user.utils';
import { performTransaction } from '@/utils';

//TODO: Save phone number in user contact info - language_id is needed
export type TCreateCustomerUserArgs = {
  customerId: number;
  name: string;
  surname: string;
  email: string;
  phone?: string | null;
  password?: string;
  passwordHash?: string;
  role: EAuthRole.Customer | EAuthRole.CustomerOwner;
};
export const createCustomerUser = async (
  { customerId, email, name, role, surname, phone: _phone, password, passwordHash }: TCreateCustomerUserArgs,
  transactionClient?: Prisma.TransactionClient,
) => {
  const customer = await customerService.getCustomer({ customerId }, transactionClient);
  if (!customer) throw new NotFoundException(Entity.CUSTOMER);

  const transactionAction = async (transactionClient: Prisma.TransactionClient) => {
    const existingUser = await userService.getUser({
      email,
      includeDeleted: true,
    });
    if (existingUser && existingUser.deleted === false) throw new HttpException(400, 'user.emailAlreadyExists');

    const { user_id } = await userService.upsertUser(
      {
        email,
        name,
        surname,
        role,
        password,
        passwordHash,
      },
      transactionClient,
    );

    const createdCustomerUser = await transactionClient.customerUser.create({
      data: {
        customer_id: customerId,
        user_id,
      },
      include: {
        user: { select: getUserSelect() },
      },
    });

    return createdCustomerUser;
  };

  const customerUser = transactionClient
    ? await transactionAction(transactionClient)
    : await performTransaction(transactionAction);

  return customerUser;
};
