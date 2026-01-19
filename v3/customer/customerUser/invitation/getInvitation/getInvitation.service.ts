import prisma from '@/db/client';
import { getUserSelect } from '@/user/user.utils';

export const getInvitation = async (customerUserInvitationId: number) => {
  const invitation = await prisma.customerUserInvitation.findFirst({
    where: { customerUserInvitation_id: customerUserInvitationId },
    include: {
      sender: {
        select: getUserSelect(),
      },
    },
  });

  return invitation;
};
