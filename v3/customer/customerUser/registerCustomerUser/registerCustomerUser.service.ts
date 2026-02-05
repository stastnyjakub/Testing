import { Entity, HttpException, NotFoundException } from '@/errors';
import { performTransaction } from '@/utils';

import * as customerUserInvitationService from '../invitation/invitation.service';
import { updateCustomerUser } from '../updateCustomerUser/updateCustomerUser.service';

export type TRegisterCustomerUserArgs = {
  invitationId: number;
  name: string;
  surname: string;
  phone?: string | null;
  password: string;
};
export const registerCustomerUser = async ({
  invitationId,
  name,
  surname,
  phone,
  password,
}: TRegisterCustomerUserArgs) => {
  const invitation = await customerUserInvitationService.getInvitation(invitationId);
  if (!invitation) {
    throw new NotFoundException(Entity.CUSTOMER_USER_INVITATION);
  }
  if (invitation.used) {
    throw new HttpException(400, 'customerUserInvitation.alreadyUsed');
  }
  const customerUser = await performTransaction(async (transactionClient) => {
    const customerUser = await updateCustomerUser(
      {
        customerUserId: invitation.customerUser_id,
        name,
        password,
        surname,
        phone,
      },
      transactionClient,
    );
    await customerUserInvitationService.updateInvitation(
      {
        customerUserInvitationId: invitation.customerUserInvitation_id,
        used: true,
      },
      transactionClient,
    );
    return customerUser;
  });

  return customerUser;
};
