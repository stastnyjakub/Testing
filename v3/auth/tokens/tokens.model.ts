import Joi from '@hapi/joi';

import { JoiNumberNullable, validateSchemaOrThrow } from '@/utils';

import {
  EAuthRole,
  TAttachmentsUploaderAuthTokenPayload,
  TAuthTokenPayload,
  TAuthTokenPayloadBase,
  TCustomerRegistrationAuthTokenPayload,
  TCustomerUserRegistrationAuthTokenPayload,
  TOnboardingUserAuthTokenPayload,
  TUserAuthTokenPayload,
} from '../types';

const baseSchema = Joi.object({
  userId: Joi.number().required(),
  role: Joi.string()
    .valid(...Object.values(EAuthRole))
    .required(),
}).unknown(true);
const userPayloadSchema = baseSchema.concat(
  Joi.object({
    number: Joi.number().required(),
    name: Joi.string().required(),
    surname: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
);
const attachmentUploaderPayloadSchema = baseSchema.concat(
  Joi.object({
    commissionId: Joi.number().required(),
    commissionQId: Joi.string().allow(null).required(),
  }),
);
const onboardingUserPayloadSchema = baseSchema.concat(
  Joi.object({
    carrierId: Joi.number().required(),
    dispatcherId: Joi.number(),
  }),
);
const customerRegistrationPayloadSchema = baseSchema.concat(
  Joi.object({
    customerRegistrationId: Joi.number().required(),
    customerId: JoiNumberNullable(),
  }),
);
const customerUserRegistrationPayloadSchema = baseSchema.concat(
  Joi.object({
    customerUserId: Joi.number().required(),
    invitationId: Joi.number().required(),
  }),
);

export const validateUserAuthTokenPayload = (payload: unknown) => {
  return validateSchemaOrThrow<TUserAuthTokenPayload>(userPayloadSchema, payload);
};

export const validateAuthTokenPayload = (payload: unknown): TAuthTokenPayload => {
  const { role } = validateSchemaOrThrow<TAuthTokenPayloadBase>(baseSchema, payload);
  switch (role) {
    case EAuthRole.OnboardingUser:
      return validateSchemaOrThrow<TOnboardingUserAuthTokenPayload>(onboardingUserPayloadSchema, payload);
    case EAuthRole.AttachmentsUploader:
      return validateSchemaOrThrow<TAttachmentsUploaderAuthTokenPayload>(attachmentUploaderPayloadSchema, payload);
    case EAuthRole.CustomerRegistration:
      return validateSchemaOrThrow<TCustomerRegistrationAuthTokenPayload>(customerRegistrationPayloadSchema, payload);
    default:
      break;
  }
  if (role === EAuthRole.CustomerUserRegistration) {
    return validateSchemaOrThrow<TCustomerUserRegistrationAuthTokenPayload>(
      customerUserRegistrationPayloadSchema,
      payload,
    );
  }

  return validateSchemaOrThrow<TUserAuthTokenPayload>(userPayloadSchema, payload);
};
