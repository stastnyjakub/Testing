import { Country, language } from '@prisma/client';

import prisma from '@/db/client';

export const listCountries = async () => {
  const countries = await prisma.country.findMany();

  return countries;
};

type ReturnType =
  | (Country & {
      language: language;
    })
  | null;
export type TGetCountryArgs = {
  countryId?: number;
  countryCode?: string;
};
export async function getCountry(args: Required<Pick<TGetCountryArgs, 'countryId'>>): Promise<ReturnType>;
export async function getCountry(args: Required<Pick<TGetCountryArgs, 'countryCode'>>): Promise<ReturnType>;
export async function getCountry({ countryId, countryCode }: TGetCountryArgs): Promise<ReturnType> {
  const country = await prisma.country.findFirst({
    where: { country_id: countryId, countryCode },
    include: { language: true },
  });

  return country;
}
