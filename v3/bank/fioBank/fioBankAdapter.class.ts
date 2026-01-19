import moment from 'moment';

import { EBank, EBankTransactionType, TBankTransaction } from '@/bank/types';

import { FioBankFacade } from './fioBankFacade.class';
import { TFioBankTransaction, TGetTransactionsArgs } from './types';
import { EFioBankTransactionType } from './types';

// Translates FIO bank transaction types to general bank transaction types
const fioBankTransactionTypeToGeneralBankTransactionType = {
  [EFioBankTransactionType.CashlessIncome]: EBankTransactionType.income,
  [EFioBankTransactionType.CashlessExpense]: EBankTransactionType.expense,
  [EFioBankTransactionType.TransferPaymentInsideBank]: EBankTransactionType.expense,
};
export class FioBankAdapter {
  private fioBankFacade: FioBankFacade;
  constructor() {
    this.fioBankFacade = new FioBankFacade();
  }

  public async getTransactions({ dateFrom, dateTo }: TGetTransactionsArgs): Promise<TBankTransaction[]> {
    const rawFioBankTransactions = await this.fioBankFacade.getAccountTransactions({
      dateFrom,
      dateTo,
      format: 'JSON',
    });

    const transformedTransactions: TBankTransaction[] = rawFioBankTransactions.map((rawTransaction) => {
      return {
        bank: EBank.FIO,
        amount: rawTransaction.column1.value,
        currency: rawTransaction.column14.value,
        // FIO API returns date in format 'YYYY-MM-DDZZ', e.g. '2021-08-01+02:00'
        date: moment(rawTransaction.column0.value, 'YYYY-MM-DDZZ'),
        type: fioBankTransactionTypeToGeneralBankTransactionType[rawTransaction.column8.value],

        counterAccountName: rawTransaction.column10?.value || null,
        variableSymbols: this.extractVariableSymbols(rawTransaction),
      };
    });
    return transformedTransactions;
  }

  private extractVariableSymbols({
    column16: messageForRecipient,
    column8: transactionType,
    column5: variableSymbol,
  }: TFioBankTransaction): string[] | null {
    if (variableSymbol?.value) {
      return [variableSymbol.value];
    }

    // Extraction applies to only income transactions
    const type = fioBankTransactionTypeToGeneralBankTransactionType[transactionType.value];
    if (type !== EBankTransactionType.income) {
      return null;
    }

    if (!messageForRecipient?.value) {
      return null;
    }

    // Invoice could be issued at the end of the year and payment could be done in the next year
    // e.g. 2023-12-31 invoice and 2024-01-01 payment
    // We need to check both years
    const lastTwoDigitsOfCurrentYear = moment.tz('Europe/Prague').format('YY');
    const lastTwoDigitsOfPreviousYear = String(Number(lastTwoDigitsOfCurrentYear) - 1);
    const regex = new RegExp(`\\b(${lastTwoDigitsOfCurrentYear}|${lastTwoDigitsOfPreviousYear})\\d{6}\\b`, 'g');

    const matches = messageForRecipient.value.match(regex);

    if (!matches) {
      return null;
    }

    return matches;
  }

  public async getIncomeTransactions({ dateFrom, dateTo }: TGetTransactionsArgs): Promise<TBankTransaction[]> {
    const transactions = await this.getTransactions({ dateFrom, dateTo });
    return transactions.filter((transaction) => transaction.type === EBankTransactionType.income);
  }
}
