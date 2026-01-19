import Joi from '@hapi/joi';

import { EAuthRole } from '@/auth/types';
import { validateSchemaOrThrow } from '@/utils';

import { TCreateApiKeyRequestBody } from './types';

export const validateCreateApiKeyRequestBody = (data: unknown) => {
  const schema = Joi.object({
    role: Joi.string()
      .valid(...[EAuthRole.ApiKeyAdmin, EAuthRole.ApiKeyEnquiryForm, EAuthRole.ApiKeyJobCaller])
      .required(),
  });
  return validateSchemaOrThrow<TCreateApiKeyRequestBody>(schema, data);
};
