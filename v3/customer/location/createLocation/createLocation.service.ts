import { Prisma } from '@prisma/client';

import * as customerService from '@/customer/customer.service';
import prisma from '@/db/client';
import { Entity, NotFoundException } from '@/errors';
import { Nullable } from '@/types';

import { TCreateRampArgs } from '../ramp/ramp.service';

export type TCreateLocationArgs = {
  customerId: number;
  city?: Nullable<string>;
  name?: Nullable<string>;
  country?: Nullable<string>;
  countryCode?: Nullable<string>;
  postalCode?: Nullable<string>;
  street?: Nullable<string>;
  latitude?: Nullable<number>;
  longitude?: Nullable<number>;
  email?: Nullable<string>;
  firstName?: Nullable<string>;
  lastName?: Nullable<string>;
  phone?: Nullable<string>;
  note?: Nullable<string>;
  discharge?: boolean;
  loading?: boolean;
  areaMap?: Nullable<string>;
  ramps?: Omit<TCreateRampArgs, 'locationId'>[];
};
export const createLocation = async (
  { customerId, ramps, ...args }: TCreateLocationArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const customer = await customerService.getCustomer({ customerId });
  if (customer === null) throw new NotFoundException(Entity.CUSTOMER);

  const data: Prisma.locationCreateInput = {
    ...args,
    customer: {
      connect: { customer_id: customerId },
    },
  };

  if (ramps?.length) {
    data.ramps = {
      create: ramps.map((ramp) => ({
        ...ramp,
      })),
    };
  }

  const createdLocation = await transactionClient.location.create({
    data,
    include: {
      ramps: true,
    },
  });

  return createdLocation;
};
