export type TGetTransactionsArgs = {
  dateFrom: moment.Moment;
  dateTo: moment.Moment;
};

type TTransactionField<T, E> = {
  value: T;
  name: E; // Field name (e.g., "ID pohybu")
  id: number; // Unique identifier for the field
};
export enum EFioBankTransactionType {
  CashlessIncome = 'Bezhotovostní příjem',
  CashlessExpense = 'Bezhotovostní platba',
  TransferPaymentInsideBank = 'Platba převodem uvnitř banky',
}
export type TFioBankTransaction = {
  // Required fields

  /**
   * ID pohybu (Movement ID) – unique identifier for the transaction
   */
  column22: TTransactionField<number, 'ID pohybu'>;

  /**
   * Datum (Date) – date of the transaction
   */
  column0: TTransactionField<string, 'Datum'>;

  /**
   * Objem (Amount) – amount of money moved in the transaction
   */
  column1: TTransactionField<number, 'Objem'>;

  /**
   * Měna (Currency) – currency code (e.g., CZK, EUR) used for the transaction
   */
  column14: TTransactionField<string, 'Měna'>;

  /**
   * Typ (Transaction Type) – type of the transaction (e.g., credit, debit)
   */
  column8: TTransactionField<EFioBankTransactionType, 'Typ'>;

  // Optional fields

  /**
   * Protiúčet (Counterparty Account) – account number of the counterparty
   */
  column2: TTransactionField<string, 'Protiúčet'> | null;

  /**
   * Název projiúčtu (Counterparty Account Name) – name of the counterparty account holder
   */
  column10: TTransactionField<string, 'Název protiúčtu'> | null;

  /**
   * Kód banky (Bank Code) – code of the counterparty’s bank
   */
  column3: TTransactionField<string, 'Kód banky'> | null;

  /**
   * Název banky (Bank Name) – name of the counterparty’s bank
   */
  column12: TTransactionField<string, 'Název banky'> | null;

  // Those fields are strings, but they contain numbers

  /**
   * KS (Constant Symbol) – identifier used for categorizing payments in accounting
   */
  column4: TTransactionField<string, 'KS'> | null;

  /**
   * VS (Variable Symbol) – identifier used for payment pairing or reference
   */
  column5: TTransactionField<string, 'VS'> | null;

  /**
   * SS (Specific Symbol) – optional additional identifier
   */
  column6: TTransactionField<string, 'SS'> | null;

  /**
   * Uživatelská identifikace (User Identification) – optional user identifier
   */
  column7: TTransactionField<string, 'Uživatelská identifikace'> | null;

  /**
   * Zpráva pro příjemce (Message for Recipient) – note or message attached to the transaction
   */
  column16: TTransactionField<string, 'Zpráva pro příjemce'> | null;

  /**
   * Provedl (Executed By) – name or ID of the person/system executing the transaction
   */
  column9: TTransactionField<string, 'Provedl'> | null;

  /**
   * Upřesnění (Specification) – additional transaction details
   */
  column18: TTransactionField<string, 'Upřesnění'> | null;

  /**
   * Komentář (Comment) – internal comment or note about the transaction
   */
  column25: TTransactionField<string, 'Komentář'> | null;

  /**
   * BIC (Bank Identifier Code) – SWIFT/BIC code of the counterparty’s bank
   */
  column26: TTransactionField<string, 'BIC'> | null;

  /**
   * ID pokynu (Instruction ID) – identifier of the payment order
   */
  column17: TTransactionField<number, 'ID pokynu'> | null;

  /**
   * Reference plátce (Payer Reference) – payer’s reference for the transaction
   */
  column27: TTransactionField<string, 'Reference plátce'> | null;
};

export type TGetAccountTransactionsResponseBody = {
  accountStatement: {
    info: {
      accountId: string;
      bankId: string;
      currency: string;
      iban: string;
      bic: string;
      openingBalance: number;
      closingBalance: number;

      dateStart: string | null;
      dateEnd: string | null;
      yearList: number | null;
      idList: number | null;
      idFrom: number | null;
      idTo: number | null;
      idLastDownload: number | null;
    };
    transactionList: {
      transaction: TFioBankTransaction[];
    };
  };
};

export type TGetAccountTransactionsArgs = {
  dateFrom: moment.Moment;
  dateTo: moment.Moment;
  format: 'JSON';
  // Those formats are supported by FIO API, but we only implement JSON
  // format: 'CSV' | 'JSON' | 'XML';
};
