import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TSendDischargeMailRequestBody } from './types';

export const validateNeutralizationBody = (body: object) => {
  const schema = Joi.object({
    lang: Joi.string().valid('en', 'cs', 'de').required(),
    date: Joi.string().required(),
    qid: Joi.string().required(),
    dischargeNumber: Joi.number().required(),

    senderCompany: Joi.string().required(),
    senderStreet: Joi.string().required(),
    senderCountry: Joi.string().required(),
    senderPostalCode: Joi.string().required(),
    senderCity: Joi.string().required(),

    receiverCompany: Joi.string().allow('').required(),
    receiverStreet: Joi.string().allow('').required(),
    receiverCountry: Joi.string().allow('').required(),
    receiverPostalCode: Joi.string().allow('').required(),
    receiverCity: Joi.string().allow('').required(),
  });
  return schema.validate(body);
};

export const validateSendDischargeMailRequestBody = (body: object) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).required(),
    message: Joi.string().required(),
    subject: Joi.string().required(),
    commissionId: Joi.number().required(),
    locationId: Joi.number().required(),
    lang: Joi.string().valid('cs', 'en', 'de').required(),
  });
  return validateSchemaOrThrow<TSendDischargeMailRequestBody>(schema, body);
};
