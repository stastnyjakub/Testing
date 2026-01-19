import { CustomerUser, Prisma } from '@prisma/client';

import prisma from '@/db/client';
import { AsyncReturnType } from '@/types';
import { getUser } from '@/user/user.service';
import { getUserSelect } from '@/user/user.utils';

export type TGetCustomerUserArgs = {
  customerUserId?: number;
  userId?: number;
};

type TGetCustomerUserReturnType = Promise<
  | (CustomerUser & {
      user: NonNullable<AsyncReturnType<typeof getUser>>;
    })
  | null
>;
export async function getCustomerUser(
  args: { userId: number },
  transactionClient?: Prisma.TransactionClient,
): TGetCustomerUserReturnType;
export async function getCustomerUser(
  args: { customerUserId: number },
  transactionClient?: Prisma.TransactionClient,
): TGetCustomerUserReturnType;
export async function getCustomerUser(
  { customerUserId, userId }: TGetCustomerUserArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) {
  const customerUser = await transactionClient.customerUser.findFirst({
    where: {
      customerUser_id: customerUserId,
      user_id: userId,
    },
    include: {
      user: {
        select: getUserSelect(),
      },
    },
  });

  return customerUser;
}
