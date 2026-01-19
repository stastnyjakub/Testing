import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import moment from 'moment';

import { EAuthRole } from '@/auth/types';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import { EPrismaClientErrorCodes } from '@/types';

import { getUserSelect } from '../user.utils';

export type TUpdateUserArgs = {
  userId: number;
  name?: string;
  surname?: string;
  profilePicture?: string;
  password?: string;
  passwordHash?: string;
  contactInfo?: {
    phone?: string;
    note?: string;
    languageId: number;
  };
  role?: EAuthRole;
  deleted?: boolean;
};

export const updateUser = async (
  { userId, contactInfo, name, password, passwordHash, profilePicture, role, surname, deleted }: TUpdateUserArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  try {
    const data: Prisma.UserUpdateInput = {
      name,
      surname,
      profilePicture,
      deleted,
    };

    if (contactInfo) {
      data.contactInfo = {
        upsert: {
          create: {
            phone: contactInfo.phone,
            note: contactInfo.note,
            language_id: contactInfo.languageId,
            tsAdded: moment().unix(),
          },
          update: {
            phone: contactInfo.phone,
            note: contactInfo.note,
            language_id: contactInfo.languageId,
          },
        },
      };
    }

    if (role) {
      data.userRoles = {
        deleteMany: {},
        create: {
          role: { connect: { name: role } },
        },
      };
    }

    if (password && !passwordHash) {
      const passwordHash = await bcrypt.hash(password, 10);
      data.passwordHash = passwordHash;
    }
    if (passwordHash) {
      data.passwordHash = passwordHash;
    }

    const updatedUser = await transactionClient.user.update({
      where: {
        user_id: userId,
      },
      data,
      select: getUserSelect(),
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.OperationDependsOnMissingRecords) {
        throw new NotFoundException(Entity.USER);
      }
    }
    throw error;
  }
};
