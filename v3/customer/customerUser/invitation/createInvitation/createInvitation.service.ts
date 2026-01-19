import { Prisma } from '@prisma/client';

import * as customerUserService from '@/customer/customerUser/customerUser.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import * as languageService from '@/language/language.service';
import * as userService from '@/user/user.service';

export type TCreateInvitationArgs = {
  customerUserId: number;
  senderId: number;
  languageId: number;
};
export const createInvitation = async (
  { customerUserId, senderId, languageId }: TCreateInvitationArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerUser = await customerUserService.getCustomerUser({ customerUserId }, transactionClient);
  if (!customerUser) throw new NotFoundException(Entity.CUSTOMER_USER);
  const senderUser = await userService.getUser({ userId: senderId }, transactionClient);
  if (!senderUser) throw new NotFoundException(Entity.USER);
  const language = await languageService.getLanguage({ languageId });
  if (!language) throw new NotFoundException(Entity.LANGUAGE);

  const customerUserInvitation = await transactionClient.customerUserInvitation.create({
    data: {
      customerUser_id: customerUserId,
      sender_id: senderId,
      language_id: languageId,
    },
  });

  return customerUserInvitation;
};
