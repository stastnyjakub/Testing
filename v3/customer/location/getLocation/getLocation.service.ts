import prisma from '@/db/client';

export const getLocation = async (locationId: number) => {
  const location = await prisma.location.findUnique({
    where: {
      location_id: locationId,
    },
    include: {
      ramps: true,
    },
  });

  return location;
};
