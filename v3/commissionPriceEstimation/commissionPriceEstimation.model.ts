import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TGetEstimationRequestParameters } from './types';

export const validateGetEstimationRequestParameters = (data: unknown) => {
  const schema = Joi.object({
    estimationCode: Joi.string().required(),
  }).options({ stripUnknown: true });

  return validateSchemaOrThrow<TGetEstimationRequestParameters>(schema, data);
};
