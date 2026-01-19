import Joi from '@hapi/joi';

import {
  ATTACHMENT_GET_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES,
  ATTACHMENT_LIST_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES,
} from '@/attachment/attachment.constants';
import {
  EAttachmentType,
  TAttachmentCreateRequestBody,
  TAttachmentGetRequestQuery,
  TAttachmentListRequestQuery,
  TAttachmentMailFileRequestBody,
  TAttachmentUpdateRequestBody,
  TCompressionJobRequestBody,
  TGenerateAttachmentUploadLinkRequestParams,
  TGenerateAttachmentUploadLinkRequestQuery,
  TGetFileRequestQuery,
  TValidateAttachmentListRequestQueryArgs,
} from '@/attachment/types';
import { validateSchemaOrThrow } from '@/utils';

export const validateCompressionJobRequestBody = (body: object) => {
  const schema = Joi.object({
    attachmentId: Joi.number().min(1).required(),
  });
  return validateSchemaOrThrow<TCompressionJobRequestBody>(schema, body);
};

export const validateGenerateAttachmentUploadLinkRequestParams = (params: object) => {
  const schema = Joi.object({
    commissionId: Joi.number().min(1).required(),
  });
  return validateSchemaOrThrow<TGenerateAttachmentUploadLinkRequestParams>(schema, params);
};

export const validateGenerateAttachmentUploadLinkRequestQuery = (params: object) => {
  const schema = Joi.object({
    renew: Joi.boolean().optional(),
  });
  return validateSchemaOrThrow<TGenerateAttachmentUploadLinkRequestQuery>(schema, params);
};

export const validateAttachmentUploadRequestFiles = (files: object) => {
  const multerFileSchema = Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
  }).unknown();
  const schema = Joi.object({
    invoice: Joi.array().items(multerFileSchema),
    deliveryNotes: Joi.array().items(multerFileSchema),
  });
  return validateSchemaOrThrow(schema, files);
};

/**
 * @throws {InvalidBodyException}
 */
export const validateAttachmentMailFileRequestBody = (body: object) => {
  const schema = Joi.object({
    emails: Joi.array().items(Joi.string().email()).min(1).required(),
    message: Joi.string().required(),
    lang: Joi.string().valid('cs', 'en', 'de').required(),
  });
  return validateSchemaOrThrow<TAttachmentMailFileRequestBody>(schema, body);
};

/**
 * @throws {InvalidBodyException}
 */
export const validateAttachmentCreateRequestBody = (body: object) => {
  const schema = Joi.object({
    commissionId: Joi.number().min(1),
    invoiceId: Joi.number().min(1),
    name: Joi.string().min(1).required(),
    type: Joi.string().valid(EAttachmentType.DELIVERY_NOTE, EAttachmentType.INVOICE).required(),
  }).xor('commissionId', 'invoiceId');
  return validateSchemaOrThrow<TAttachmentCreateRequestBody>(schema, body);
};

/**
 * @throws {InvalidBodyException}
 */
export const validateAttachmentUpdateRequestBody = (body: object) => {
  const schema = Joi.object({
    commissionId: Joi.number().min(1),
    invoiceId: Joi.number().min(1),
    name: Joi.string().min(1),
    type: Joi.string().valid(EAttachmentType.DELIVERY_NOTE, EAttachmentType.INVOICE),
    sent: Joi.boolean(),
  }).oxor('commissionId', 'invoiceId');
  return validateSchemaOrThrow<TAttachmentUpdateRequestBody>(schema, body);
};

/**
 * @throws {InvalidBodyException}
 */
export const validateAttachmentGetRequestQuery = (query: object) => {
  const schema = Joi.object({
    include: Joi.array()
      .items(Joi.string().valid(...ATTACHMENT_GET_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES))
      .unique(),
  });
  return validateSchemaOrThrow<TAttachmentGetRequestQuery>(schema, query);
};

/**
 * @throws {InvalidBodyException}
 */
export const validateAttachmentListRequestQuery = (
  query: object,
  { prohibitPrivateValues }: TValidateAttachmentListRequestQueryArgs = {},
) => {
  const getSchema = (): Joi.ObjectSchema => {
    if (prohibitPrivateValues) {
      return Joi.object({
        commissionId: Joi.number().min(1),
        invoiceId: Joi.number().min(1),
      }).xor('commissionId', 'invoiceId');
    }

    return Joi.object({
      include: Joi.array()
        .items(Joi.string().valid(...ATTACHMENT_LIST_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES))
        .unique(),
      commissionId: Joi.number().min(1),
      invoiceId: Joi.number().min(1),
      withCommissionsDeliveryNotes: Joi.boolean().optional(),
    }).xor('commissionId', 'invoiceId');
  };

  return validateSchemaOrThrow<TAttachmentListRequestQuery>(getSchema(), query);
};

export const validateGetFileRequestQuery = (query: object) => {
  const schema = Joi.object({
    download: Joi.boolean().optional(),
  });
  return validateSchemaOrThrow<TGetFileRequestQuery>(schema, query);
};
