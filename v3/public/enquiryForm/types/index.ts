export * from './request';
export * from './arguments';

export type TEnquiryFormPoint = {
  longitude: number;
  latitude: number;
  country: string;
  countryCode: string;
  street?: string;
  city?: string;
  postalCode?: string;
};

export type TCalculateCommissionPriceEstimationParameters = {
  startPoint: TEnquiryFormPoint;
  endPoint: TEnquiryFormPoint;
  loadingMeters: number;
};

export type TEstimationData = {
  columnHeaders: number[];
  rowHeaders: number[];
  values: (number | null)[][];
};

export enum ETransportType {
  Domestic = 'domestic',
  Export = 'export',
  Import = 'import',
  International = 'international',
}
