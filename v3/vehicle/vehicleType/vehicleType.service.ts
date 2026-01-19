import prisma from '@/db/client';

export const getVehicleType = async (vehicleTypeId: number) => {
  const vehicleType = await prisma.vehicleType.findUnique({
    where: { vehicleType_id: vehicleTypeId },
    include: {
      vehicleTypeVehicleFeatures: {
        include: {
          vehicleFeature: true,
        },
      },
    },
  });
  return vehicleType;
};

export const listVehicleTypes = async () => {
  const vehicleTypes = await prisma.vehicleType.findMany({
    include: {
      vehicleTypeVehicleFeatures: {
        include: {
          vehicleFeature: true,
        },
      },
    },
  });
  return vehicleTypes;
};
