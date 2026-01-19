import { Prisma } from '@prisma/client';
import axios from 'axios';

import * as dispatcherService from '@/dispatcher/dispatcher.service';
import { EPrismaClientErrorCodes } from '@/types';
import { performTransaction } from '@/utils';

import prisma from '../db/client';
import { Entity, NotFoundException } from '../errors';

import { IGetLocationCoordinatesResponse } from './carrier.interface';

export const getCarrier = async (carrierId: number) => {
  const carrier = await prisma.carrier.findUnique({
    where: { carrier_id: carrierId },
  });
  return carrier;
};

// export const createCarrier = async (
//   carrier: Prisma.CarrierCreateInput,
//   dispatchers: CarrierBodyCreate['dispatchers'],
//   dispatcherVehicles: CarrierBodyCreate['dispatcherVehicles'],
//   places: CarrierBodyCreate['places'],
// ): Promise<Carrier> => {
//   // transaction returns void
//   let createdCarrier;
//   await prisma.$transaction(
//     async (transaction) => {
//       if (carrier?.place?.['postalCode']) carrier.place['postalCode'] = formatPostalCode(carrier.place['postalCode']);

//       const coords = await getLocationCoordinates(
//         carrier?.place?.['countryCode'],
//         carrier?.place?.['city'],
//         carrier?.place?.['postalCode'],
//       );
//       if (!carrier?.place) {
//         carrier.place = {
//           latitude: coords.lat,
//           longitude: coords.lng,
//         };
//       }
//       if (carrier?.place) {
//         carrier.place['latitude'] = coords.lat;
//         carrier.place['longitude'] = coords.lng;
//       }

//       // create carrier and dispatcherVehicles + places (/wo dispatcher)
//       const dispatcherVehicleCreateArray = [];

//       if (dispatcherVehicles && dispatcherVehicles.toCreate) {
//         for (const dispatcherVehicle of dispatcherVehicles.toCreate) {
//           const { dispatcherVehicleFeatures, ...dispatcherVehicleData } = dispatcherVehicle;
//           dispatcherVehicleCreateArray.push({
//             ...dispatcherVehicleData,
//             dispatchervehiclefeature: {
//               create: dispatcherVehicleFeatures?.toCreate,
//             },
//           });
//         }
//       }
//       const lastNumber = carrier.number
//         ? carrier.number
//         : (
//             await transaction.carrier.aggregate({
//               _max: {
//                 number: true,
//               },
//               where: {
//                 deleted: false,
//               },
//             })
//           )._max.number + 1;
//       const newCarrier = await transaction.carrier.create({
//         data: {
//           ...carrier,
//           number: lastNumber ? lastNumber : 1,
//           dispatchervehicle: {
//             create: dispatcherVehicleCreateArray,
//           },
//           places: {
//             create: places?.toCreate,
//           },
//         },
//       });

//       // create dispatchers + vehicles + features
//       if (dispatchers && dispatchers.toCreate) {
//         for (const dispatcher of dispatchers.toCreate) {
//           const { places: p, dispatcherVehicles: df, ...dispatcherData } = dispatcher;
//           const dispatcherVehiclesCreateArray = [];
//           const placesCreateArray = [];
//           // dispatcher vehicles
//           if (df && df.toCreate) {
//             for (const dispatcherVehicle of df.toCreate) {
//               const { dispatcherVehicleFeatures, ...dispatcherVehicleData } = dispatcherVehicle;
//               dispatcherVehiclesCreateArray.push({
//                 ...dispatcherVehicleData,
//                 carrier_id: newCarrier.carrier_id,
//                 dispatchervehiclefeature: {
//                   create: dispatcherVehicleFeatures?.toCreate,
//                 },
//               });
//             }
//           }
//           // places
//           if (p && p.toCreate) {
//             for (const place of p.toCreate) {
//               placesCreateArray.push({
//                 ...place,
//                 carrier_id: newCarrier.carrier_id,
//               });
//             }
//           }

//           await transaction.dispatcher.create({
//             data: {
//               ...dispatcherData,
//               dispatchervehicle: {
//                 create: dispatcherVehiclesCreateArray,
//               },
//               place: {
//                 create: placesCreateArray,
//               },
//               carrier_id: newCarrier.carrier_id,
//             } as Prisma.DispatcherCreateInput,
//           });
//         }
//       }
//       createdCarrier = await transaction.carrier.findFirst({
//         where: { carrier_id: newCarrier.carrier_id },
//         include: {
//           dispatcher: true,
//           dispatchervehicle: {
//             include: {
//               dispatchervehiclefeature: true,
//             },
//           },
//           places: true,
//         },
//       });
//     },
//     { timeout: 30000 },
//   );
//   return createdCarrier;
// };

