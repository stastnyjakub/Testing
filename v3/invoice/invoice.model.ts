import * as Joi from '@hapi/joi';

import { ECurrency } from '@/types';
import { validateSchemaOrThrow } from '@/utils';

import {
  TGetCommissionsForInvoicingRequestQuery,
  TGetInvoicingStatusesRequestQuery,
  TListInvoiceNumbersRequestQuery,
  TMailInvoiceRequestBody,
} from './types/request';

export const validateRequestBody = (body: object) => {
  const schema = Joi.object({
    invoice_id: Joi.number(),
    user_id: Joi.number(),
    canceled: Joi.bool().allow(null, ''),
    constantSymbol: Joi.string().allow(null, ''),
    dueDate: Joi.number().unsafe().strict().allow(null, ''),
    orderDate: Joi.number().unsafe().strict().allow(null),
    exported: Joi.bool().allow(null, ''),
    invoiceSent: Joi.bool().allow(null, ''),
    issueDate: Joi.number().unsafe().strict().allow(null, ''),
    language: Joi.string().allow(null, ''),
    paid: Joi.bool().allow(null, ''),
    paidStateChangedBy_id: Joi.number().allow(null),
    paymentMethod: Joi.string().allow(null, ''),
    pointDate: Joi.number().unsafe().strict().allow(null, ''),
    reverseCharge: Joi.bool().allow(null, ''),
    valueAddedTax: Joi.number().allow(null, ''),
    commission: Joi.array().items(
      Joi.object({
        commission_id: Joi.number().required(),
        vat: Joi.string().allow(null, ''),
      }).unknown(true),
    ),
  });
  return schema.validate(body);
};

export const validateParameters = (params: object) => {
  const schema = Joi.object({
    invoice_id: Joi.number(),
    invoiceNumber: Joi.number(),
    customer_company: Joi.string(),
    issueDate_gt: Joi.number(),
    issueDate_lt: Joi.number(),
    issueDate_gte: Joi.number(),
    issueDate_lte: Joi.number(),
    dueDate_gt: Joi.number(),
    dueDate_lt: Joi.number(),
    dueDate_gte: Joi.number(),
    dueDate_lte: Joi.number(),
    totalCommissions_gt: Joi.number(),
    totalCommissions_lt: Joi.number(),
    totalCommissions_gte: Joi.number(),
    totalCommissions_lte: Joi.number(),
    paymentConfirmationDate_gt: Joi.number(),
    paymentConfirmationDate_lt: Joi.number(),
    paymentConfirmationDate_gte: Joi.number(),
    paymentConfirmationDate_lte: Joi.number(),
    totalPrice_gt: Joi.number(),
    totalPrice_lt: Joi.number(),
    totalPrice_gte: Joi.number(),
    totalPrice_lte: Joi.number(),
    pointDate_gt: Joi.number(),
    pointDate_lt: Joi.number(),
    pointDate_gte: Joi.number(),
    pointDate_lte: Joi.number(),
    currency: Joi.string(),
    invoiceSent: Joi.boolean(),
    exported: Joi.boolean(),
    offset: Joi.number(),
    limit: Joi.number(),
    sort: Joi.string(),
    search: Joi.string(),
    omit: Joi.string().regex(/^\d+(?:,\d+)*$/),
    selected: Joi.string().regex(/^\d+(?:,\d+)*$/),
  });
  return schema.validate(params);
};

export const validateText = (params: object) => {
  const schema = Joi.object({
    invoice: Joi.number().min(1).max(2147483647).required(),
    languageCode: Joi.string().valid('en', 'de', 'cs').required(),
  });
  return schema.validate(params);
};

export const validateExportBody = (body: object) => {
  const schema = Joi.array().items(Joi.number()).min(1).required();
  return schema.validate(body);
};

export const validateUninvoicedItemsQuery = (body: object) => {
  const schema = Joi.object({
    customer_company: Joi.string().required(),
    currency: Joi.string().valid('CZK', 'EUR').required(),
    limit: Joi.number().min(1).required(),
    offset: Joi.number().min(0).required(),
  });
  return schema.validate(body);
};

export const validatePdfPreviewBody = (body: object) => {
  const commissionSchema = Joi.object({
    text: Joi.string().required(),
    orderedBy: Joi.string().allow(null).optional(),
    orderDate: Joi.string().required(),
    loadingDate: Joi.string().allow('').required(),
    price: Joi.number().required(),
    vat: Joi.number().valid(0, 21).required(),
  });

  const pdfInvoiceSchema = Joi.object({
    createdBy: Joi.string().required(),
    createdByMail: Joi.string().required(),
    customerCompany: Joi.string().required(),
    customerStreet: Joi.string().allow('').required(),
    customerCountry: Joi.string().allow('').required(),
    customerPostalCode: Joi.string().allow('').required(),
    customerCity: Joi.string().allow('').required(),
    paymentMethod: Joi.string().allow(null, ''),
    registrationNumber: Joi.string().allow('').required(),
    taxId: Joi.string().allow('').required(),
    varSymbol: Joi.string().required(),
    constSymbol: Joi.string().allow('').required(),
    currency: Joi.string().valid('EUR', 'CZK').required(),
    language: Joi.string().valid('cs', 'en', 'de').required(),
    rateBase: Joi.number().allow(null).required(),
    orderDate: Joi.string().required(),
    exposureDate: Joi.string().required(),
    maturityDate: Joi.string().required(),
    performanceDate: Joi.string().required(),
    commissions: Joi.array().items(commissionSchema).required(),
  });

  return pdfInvoiceSchema.validate(body);
};

export const validateMailInvoiceRequestBody = (body: object) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).required(),
    message: Joi.string().required(),
    lang: Joi.string().valid('cs', 'en', 'de').required(),
  });
  return validateSchemaOrThrow<TMailInvoiceRequestBody>(schema, body);
};

export const validateListInvoiceNumbersRequestQuery = (query: unknown) => {
  const schema = Joi.object({
    search: Joi.string(),
  });

  return validateSchemaOrThrow<TListInvoiceNumbersRequestQuery>(schema, query);
};

export const validateGetInvoicingStatusesRequestQuery = (query: unknown) => {
  const schema = Joi.object({
    includeAllCommissions: Joi.boolean().required(),
  });

  return validateSchemaOrThrow<TGetInvoicingStatusesRequestQuery>(schema, query);
};

export const validateGetCommissionsForInvoicingRequestQuery = (query: unknown) => {
  const schema = Joi.object({
    currency: Joi.string()
      .valid(...Object.values(ECurrency))
      .optional(),
    customerId: Joi.number().optional(),
    includeAllCommissions: Joi.boolean().optional(),
  });

  return validateSchemaOrThrow<TGetCommissionsForInvoicingRequestQuery>(schema, query);
};
