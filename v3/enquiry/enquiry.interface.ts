import {
  Carrier,
  commission,
  commissiondischarge,
  commissionitem,
  Dispatcher,
  enquiry,
  enquirydispatcher,
  location,
  offer,
} from '@prisma/client';

export type TEnquiryParameters = {
  minLength: number;
  minHeight: number;
  minWeight: number;
  minWidth: number;
  requiredFeatures: number[];
  requiredFeaturesSome: number[];
  vehicleTypes: number[];
};

export enum EnquiryState {
  WAITING = 'WAITING',
  OPENED = 'OPENED',
  CLOSED = 'CLOSED',
}
export enum EnquiryStateForDispatcher {
  NEW = 'NEW',
  RESPONDED = 'RESPONDED',
  WON = 'WON',
  CLOSED = 'CLOSED',
}
export type TCreateRequestBody = {
  commission_id: number;
  note: string | null;
  parameters?: TEnquiryParameters;
  contactedDispatchers: number[];
};

export type TCloseRequestBody = {
  offerId: number;
};

export type TContactDispatcherRequestBody = {
  enquiryId: number;
  dispatcherIds: number[];
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
  parameters?: {
    minLength?: number;
    minHeight?: number;
    minWeight?: number;
    minWidth?: number;
    requiredFeatures?: number[];
    requiredFeaturesSome?: number[];
    s?: number[];
  };
  subject: string;
};

export type IGetEnquiryForAdminResult = enquiry & {
  contactedDispatchers: (enquirydispatcher & {
    dispatcher: Dispatcher & {
      carrier: Carrier;
      _count: {
        dispatchervehicle: number;
      };
    };
  })[];
  offers: (offer & {
    dispatcher: Dispatcher & {
      carrier: Carrier;
      _count: {
        dispatchervehicle: number;
      };
    };
  })[];
  commission: commission & {
    commissiondischarge: (commissiondischarge & {
      location: location;
    })[];
    commissionloading: (commissiondischarge & {
      location: location;
    })[];
    commisionitem: commissionitem[];
  };
};
export type IGetEnquiryForDispatcherResult = Omit<IGetEnquiryForAdminResult, 'contactedDispatchers' | 'state'> & {
  state: EnquiryStateForDispatcher;
};
