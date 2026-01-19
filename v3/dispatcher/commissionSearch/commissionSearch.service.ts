import prisma from '../../db/client';

import {
  CommissionDispatcherSearchBody,
  CommissionDispatcherSearchVehicleAttributes,
  ESearchType,
  ESuccessReasonType,
  GetFilteredDispatchersByVehicleResult,
} from './commissionSearch.types';
import { getFilteredDispatchersByVehicleQuery } from './commissionSearch.utils';
import { DispatcherSearchObject } from './dispatcherSearchObject.class';

export const transformDispatcherSearchObjects = (dispatchers: DispatcherSearchObject[]) => {
  const locationsCountByType = {
    [ESuccessReasonType.COMMISSION]: 0,
    [ESuccessReasonType.HQ]: 0,
    [ESuccessReasonType.DISPATCHER]: 0,
  };

  return {
    data: dispatchers.map((searchObject) => {
      searchObject.lastSuccessReason && (locationsCountByType[searchObject.lastSuccessReason.type] += 1);
      return searchObject.serialize();
    }),
    counts: locationsCountByType,
  };
};

export const searchForDispatchersForCommission = async (body: CommissionDispatcherSearchBody) => {
  const { searchType, directions, dischargeLocation, loadingLocation, dischargeRadius, loadingRadius } = body;
  const suitableDispatchers = await getFilteredDispatchersByVehicle(body);
  const dispatcherSearchObjects = suitableDispatchers.map((dispatcher) => {
    return new DispatcherSearchObject(
      dispatcher,
      dispatcher.carrier,
      {
        directions,
        endPoint: dischargeLocation,
        startPoint: loadingLocation,
        endRadius: dischargeRadius,
        startRadius: loadingRadius,
      },
      dispatcher.commissions,
    );
  });

  if (searchType === ESearchType.HQ) {
    return getFilteredDispatchersByHQ(dispatcherSearchObjects);
  }
  if (searchType === ESearchType.DISPATCHER) {
    return getFilteredDispatchersByDispatcherPlaces(dispatcherSearchObjects);
  }
  if (searchType === ESearchType.COMMISSION) {
    const filteredDispatchers = await getFilteredDispatchersByCommissionsPlaces(dispatcherSearchObjects);
    return filteredDispatchers;
  }

  return dispatcherSearchObjects;
};

const getFilteredDispatchersByCommissionsPlaces = async (dispatcherSearchObjects: DispatcherSearchObject[]) => {
  const filteredDispatchers = dispatcherSearchObjects.filter((dispatcherSearchObject) => {
    if (!dispatcherSearchObject.isSuitableForCommissionSearch) return;
    const isSuitable = dispatcherSearchObject.getArePointsNearbyCommissionLocations();
    return isSuitable;
  });

  return filteredDispatchers;
};

const getFilteredDispatchersByDispatcherPlaces = (dispatcherSearchObjects: DispatcherSearchObject[]) => {
  const filteredDispatchers = dispatcherSearchObjects.filter((dispatcherSearchObject) => {
    if (!dispatcherSearchObject.isSuitableForDispatcherSearch) return false;

    return dispatcherSearchObject.getArePointsNearbyDispatcherPlaces();
  });
  return filteredDispatchers;
};

const getFilteredDispatchersByHQ = (dispatcherSearchObjects: DispatcherSearchObject[]) => {
  const suitableCarrierIds = new Set<number>();
  const filteredDispatchers: typeof dispatcherSearchObjects = [];
  for (const dispatcherSearchObject of dispatcherSearchObjects) {
    if (!dispatcherSearchObject.isSuitableForHQSearch) continue;
    const {
      carrier: { carrier_id },
    } = dispatcherSearchObject;

    // If dispatchers carrier is already in the list, skip the distance calculation
    // those dispatchers will not have any success reason set, it would be redundant
    if (suitableCarrierIds.has(carrier_id)) {
      filteredDispatchers.push(dispatcherSearchObject);
      continue;
    }

    const isNearbyHq = dispatcherSearchObject.getIsNearbyHq();
    if (!isNearbyHq) continue;

    suitableCarrierIds.add(carrier_id);
    filteredDispatchers.push(dispatcherSearchObject);
  }

  return filteredDispatchers;
};

const areVehiclesAttributesEmpty = ({
  minHeight,
  minLength,
  minWeight,
  minWidth,
  requiredFeatures,
  requiredFeaturesSome,
  vehicleTypes,
}: CommissionDispatcherSearchVehicleAttributes) => {
  return (
    minHeight === 0 &&
    minLength === 0 &&
    minWeight === 0 &&
    minWidth === 0 &&
    requiredFeatures.length === 0 &&
    requiredFeaturesSome.length === 0 &&
    vehicleTypes.length === 0
  );
};

const getFilteredDispatchersByVehicle = async (vehicleAttributes: CommissionDispatcherSearchVehicleAttributes) => {
  const { minHeight, minLength, minWeight, minWidth, requiredFeatures, requiredFeaturesSome, vehicleTypes } =
    vehicleAttributes;

  const suitableDispatchers = await prisma.dispatcher.findMany({
    select: {
      dispatcher_id: true,
    },
    where: {
      deleted: false,
      carrier: {
        deleted: false,
      },
      ...(!areVehiclesAttributesEmpty(vehicleAttributes)
        ? {
            dispatchervehicle: {
              some: {
                //? if minHeight/minLength/minWeight/minWidth is 0, it means that the user didn't set the value and ve don't want to filter by this attribute
                maxHeight: {
                  gte: minHeight || undefined,
                },
                maxLength: {
                  gte: minLength || undefined,
                },
                maxWeight: {
                  gte: minWeight || undefined,
                },
                maxWidth: {
                  gte: minWidth || undefined,
                },
                ...(vehicleTypes.length ? { vehicleType_id: { in: vehicleTypes } } : {}),
                AND: [
                  // If there are requiredFeaturesSome, we want to find dispatcher with vehicle that has at least one of the required features
                  ...(requiredFeaturesSome.length
                    ? [
                        {
                          dispatchervehiclefeature: {
                            some: {
                              vehicleFeature_id: {
                                in: requiredFeaturesSome,
                              },
                            },
                          },
                        },
                      ]
                    : []),
                  // If there are requiredFeatures, we want to find dispatcher with vehicle that has all of the required features
                  ...(requiredFeatures.length
                    ? requiredFeatures.map((featureId) => ({
                        dispatchervehiclefeature: {
                          some: {
                            vehicleFeature_id: featureId,
                          },
                        },
                      }))
                    : []),
                ],
              },
            },
          }
        : {}),
    },
  });
  const dispatcherIds = suitableDispatchers.map(({ dispatcher_id }) => dispatcher_id);
  const suitableDispatchersWithRelatedData = await prisma.$queryRawUnsafe(
    getFilteredDispatchersByVehicleQuery,
    dispatcherIds,
  );
  return suitableDispatchersWithRelatedData as GetFilteredDispatchersByVehicleResult[];
};
