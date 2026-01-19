import { Lang } from '@/types';

export type TProcessRegistrationRequestArgs = {
  companyIdentification: string;
  email: string;
  password: string;
  lang: Lang;
};
