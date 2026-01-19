import { Prisma } from '@prisma/client';

import prisma from '@/db/client';

export type TListVehiclesArgs = {
  dispatcherId?: number;
};
export const listVehicles = async ({ dispatcherId }: TListVehiclesArgs) => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      dispatcher_id: dispatcherId,
    },
    include: {
      vehicleType: true,
      vehicleVehicleFeatures: {
        include: {
          vehicleFeature: true,
        },
      },
    },
  });

  return vehicles;
};

export const getVehicle = async (vehicleId: number) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      vehicle_id: vehicleId,
    },
    include: {
      vehicleType: true,
      vehicleVehicleFeatures: {
        include: {
          vehicleFeature: true,
        },
      },
    },
  });

  return vehicle;
};

export type TUpdateVehicleArgs = {
  vehicleId: number;
  vehicleTypeId?: number;
  maxHeight?: number;
  maxWeight?: number;
  maxLength?: number;
  maxWidth?: number;
  vehicleFeatures?: {
    vehicleFeatureId: number;
  }[];
};
export const updateVehicle = async ({
  vehicleId,
  maxHeight,
  maxWeight,
  maxLength,
  maxWidth,
  vehicleTypeId,
  vehicleFeatures,
}: TUpdateVehicleArgs) => {
  const data: Prisma.VehicleUpdateInput = {
    maxHeight,
    maxWeight,
    maxLength,
    maxWidth,
  };

  if (vehicleTypeId) {
    data.vehicleType = {
      connect: { vehicleType_id: vehicleTypeId },
    };
  }

  if (vehicleFeatures) {
    data.vehicleVehicleFeatures = {
      deleteMany: {},
      create: vehicleFeatures.map((feature) => ({
        vehicleFeature: { connect: { vehicleFeature_id: feature.vehicleFeatureId } },
      })),
    };
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { vehicle_id: vehicleId },
    data,
  });

  return updatedVehicle;
};

export * from './vehicleType/vehicleType.service';
