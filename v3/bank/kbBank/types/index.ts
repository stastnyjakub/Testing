export type TGetAccessTokenArgs = {
  enforceTokenRefresh?: boolean;
};

export type TRefreshAccessTokenResponseBody = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
export type TCreateRefreshTokenResponseBody = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

export type TGetAccountTransactionsArgs = {
  dateFrom: moment.Moment;
  dateTo: moment.Moment;
};

export type TFetchAccountTransactionsArgs = TGetAccountTransactionsArgs & {
  page?: number;
  size?: number;
  retryCount?: number;
  enforceAccessTokenRefresh?: boolean;
};

export type TGetAccountsArgs = {
  enforceTokenRefresh?: boolean;
  retryCount?: number;
};

export type TKbBankTransaction = {
  lastUpdated: string; // ISO 8601 format
  accountType: 'KB' | 'AG';
  entryReference?: string;
  iban: string;
  creditDebitIndicator: 'CREDIT' | 'DEBIT';
  transactionType: 'INTEREST' | 'FEE' | 'DOMESTIC' | 'FOREIGN' | 'SEPA' | 'CASH' | 'CARD' | 'OTHER';
  bankTransactionCode?: {
    code: string;
    issuer: 'CBA' | 'OTHER';
  };
  amount: {
    value: number;
    currency: string;
  };
  bookingDate?: string;
  valueDate?: string;
  instructed?: {
    value: number;
    currency: string;
  };
  reversalIndicator?: boolean;
  status?: string;
  counterParty?: {
    iban?: string;
    name?: string;
    accountNo?: string;
    bankBic?: string;
    bankCode?: string;
    bankName?: string;
  };
  references?: {
    accountServicer?: string;
    endToEndIdentification?: string;
    variable?: string;
    constant?: string;
    specific?: string;
    receiver?: string;
    myDescription?: string;
  };
  additionalTransactionInformation?: string;
  cardTransactionDetails?: {
    holdExpirationDate?: string;
  };
};

export type TGetAccountTransactionsResponseBody = {
  content: TKbBankTransaction[];
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type TGetAccountsResponseBody = {
  accountId: string;
  currency: string;
  iban: string;
}[];
