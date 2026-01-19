import { Prisma } from '@prisma/client';

import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

import { getLocation } from '../getLocation/getLocation.service';
import { TCreateRampArgs, TUpdateRampArgs } from '../ramp/ramp.service';

export type TUpdateLocationArgs = {
  locationId: number;
  city?: string | null;
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  postalCode?: string | null;
  street?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  note?: string | null;
  discharge?: boolean;
  loading?: boolean;
  areaMap?: string | null;
  ramps?: (TUpdateRampArgs | Omit<TCreateRampArgs, 'locationId'>)[];
};
export const updateLocation = async (
  { locationId, ramps, ...args }: TUpdateLocationArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const location = await getLocation(locationId);
  if (location === null) throw new NotFoundException(Entity.LOCATION);

  const data: Prisma.locationUpdateInput = {
    ...args,
  };

  if (ramps) {
    const rampsToCreate = ramps.reduce<Omit<TCreateRampArgs, 'locationId'>[]>((prev, curr) => {
      if (!('rampId' in curr)) {
        prev.push({
          ...curr,
        });
      }
      return prev;
    }, []);
    const rampsToUpdate = ramps.reduce<TUpdateRampArgs[]>((prev, curr) => {
      if ('rampId' in curr) {
        prev.push({ ...curr });
      }
      return prev;
    }, []);

    const rampsToDelete = location.ramps.filter(
      ({ ramp_id }) => !rampsToUpdate.some(({ rampId: rampToUpdateId }) => rampToUpdateId === ramp_id),
    );

    data.ramps = {
      deleteMany: rampsToDelete.map(({ ramp_id }) => ({ ramp_id })),
      createMany: {
        data: rampsToCreate.map((ramp) => ramp),
      },
      update: rampsToUpdate.map(({ rampId, ...ramp }) => ({
        where: { ramp_id: rampId },
        data: {
          ...ramp,
        },
      })),
    };
  }

  const updatedLocation = await transactionClient.location.update({
    where: {
      location_id: locationId,
    },
    data,
    include: {
      ramps: true,
    },
  });

  return updatedLocation;
};
