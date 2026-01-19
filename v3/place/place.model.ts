import * as Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TListPlacesRequestQuery, TUpdatePlacesRequestBody } from './types';

export const validateListPlacesRequestQuery = (query: object) => {
  const schema = Joi.object({
    dispatcherId: Joi.number().integer(),
  });
  return validateSchemaOrThrow<TListPlacesRequestQuery>(schema, query);
};

export const validateUpdatePlacesRequestBody = (body: object) => {
  const schema = Joi.object({
    places: Joi.array().items(
      Joi.object({
        placeId: Joi.number().required(),
        city: Joi.string().optional(),
        country: Joi.string().optional(),
        countryCode: Joi.string().optional(),
        postalCode: Joi.string().optional(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        note: Joi.string().optional(),
        directionLoading: Joi.boolean().optional(),
        directionDischarge: Joi.boolean().optional(),
      }),
    ),
  });

  return validateSchemaOrThrow<TUpdatePlacesRequestBody>(schema, body);
};
