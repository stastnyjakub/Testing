import * as Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { TSendConfirmationMailRequestBody, TSendMailRequestBody } from './types';

export const validateCreateBody = (body: object) => {
  const schema = Joi.object({
    commissionId: Joi.number().required(),
    lang: Joi.string().valid('en', 'cs', 'de').required(),
    qid: Joi.string().required(),
    carrierDispatcherName: Joi.string().allow('').required(),
    carrierCompany: Joi.string().required(),
    carrierDispatcherGsm: Joi.string().allow('').required(),
    carrierStreet: Joi.string().allow('').required(),
    carrierDispatcherEmail: Joi.string().allow('').required(),
    carrierCountry: Joi.string().allow('').required(),
    carrierPostalCode: Joi.string().allow('').required(),
    carrierCity: Joi.string().allow('').required(),
    carrierDriver: Joi.string().allow('').required(),
    carrierRegistrationNumber: Joi.string().allow('').required(),
    carrierGsm: Joi.string().allow('').required(),
    carrierTaxNumber: Joi.string().allow('').required(),
    loadings: Joi.array().items(
      Joi.object({
        loadingNumber: Joi.number().required(),
        loadingDate: Joi.string().required(),
        loadingDateTo: Joi.string().allow('').required(),
        loadingTime: Joi.string().allow('').required(),
        loadingCompany: Joi.string().allow('').required(),
        loadingStreet: Joi.string().allow('').required(),
        loadingPostalCode: Joi.string().allow('').required(),
        loadingCountry: Joi.string().allow('').required(),
        loadingCity: Joi.string().allow('').required(),
        loadingGps: Joi.string().allow('').required(),
        loadingRefNumber: Joi.string().allow(''),
      }),
    ),
    discharges: Joi.array().items(
      Joi.object({
        dischargeNumber: Joi.number().required(),
        dischargeDate: Joi.string().required(),
        dischargeDateTo: Joi.string().allow('').required(),
        dischargeTime: Joi.string().allow('').required(),
        dischargeCompany: Joi.string().allow('').required(),
        dischargeStreet: Joi.string().allow('').required(),
        dischargeCountry: Joi.string().allow('').required(),
        dischargePostalCode: Joi.string().allow('').required(),
        dischargeCity: Joi.string().allow('').required(),
        dischargeGps: Joi.string().allow('').required(),
        neutralization: Joi.boolean(),
      }),
    ),
    items: Joi.array().items(
      Joi.object({
        itemLoading: Joi.string().required(),
        itemDischarge: Joi.string().required(),
        itemName: Joi.string().required(),
        itemPackage: Joi.string().allow('').required(),
        itemQuantity: Joi.string().allow('').required(),
        itemSize: Joi.string().allow('').required(),
        itemLoadingMeters: Joi.string().allow('').required(),
        itemWeight: Joi.string().allow('').required(),
        itemWeightBrutto: Joi.string().allow('').required(),
      }),
    ),
    carrierRegistrationPlate: Joi.string().allow('').required(),
    disposition: Joi.string().allow('').required(),
    carrierPrice: Joi.number().required(),
    orderCurrency: Joi.string().valid('CZK', 'EUR').required(),
    date: Joi.string().required(),
    createdBy: Joi.string().required(),
    createdByPhoneNumber: Joi.string().required(),
  });
  return schema.validate(body);
};

export const validateSendMailRequestBody = (body: object) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).required(),
    message: Joi.string().required(),
    subject: Joi.string().required(),
    commissionId: Joi.number().required(),
    lang: Joi.string().valid('cs', 'en', 'de').required(),
  });
  return validateSchemaOrThrow<TSendMailRequestBody>(schema, body);
};

export const validateSendConfirmationMailRequestBody = (body: object) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).required(),
    message: Joi.string().required(),
    subject: Joi.string().required(),
    lang: Joi.string().valid('cs', 'en', 'de').required(),
  });
  return validateSchemaOrThrow<TSendConfirmationMailRequestBody>(schema, body);
};

export const validateConfirmationEmailBody = (body: object) => {
  const DispatcherSchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  const BaseMailSchema = Joi.object({
    to: Joi.string().email().required(),
    dispatcher: DispatcherSchema.required(),
    qid: Joi.string().required(),
    subject: Joi.string(),
    body: Joi.string(),
    lang: Joi.string().required(),
    itemName: Joi.string().required(),
    itemPackage: Joi.string().allow('').required(),
    itemWeight: Joi.string().allow('').required(),
    itemLoadingMeters: Joi.string().allow('').required(),
    loadingDate: Joi.string().required(),
    loadingAddress: Joi.string().required(),
    dischargeAddress: Joi.string().required(),
    dischargeDate: Joi.string().required(),
    carrierPrice: Joi.string().required(),
    driverPhone: Joi.string().allow('').required(),
    carrierRegistrationPlate: Joi.string().allow('').required(),
  });

  return BaseMailSchema.validate(body);
};
