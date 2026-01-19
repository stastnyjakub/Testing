import * as Joi from '@hapi/joi';

import { validateSchemaOrThrow } from '@/utils';

import { EnquiryState } from '../enquiry/enquiry.interface';
import { InvalidBodyException } from '../errors';

import { ECommissionState, TCommissionListCommissionNumbersRequestQuery } from './types';

export const validateCommissionListCommissionNumbersQuery = (query: object) => {
  const schema = Joi.object({
    search: Joi.string(),
    age: Joi.string(),
  });
  return validateSchemaOrThrow<TCommissionListCommissionNumbersRequestQuery>(schema, query);
};

export const validateParameters = (body: object) => {
  const schema = Joi.object({
    items: Joi.string(),
    limit: Joi.string(),
    offset: Joi.string(),
    sort: Joi.string(),
    search: Joi.string(),
    state: Joi.string().valid(ECommissionState.Enquiry, ECommissionState.InComplete, ECommissionState.Complete),
    relation: Joi.string(),
    week_gte: Joi.number(),
    week: Joi.number(),
    week_lte: Joi.number(),
    number_gte: Joi.number(),
    number_lte: Joi.number(),
    year_gte: Joi.number(),
    year_lte: Joi.number(),
    invoiceAttachment: Joi.string(),
    customer_company: Joi.string(),
    loading_date_gte: Joi.number(),
    loading_date_lte: Joi.number(),
    loading_city: Joi.string(),
    loading_zip: Joi.string(),
    discharge_date_gte: Joi.number(),
    discharge_date_lte: Joi.number(),
    discharge_city: Joi.string(),
    discharge_zip: Joi.string(),
    carrierAssignedBy: Joi.string(),
    total_weight_gte: Joi.number(),
    total_weight_lte: Joi.number(),
    total_loading_meters_gte: Joi.number(),
    total_loading_meters_lte: Joi.number(),
    total_loading_meters: Joi.number(),
    priceCustomer_gte: Joi.number(),
    priceCustomer_lte: Joi.number(),
    invNumber_gte: Joi.number(),
    invNumber_lte: Joi.number(),
    carrier_company: Joi.string(),
    priceCarrier_gte: Joi.number(),
    priceCarrier_lte: Joi.number(),
    provision_gte: Joi.number(),
    provision_lte: Joi.number(),
    addedBy: Joi.string(),
    notification: Joi.boolean(),
    note: Joi.string(),
    enquiryState: Joi.string().allow(EnquiryState.CLOSED).allow(EnquiryState.OPENED),
  });
  return validate(schema, body);
};

