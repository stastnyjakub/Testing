import { invoice } from '@prisma/client';

import { TBankTransaction } from '@/bank/types';
import { TBaseMail } from '@/mail/mail.interface';
import { ECurrency } from '@/types';

export type TGetCommissionsForInvoicingArgs = {
  customerId?: number;
  currency?: ECurrency;
  maxCommissionAge?: number;
};
export type TGetAllUnInvoicedCommissionsArgs = {
  customerId?: number;
  currency?: ECurrency;
  maxCommissionAge?: number;
};

export type TGetInvoicingStatusesArgs = {
  includeAllUnInvoicedCommissions?: boolean;
  maxCommissionAge?: number;
};

export type TGetInvoicesWithoutPaymentConfirmationByNumbersArgs = {
  invoiceNumbers: number[];
};

export type TNotifyAdminsAboutNotMatchingPaymentArgs = {
  invoiceNumber: number;
  invoiceId: number;
};

export type TNotifyAdminsAboutGroupedPaymentArgs = {
  invoices: Pick<invoice, 'invoiceNumber' | 'invoice_id'>[];
  transaction: TBankTransaction;
};

export type TProcessInvoicePaymentUpdateArgs = {
  incomeTransaction: TBankTransaction;
  invoiceId: number;
};

export type TProcessGroupedInvoicePaymentArgs = {
  incomeTransaction: TBankTransaction;
  invoiceIds: number[];
};

export type TInvoicePaymentReminderEmailData = {
  invoiceNumber: number;
  issueDate: number;
  dueDate: number;
  price: number;
  currency: string;
  bankAccount: string;
  dispatcher: TBaseMail['sender'];
};
