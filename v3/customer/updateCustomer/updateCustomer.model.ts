import Joi from '@hapi/joi';

import { JoiStringNullish, validateSchemaOrThrow } from '@/utils';

import { TUpdateCustomerRequestBody } from '../types';

export const validateUpdateCustomerRequestBody = (body: object) => {
  const schema = Joi.object({
    defaultDueDate: JoiStringNullish(),
    city: JoiStringNullish(),
    country: JoiStringNullish(),
    countryCode: JoiStringNullish(),
    postalCode: JoiStringNullish(),
    street: JoiStringNullish(),
    name: JoiStringNullish(),
    taxId: JoiStringNullish(),
    companyRegistrationNumber: JoiStringNullish(),
    billingEmail: Joi.string().email().allow(null).optional(),
    note: JoiStringNullish(),
    sameBillingAddress: Joi.boolean().optional(),
    cityBilling: JoiStringNullish(),
    countryCodeBilling: JoiStringNullish(),
    postalCodeBilling: JoiStringNullish(),
    streetBilling: JoiStringNullish(),
  });

  return validateSchemaOrThrow<TUpdateCustomerRequestBody>(schema, body);
};
