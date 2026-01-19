import { Prisma } from '@prisma/client';
import prisma from '../../../v3/db/client';
import bcrypt from 'bcryptjs';

export const createMockUser = async (user: Prisma.usersCreateInput) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  return await prisma.users.create({
    data: user,
  });
};

export const deleteMockUser = (userId: number) => {
  return prisma.users.delete({
    where: { user_id: userId },
  });
};
