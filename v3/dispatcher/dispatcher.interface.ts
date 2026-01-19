import { Dispatcher as DispatcherPrisma, Place, Vehicle } from '@prisma/client';

export interface Dispatcher extends DispatcherPrisma {
  place?: Place[];
  dispatchervehicle?: Vehicle[];
}

export type DispatcherSave = Omit<Dispatcher, 'password'>;

export type DispatcherPatchBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  language_id?: number;
  notificationEmail?: boolean;
  notificationWhatsapp?: boolean;
  dispatcherVehicles?: {
    toCreate: {
      vehicleType_id: number;
      maxHeight?: number | null;
      maxLength?: number | null;
      maxWeight?: number | null;
      maxWidth?: number | null;
      dispatcherVehicleFeatures?: {
        toCreate: {
          vehicleFeature_id: number;
        }[];
      };
    }[];
    toUpdate: {
      dispatcherVehicle_id: number;
      vehicleType_id?: number;
      maxHeight?: number | null;
      maxLength?: number | null;
      maxWeight?: number | null;
      maxWidth?: number | null;
      dispatcherVehicleFeatures?: {
        toCreate: {
          vehicleFeature_id: number;
        }[];
        toUpdate: {
          dispatcherVehicleFeature_id: number;
          vehicleFeature_id: number;
        }[];
        toDelete: {
          dispatcherVehicleFeature_id: number;
        }[];
      };
    }[];
    toDelete: {
      dispatcherVehicle_id: number;
    }[];
  };
  places?: {
    toCreate: {
      city?: string | null;
      country?: string | null;
      countryCode?: string | null;
      directionLoading?: boolean;
      directionDischarge?: boolean;
      latitude?: number | null;
      longitude?: number | null;
      note?: string | null;
      postalCode?: string | null;
    }[];
    toUpdate: {
      place_id: number;
      dispatcher_id?: number | null;
      city?: string | null;
      country?: string | null;
      countryCode?: string | null;
      directionLoading?: boolean;
      directionDischarge?: boolean;
      latitude?: number | null;
      longitude?: number | null;
      note?: string | null;
      postalCode?: string | null;
    }[];
    toDelete: {
      place_id: number;
    }[];
  };
};

export type PatchDispatcherArguments = {
  dispatcher_id: number;
} & DispatcherPatchBody;

export type DispatcherCreateBody = {
  carrier_id: number;
  email?: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language_id?: number;
  notificationEmail: boolean;
  notificationWhatsapp: boolean;
  dispatcherVehicles?: {
    toCreate: {
      vehicleType_id: number;
      maxHeight?: number | null;
      maxLength?: number | null;
      maxWeight?: number | null;
      maxWidth?: number | null;
      dispatcherVehicleFeatures?: {
        toCreate: {
          vehicleFeature_id: number;
        }[];
      };
    }[];
  };
  places?: {
    toCreate: {
      city?: string | null;
      country?: string | null;
      countryCode?: string | null;
      directionLoading?: boolean;
      directionDischarge?: boolean;
      latitude?: number | null;
      longitude?: number | null;
      note?: string | null;
      postalCode?: string | null;
    }[];
  };
};

export type CheckMailQuery = {
  email: string;
};

export type EmailBody = {
  dispatcherId: number;
  subject: string;
  body: string;
};
