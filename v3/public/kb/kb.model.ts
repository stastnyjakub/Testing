import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TOauth2AuthorizationCallbackRequestQuery, TOauth2RegistrationCallbackRequestQuery } from './types';

export const validateOauth2RegistrationCallbackRequestQuery = (body: unknown) => {
  const schema = Joi.object({
    salt: Joi.string().required(),
    encryptedData: Joi.string().required(),
  });

  return validateSchemaOrThrow<TOauth2RegistrationCallbackRequestQuery>(schema, body);
};

export const validateOauth2AuthorizationCallbackRequestQuery = (body: unknown) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    client_id: Joi.string(),
  }).options({ allowUnknown: true });

  return validateSchemaOrThrow<TOauth2AuthorizationCallbackRequestQuery>(schema, body);
};
