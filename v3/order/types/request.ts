import { Lang } from '@/types';

export type TSendMailRequestBody = {
  emails: string[];
  message: string;
  subject: string;
  commissionId: number;
  lang: Lang;
};

export type TSendConfirmationMailRequestBody = {
  emails: string[];
  message: string;
  subject: string;
  lang: Lang;
};