export const validateRequestBodyCreate = (body: object) => {
  const schema = Joi.object({
    commission_id: Joi.number(),
    carrier_id: Joi.number().allow(null),
    carrierDriver: Joi.string().allow(null, ''),
    carrierGsm: Joi.string().allow(null, ''),
    carrierOrderCreatedBy: Joi.string().allow(null, ''),
    carrierOrderSent: Joi.boolean().allow(null),
    currencyCarrier: Joi.string().allow(null, ''),
    currencyCustomer: Joi.string().allow(null, ''),
    carrierNote: Joi.string().allow(null, ''),
    carrierRegistrationPlate: Joi.string().allow(null, ''),
    carriersTable: Joi.array().items(Joi.string()).allow(null),
    customer_id: Joi.number(),
    customerContact_id: Joi.number(),
    dischargeConfirmationSent: Joi.boolean().allow(null),
    dischargeRadius: Joi.number().allow(null),
    invoice_id: Joi.number().min(1).allow(null, ''),
    dispatcher_id: Joi.number().allow(null),
    dispatchersTable: Joi.array().items(Joi.string()).allow(null),
    disposition: Joi.string().allow(null, ''),
    editedBy: Joi.string().allow(null, ''),
    carrierAssignedBy_id: Joi.number().allow(null),
    exchangeRateCarrier: Joi.number().allow(null),
    exchangeRateCustomer: Joi.number().allow(null),
    loadingConfirmationSent: Joi.boolean(),
    loadingRadius: Joi.number().allow(null),
    note: Joi.string().allow(null, ''),
    number: Joi.number().allow(null),
    orderConfirmationSent: Joi.boolean().allow(null),
    phoneNumberCarrierOrderCreatedBy: Joi.string().allow(null, ''),
    priceCarrier: Joi.string().allow(null, ''),
    priceCustomer: Joi.string().allow(null, ''),
    qid: Joi.string().allow(null, ''),
    relation: Joi.string().allow(null, ''),
    state: Joi.string().valid(ECommissionState.Enquiry, ECommissionState.InComplete, ECommissionState.Complete),
    tsAdded: Joi.number().allow(null),
    tsCarrierOrderCreatedBy: Joi.number().allow(null),
    tsEdited: Joi.number().allow(null),
    tsEnteredCarrier: Joi.number().allow(null),
    vat: Joi.string().allow(null, ''),
    week: Joi.number().allow(null),
    year: Joi.number().allow(null),
    notification: Joi.boolean().allow(null),
    orderDate: Joi.number().allow(null, ''),
    orderNumber: Joi.string().allow(null, ''),
    commissionDischarges: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            customer_id: Joi.number(),
            city: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, ''),
            date: Joi.number().allow(null),
            dateTo: Joi.number().allow(null),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            note: Joi.string().allow(null, ''),
            neutralization: Joi.boolean().allow(null),
            number: Joi.number().allow(null),
            postalCode: Joi.string().allow(null, ''),
            street: Joi.string().allow(null, ''),
            scrollTo: Joi.string().allow(null, ''),
            location_id: Joi.number().allow(null),
            refNumber: Joi.string().allow(null, ''),
            time: Joi.string().allow(null, ''),
            year: Joi.number().allow(null),
          }).min(1),
        )
        .min(1),
    }).required(),
    commissionLoadings: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            date: Joi.number().allow(null),
            dateTo: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            number: Joi.number().allow(null),
            location_id: Joi.number(),
            refNumber: Joi.string().allow(null, ''),
            time: Joi.string().allow(null, ''),
            year: Joi.number().allow(null),
          }).min(1),
        )
        .min(1),
    }).required(),
    commissionItems: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            loadingMeters: Joi.number().allow(null),
            name: Joi.string().allow(null, ''),
            price: Joi.number().allow(null),
            package: Joi.string().allow(null, ''),
            packaging: Joi.string().allow(null, ''),
            quantity: Joi.number().allow(null),
            size: Joi.string().allow(null, ''),
            weight: Joi.string().allow(null, ''),
            weightBrutto: Joi.number().allow(null),
            year: Joi.number().allow(null),
            width: Joi.number().allow(null),
            length: Joi.number().allow(null),
            height: Joi.number().allow(null),
            dischargeIdx: Joi.number(),
            loadingIdx: Joi.number(),
          }).min(1),
        )
        .min(1),
    }).required(),
  });
  return schema.validate(body);
};

