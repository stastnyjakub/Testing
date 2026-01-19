import { Carrier, Dispatcher, Place, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';

export enum ESearchType {
  COMMISSION = 'commission',
  DISPATCHER = 'dispatcher',
  HQ = 'hq',
}

export enum ESuccessReasonType {
  COMMISSION = 'commission',
  HQ = 'hq',
  DISPATCHER = 'dispatcher',
}

export type GetFilteredDispatchersByVehicleResult = Dispatcher & {
  places: Place[];
  carrier: Carrier;
  commissions: DispatcherSearchCommission[];
  user: User;
};

export type CommissionDispatcherSearchBody = {
  searchType: ESearchType | null;
  loadingRadius: number;
  loadingLocation: {
    latitude: number;
    longitude: number;
  };
  dischargeRadius: number;
  dischargeLocation: {
    latitude: number;
    longitude: number;
  };
  directions: boolean;
} & CommissionDispatcherSearchVehicleAttributes;

export type DispatcherSearchCommission = {
  commission_id: number;
  orderDate: bigint | null;
  number: number | null;
  priceCarrier: Decimal | null;
  customer: {
    company: string | null;
  } | null;
  loadingLocations: DispatcherSearchCommissionLocation[] | null;
  dischargeLocations: DispatcherSearchCommissionLocation[] | null;
};

export type DispatcherSearchCommissionLocation = {
  date: bigint | null;
  location: {
    city: string | null;
    postalCode: string | null;
    latitude: number | Decimal;
    longitude: number | Decimal;
  };
};

export type CommissionDispatcherSearchVehicleAttributes = {
  minLength: number | null;
  minHeight: number | null;
  minWidth: number | null;
  minWeight: number | null;

  vehicleTypes: number[];
  requiredFeatures: number[];
  requiredFeaturesSome: number[];
};
