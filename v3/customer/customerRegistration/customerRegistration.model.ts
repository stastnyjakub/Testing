import Joi from '@hapi/joi';
import { z } from 'zod';

import { JoiStringNullable, validateSchemaOrThrow } from '@/utils';

import { TProcessCustomerRegistrationRequestRequestBody, TRegisterCustomerRequestBody } from './types';

export const validateProcessCustomerRegistrationRequestRequestBody = (body: object) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    companyIdentification: Joi.string().required(),
  });

  return validateSchemaOrThrow<TProcessCustomerRegistrationRequestRequestBody>(schema, body);
};

export const validateRegisterCustomerRequestBody = (body: object) => {
  const schema = Joi.object({
    company: Joi.object({
      name: Joi.string().required(),
      taxId: Joi.string().required(),
      countryCode: Joi.string().required(),
      street: Joi.string().required(),
      postalCode: Joi.string().required(),
      city: Joi.string().required(),
      sameBillingAddress: Joi.boolean().required(),
      cityBilling: Joi.string().required(),
      countryCodeBilling: Joi.string().required(),
      postalCodeBilling: Joi.string().required(),
      streetBilling: Joi.string().required(),
      billingEmail: Joi.string().email().required(),
    }),
    user: Joi.object({
      name: Joi.string().required(),
      surname: Joi.string().required(),
      phone: JoiStringNullable(),
    }),
  });

  return validateSchemaOrThrow<TRegisterCustomerRequestBody>(schema, body);
};

export const sendRegistrationRequestBodySchema = z.object({
  customerRegistrationId: z.number(),
});
export type TSendRegistrationRequestBody = z.infer<typeof sendRegistrationRequestBodySchema>;
