import { Lang } from '@/types';

export type TSendDischargeMailRequestBody = {
  emails: string[];
  message: string;
  subject: string;
  commissionId: number;
  locationId: number;
  lang: Lang;
};
