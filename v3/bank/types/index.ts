import moment from 'moment';
export enum EBank {
  FIO = 'fio',
  KB = 'kb',
}
export enum EBankTransactionType {
  'income' = 'income',
  'expense' = 'expense',
}
export type TBankTransaction = {
  bank: EBank;
  currency: string;
  amount: number;
  date: moment.Moment;
  type: EBankTransactionType;

  variableSymbols: string[] | null;
  counterAccountName: string | null;
};

export type TGetIncomeTransactionsArgs = {
  dateFrom: moment.Moment;
  dateTo: moment.Moment;
};
