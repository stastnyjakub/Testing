import { CustomerRegistration, language, Prisma } from '@prisma/client';

import prisma from '@/db/client';

type ReturnType =
  | (CustomerRegistration & {
      language: language;
    })
  | null;

export async function getRegistration(
  args: {
    customerRegistrationId: number;
  },
  transactionClient?: Prisma.TransactionClient,
): Promise<ReturnType>;
export async function getRegistration(
  args: { email: string },
  transactionClient?: Prisma.TransactionClient,
): Promise<ReturnType>;
export async function getRegistration(
  {
    customerRegistrationId,
    email,
  }: {
    email?: string;
    customerRegistrationId?: number;
  },
  transactionClient: Prisma.TransactionClient = prisma,
): Promise<ReturnType> {
  return await transactionClient.customerRegistration.findFirst({
    where: {
      customerRegistration_id: customerRegistrationId,
      email,
    },
    include: { language: true },
  });
}
