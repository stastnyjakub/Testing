import moment from 'moment';

import { EBank, EBankTransactionType, TBankTransaction } from '../types';

import { KbBankFacadeSingleton } from './kbBankFacade.class';
import { TGetAccountTransactionsArgs } from './types';

export class KbBankAdapter {
  private kbBankFacade: KbBankFacadeSingleton;

  constructor() {
    this.kbBankFacade = KbBankFacadeSingleton.getInstance();
  }

  public async getTransactions({ dateFrom, dateTo }: TGetAccountTransactionsArgs) {
    const rawKbBankTransactions = await this.kbBankFacade.getAccountTransactions({ dateFrom, dateTo });
    const transformedTransactions: TBankTransaction[] = rawKbBankTransactions.map((rawTransaction) => {
      return {
        bank: EBank.KB,
        amount: rawTransaction.amount.value,
        currency: rawTransaction.amount.currency,
        // KB Bank API returns date in format 'YYYY-MM-DD', e.g. '2021-08-01'
        date: moment(rawTransaction.bookingDate, 'YYYY-MM-DD'),
        type:
          rawTransaction.creditDebitIndicator === 'CREDIT' ? EBankTransactionType.income : EBankTransactionType.expense,
        counterAccountName: rawTransaction?.counterParty?.name || null,
        variableSymbols: rawTransaction?.references?.variable ? [rawTransaction.references.variable] : null,
      };
    });
    return transformedTransactions;
  }

  public async getIncomeTransactions({ dateFrom, dateTo }: TGetAccountTransactionsArgs) {
    const transactions = await this.getTransactions({ dateFrom, dateTo });
    return transactions.filter((transaction) => transaction.type === EBankTransactionType.income);
  }
}
