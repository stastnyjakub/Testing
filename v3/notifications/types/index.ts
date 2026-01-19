import { Lang } from '@/types';

export type TSendNotificationArgs = {
  userIds: number[];
  subject?: string;
  title: string;
  message: string;
  lang?: Lang;
};

export type TNotificationData = {
  title: string;
  message: string;
};
