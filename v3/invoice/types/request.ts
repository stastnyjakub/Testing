import { ECurrency, Lang } from '@/types';

export type TListInvoiceNumbersRequestQuery = {
  search?: string;
};

export type TGetCommissionsForInvoicingRequestQuery = {
  currency?: ECurrency;
  customerId?: number;
  includeAllCommissions?: true;
};

export type TGetInvoicingStatusesRequestQuery = {
  includeAllCommissions: boolean;
};

export type TMailInvoiceRequestBody = {
  emails: string[];
  message: string;
  lang: Lang;
};
