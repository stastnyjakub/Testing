import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TLoginRequestBody, TRefreshTokenRequestCookies } from './types';

export const validateRefreshTokenRequestCookies = (cookies: object) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
  });
  return validateSchemaOrThrow<TRefreshTokenRequestCookies>(schema, cookies);
};

export const validateLoginRequestBody = (body: object) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return validateSchemaOrThrow<TLoginRequestBody>(schema, body);
};
