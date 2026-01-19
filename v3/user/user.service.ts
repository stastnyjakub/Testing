import { Prisma } from '@prisma/client';

import { EAuthRole } from '@/auth/types';
import { USERS } from '@/config/constants';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import { EPrismaClientErrorCodes } from '@/types';

import { getUserSelect } from './user.utils';

export const getUsersList = async () => {
  const users = await prisma.users.findMany({
    select: {
      user_id: true,
      name: true,
      surname: true,
    },
    where: {
      user_id: {
        not: USERS.System.id,
      },
    },
  });
  return {
    data: users,
    totalRows: users.length,
  };
};

export type TGetIsEmailAvailableArgs = {
  email: string;
  /**
   * User ID to exclude from the search
   */
  userId?: number;
};
export const getIsEmailAvailable = async ({ email, userId }: TGetIsEmailAvailableArgs) => {
  const userWithSameEmail = await prisma.user.findFirst({
    where: {
      email,
      user_id: userId
        ? {
            not: userId,
          }
        : undefined,
    },
  });
  return !userWithSameEmail;
};

export const getQaplineUserInfoForEmail = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      user_id: true,
      name: true,
      surname: true,
      email: true,
      profilePicture: true,
      contactInfo: {
        select: {
          phone: true,
        },
      },
    },
  });
  if (!user) throw new NotFoundException(Entity.USER);

  const { name, surname, contactInfo, email, profilePicture } = user;
  return {
    name,
    email,
    surname,
    profilePicture: profilePicture || undefined,
    phone: contactInfo?.phone || undefined,
  };
};

export const deleteUser = async (userId: number, transactionClient: Prisma.TransactionClient = prisma) => {
  try {
    await transactionClient.user.delete({
      where: {
        user_id: userId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.OperationDependsOnMissingRecords) {
        throw new NotFoundException(Entity.USER);
      }
    }
    throw error;
  }
};

/**
 * Get a user with a unique role. This should be used when you expect only one user to have a specific role.
 * If multiple users have the same role, this will return the first one found.
 * @param role The role to search for.
 * @returns The user with the specified role, or null if not found.
 */
export const getUserWithUniqueRole = async (role: EAuthRole) => {
  const user = await prisma.user.findFirst({
    where: {
      userRoles: {
        some: {
          role: {
            name: role,
          },
        },
      },
    },
    select: getUserSelect(),
  });

  return user;
};

export * from './getUser/getUser.service';
export * from './createUser/createUser.service';
export * from './updateUser/updateUser.service';
export * from './upsertUser/upsertUser.service';
