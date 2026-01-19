import * as Sentry from '@sentry/node';

import { FioBankAdapter } from './fioBank/fioBankAdapter.class';
import { KbBankAdapter } from './kbBank/kbBankAdapter.class';
import { KbBankFacade } from './kbBank/kbBankFacade.class';
import { TBankTransaction, TGetIncomeTransactionsArgs } from './types';

export class BankServiceSingleton {
  private static instance: BankServiceSingleton;
  private fioBankAdapter: FioBankAdapter;
  private kbBankAdapter: KbBankAdapter;

  private constructor() {
    this.fioBankAdapter = new FioBankAdapter();
    this.kbBankAdapter = new KbBankAdapter();
  }

  public static getInstance() {
    if (!BankServiceSingleton.instance) {
      BankServiceSingleton.instance = new BankServiceSingleton();
    }

    return BankServiceSingleton.instance;
  }

  // Get all income transactions from all bank accounts
  public async getIncomeTransactions({ dateFrom, dateTo }: TGetIncomeTransactionsArgs): Promise<TBankTransaction[]> {
    const transactionsPromiseResults = await Promise.allSettled([
      this.fioBankAdapter.getIncomeTransactions({ dateFrom, dateTo }),
      this.kbBankAdapter.getIncomeTransactions({ dateFrom, dateTo }),
    ]);

    // Combine results from all bank accounts
    // If some of the promises are rejected, we still want to return the results from the other banks
    return transactionsPromiseResults.reduce<TBankTransaction[]>((acc, result) => {
      if (result.status === 'fulfilled') {
        return [...acc, ...result.value];
      }
      Sentry.captureException(result.reason);
      return acc;
    }, []);
  }
}

export const BankService = BankServiceSingleton.getInstance();

export const getKbAccounts = async () => {
  const kbBankFacade = KbBankFacade;
  const accounts = await kbBankFacade.getAccounts();
  return accounts;
};
