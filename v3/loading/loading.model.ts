import * as Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TSendMailRequestBody } from './types';

export const validateCreateBody = (body: object) => {
  const schema = Joi.object({
    qid: Joi.string().required(),
    lang: Joi.string().valid('en', 'cs', 'de').required(),
    customerCompany: Joi.string().required(),
    items: Joi.string().required(),
    loadingDate: Joi.string().required(),
    loadingTime: Joi.string().allow('').required(),
    carrierRegistrationPlate: Joi.string().allow('').required(),
    carrierDriver: Joi.string().allow('').required(),
    carrierGsm: Joi.string().allow('').required(),
    loadingRefNumber: Joi.string().allow('').required(),
  });
  return schema.validate(body);
};

export const validateSendMailRequestBody = (body: object) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).required(),
    message: Joi.string().required(),
    subject: Joi.string().required(),
    commissionId: Joi.number().required(),
    lang: Joi.string().valid('cs', 'en', 'de').required(),
  });
  return validateSchemaOrThrow<TSendMailRequestBody>(schema, body);
};
