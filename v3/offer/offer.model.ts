import Joi from '@hapi/joi';

import { InvalidBodyException } from '../errors';

export const validateCreateBody = (body: object): Joi.ValidationResult => {
  const schema = Joi.object({
    enquiryId: Joi.number().required(),
    dispatcherId: Joi.number().required(),
    response: Joi.boolean().required(),
    price: Joi.number().allow(null).required(),
    currency: Joi.string().required(),
  });
  return validate(schema, body);
};

export const validateUpdateBody = (body: object): Joi.ValidationResult => {
  const schema = Joi.object({
    preferenced: Joi.boolean(),
    note: Joi.string().allow(null),
  });
  return validate(schema, body);
};

export const validate = (schema: Joi.AnySchema, object: unknown) => {
  const validationResult = schema.validate(object);
  if (validationResult.error) throw new InvalidBodyException(validationResult.error.details);
  return validationResult;
};
