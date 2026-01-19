import Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TListVehiclesRequestQuery, TUpdateVehicleRequestBody } from './types';

export const validateListVehiclesRequestQuery = (query: object) => {
  const schema = Joi.object({
    dispatcherId: Joi.number().integer().optional(),
  });

  return validateSchemaOrThrow<TListVehiclesRequestQuery>(schema, query);
};

export const validateUpdateVehicleRequestBody = (body: object) => {
  const schema = Joi.object({
    vehicleTypeId: Joi.number().integer().optional(),
    maxHeight: Joi.number().optional(),
    maxWeight: Joi.number().optional(),
    maxLength: Joi.number().optional(),
    maxWidth: Joi.number().optional(),
    vehicleFeatures: Joi.array()
      .items(
        Joi.object({
          vehicleFeatureId: Joi.number().integer().required(),
        }),
      )
      .optional(),
  });

  return validateSchemaOrThrow<TUpdateVehicleRequestBody>(schema, body);
};