export const validateRequestBodyUpdate = (body: object) => {
  const schema = Joi.object({
    commission_id: Joi.number(),
    carrier_id: Joi.number().allow(null),
    carrierDriver: Joi.string().allow(null, ''),
    carrierGsm: Joi.string().allow(null, ''),
    carrierOrderCreatedBy: Joi.string().allow(null, ''),
    carrierOrderSent: Joi.boolean().allow(null),
    currencyCarrier: Joi.string().allow(null, ''),
    currencyCustomer: Joi.string().allow(null, ''),
    carrierNote: Joi.string().allow(null, ''),
    carrierRegistrationPlate: Joi.string().allow(null, ''),
    carriersTable: Joi.array().items(Joi.string()).allow(null),
    customer_id: Joi.number(),
    customerContact_id: Joi.number(),
    invoice_id: Joi.number().min(1).allow(null, ''),
    dischargeConfirmationSent: Joi.boolean().allow(null),
    dischargeRadius: Joi.number().allow(null),
    dispatcher_id: Joi.number().allow(null),
    dispatchersTable: Joi.array().items(Joi.string()).allow(null),
    disposition: Joi.string().allow(null, ''),
    editedBy: Joi.string().allow(null, ''),
    carrierAssignedBy_id: Joi.number().allow(null),
    exchangeRateCarrier: Joi.number().allow(null),
    exchangeRateCustomer: Joi.number().allow(null),
    loadingConfirmationSent: Joi.boolean(),
    loadingRadius: Joi.number().allow(null),
    note: Joi.string().allow(null, ''),
    number: Joi.number().allow(null),
    orderConfirmationSent: Joi.boolean().allow(null),
    phoneNumberCarrierOrderCreatedBy: Joi.string().allow(null, ''),
    priceCarrier: Joi.string().allow(null, ''),
    priceCustomer: Joi.string().allow(null, ''),
    qid: Joi.string().allow(null, ''),
    relation: Joi.string().allow(null, ''),
    state: Joi.string().valid(ECommissionState.Enquiry, ECommissionState.InComplete, ECommissionState.Complete),
    tsAdded: Joi.number().allow(null),
    tsCarrierOrderCreatedBy: Joi.number().allow(null),
    tsEdited: Joi.number().allow(null),
    tsEnteredCarrier: Joi.number().allow(null),
    vat: Joi.string().allow(null, ''),
    week: Joi.number().allow(null),
    year: Joi.number().allow(null),
    notification: Joi.boolean().allow(null),
    orderDate: Joi.number().allow(null, ''),
    orderNumber: Joi.string().allow(null, ''),
    commissionDischarges: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            customer_id: Joi.number(),
            city: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, ''),
            date: Joi.number().allow(null),
            dateTo: Joi.number().allow(null),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            note: Joi.string().allow(null, ''),
            neutralization: Joi.boolean().allow(null),
            number: Joi.number().allow(null),
            postalCode: Joi.string().allow(null, ''),
            street: Joi.string().allow(null, ''),
            scrollTo: Joi.string().allow(null, ''),
            location_id: Joi.number().allow(null),
            refNumber: Joi.string().allow(null, ''),
            time: Joi.string().allow(null, ''),
            year: Joi.number().allow(null),
          }),
        )
        .min(0),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            commissionDischarge_id: Joi.number(),
            customer_id: Joi.number(),
            city: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, ''),
            date: Joi.number().allow(null),
            dateTo: Joi.number().allow(null),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            note: Joi.string().allow(null, ''),
            neutralization: Joi.boolean().allow(null),
            number: Joi.number().allow(null),
            postalCode: Joi.string().allow(null, ''),
            street: Joi.string().allow(null, ''),
            scrollTo: Joi.string().allow(null, ''),
            location_id: Joi.number().allow(null),
            refNumber: Joi.string().allow(null, ''),
            time: Joi.string().allow(null, ''),
            year: Joi.number().allow(null),
          }),
        )
        .min(0),
      toDelete: Joi.array()
        .items(
          Joi.object({
            commissionDischarge_id: Joi.number(),
          }),
        )
        .min(0),
    }).required(),
    commissionLoadings: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            date: Joi.number().allow(null),
            dateTo: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            number: Joi.number().allow(null),
            location_id: Joi.number(),
            refNumber: Joi.string().allow(null, ''),
            time: Joi.string().allow(null, ''),
            year: Joi.number().allow(null),
          }),
        )
        .min(0),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            commissionLoading_id: Joi.number(),
            date: Joi.number().allow(null),
            dateTo: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            number: Joi.number().allow(null),
            location_id: Joi.number(),
            refNumber: Joi.string().allow(null, ''),
            time: Joi.string().allow(null, ''),
            year: Joi.number().allow(null),
          }),
        )
        .min(0),
      toDelete: Joi.array()
        .items(
          Joi.object({
            commissionLoading_id: Joi.number(),
          }),
        )
        .min(0),
    }).required(),
    commissionItems: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            loadingMeters: Joi.number().allow(null),
            name: Joi.string().allow(null, ''),
            price: Joi.number().allow(null),
            package: Joi.string().allow(null, ''),
            packaging: Joi.string().allow(null, ''),
            quantity: Joi.number().allow(null),
            size: Joi.string().allow(null, ''),
            weight: Joi.string().allow(null, ''),
            weightBrutto: Joi.number().allow(null),
            year: Joi.number().allow(null),
            width: Joi.number().allow(null),
            length: Joi.number().allow(null),
            height: Joi.number().allow(null),
            dischargeIdx: Joi.number().allow(null),
            loadingIdx: Joi.number().allow(null),
            commissionLoading_id: Joi.number().allow(null),
            commissionDischarge_id: Joi.number().allow(null),
          }),
        )
        .min(0),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            commissionItem_id: Joi.number(),
            loadingMeters: Joi.number().allow(null),
            name: Joi.string().allow(null, ''),
            price: Joi.number().allow(null),
            package: Joi.string().allow(null, ''),
            packaging: Joi.string().allow(null, ''),
            quantity: Joi.number().allow(null),
            size: Joi.string().allow(null, ''),
            weight: Joi.string().allow(null, ''),
            weightBrutto: Joi.number().allow(null),
            year: Joi.number().allow(null),
            width: Joi.number().allow(null),
            length: Joi.number().allow(null),
            height: Joi.number().allow(null),
            dischargeIdx: Joi.number().allow(null),
            loadingIdx: Joi.number().allow(null),
            commissionLoading_id: Joi.number().allow(null),
            commissionDischarge_id: Joi.number().allow(null),
          }),
        )
        .min(0),
      toDelete: Joi.array()
        .items(
          Joi.object({
            commissionItem_id: Joi.number(),
          }),
        )
        .min(0),
    }).required(),
  });
  return schema.validate(body);
};

export const validate = (schema: Joi.AnySchema, object: unknown) => {
  const validationResult = schema.validate(object);
  if (validationResult.error) throw new InvalidBodyException(validationResult.error.details);
  return validationResult;
};
