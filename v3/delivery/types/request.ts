import { Lang } from '@/types';

export type TSendDeliveryMailRequestBody = {
  emails: string[];
  message: string;
  subject: string;
  commissionId: number;
  lang: Lang;
};
