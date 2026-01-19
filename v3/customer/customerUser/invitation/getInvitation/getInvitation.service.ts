import prisma from '@/db/client';

export const getInvitation = async (customerUserInvitationId: number) => {
  const invitation = await prisma.customerUserInvitation.findFirst({
    where: { customerUserInvitation_id: customerUserInvitationId },
  });

  return invitation;
};
