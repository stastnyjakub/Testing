import { TCalculateCommissionPriceEstimationParameters } from '.';

export type TCalculateCommissionPriceEstimationRequestBody = TCalculateCommissionPriceEstimationParameters & {
  email?: string;
};

export type THandleEnquiryFormRequestBody = {
  loadingDate: number;
  email: string;
  goodsWeight: number;
  estimationCode: string;
  phone?: string;
};
