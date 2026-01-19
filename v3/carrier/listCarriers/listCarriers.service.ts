import { Carrier, Prisma } from '@prisma/client';

import prisma from '@/db/client';

export type TListCarriersArgs = {
  limit?: number;
  offset?: number;
  search?: string;

  deleted?: boolean;
  company?: Prisma.StringFilter;
  companyRegistrationNumber?: Prisma.StringFilter;
  taxId?: Prisma.StringFilter;
  street?: Prisma.StringFilter;
  city?: Prisma.StringFilter;
  country?: Prisma.StringFilter;
  countryCode?: Prisma.StringFilter;
  postalCode?: Prisma.StringFilter;
  number?: Prisma.IntFilter;
  tsEdited?: Prisma.BigIntFilter;
  tsAdded?: Prisma.BigIntFilter;
};
export const listCarriers = async ({ limit, offset, search: _search, ...filters }: TListCarriersArgs) => {
  const readPromises: [Promise<Carrier[]>, Promise<number>] = [
    prisma.carrier.findMany({
      where: {
        ...filters,
      },
      take: limit,
      skip: offset,
    }),
    prisma.carrier.count({
      where: {
        ...filters,
      },
    }),
  ];
  const [carriers, totalRows] = await Promise.all(readPromises);

  return { carriers, totalRows };
};
