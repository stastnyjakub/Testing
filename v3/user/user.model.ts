import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TCheckEmailAvailabilityRequestQuery } from './types';

export const validateCheckEmailAvailabilityRequestQuery = (query: object) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return validateSchemaOrThrow<TCheckEmailAvailabilityRequestQuery>(schema, query);
};
