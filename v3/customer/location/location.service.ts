import { Prisma } from '@prisma/client';

import * as customerService from '@/customer/customer.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';

import { getLocation } from './getLocation/getLocation.service';

export type TListLocationsArgs = {
  customerId: number;
};
export const listLocations = async ({ customerId }: TListLocationsArgs) => {
  const customer = await customerService.getCustomer({ customerId });
  if (customer === null) throw new NotFoundException(Entity.CUSTOMER);

  const locations = await prisma.location.findMany({
    where: {
      customer: {
        customer_id: customerId,
      },
    },
    include: {
      ramps: true,
    },
  });

  return locations;
};

export const deleteLocation = async (locationId: number, transactionClient: Prisma.TransactionClient = prisma) => {
  const location = await getLocation(locationId);
  if (location === null) throw new NotFoundException(Entity.LOCATION);

  await transactionClient.location.delete({
    where: {
      location_id: locationId,
    },
  });

  return;
};

export * from './createLocation/createLocation.service';
export * from './getLocation/getLocation.service';
export * from './updateLocation/updateLocation.service';
