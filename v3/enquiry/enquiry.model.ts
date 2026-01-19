import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { InvalidBodyException } from '../errors';

import { TListRequestQuery } from './list/list.interface';
import { TUpdateRequestBody } from './update/update.interface';
import {
  EnquiryState,
  EnquiryStateForDispatcher,
  TCloseRequestBody,
  TContactDispatcherRequestBody,
  TCreateRequestBody,
} from './enquiry.interface';

export const validateListQuery = (query: object) => {
  const schema = Joi.object({
    limit: Joi.number().required(),
    offset: Joi.number().required(),
    search: Joi.string(),
    state: Joi.array().items(
      Joi.string()
        .valid(EnquiryState.OPENED)
        .valid(EnquiryState.CLOSED)
        .valid(EnquiryStateForDispatcher.CLOSED)
        .valid(EnquiryStateForDispatcher.NEW)
        .valid(EnquiryStateForDispatcher.RESPONDED)
        .valid(EnquiryStateForDispatcher.WON),
    ),
  });
  return validateSchemaOrThrow<TListRequestQuery>(schema, query);
};

export const validateContactDispatchersBody = (body: object) => {
  const dispatcherSchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  const schema = Joi.object({
    enquiryId: Joi.number().required(),
    dispatcherIds: Joi.array().items(Joi.number()).required().min(1),
    dispatcher: dispatcherSchema.required(),
    body: Joi.object({
      cs: Joi.string().required(),
      en: Joi.string().required(),
      de: Joi.string().required(),
    }).required(),
    subject: Joi.string().required(),
    parameters: Joi.object({
      minLength: Joi.number().min(0),
      minHeight: Joi.number().min(0),
      minWeight: Joi.number().min(0),
      minWidth: Joi.number().min(0),
      requiredFeatures: Joi.array().items(Joi.number()),
      requiredFeaturesSome: Joi.array().items(Joi.number()),
      vehicleTypes: Joi.array().items(Joi.number()),
    }),
  });
  return validateSchemaOrThrow<TContactDispatcherRequestBody>(schema, body);
};

export const validateCreateBody = (body: object) => {
  const schema = Joi.object({
    commission_id: Joi.number().required(),
    note: Joi.string().allow(null).required(),
    parameters: Joi.object({
      minLength: Joi.number().required().min(0),
      minHeight: Joi.number().required().min(0),
      minWeight: Joi.number().required().min(0),
      minWidth: Joi.number().required().min(0),
      requiredFeatures: Joi.array().items(Joi.number()).required(),
      requiredFeaturesSome: Joi.array().items(Joi.number()).required(),
      s: Joi.array().items(Joi.number()).required(),
    }).required(),
    contactedDispatchers: Joi.array().items(Joi.number()).required().min(1),
  });
  return validateSchemaOrThrow<TCreateRequestBody>(schema, body);
};

export const validateUpdateBody = (body: object) => {
  const schema = Joi.object({
    state: Joi.string().valid(EnquiryState.WAITING).valid(EnquiryState.OPENED).valid(EnquiryState.CLOSED),
    parameters: Joi.object({
      minLength: Joi.number().required().min(0),
      minHeight: Joi.number().required().min(0),
      minWeight: Joi.number().required().min(0),
      minWidth: Joi.number().required().min(0),
      requiredFeatures: Joi.array().items(Joi.number()).required(),
      requiredFeaturesSome: Joi.array().items(Joi.number()).required(),
      vehicleTypes: Joi.array().items(Joi.number()).required(),
    }),
    note: Joi.string().allow(null),
    contactedDispatchers: Joi.object({
      add: Joi.array().items(Joi.number()),
      remove: Joi.array().items(Joi.number()),
    }),
  });
  return validateSchemaOrThrow<TUpdateRequestBody>(schema, body);
};

export const validateCloseBody = (body: object) => {
  const schema = Joi.object({
    offerId: Joi.number().required(),
  });
  return validateSchemaOrThrow<TCloseRequestBody>(schema, body);
};

export const validate = (schema: Joi.AnySchema, object: unknown) => {
  const validationResult = schema.validate(object);
  if (validationResult.error) throw new InvalidBodyException(validationResult.error.details);
  return validationResult;
};
