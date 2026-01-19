import Joi from '@hapi/joi';

import { JoiStringNullish, validateSchemaOrThrow } from '@/utils';

import { TCreateCustomerContactRequestBody, TUpdateCustomerContactRequestBody } from './customerContact.types';

export const createCustomerContactSchema = Joi.object({
  name: JoiStringNullish(),
  surname: JoiStringNullish(),
  email: JoiStringNullish(),
  phone: JoiStringNullish(),
});
export const validateCreateCustomerContactRequestBody = (body: object) => {
  const schema = createCustomerContactSchema;
  return validateSchemaOrThrow<TCreateCustomerContactRequestBody>(schema, body);
};

export const updateCustomerContactSchema = Joi.object({
  name: JoiStringNullish(),
  surname: JoiStringNullish(),
  email: JoiStringNullish(),
  phone: JoiStringNullish(),
});
export const validateUpdateCustomerContactRequestBody = (body: object) => {
  const schema = updateCustomerContactSchema;
  return validateSchemaOrThrow<TUpdateCustomerContactRequestBody>(schema, body);
};
