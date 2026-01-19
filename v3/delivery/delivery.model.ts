import * as Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TSendDeliveryMailRequestBody } from './types';

export const validateCreateBody = (body: object) => {
  const schema = Joi.object({
    qid: Joi.string().required(),
    lang: Joi.string().valid('en', 'cs', 'de').required(),
    customerCompany: Joi.string().required(),
    items: Joi.string().required(),
    dischargeDate: Joi.string().allow('').required(),
    dischargeTime: Joi.string().allow('').required(),
    carrierRegistrationPlate: Joi.string().allow('').required(),
    carrierDriver: Joi.string().allow('').required(),
    carrierGsm: Joi.string().allow('').required(),
  });
  return schema.validate(body);
};

export const validateSendDeliveryMailRequestBody = (body: object) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).required(),
    message: Joi.string().required(),
    subject: Joi.string().required(),
    commissionId: Joi.number().required(),
    lang: Joi.string().valid('cs', 'en', 'de').required(),
  });
  return validateSchemaOrThrow<TSendDeliveryMailRequestBody>(schema, body);
};
