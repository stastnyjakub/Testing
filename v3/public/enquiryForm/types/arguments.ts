import { CommissionPriceEstimation } from '@prisma/client';

import { TMailSender } from '@/mail/mail.interface';

import { THandleEnquiryFormRequestBody } from './request';

export type TNotifyCustomerAboutSubmittedEnquiryArgs = THandleEnquiryFormRequestBody;
export type TNotifyQaplineAboutSubmittedEnquiryArgs = THandleEnquiryFormRequestBody & {
  commissionId: number;
};
export type TNotifyCustomerAboutUnSubmittedEnquiryArgs = {
  estimations: CommissionPriceEstimation[];
};

export type TNewEnquiryCustomerEmailData = {
  startPoint: string;
  endPoint: string;
  loadingMeters: number;
  loadingDate: number;
  goodsWeight: number;
  minPrice: number;
  maxPrice: number;
  email: string;
  phone?: string;
  dispatcher: TMailSender;
};

export type TNewEnquiryQaplineEmailData = {
  startPoint: string;
  endPoint: string;
  loadingMeters: number;
  loadingDate: number;
  goodsWeight: number;
  minPrice: number;
  maxPrice: number;
  email: string;
  phone?: string;
  openLink: string;
};

export type TUnSubmittedEnquiryCustomerEmailData = {
  estimations: {
    startPoint: string;
    endPoint: string;
    loadingMeters: number;
    minPrice: number;
    maxPrice: number;
    openLink: string;
  }[];
  dispatcher: TMailSender;
};