export const getLocationCoordinates = async (countryCode?: string, city?: string, postalCode?: string) => {
  const callbackValue = {
    lat: 0,
    lng: 0,
  };
  if (!countryCode || !city || !postalCode) return callbackValue;
  const url = `https://secure.geonames.org/postalCodeSearchJSON?placename=${[countryCode, city, postalCode].join(
    ', ',
  )}&maxRows=10&username=koala42`;
  try {
    const {
      data: { postalCodes: data },
    } = await axios.get<IGetLocationCoordinatesResponse>(url);
    if (!data || data.length === 0) return callbackValue;
    return {
      lng: data[0].lng,
      lat: data[0].lat,
    };
  } catch (error) {
    return callbackValue;
  }
};

// export const updateCarrier = async (
//   id: number,
//   carrier: Prisma.CarrierUpdateInput,
//   dispatchers: CarrierBodyUpdate['dispatchers'],
//   dispatcherVehicles: CarrierBodyUpdate['dispatcherVehicles'],
//   places: CarrierBodyUpdate['places'],
// ): Promise<Carrier> => {
//   // transaction returns void
//   let updatedCarrier;
//   await prisma.$transaction(
//     async (transaction) => {
//       // check if place has changed and update coordinates
//       const carrierData = await transaction.carrier.findFirst({
//         where: { carrier_id: id },
//       });

//       if (carrier?.place?.['postalCode']) carrier.place['postalCode'] = formatPostalCode(carrier.place['postalCode']);

//       if (
//         carrierData?.place?.['countryCode'] !== carrier?.place?.['countryCode'] ||
//         carrierData?.place?.['city'] !== carrier?.place?.['city'] ||
//         carrierData?.place?.['postalCode'] !== carrier?.place?.['postalCode']
//       ) {
//         const coords = await getLocationCoordinates(
//           carrier?.place?.['countryCode'],
//           carrier?.place?.['city'],
//           carrier?.place?.['postalCode'],
//         );
//         if (!carrier?.place) {
//           carrier.place = {
//             latitude: coords.lat,
//             longitude: coords.lng,
//           };
//         }
//         if (carrier?.place) {
//           carrier.place['latitude'] = coords.lat;
//           carrier.place['longitude'] = coords.lng;
//         }
//       }

//       // update carrier and its dispatcherVehicles + places + dispatchers
//       // places
//       const placesUpdateArray = [];
//       if (places && places.toUpdate) {
//         for (const place of places.toUpdate) {
//           const { place_id, ...placeData } = place;
//           placesUpdateArray.push({
//             where: { place_id },
//             data: placeData,
//           });
//         }
//       }

//       // dispatchers
//       const dispatcherDataUpdateArray = [];
//       if (dispatchers && dispatchers.toUpdate) {
//         for (const dispatcher of dispatchers.toUpdate) {
//           const { dispatcher_id, ...dispatcherData } = dispatcher;
//           dispatcherDataUpdateArray.push({
//             where: { dispatcher_id },
//             data: {
//               ...dispatcherData,
//             },
//           });
//         }
//       }

//       // dispatcherVehicles
//       const dispatcherVehiclesUpdateArray = [],
//         dispatcherVehiclesCreateArray = [];
//       if (dispatcherVehicles) {
//         if (dispatcherVehicles.toCreate) {
//           for (const dispatcherVehicle of dispatcherVehicles.toCreate) {
//             const { dispatcherVehicleFeatures, ...dispatcherVehicleData } = dispatcherVehicle;
//             dispatcherVehiclesCreateArray.push({
//               ...dispatcherVehicleData,
//               dispatchervehiclefeature: {
//                 create: dispatcherVehicleFeatures?.toCreate,
//               },
//             });
//           }
//         }
//         if (dispatcherVehicles.toUpdate) {
//           for (const dispatcherVehicle of dispatcherVehicles.toUpdate) {
//             const { dispatcherVehicleFeatures, dispatcherVehicle_id, ...dispatcherVehicleData } = dispatcherVehicle;
//             // dispatcherVehicleFeature update
//             const dfFeaturesUpdateArray = [];
//             if (dispatcherVehicleFeatures && dispatcherVehicleFeatures.toUpdate) {
//               for (const dispatcherVehicleFeature of dispatcherVehicleFeatures.toUpdate) {
//                 const { dispatcherVehicleFeature_id, ...dispatcherVehicleFeatureData } = dispatcherVehicleFeature;
//                 dfFeaturesUpdateArray.push({
//                   where: { dispatcherVehicleFeature_id },
//                   data: dispatcherVehicleFeatureData,
//                 });
//               }
//             }
//             dispatcherVehiclesUpdateArray.push({
//               where: { dispatcherVehicle_id },
//               data: {
//                 ...dispatcherVehicleData,
//                 dispatchervehiclefeature: {
//                   update: dfFeaturesUpdateArray,
//                   deleteMany: dispatcherVehicleFeatures?.toDelete,
//                   create: dispatcherVehicleFeatures?.toCreate,
//                 },
//               },
//             });
//           }
//         }
//       }

