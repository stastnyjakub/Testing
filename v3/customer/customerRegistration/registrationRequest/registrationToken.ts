import { Prisma } from '@prisma/client';

import * as tokenService from '@/auth/tokens/tokens.service';
import { EAuthRole, TCustomerRegistrationAuthTokenPayload } from '@/auth/types';
import prisma from '@/db/client';
import env from '@/env';
import { Entity, NotFoundException } from '@/errors';
import * as userService from '@/user/user.service';

import { getCustomerRegistration } from '../customerRegistration.service';

type TGenerateCustomerRegistrationTokenArgs = {
  customerRegistrationId: number;
  customerId?: number;
  customerContactId?: number;
};
export const generateCustomerRegistrationToken = async (
  { customerRegistrationId, customerId, customerContactId }: TGenerateCustomerRegistrationTokenArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customerRegistration = await getCustomerRegistration({ customerRegistrationId }, transactionClient);
  if (!customerRegistration) {
    throw new NotFoundException(Entity.CUSTOMER_REGISTRATION);
  }

  const user = await userService.getUserWithUniqueRole(EAuthRole.CustomerRegistration);
  if (!user) {
    throw new NotFoundException(Entity.USER);
  }

  const payload: TCustomerRegistrationAuthTokenPayload = {
    customerRegistrationId: customerRegistration.customerRegistration_id,
    role: EAuthRole.CustomerRegistration,
    customerId: customerId ?? null,
    customerContactId: customerContactId ?? null,
    userId: user.user_id,
  };

  return await tokenService.getSignedToken({ expiresIn: '1h', payload });
};

export const generateCustomerRegistrationUrl = (token: string) => {
  return `${env().CUSTOMER_ZONE_URL}/onboarding?token=${token}`;
};
