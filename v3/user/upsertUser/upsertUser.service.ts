import { Prisma } from '@prisma/client';

import prisma from '@/db/client';

import { createUser, TCreateUserArgs } from '../createUser/createUser.service';
import { getUser } from '../getUser/getUser.service';
import { updateUser } from '../updateUser/updateUser.service';

export type TUpsertUserArgs = TCreateUserArgs;

export const upsertUser = async (
  { email, name, role, surname, contactInfo, profilePicture, password, passwordHash }: TUpsertUserArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const existingUser = await getUser({ email, includeDeleted: true });

  if (existingUser) {
    const updatedUser = await updateUser(
      {
        userId: existingUser.user_id,
        name,
        surname,
        role,
        contactInfo,
        profilePicture,
        password,
        passwordHash,
        deleted: false,
      },
      transactionClient,
    );

    return updatedUser;
  }

  const createdUser = await createUser(
    {
      email,
      name,
      surname,
      role,
      contactInfo,
      profilePicture,
      password,
      passwordHash,
    },
    transactionClient,
  );

  return createdUser;
};
