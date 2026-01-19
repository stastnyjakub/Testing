import * as tokenService from '@/auth/tokens/tokens.service';
import { EAuthRole, TCustomerUserRegistrationAuthTokenPayload } from '@/auth/types';
import env from '@/env';

export type TGenerateCustomerUserRegistrationTokenArgs = {
  customerUserId: number;
  invitationId: number;
  userId: number;
};
export const generateCustomerUserRegistrationToken = async ({
  customerUserId,
  invitationId,
  userId,
}: TGenerateCustomerUserRegistrationTokenArgs) => {
  const payload: TCustomerUserRegistrationAuthTokenPayload = {
    customerUserId,
    invitationId,
    role: EAuthRole.CustomerUserRegistration,
    userId,
  };
  const token = await tokenService.getSignedToken({ expiresIn: '48h', payload });

  return token;
};

export const generateCustomerUserRegistrationLink = (token: string) => {
  return `${env().CUSTOMER_ZONE_URL}/onboarding?token=${token}`;
};
