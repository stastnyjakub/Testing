import Joi from '@hapi/joi';

import { validateSchemaOrThrow, validateTimestamp } from '@/utils';

import {
  TCalculateCommissionPriceEstimationRequestBody as TCalculateCommissionPriceEstimationRequestBody,
  THandleEnquiryFormRequestBody,
} from './types';

export const enquiryFormPointSchema = Joi.object({
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
  country: Joi.string().min(1).required(),
  countryCode: Joi.string().uppercase().min(1).required(),
  street: Joi.string().min(1),
  city: Joi.string().min(1),
  postalCode: Joi.string().pattern(/^\d{3}\s?\d{2}$/, 'postalCode'),
});

export const calculateCommissionPriceEstimationSearchParametersSchema = Joi.object({
  startPoint: enquiryFormPointSchema.required(),
  endPoint: enquiryFormPointSchema.required(),
  loadingMeters: Joi.number().min(1).required(),
});

export const validateCalculateCommissionPriceEstimationRequestBody = (body: unknown) => {
  const schema = calculateCommissionPriceEstimationSearchParametersSchema
    .keys({
      email: Joi.string().email().lowercase().trim(),
    })
    .unknown(false);

  return validateSchemaOrThrow<TCalculateCommissionPriceEstimationRequestBody>(schema, body);
};

export const validateHandleEnquiryFormRequestBody = (body: unknown) => {
  const schema = Joi.object({
    loadingDate: Joi.number().min(0).required().custom(validateTimestamp),
    goodsWeight: Joi.number().min(1).required(),
    email: Joi.string().email().lowercase().trim().required(),
    estimationCode: Joi.string().min(1).required(),
    phone: Joi.string().min(1),
  }).unknown(false);

  return validateSchemaOrThrow<THandleEnquiryFormRequestBody>(schema, body);
};
