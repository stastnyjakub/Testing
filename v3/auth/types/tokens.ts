import { Nullable } from '@/types';

import { EAuthRole } from './permissions';

export type TAuthTokenPayloadBase = {
  userId: number;
  role: EAuthRole;
  iat?: number;
  exp?: number;
};

export type TUserAuthTokenPayload = TAuthTokenPayloadBase & {
  number: number;
  name: string;
  surname: string;
  email: string;
  role: EAuthRole.Admin | EAuthRole.Dispatcher | EAuthRole.DispatcherOwner | EAuthRole.QaplineEmployee;
};

export type TAttachmentsUploaderAuthTokenPayload = TAuthTokenPayloadBase & {
  commissionId: number;
  commissionQId: string | null;
  role: EAuthRole.AttachmentsUploader;
};

export type TOnboardingUserAuthTokenPayload = TAuthTokenPayloadBase & {
  carrierId: number;
  dispatcherId?: number;
  role: EAuthRole.OnboardingUser;
};

export type TCustomerRegistrationAuthTokenPayload = TAuthTokenPayloadBase & {
  role: EAuthRole.CustomerRegistration;
  customerRegistrationId: number;
  customerId: Nullable<number>;
  customerContactId: Nullable<number>;
};

export type TCustomerUserRegistrationAuthTokenPayload = TAuthTokenPayloadBase & {
  role: EAuthRole.CustomerUserRegistration;
  customerUserId: number;
  invitationId: number;
};

export type TAuthTokenPayload =
  | TUserAuthTokenPayload
  | TAttachmentsUploaderAuthTokenPayload
  | TOnboardingUserAuthTokenPayload
  | TCustomerRegistrationAuthTokenPayload
  | TCustomerUserRegistrationAuthTokenPayload;
