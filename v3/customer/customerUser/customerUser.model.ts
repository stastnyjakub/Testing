import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TCreateCustomerUserRequestBody } from './types';

export const createCustomerUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(1).max(100).required(),
  surname: Joi.string().min(1).max(100).required(),
  phone: Joi.string().allow(null).optional(),
});
export const validateCreateCustomerUserRequestBody = (body: object) => {
  const schema = createCustomerUserSchema;
  return validateSchemaOrThrow<TCreateCustomerUserRequestBody>(schema, body);
};
