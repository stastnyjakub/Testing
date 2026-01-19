import { Customer, location, Prisma } from '@prisma/client';

import * as locationService from '../location/location.service';

import { TUpdateCustomerArgs } from './updateCustomer.service';

export type TUpdateLocationsArgs = {
  customer: Customer & {
    location: location[];
  };
  locations: NonNullable<TUpdateCustomerArgs['locations']>;
};
export const updateLocations = async (
  { customer, locations }: TUpdateLocationsArgs,
  transactionClient: Prisma.TransactionClient,
) => {
  const locationsToCreate = locations.reduce<locationService.TCreateLocationArgs[]>((prev, curr) => {
    if (!('locationId' in curr)) {
      prev.push({
        ...curr,
        customerId: customer.customer_id,
      });
    }
    return prev;
  }, []);

  const locationsToUpdate = locations.reduce<locationService.TUpdateLocationArgs[]>((prev, curr) => {
    if ('locationId' in curr) {
      prev.push({ ...curr });
    }
    return prev;
  }, []);

  const locationsToDelete = customer.location.filter(
    ({ location_id }) =>
      !locationsToUpdate.some(({ locationId: locationToUpdateId }) => locationToUpdateId === location_id),
  );

  const creationPromises = locationsToCreate.map((location) =>
    locationService.createLocation(
      {
        ...location,
      },
      transactionClient,
    ),
  );
  const updatePromises = locationsToUpdate.map((location) =>
    locationService.updateLocation(
      {
        ...location,
      },
      transactionClient,
    ),
  );
  const deletionPromises = locationsToDelete.map(({ location_id }) =>
    locationService.deleteLocation(location_id, transactionClient),
  );

  await Promise.all([...creationPromises, ...updatePromises, ...deletionPromises]);
};
