import { Lang } from '@/types';

export type TSendMailRequestBody = {
  emails: string[];
  message: string;
  subject: string;
  commissionId: number;
  lang: Lang;
};
