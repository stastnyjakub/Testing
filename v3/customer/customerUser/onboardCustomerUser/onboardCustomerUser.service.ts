import * as customerUserInvitationService from '@/customer/customerUser/invitation/invitation.service';
import { performTransaction } from '@/utils';

import { createCustomerUser, TCreateCustomerUserArgs } from '../createCustomerUser/createCustomerUser.service';

export type TOnboardCustomerUserArgs = {
  senderId: number;
  languageId: number;
} & TCreateCustomerUserArgs;
export const onboardCustomerUser = async ({
  senderId,
  languageId,
  ...createCustomerUserArgs
}: TOnboardCustomerUserArgs) => {
  const customerUser = await performTransaction(async (transactionClient) => {
    const customerUser = await createCustomerUser(
      {
        ...createCustomerUserArgs,
      },
      transactionClient,
    );
    const { customerUserInvitation_id } = await customerUserInvitationService.createInvitation(
      {
        customerUserId: customerUser.customerUser_id,
        senderId,
        languageId,
      },
      transactionClient,
    );
    await customerUserInvitationService.queueSendInvitation(customerUserInvitation_id);

    return customerUser;
  });
  return customerUser;
};