//       const newUpdatedCarrier = await transaction.carrier.update({
//         where: { carrier_id: id },
//         data: {
//           ...carrier,
//           ts_edited: getTimestampInMilliseconds(),
//           dispatcher: {
//             ...(dispatcherDataUpdateArray.length > 0 && { update: dispatcherDataUpdateArray }),
//             ...(dispatchers?.toDelete?.length > 0 && { deleteMany: dispatchers?.toDelete }),
//           },
//           dispatchervehicle: {
//             ...(dispatcherVehicles?.toDelete?.length > 0 && { delete: dispatcherVehicles?.toDelete }),
//             ...(dispatcherVehiclesCreateArray.length > 0 && { create: dispatcherVehiclesCreateArray }),
//             ...(dispatcherVehiclesUpdateArray.length > 0 && { update: dispatcherVehiclesUpdateArray }),
//           },
//           places: {
//             ...(places?.toDelete?.length > 0 && { delete: places?.toDelete }),
//             ...(places?.toCreate?.length > 0 && { create: places?.toCreate }),
//             ...(placesUpdateArray.length > 0 && { update: placesUpdateArray }),
//           },
//         },
//       });

//       // create dispatchers and their vehicles + features
//       if (dispatchers && dispatchers.toCreate) {
//         for (const dispatcher of dispatchers.toCreate) {
//           const { places: p, dispatcherVehicles: df, ...dispatcherData } = dispatcher;
//           const dispatcherVehiclesCreateArray = [];
//           const placesCreateArray = [];
//           // dispatcher vehicles
//           if (df && df.toCreate) {
//             for (const dispatcherVehicle of df.toCreate) {
//               const { dispatcherVehicleFeatures, ...dispatcherVehicleData } = dispatcherVehicle;
//               dispatcherVehiclesCreateArray.push({
//                 ...dispatcherVehicleData,
//                 carrier_id: newUpdatedCarrier.carrier_id,
//                 dispatchervehiclefeature: {
//                   create: dispatcherVehicleFeatures?.toCreate,
//                 },
//               });
//             }
//           }
//           // places
//           if (p && p.toCreate) {
//             for (const place of p.toCreate) {
//               placesCreateArray.push({
//                 ...place,
//                 carrier_id: newUpdatedCarrier.carrier_id,
//               });
//             }
//           }
//           await transaction.dispatcher.create({
//             data: {
//               ...dispatcherData,
//               dispatchervehicle: {
//                 create: dispatcherVehiclesCreateArray,
//                 connect: df && df.toConnect,
//               },
//               place: {
//                 create: placesCreateArray,
//                 connect: p && p.toConnect,
//               },
//               carrier_id: newUpdatedCarrier.carrier_id,
//             } as Prisma.dispatcherCreateInput,
//           });
//         }
//       }
//       // get updated carrier
//       updatedCarrier = await transaction.carrier.findFirst({
//         where: { carrier_id: newUpdatedCarrier.carrier_id },
//         include: {
//           dispatcher: true,
//           dispatchervehicle: {
//             include: {
//               dispatchervehiclefeature: true,
//             },
//           },
//           places: true,
//         },
//       });
//     },
//     { timeout: 50000 },
//   );
//   return updatedCarrier;
// };

export const deleteCarrier = async (carrierId: number) => {
  try {
    const deletedEntities = await performTransaction(async (transaction) => {
      const deletedCarrier = await transaction.carrier.delete({
        where: { carrier_id: carrierId },
      });
      const deletedDispatchers = await dispatcherService.deleteDispatchers({
        carrierId,
        transactionClient: transaction,
      });

      return {
        deletedCarrier,
        deletedDispatchers,
      };
    });

    return deletedEntities;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === EPrismaClientErrorCodes.RecordNotFound) {
        throw new NotFoundException(Entity.CARRIER);
      }
    }
    throw error;
  }
};

export * from './listCarriers/listCarriers.service';
