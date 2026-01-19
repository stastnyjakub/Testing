import { Customer, Prisma } from '@prisma/client';

import prisma from '@/db/client';

export type TListCustomersArgs = {
  limit?: number;
  offset?: number;
  search?: string;

  name?: Prisma.StringFilter;
  number?: Prisma.IntFilter;
  city?: Prisma.StringFilter;
  country?: Prisma.StringFilter;
  countryCode?: Prisma.StringFilter;
  postalCode?: Prisma.StringFilter;
  street?: Prisma.StringFilter;
  taxId?: Prisma.StringFilter;
  note?: Prisma.StringFilter;
  billingEmail?: Prisma.StringFilter;
};
export const listCustomers = async ({ limit, offset, search: _search, ...filters }: TListCustomersArgs) => {
  const readPromises: [Promise<Customer[]>, Promise<number>] = [
    prisma.customer.findMany({
      where: {
        ...filters,
      },
      take: limit,
      skip: offset,
    }),
    prisma.customer.count({
      where: {
        ...filters,
      },
    }),
  ];
  const [customers, totalRows] = await Promise.all(readPromises);

  return { customers, totalRows };
};
