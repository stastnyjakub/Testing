import { Place } from '@prisma/client';

import { performTransaction } from '@/utils';

import prisma from '../db/client';

export type TListPlacesArgs = {
  dispatcherId: number;
};
export const listPlaces = async ({ dispatcherId }: TListPlacesArgs) => {
  const places = await prisma.place.findMany({
    where: {
      dispatcher_id: dispatcherId,
    },
  });

  return places;
};

export type TUpdatePlaceArgs = {
  placeId: number;
  city?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  directionLoading?: boolean;
  directionDischarge?: boolean;
}[];
export const updatePlaces = async (args: TUpdatePlaceArgs) => {
  const updatedPlaces = await performTransaction(async (transactionClient) => {
    const updatedPlaces: Place[] = [];
    for (const { placeId, ...values } of args) {
      const updatePlace = await transactionClient.place.update({
        where: { place_id: placeId },
        data: {
          ...values,
        },
      });
      updatedPlaces.push(updatePlace);
    }

    return updatedPlaces;
  });

  return updatedPlaces;
};
