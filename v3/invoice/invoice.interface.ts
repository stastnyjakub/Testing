import { commission, complete_invoice, Customer, invoice } from '@prisma/client';

import { Lang } from '../types';

export type DataFixerResponse =
  | {
      success: true;
      timestamp: number;
      base: string;
      date: string;
      rates: {
        CZK: number;
      };
    }
  | {
      success: false;
      error: {
        code: number;
        type: string;
        info: string;
      };
    };
export interface Invoice extends invoice {
  totalRows?: number;
  totalPrice?: number;
  totalCommissions?: number;
  currency?: string;
  customer?: Customer;
  commission?: commission[];
}

export interface CustomerPlace {
  city: string;
  street: string;
  country: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  countryCode: string;
}

export interface InvoiceError {
  message: string;
  error_code?: number;
}

export interface InvoiceWithAttachments extends complete_invoice {
  attachments: string[];
}

export interface InvoiceQueryString {
  invoice_id?: number;
  customer_company?: string;
  issueDate_gt?: number;
  issueDate_lt?: number;
  dueDate_gt?: number;
  dueDate_lt?: number;
  totalCommissions_gt?: number;
  totalCommissions_lt?: number;
  totalPrice_gt?: number;
  totalPrice_lt?: number;
  currency?: string;
  invoiceSent?: string;
  exported?: string;
  offset?: string;
  limit?: string;
  sort?: string;
  search?: string;
  invoiceNumber?: bigint;
}

export interface AllInvoicesResponse {
  data: Invoice[] | complete_invoice[];
  totalRows: number;
}

interface Commission {
  text: string;
  orderedBy: string | null;
  orderDate: string;
  loadingDate: string;
  price: number;
  vat: 0 | 21;
}

export interface PdfInvoice {
  createdBy: string;
  createdByMail: string;
  customerCompany: string;
  customerStreet: string;
  customerCountry: string;
  customerPostalCode: string;
  customerCity: string;
  registrationNumber: string;
  taxId: string;
  varSymbol: string;
  constSymbol: string;
  currency: 'EUR' | 'CZK';
  language: Lang;
  rateBase: number | null;
  orderDate: string;
  exposureDate: string;
  maturityDate: string;
  performanceDate: string;
  commissions: Commission[];
}

export interface CommissionSubstitute extends Commission {
  priceVat: number;
  priceWithVat: number;
}

export interface PdfSubstitute extends PdfInvoice {
  price: number;
  priceVat: number;
  priceWithVat: number;
  rounding: number;
  priceTotal: number;
  priceNone: number;
  priceHigh: number;
  priceVatHigh: number;
  priceHighWithVat: number;
  qrCode: string;
  commissions: CommissionSubstitute[];
}
