import { Carrier as CarrierPrisma, Dispatcher, Place, Vehicle, VehicleVehicleFeature } from '@prisma/client';

export const countryCodeToLanguageCode = {
  AL: 'en', // English
  AD: 'en', // English
  AM: 'en', // English
  AT: 'de', // German
  BY: 'en', // English
  BE: 'en', // English
  BA: 'en', // English
  BG: 'en', // English
  CH: 'de', // German
  CY: 'en', // English
  CZ: 'cs', // Czech
  DE: 'de', // German
  DK: 'en', // English
  EE: 'en', // English
  ES: 'en', // English
  FO: 'en', // English
  FI: 'en', // English
  FR: 'en', // French
  GB: 'en', // English
  GE: 'en', // English
  GI: 'en', // English
  GR: 'en', // English
  HU: 'en', // English
  HR: 'en', // English
  IE: 'en', // English
  IS: 'en', // English
  IT: 'en', // English
  LI: 'de', // German
  LT: 'en', // English
  CN: 'en', // English
  LU: 'de', // German
  LV: 'en', // English
  MC: 'en', // French
  MK: 'en', // English
  MT: 'en', // English
  NO: 'en', // English
  NL: 'en', // Dutch
  PL: 'en', // English
  PT: 'en', // English
  RO: 'en', // English
  RS: 'en', // English
  SE: 'en', // English
  SI: 'en', // English
  SK: 'cs', // Czech
  SM: 'en', // Italian
  TR: 'en', // English
  UA: 'en', // English
  VA: 'en', // English
};

export type carrierWithOnboardingInfo = CarrierPrisma & {
  dispatchersUnregistered: number;
  dispatchersRegistered: number;
  dispatchersPending: number;
};
export interface AllCarriersResponse {
  data: carrierWithOnboardingInfo[];
  totalRows: number;
}

export interface Carrier extends CarrierPrisma {
  dispatcher: Dispatcher[];
  places: Place[];
  dispatchervehicle: (Vehicle & {
    dispatchervehiclefeature: VehicleVehicleFeature[];
  })[];
}

// export interface CarrierBodyCreate extends Omit<Prisma.CarrierCreateInput, 'places'> {
//   dispatchers?: {
//     toCreate?: (Prisma.DispatcherCreateInput & {
//       vehicle?: {
//         toCreate?: (Prisma.VehicleCreateInput & {
//           vehicleVehicleFeature?: {
//             toCreate?: Prisma.VehicleVehicleFeatureCreateInput[];
//           };
//         })[];
//       };
//       places?: {
//         toCreate?: Prisma.PlaceCreateInput[];
//       };
//     })[];
//   };
//   vehicle?: {
//     toCreate?: (Prisma.VehicleCreateInput & {
//       vehicleVehicleFeature: {
//         toCreate?: Prisma.VehicleVehicleFeatureCreateInput[];
//       };
//     })[];
//   };
//   place?: {
//     toCreate?: Prisma.PlaceCreateInput[];
//   };
// }

// export interface CarrierBodyUpdate extends Omit<Prisma.carrierUpdateInput, 'places'> {
//   dispatchers?: {
//     toCreate?: (Prisma.dispatcherCreateInput & {
//       dispatcherVehicles?: {
//         toCreate?: Prisma.dispatchervehicleCreateInput &
//           {
//             dispatcherVehicleFeatures?: {
//               toCreate?: Prisma.dispatchervehiclefeatureCreateInput[];
//             };
//           }[];
//         toConnect?: { dispatcherVehicle_id: number }[];
//       };
//       places?: {
//         toCreate?: Prisma.placeCreateInput[];
//         toConnect?: { place_id: number }[];
//       };
//     })[];
//     toUpdate?: Partial<dispatcher>[];
//     toDelete?: { dispatcher_id: number }[];
//   };
//   dispatcherVehicles?: {
//     toCreate?: (Prisma.dispatchervehicleCreateInput & {
//       dispatcherVehicleFeatures?: {
//         toCreate?: Prisma.dispatchervehiclefeatureCreateInput[];
//       };
//     })[];
//     toUpdate?: (Partial<dispatchervehicle> & {
//       dispatcherVehicleFeatures?: {
//         toCreate?: Prisma.dispatchervehiclefeatureCreateInput[];
//         toUpdate?: Partial<dispatchervehiclefeature>[];
//         toDelete?: { dispatcherVehicleFeature_id: number }[];
//       };
//     })[];
//     toDelete?: { dispatcherVehicle_id: number }[];
//   };
//   places?: {
//     toCreate?: Prisma.placeCreateInput[];
//     toUpdate?: Partial<place>[];
//     toDelete?: { place_id: number }[];
//   };
// }

export interface QueryString {
  carrier_id?: string;
  offset?: string;
  limit?: string;
  items?: string;
  search?: string;
  sort?: string;
  number?: string;
  company?: string;
  street?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  note?: string;
  ts_added_gt?: string;
  ts_added_lt?: string;
  ts_added_gte?: string;
  ts_added_lte?: string;
  ts_edited_gt?: string;
  ts_edited_lt?: string;
  ts_edited_gte?: string;
  ts_edited_lte?: string;
}

export interface Filters {
  sortParams?: {
    field: string;
    order: string;
  };
  whereFilter?: string;
  dispatchersStateWhereFilter?: string;
  counter?: number;
  values?: any[];
}

export interface ExportCsvField {
  label: string;
  value: string;
  formatter?: (val: any) => any;
}

export type CarrierEmailEnquiryEmailRequestBody = {
  commissionId: number;
  parameters: {
    minLength: number;
    minHeight: number;
    minWeight: number;
    minWidth: number;
    requiredFeatures: number[];
    requiredFeaturesSome: number[];
    vehicleTypes: number[];
  };
  to: {
    dispatcherId: number;
  }[];
  dispatcher: {
    name: string;
    surname: string;
    phone: string;
    email: string;
  };
  body: {
    cs: string;
    en: string;
    de: string;
  };
  subject: string;
};

export interface IGetLocationCoordinatesResponse {
  postalCodes: {
    lat: number;
    lng: number;
    placeName: string;
    postalCode: string;
    adminName1: string;
    adminName2?: string;
    countryCode: string;
  }[];
}

export interface IGetCarrierListResponse {
  data: { carrier_id: number; company: string }[];
  totalRows: number;
}
