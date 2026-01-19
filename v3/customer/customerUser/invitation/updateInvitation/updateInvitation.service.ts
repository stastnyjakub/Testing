import prisma from '@/db/client';
import { Nullable } from '@/types';

export type TUpdateInvitationArgs = {
  customerUserInvitationId: number;
  sent?: Nullable<boolean>;
  sentAt?: Nullable<number>;
  used?: boolean;
};
export const updateInvitation = async ({ customerUserInvitationId, sent, sentAt, used }: TUpdateInvitationArgs) => {
  const customerUserInvitation = await prisma.customerUserInvitation.update({
    where: { customerUserInvitation_id: customerUserInvitationId },
    data: {
      sent,
      sentAt,
      used,
    },
  });

  return customerUserInvitation;
};
