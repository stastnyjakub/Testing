import { Customer, Prisma } from '@prisma/client';

import prisma from '@/db/client';

export type TGetCustomerArgs = {
  customerId?: number;
  companyRegistrationNumber?: string;
};
export async function getCustomer(
  args: Required<Pick<TGetCustomerArgs, 'companyRegistrationNumber'>>,
  transactionClient?: Prisma.TransactionClient,
): Promise<Customer | null>;
export async function getCustomer(
  args: Required<Pick<TGetCustomerArgs, 'customerId'>>,
  transactionClient?: Prisma.TransactionClient,
): Promise<Customer | null>;
export async function getCustomer(
  { companyRegistrationNumber, customerId }: TGetCustomerArgs,
  transactionClient: Prisma.TransactionClient = prisma,
): Promise<Customer | null> {
  return transactionClient.customer.findFirst({ where: { customer_id: customerId, companyRegistrationNumber } });
}
