import Joi from '@hapi/joi';

import { JoiNumberOptional, JoiStringOptional, validateSchemaOrThrow } from '@/utils';

import { TListCustomersRequestQuery } from './listCustomers.types';

const stringFilterSchema = Joi.object({
  equals: JoiStringOptional(),
  contains: JoiStringOptional(),
});

const numberFilterSchema = Joi.object({
  equals: JoiNumberOptional(),
  lt: JoiNumberOptional(),
  lte: JoiNumberOptional(),
  gt: JoiNumberOptional(),
  gte: JoiNumberOptional(),
});

export const validateListCustomersRequestQuery = (query: object) => {
  const schema = Joi.object({
    limit: JoiNumberOptional().integer().min(1).max(1000),
    offset: JoiNumberOptional().integer().min(0),
    search: JoiStringOptional(),

    name: stringFilterSchema.optional(),
    number: numberFilterSchema.optional(),
    city: stringFilterSchema.optional(),
    country: stringFilterSchema.optional(),
    countryCode: stringFilterSchema.optional(),
    postalCode: stringFilterSchema.optional(),
    street: stringFilterSchema.optional(),
    companyRegistrationNumber: stringFilterSchema.optional(),
    taxId: stringFilterSchema.optional(),
    note: stringFilterSchema.optional(),
    billingEmail: stringFilterSchema.optional(),
  });

  return validateSchemaOrThrow<TListCustomersRequestQuery>(schema, query);
};
