import { Attachment } from '@prisma/client';

export enum EAttachmentType {
  INVOICE = 'INVOICE',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
}

export type TFileUploadResultsMap = Map<string, { name: string; status: 'uploaded' | 'error' }>;

export type TInvoiceAttachmentCustomerEmail = {
  email: string | null;
  language: string | null;
};

export type TAttachment = Attachment & {
  invoiceCustomerEmail?: string | null;
  invoiceLanguage?: string | null;
};

export * from './arguments';
export * from './request';
