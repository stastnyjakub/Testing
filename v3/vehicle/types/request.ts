export type TListVehiclesRequestQuery = {
  dispatcherId?: number;
};

export type TUpdateVehicleRequestBody = {
  vehicleTypeId?: number;
  maxHeight?: number;
  maxWeight?: number;
  maxLength?: number;
  maxWidth?: number;
  vehicleFeatures?: {
    vehicleFeatureId: number;
  }[];
};
