import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TListCarriersRequestBody } from './listCarriers.types';

const stringFilterSchema = Joi.object({
  equals: Joi.string().optional(),
  contains: Joi.string().optional(),
});

const numberFilterSchema = Joi.object({
  equals: Joi.number().optional(),
  lt: Joi.number().optional(),
  lte: Joi.number().optional(),
  gt: Joi.number().optional(),
  gte: Joi.number().optional(),
});

export const validateListCarriersRequestBody = (body: object) => {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).max(1000).optional(),
    offset: Joi.number().integer().min(0).optional(),
    search: Joi.string().optional(),

    deleted: Joi.boolean().optional(),
    company: stringFilterSchema.optional(),
    companyRegistrationNumber: stringFilterSchema.optional(),
    taxId: stringFilterSchema.optional(),
    street: stringFilterSchema.optional(),
    city: stringFilterSchema.optional(),
    country: stringFilterSchema.optional(),
    countryCode: stringFilterSchema.optional(),
    postalCode: stringFilterSchema.optional(),
    number: numberFilterSchema.optional(),
    tsEdited: numberFilterSchema.optional(),
    tsAdded: numberFilterSchema.optional(),
  });

  return validateSchemaOrThrow<TListCarriersRequestBody>(schema, body);
};
