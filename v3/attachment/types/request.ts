import {
  ATTACHMENT_GET_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES,
  ATTACHMENT_LIST_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES,
} from '@/attachment/attachment.constants';
import { Lang } from '@/types';

import { EAttachmentType } from '.';

export type TCompressionJobRequestBody = {
  attachmentId: number;
};

export type TGenerateAttachmentUploadLinkRequestParams = {
  commissionId: number;
};
export type TGenerateAttachmentUploadLinkRequestQuery = {
  renew?: boolean;
};

export type TAttachmentIdRequestParameter = {
  attachmentId: string;
};

// Form data type - only string values
export type TAttachmentCreateRequestBody = {
  commissionId?: string;
  invoiceId?: string;
  name: string;
  type: EAttachmentType;
};
export type TAttachmentUpdateRequestBody = {
  commissionId?: number;
  invoiceId?: number;
  name?: string;
  type?: EAttachmentType;
  sent?: boolean;
};
export type TAttachmentMailFileRequestBody = {
  emails: string[];
  message: string;
  lang: Lang;
};
export type TAttachmentUploadRequestFiles = {
  invoice?: Express.Multer.File[];
  deliveryNotes?: Express.Multer.File[];
};

export type TAttachmentUpdateRequestParams = TAttachmentIdRequestParameter;
export type TAttachmentDeleteRequestParams = TAttachmentIdRequestParameter;
export type TAttachmentGetRequestParams = TAttachmentIdRequestParameter;
export type TAttachmentGetFileRequestParams = TAttachmentIdRequestParameter;
export type TAttachmentMailFileRequestParams = TAttachmentIdRequestParameter;

export type TAttachmentGetRequestQuery = {
  include?: (typeof ATTACHMENT_GET_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES)[number][];
};
export type TAttachmentListRequestQuery = {
  commissionId?: string;
  invoiceId?: string;
  include?: (typeof ATTACHMENT_LIST_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES)[number][];
  withCommissionsDeliveryNotes?: boolean;
};

export type TGetFileRequestQuery = {
  download?: boolean;
};
