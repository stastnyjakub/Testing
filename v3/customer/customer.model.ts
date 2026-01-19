import Joi from '@hapi/joi';

import { ECustomerType } from './customer.interface';

export const validateRequestBodyUpdate = (body: object) => {
  const schema = Joi.object({
    addedBy: Joi.string().allow(null, ''),
    city: Joi.string().allow(null, ''),
    company: Joi.string().required().allow(null, ''),
    companyRegistrationNumber: Joi.number().allow(null, ''),
    country: Joi.string().allow(null, ''),
    countryCode: Joi.string().allow(null, ''),
    editedBy: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    email: Joi.string().allow(null, ''),
    firstName: Joi.string().allow(null, ''),
    lastName: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    place: Joi.object({
      city: Joi.string().allow(null, ''),
      street: Joi.string().allow(null, ''),
      country: Joi.string().allow(null, ''),
      latitude: Joi.number().allow(null),
      longitude: Joi.number().allow(null),
      postalCode: Joi.string().allow(null, ''),
      countryCode: Joi.string().allow(null, ''),
    }),
    postalCode: Joi.string().allow(null, ''),
    qid: Joi.number().allow(null),
    number: Joi.number().allow(null),
    street: Joi.string().allow(null, ''),
    taxId: Joi.string().allow(null, ''),
    deleted: Joi.bool(),
    defaultDueDate: Joi.number().allow(null),
    customerContacts: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            deleted: Joi.bool(),
          }).min(1),
        )
        .min(1),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            customerContact_id: Joi.number().required(),
            customer_id: Joi.number(),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            deleted: Joi.bool(),
          }).min(1),
        )
        .min(1),
      toDelete: Joi.array()
        .items(
          Joi.object({
            customerContact_id: Joi.number().required(),
            customer_id: Joi.number(),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            deleted: Joi.bool().allow(null, ''),
          }).min(1),
        )
        .min(1),
    }).required(),
    locations: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            city: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, ''),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            gps: Joi.string().allow(null, ''),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            postalCode: Joi.string().allow(null, ''),
            street: Joi.string().allow(null, ''),
            discharge: Joi.boolean(),
            loading: Joi.boolean(),
            deleted: Joi.boolean(),
          }).min(1),
        )
        .min(1),
      toUpdate: Joi.array()
        .items(
          Joi.object({
            location_id: Joi.number().required(),
            customer_id: Joi.number(),
            city: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, ''),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            gps: Joi.string().allow(null, ''),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            postalCode: Joi.string().allow(null, ''),
            street: Joi.string().allow(null, ''),
            discharge: Joi.boolean(),
            loading: Joi.boolean(),
            deleted: Joi.boolean(),
          }),
        )
        .min(1),
      toDelete: Joi.array()
        .items(
          Joi.object({
            location_id: Joi.number().required(),
            customer_id: Joi.number(),
            city: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, ''),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            gps: Joi.string().allow(null, ''),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            postalCode: Joi.string().allow(null, ''),
            street: Joi.string().allow(null, ''),
            discharge: Joi.boolean(),
            loading: Joi.boolean(),
            deleted: Joi.boolean(),
          }),
        )
        .min(1),
    }).required(),
  });
  return schema.validate(body);
};

export const validateRequestBodyCreate = (body: object) => {
  const schema = Joi.object({
    addedBy: Joi.string().allow(null, ''),
    city: Joi.string().allow(null, ''),
    company: Joi.string().required(),
    companyRegistrationNumber: Joi.number().allow(null),
    country: Joi.string().allow(null, ''),
    countryCode: Joi.string().allow(null, ''),
    editedBy: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    email: Joi.string().allow(null, ''),
    firstName: Joi.string().allow(null, ''),
    lastName: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    place: Joi.object({
      city: Joi.string().allow(null, ''),
      street: Joi.string().allow(null, ''),
      country: Joi.string().allow(null, ''),
      latitude: Joi.number().allow(null),
      longitude: Joi.number().allow(null),
      postalCode: Joi.string().allow(null, ''),
      countryCode: Joi.string().allow(null, ''),
    }),
    postalCode: Joi.string().allow(null, ''),
    qid: Joi.number().allow(null),
    number: Joi.number().allow(null),
    street: Joi.string().allow(null, ''),
    taxId: Joi.string().allow(null, ''),
    deleted: Joi.bool(),
    defaultDueDate: Joi.number().allow(null),
    customerContacts: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            deleted: Joi.bool(),
          }).min(1),
        )
        .min(1),
    }).required(),
    locations: Joi.object({
      toCreate: Joi.array()
        .items(
          Joi.object({
            city: Joi.string().allow(null, ''),
            country: Joi.string().allow(null, ''),
            company: Joi.string().allow(null, ''),
            countryCode: Joi.string().allow(null, ''),
            email: Joi.string().allow(null, ''),
            firstName: Joi.string().allow(null, ''),
            lastName: Joi.string().allow(null, ''),
            gps: Joi.string().allow(null, ''),
            latitude: Joi.number().allow(null),
            longitude: Joi.number().allow(null),
            note: Joi.string().allow(null, ''),
            phone: Joi.string().allow(null, ''),
            postalCode: Joi.string().allow(null, ''),
            street: Joi.string().allow(null, ''),
            discharge: Joi.boolean(),
            loading: Joi.boolean(),
            deleted: Joi.boolean(),
          }).min(1),
        )
        .min(1),
    }).required(),
  });
  return schema.validate(body);
};

export const validateParameters = (params: object) => {
  const schema = Joi.object({
    customer_id: Joi.number().min(1).max(2147483647),
    sort: Joi.string(),
    limit: Joi.number(),
    offset: Joi.number(),
    type: Joi.string().allow(ECustomerType.Active, ECustomerType.Potential),
    search: Joi.string(),
    omit: Joi.string().regex(/^\d+(?:,\d+)*$/),
    selected: Joi.string().regex(/^\d+(?:,\d+)*$/),
    number: Joi.number(),
    city: Joi.string().allow(null, ''),
    company: Joi.string().allow(null, ''),
    street: Joi.string().allow(null, ''),
    postalCode: Joi.alternatives().try(Joi.string().allow(null, ''), Joi.number()),
    country: Joi.string().allow(null, ''),
    countryCode: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
  });
  return schema.validate(params);
};
