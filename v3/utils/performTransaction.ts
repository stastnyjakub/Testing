import { Prisma } from '@prisma/client';

import { EPrismaClientErrorCodes } from '@/types/prisma';

import prisma from '../db/client';

export const DEFAULT_TRANSACTION_RETRY_COUNT = 5;

type PerformTransactionFunc<T> = (transactionClient: Prisma.TransactionClient) => T;
/**
 * @param func - function to perform in transaction
 * @param timeout - optional timeout in milliseconds
 * @param transactionClient - optional transaction client to use (no nested transactions)
 */
export const performTransaction = async <T>(
  func: PerformTransactionFunc<T>,
  timeout?: number,
  transactionClient?: Prisma.TransactionClient,
) => {
  let retries = 0;
  while (retries < DEFAULT_TRANSACTION_RETRY_COUNT) {
    try {
      // If transactionClient is provided, use it to perform the transaction
      // This is useful for nested transactions (nested transactions are not supported in Prisma, yet)
      if (transactionClient) {
        return await func(transactionClient);
      }
      const transactionResults = await prisma.$transaction(
        async (transaction) => {
          return await func(transaction);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout,
        },
      );
      return transactionResults;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === EPrismaClientErrorCodes.TransactionWriteConflict) {
          retries++;
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error('Transaction failed after maximum retries');
};
