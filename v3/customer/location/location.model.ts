import Joi from '@hapi/joi';

import {
  JoiBooleanNullish,
  JoiBooleanOptional,
  JoiNumberNullish,
  JoiNumberOptional,
  JoiStringNullish,
  validateSchemaOrThrow,
} from '@/utils';

import { TCreateLocationRequestBody, TUpdateLocationRequestBody } from './location.types';

export const createLocationSchema = Joi.object({
  city: JoiStringNullish(),
  name: JoiStringNullish(),
  country: JoiStringNullish(),
  countryCode: JoiStringNullish(),
  postalCode: JoiStringNullish(),
  street: JoiStringNullish(),
  latitude: JoiNumberNullish(),
  longitude: JoiNumberNullish(),
  email: JoiStringNullish().email(),
  firstName: JoiStringNullish(),
  lastName: JoiStringNullish(),
  phone: JoiStringNullish(),
  note: JoiStringNullish(),
  discharge: JoiBooleanOptional(),
  loading: JoiBooleanOptional(),
  areaMap: JoiStringNullish(),
  ramps: Joi.array()
    .items(
      Joi.object({
        number: Joi.number().required(),
        gatehousePhone: JoiStringNullish(),
      }),
    )
    .optional(),
});
export const validateCreateLocationRequestBody = (body: unknown) => {
  const schema = createLocationSchema;
  return validateSchemaOrThrow<TCreateLocationRequestBody>(schema, body);
};

export const updateLocationSchema = Joi.object({
  city: JoiStringNullish(),
  name: JoiStringNullish(),
  country: JoiStringNullish(),
  countryCode: JoiStringNullish(),
  postalCode: JoiStringNullish(),
  street: JoiStringNullish(),
  latitude: JoiNumberNullish(),
  longitude: JoiNumberNullish(),
  email: JoiStringNullish().email(),
  firstName: JoiStringNullish(),
  lastName: JoiStringNullish(),
  phone: JoiStringNullish(),
  note: JoiStringNullish(),
  discharge: JoiBooleanNullish(),
  loading: JoiBooleanNullish(),
  areaMap: JoiStringNullish(),
  ramps: Joi.array()
    .items(
      Joi.object({
        rampId: JoiNumberOptional(),
        number: JoiNumberOptional(),
        gatehousePhone: JoiStringNullish(),
      }),
    )
    .optional(),
});
export const validateUpdateLocationRequestBody = (body: unknown) => {
  const schema = updateLocationSchema;
  return validateSchemaOrThrow<TUpdateLocationRequestBody>(schema, body);
};
