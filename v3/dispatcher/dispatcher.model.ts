import * as Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { InvalidBodyException } from '../errors';

import { ESearchType } from './commissionSearch/commissionSearch.types';
import { EmailBody } from './dispatcher.interface';

export const validateId = (id: string): boolean => {
  const parsedId = Number(id);
  if (isNaN(parsedId)) {
    return false;
  }
  return true;
};

export enum DispatcherOnboardingState {
  UNREGISTERED = 'unregistered',
  PENDING = 'pending',
  REGISTERED = 'registered',
}

export const validatePatchBody = (body: any) => {
  const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string().allow(null).allow(''),
    notificationEmail: Joi.boolean(),
    notificationWhatsapp: Joi.boolean(),
    language_id: Joi.number(),
    dispatcherVehicles: Joi.object({
      toCreate: Joi.array().items(
        Joi.object({
          vehicleType_id: Joi.number().min(1).max(4),
          maxHeight: Joi.number().allow(null),
          maxLength: Joi.number().allow(null),
          maxWeight: Joi.number().allow(null),
          maxWidth: Joi.number().allow(null),
          dispatcherVehicleFeatures: Joi.object({
            toCreate: Joi.array().items(
              Joi.object({
                vehicleFeature_id: Joi.number().min(1).max(16).required(),
              }),
            ),
          }),
        }),
      ),
      toUpdate: Joi.array().items(
        Joi.object({
          dispatcherVehicle_id: Joi.number().required(),
          vehicleType_id: Joi.number().min(1).max(4),
          maxHeight: Joi.number().allow(null),
          maxLength: Joi.number().allow(null),
          maxWeight: Joi.number().allow(null),
          maxWidth: Joi.number().allow(null),
          dispatcherVehicleFeatures: Joi.object({
            toCreate: Joi.array().items(
              Joi.object({
                vehicleFeature_id: Joi.number().min(1).max(16).required(),
              }),
            ),
            toUpdate: Joi.array().items(
              Joi.object({
                dispatcherVehicleFeature_id: Joi.number().required(),
                vehicleFeature_id: Joi.number().min(1).max(16).required(),
              }),
            ),
            toDelete: Joi.array().items(
              Joi.object({
                dispatcherVehicleFeature_id: Joi.number().required(),
              }),
            ),
          }),
        }),
      ),
      toDelete: Joi.array().items(
        Joi.object({
          dispatcherVehicle_id: Joi.number().min(1).max(2147483647).required(),
        }),
      ),
    }),
    places: Joi.object({
      toCreate: Joi.array().items(
        Joi.object({
          city: Joi.string().allow(null, ''),
          country: Joi.string().allow(null, ''),
          countryCode: Joi.string().allow(null, '').min(2).max(2),
          directionLoading: Joi.boolean(),
          directionDischarge: Joi.boolean(),
          latitude: Joi.number().allow(null),
          longitude: Joi.number().allow(null),
          note: Joi.string().allow(null, ''),
          postalCode: Joi.string().allow(null, ''),
        }),
      ),
      toUpdate: Joi.array().items(
        Joi.object({
          place_id: Joi.number().min(1).max(2147483647).required(),
          dispatcher_id: Joi.number().min(1).max(2147483647).allow(null),
          city: Joi.string().allow(null, ''),
          country: Joi.string().allow(null, ''),
          countryCode: Joi.string().allow(null, '').min(2).max(2),
          directionLoading: Joi.boolean(),
          directionDischarge: Joi.boolean(),
          latitude: Joi.number().allow(null),
          longitude: Joi.number().allow(null),
          note: Joi.string().allow(null, ''),
          postalCode: Joi.string().allow(null, ''),
        }),
      ),
      toDelete: Joi.array().items(
        Joi.object({
          place_id: Joi.number().min(1).max(2147483647).required(),
        }),
      ),
    }),
  });
  return schema.validate(body);
};

export const validateCreateBody = (body: any) => {
  const schema = Joi.object({
    carrier_id: Joi.number().required(),
    email: Joi.string().email(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().allow(null).allow(''),
    password: Joi.string(),
    language_id: Joi.number(),
    notificationEmail: Joi.boolean().required(),
    notificationWhatsapp: Joi.boolean().required(),
    dispatcherVehicles: Joi.object({
      toCreate: Joi.array().items(
        Joi.object({
          vehicleType_id: Joi.number().min(1).max(4),
          maxHeight: Joi.number().allow(null),
          maxLength: Joi.number().allow(null),
          maxWeight: Joi.number().allow(null),
          maxWidth: Joi.number().allow(null),
          dispatcherVehicleFeatures: Joi.object({
            toCreate: Joi.array().items(
              Joi.object({
                vehicleFeature_id: Joi.number().min(1).max(16).required(),
              }),
            ),
          }),
        }),
      ),
    }),
    places: Joi.object({
      toCreate: Joi.array().items(
        Joi.object({
          city: Joi.string().allow(null, ''),
          country: Joi.string().allow(null, ''),
          countryCode: Joi.string().allow(null, '').min(2).max(2),
          directionLoading: Joi.boolean(),
          directionDischarge: Joi.boolean(),
          latitude: Joi.number().allow(null),
          longitude: Joi.number().allow(null),
          note: Joi.string().allow(null, ''),
          postalCode: Joi.string().allow(null, ''),
        }),
      ),
    }),
  });
  return schema.validate(body);
};

export const validateCheckMailQuery = (body: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(body);
};

export const validateCheckTokenQuery = (body: any) => {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  return schema.validate(body);
};

export const validateEmailBody = (body: any) => {
  const schema = Joi.object({
    dispatcherId: Joi.number().required(),
    subject: Joi.string().required(),
    body: Joi.string().required(),
  });
  return validateSchemaOrThrow<EmailBody>(schema, body);
};

export const validateCommissionSearchBody = (body: any) => {
  const schema = Joi.object({
    searchType: Joi.string()
      .valid(ESearchType.COMMISSION)
      .valid(ESearchType.DISPATCHER)
      .valid(ESearchType.HQ)
      .valid(null),
    loadingRadius: Joi.number().min(0).required(),
    loadingLocation: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).required(),
    dischargeRadius: Joi.number().min(0).required(),
    dischargeLocation: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).required(),
    directions: Joi.boolean().required(),

    vehicleTypes: Joi.array().items(Joi.number()).required(),
    minLength: Joi.number().min(0).allow(null).required(),
    minHeight: Joi.number().min(0).allow(null).required(),
    minWidth: Joi.number().min(0).allow(null).required(),
    minWeight: Joi.number().min(0).allow(null).required(),

    requiredFeatures: Joi.array().items(Joi.number()).required(),
    requiredFeaturesSome: Joi.array().items(Joi.number()).required(),
  });
  return validate(schema, body);
};

export const validate = (schema: Joi.AnySchema, object: unknown) => {
  const validationResult = schema.validate(object);
  if (validationResult.error) throw new InvalidBodyException(validationResult.error.details);
  return validationResult;
};
