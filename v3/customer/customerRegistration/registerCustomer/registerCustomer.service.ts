import { EAuthRole } from '@/auth/types';
import * as customerService from '@/customer/customer.service';
import * as customerRegistrationService from '@/customer/customerRegistration/customerRegistration.service';
import * as customerUserService from '@/customer/customerUser/customerUser.service';
import { Entity, NotFoundException } from '@/errors';
import { performTransaction } from '@/utils';

import { TRegisterCustomerRequestBody } from '../types';

export type TRegisterCustomerArgs = TRegisterCustomerRequestBody & {
  customerRegistrationId: number;
  userId: number;
};
export const registerCustomer = async ({ customerRegistrationId, company, user, userId }: TRegisterCustomerArgs) => {
  const customerRegistration = await customerRegistrationService.getRegistration({ customerRegistrationId });
  if (!customerRegistration) {
    throw new NotFoundException(Entity.CUSTOMER_REGISTRATION);
  }

  const { companyIdentification, email, passwordHash, customer_id } = customerRegistration;
  const customer = await performTransaction(async (transactionClient) => {
    const customer = await customerService.upsertCustomer(
      {
        ...company,
        companyRegistrationNumber: companyIdentification,
        addedById: customer_id ? undefined : userId,
        customerId: customer_id ?? undefined,
      },
      transactionClient,
    );
    await customerUserService.createCustomerUser(
      {
        customerId: customer.customer_id,
        ...user,
        role: EAuthRole.CustomerOwner,
        email,
        passwordHash,
      },
      transactionClient,
    );

    return customer;
  });

  await customerRegistrationService.deleteRegistration(customerRegistrationId);

  return customer;
};
