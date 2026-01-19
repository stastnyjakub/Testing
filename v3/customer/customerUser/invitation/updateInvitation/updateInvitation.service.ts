import { Prisma } from '@prisma/client';

import prisma from '@/db/client';
import { Nullable } from '@/types';

export type TUpdateInvitationArgs = {
  customerUserInvitationId: number;
  sent?: Nullable<boolean>;
  sentAt?: Nullable<number>;
  used?: boolean;
};
export const updateInvitation = async (
  { customerUserInvitationId, sent, sentAt, used }: TUpdateInvitationArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerUserInvitation = await transactionClient.customerUserInvitation.update({
    where: { customerUserInvitation_id: customerUserInvitationId },
    data: {
      sent,
      sentAt,
      used,
    },
  });

  return customerUserInvitation;
};
