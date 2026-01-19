import { carrier } from '@prisma/client';
import prisma from '../../../v3/db/client';

export const createMockCarrier = async (): Promise<carrier> => {
  const carrier = await prisma.carrier.create({
    data: {
      company: 'Koala42',
    },
  });
  return carrier;
};

export const deleteMockCarrier = async (carrier_id: number) => {
  await prisma.carrier.delete({
    where: { carrier_id },
  });
};
