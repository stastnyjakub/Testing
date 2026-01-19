import { Prisma } from '@prisma/client';

import {
  ATTACHMENT_GET_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES,
  ATTACHMENT_LIST_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES,
} from '@/attachment/attachment.constants';
import { Lang } from '@/types';

import { TAttachmentUpdateRequestBody } from './request';
import { EAttachmentType } from '.';

export type TAttachmentFile = {
  originalname: string;
  mimetype: string;
  filename: string;
  size: number;
  buffer?: Buffer;
};

export type TCreateAttachmentData = {
  commissionId?: number;
  invoiceId?: number;
  name: string;
  file: TAttachmentFile;
  type: EAttachmentType;
  userId: number | null;
};

export type TUpdateAttachmentData = TAttachmentUpdateRequestBody & {
  attachmentId: number;
};
export type TMailAttachmentData = {
  attachmentId: number;
  emails: string[];
  lang: Lang;
  senderId: number;
  message: string;
};

export type TListAttachmentIncludeArgs = {
  [K in (typeof ATTACHMENT_LIST_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES)[number]]?: boolean;
};
export type TGetAttachmentIncludeArgs = {
  [K in (typeof ATTACHMENT_GET_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES)[number]]?: boolean;
};

export type TCheckInvoiceAttachmentExistsArgs = {
  commissionId?: number;
  invoiceId?: number;
  attachmentId?: number;
};

export type TValidateAttachmentListRequestQueryArgs = {
  prohibitPrivateValues?: boolean;
};

export type TCreateOrGetAttachmentUploadTokenArgs = {
  commissionId: number;
  renew?: boolean;
};

type TBaseUpdateInvoiceAttachmentSentStatusArgs<T extends string> = Record<T, number> & {
  sent: boolean;
  transactionClient?: Prisma.TransactionClient;
};

export type TUpdateInvoiceAttachmentSentStatusArgs =
  | TBaseUpdateInvoiceAttachmentSentStatusArgs<'attachmentId'>
  | TBaseUpdateInvoiceAttachmentSentStatusArgs<'invoiceId'>;
