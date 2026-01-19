import { CustomerRegistration, Prisma } from '@prisma/client';

import prisma from '@/db/client';

export async function getCustomerRegistration(
  args: {
    customerRegistrationId: number;
  },
  transactionClient?: Prisma.TransactionClient,
): Promise<CustomerRegistration | null>;
export async function getCustomerRegistration(
  args: { email: string },
  transactionClient?: Prisma.TransactionClient,
): Promise<CustomerRegistration | null>;
export async function getCustomerRegistration(
  {
    customerRegistrationId,
    email,
  }: {
    email?: string;
    customerRegistrationId?: number;
  },
  transactionClient: Prisma.TransactionClient = prisma,
): Promise<CustomerRegistration | null> {
  return await transactionClient.customerRegistration.findFirst({
    where: {
      customerRegistration_id: customerRegistrationId,
      email,
    },
  });
}
