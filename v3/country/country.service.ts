import prisma from '@/db/client';

export const listCountries = async () => {
  const countries = await prisma.country.findMany();

  return countries;
};
