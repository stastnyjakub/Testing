import * as locationService from '@/customer/location/location.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

export type TCreateRampArgs = {
  locationId: number;
  number: number;
  gatehousePhone?: string | null;
};
export const createRamp = async ({ locationId, ...args }: TCreateRampArgs) => {
  const location = await locationService.getLocation(locationId);
  if (location === null) throw new NotFoundException(Entity.LOCATION);

  const createdRamp = await prisma.ramp.create({
    data: {
      ...args,
      location: {
        connect: { location_id: locationId },
      },
    },
  });

  return createdRamp;
};

export type TUpdateRampArgs = {
  rampId: number;
  number?: number;
  gatehousePhone?: string | null;
  deleted?: boolean;
};

export const getRamp = async (rampId: number) => {
  const ramp = await prisma.ramp.findUnique({
    where: {
      ramp_id: rampId,
    },
    include: {
      location: true,
    },
  });

  return ramp;
};
