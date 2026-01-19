import { Prisma } from '@prisma/client';

import prisma from '@/db/client';

import { getUserSelect, unsafeUserSelect, userSelect } from '../user.utils';

export type TGetUserArgsBase = {
  email?: string;
  userId?: number;
  includeDeleted?: boolean;
  deleted?: boolean;
};

// Overloads
export function getUser(
  args: TGetUserArgsBase & { includeUnsafeValues: true },
  transactionClient?: Prisma.TransactionClient,
): Promise<Prisma.UserGetPayload<{ select: typeof unsafeUserSelect }> | null>;
export function getUser(
  args: TGetUserArgsBase & { includeUnsafeValues?: false },
  transactionClient?: Prisma.TransactionClient,
): Promise<Prisma.UserGetPayload<{ select: typeof userSelect }> | null>;

// Implementation
export async function getUser(
  {
    email,
    includeDeleted,
    userId,
    deleted,
    includeUnsafeValues = false,
  }: TGetUserArgsBase & { includeUnsafeValues?: boolean },
  transactionClient: Prisma.TransactionClient = prisma,
) {
  if (!email && !userId) throw new Error('Either email or userId must be provided');

  const user = await transactionClient.user.findFirst({
    select: getUserSelect({ includeUnsafeValues }),
    where: {
      email,
      user_id: userId,
      deleted,
    },
  });

  if (includeDeleted === true && user === null) {
    const deletedUser = await getUser(
      {
        email,
        userId,
        deleted: true,
      },
      transactionClient,
    );

    return deletedUser;
  }

  return user;
}
