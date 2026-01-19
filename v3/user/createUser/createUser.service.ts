import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import moment from 'moment';

import { EAuthRole } from '@/auth/types';
import prisma from '@/db/client';

import { getUserSelect } from '../user.utils';

export type TCreateUserArgs = {
  role: EAuthRole;
  name: string;
  surname: string;
  email: string;
  profilePicture?: string;
  password?: string;
  passwordHash?: string;
  contactInfo?: {
    phone?: string;
    note?: string;
    languageId: number;
  };
};
export const createUser = async (
  { email, name, role, surname, profilePicture, password, passwordHash, contactInfo }: TCreateUserArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const {
    _max: { number },
  } = await transactionClient.user.aggregate({
    _max: {
      number: true,
    },
  });
  if (!number) throw new Error('Failed to retrieve the maximum user number');

  const creationData: Prisma.UserCreateInput = {
    number: number + 1,
    email,
    name,
    surname,
    profilePicture,
    userRoles: {
      create: {
        role: { connect: { name: role } },
      },
    },
    tsAdded: moment().unix(),
  };

  if (contactInfo) {
    const { phone, note, languageId } = contactInfo;
    creationData.contactInfo = {
      create: {
        phone,
        note,
        language_id: languageId,
        tsAdded: moment().unix(),
      },
    };
  }

  if (password && !passwordHash) {
    const passwordHash = await bcrypt.hash(password, 10);
    creationData.passwordHash = passwordHash;
  }
  if (passwordHash) {
    creationData.passwordHash = passwordHash;
  }

  const user = await transactionClient.user.create({
    data: creationData,
    select: getUserSelect(),
  });

  return user;
};
