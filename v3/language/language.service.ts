import { language } from '@prisma/client';

import * as countryService from '@/country/country.service';
import prisma from '@/db/client';
import { Lang } from '@/types';

export type TGetLanguageArgs = {
  languageId?: number;
  languageCode?: Lang;
};

export async function getLanguage(args: Required<Pick<TGetLanguageArgs, 'languageCode'>>): Promise<language | null>;
export async function getLanguage(args: Required<Pick<TGetLanguageArgs, 'languageId'>>): Promise<language | null>;
export async function getLanguage({ languageId, languageCode }: TGetLanguageArgs): Promise<language | null> {
  const language = await prisma.language.findFirst({
    where: { languageCode, language_id: languageId },
  });

  return language;
}

export const getLanguageForCountry = async (countryCode: string) => {
  const country = await countryService.getCountry({ countryCode });
  if (!country) return null;

  return country.language.languageCode as Lang;
};
