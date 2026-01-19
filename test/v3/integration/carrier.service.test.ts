import { updateCarrier, createCarrier, getCarrier, removeCarrier } from '../../../v3/carrier/carrier.service';

import { getCarriers } from '../../../v3/carrier/search/search.service';

let carrierId: number,
  dispatcherId1: number,
  dispatcherId2: number,
  dispatcherPlaceId1: number,
  dispatcherPlaceId2: number;

let dispatcherVehicleId1: number;
let dispatcherVehicleId2: number;
let dispatcherVehicleFeatureId1: number;
let dispatcherVehicleFeatureId2: number;

const mockCarrierCreate = <any>{
  company: 'test',
  email: 'email',
  dispatchers: {
    toCreate: [
      {
        email: 'email',
        firstName: 'Franta',
        lastName: 'lastName',
        phone: 'phone',
        language_id: 1,
        dispatcherVehicles: {
          toCreate: [
            {
              vehicleType_id: 1,
              maxHeight: 2,
              maxLength: 2,
              maxWeight: 3,
              dispatcherVehicleFeatures: {
                toCreate: [
                  {
                    vehicleFeature_id: 1,
                  },
                  {
                    vehicleFeature_id: 2,
                  },
                ],
              },
            },
          ],
        },
        places: {
          toCreate: [
            {
              city: 'Praha1',
              country: 'Ceska republika',
              countryCode: 'CZ',
              directionLoading: false,
              directionDischarge: false,
              latitude: 50.6712,
              longitude: 14.14,
              note: 'asd',
              postalCode: '12000',
            },
          ],
        },
      },
      {
        email: 'email',
        firstName: 'Tonda',
        lastName: 'lastName',
        phone: 'phone',
      },
    ],
  },
  dispatcherVehicles: {
    toCreate: [
      {
        vehicleType_id: 1,
        dispatcherVehicleFeatures: {
          toCreate: [
            {
              vehicleFeature_id: 1,
            },
            {
              vehicleFeature_id: 2,
            },
          ],
        },
      },
    ],
  },
  places: {
    toCreate: [
      {
        city: 'Praha2',
      },
    ],
  },
};

// const mockCarrierUpdate = <
//   Prisma.carrierUpdateInput & {
//     dispatchers: any;
//     places: any;
//     dispatcherVehicles: any;
//   }
// >{
//   company: 'Test',
//   email: 'email',
//   dispatchers: {
//     toCreate: [
//       {
//         email: 'email',
//         firstName: 'Milan',
//         lastName: 'lastName',
//         phone: 'phone',
//         language_id: 1,
//         dispatcherVehicles: {
//           toCreate: [
//             {
//               vehicleType_id: 1,
//               maxHeight: 2,
//               maxLength: 2,
//               maxWeight: 3,
//               dispatcherVehicleFeatures: {
//                 toCreate: [
//                   {
//                     vehicleFeature_id: 1,
//                   },
//                   {
//                     vehicleFeature_id: 2,
//                   },
//                 ],
//               },
//             },
//             {
//               vehicleType_id: 1,
//               maxHeight: 2,
//               maxLength: 2,
//               maxWeight: 3,
//               dispatcherVehicleFeatures: {
//                 toCreate: [
//                   {
//                     vehicleFeature_id: 2,
//                   },
//                 ],
//               },
//             },
//           ],
//         },
//         places: {
//           toCreate: [
//             {
//               city: 'Praha1',
//               country: 'Ceska republika',
//               countryCode: 'CZ',
//               directions: [0, 1],
//               latitude: 50.6712,
//               longitude: 14.14,
//               note: 'asd',
//               postalCode: '12000',
//             },
//             {
//               city: 'Praha2',
//               country: 'Ceska republika',
//               countryCode: 'CZ',
//               directions: [0, 1],
//               latitude: 50.6712,
//               longitude: 14.14,
//               note: 'asd',
//               postalCode: '12000',
//             },
//           ],
//         },
//       },
//     ],
//     toUpdate: [
//       {
//         dispatcher_id: dispatcherId1,
//       },
//     ],
//     toDelete: [{ dispatcher_id: dispatcherId2 }],
//   },
//   dispatcherVehicles: {},
//   places: {},
// };

describe('Carrier service tests', () => {
  it('Should create carrier', async () => {
    const { dispatchers, places, dispatcherVehicles, ...carrier } = mockCarrierCreate;
    const createdCarrier = await createCarrier(carrier, dispatchers, dispatcherVehicles, places);
    carrierId = createdCarrier.carrier_id;
    dispatcherId1 = createdCarrier.dispatcher[0].dispatcher_id;
    dispatcherId2 = createdCarrier.dispatcher[1].dispatcher_id;
    dispatcherPlaceId1 = createdCarrier.places[0].place_id;
    dispatcherPlaceId2 = createdCarrier.places[1].place_id;
    dispatcherVehicleId1 = createdCarrier.dispatchervehicle[0].dispatcherVehicle_id;
    dispatcherVehicleId2 = createdCarrier.dispatchervehicle[1].dispatcherVehicle_id;
    dispatcherVehicleFeatureId1 =
      createdCarrier.dispatchervehicle[0].dispatchervehiclefeature[0].dispatcherVehicleFeature_id;
    dispatcherVehicleFeatureId2 =
      createdCarrier.dispatchervehicle[0].dispatchervehiclefeature[1].dispatcherVehicleFeature_id;

    expect(createdCarrier).toHaveProperty('carrier_id');
    expect(createdCarrier).toHaveProperty('company', carrier.company);
    expect(createdCarrier).toHaveProperty('email', carrier.email);
    expect(createdCarrier).toHaveProperty('dispatcher');
    expect(createdCarrier.dispatcher).toHaveLength(2);
    expect(createdCarrier.dispatcher[1]).toHaveProperty('firstName', 'Tonda');
    expect(createdCarrier.dispatcher[0]).toHaveProperty('firstName', 'Franta');
    expect(createdCarrier).toHaveProperty('places');
    expect(createdCarrier.places).toHaveLength(2);
    expect(createdCarrier.places[0]).toHaveProperty('city', 'Praha2');
    expect(createdCarrier.places[0]).toHaveProperty('dispatcher_id', null);
    expect(createdCarrier.places[1]).toHaveProperty('city', 'Praha1');
    expect(createdCarrier.places[1]).toHaveProperty('dispatcher_id', dispatcherId1);
    expect(createdCarrier).toHaveProperty('dispatchervehicle');
    expect(createdCarrier.dispatchervehicle).toHaveLength(2);
    expect(createdCarrier.dispatchervehicle[0]).toHaveProperty('vehicleType_id', 1);
    expect(createdCarrier.dispatchervehicle[0]).toHaveProperty('dispatchervehiclefeature');
    expect(createdCarrier.dispatchervehicle[0].dispatchervehiclefeature).toHaveLength(2);
    expect(createdCarrier.dispatchervehicle[0].dispatchervehiclefeature[0]).toHaveProperty('vehicleFeature_id', 1);
  });

  it('Should update carrier', async () => {
    const mockCarrierUpdate = <any>{
      company: 'updatedName',
      email: 'updatedEmail',
      dispatchers: {
        toCreate: [
          {
            firstName: 'Johan',
            places: {
              toCreate: [
                {
                  city: 'Praha5',
                },
              ],
            },
            dispatcherVehicles: {
              toCreate: [
                {
                  vehicleType_id: 2,
                  dispatcherVehicleFeatures: {
                    toCreate: [
                      {
                        vehicleFeature_id: 4,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
        toUpdate: [
          {
            dispatcher_id: dispatcherId1,
            firstName: 'Tom',
          },
        ],
        toDelete: [
          {
            dispatcher_id: dispatcherId2,
          },
        ],
      },
      places: {
        toCreate: [
          {
            city: 'Praha /wo dispatcher',
          },
        ],
        toUpdate: [
          {
            place_id: dispatcherPlaceId1,
            city: 'Praha1 updated',
          },
        ],
        toDelete: [
          {
            place_id: dispatcherPlaceId2,
          },
        ],
      },
      dispatcherVehicles: {
        toCreate: [],
        toUpdate: [],
        toDelete: [],
      },
    };

    const { dispatchers, dispatcherVehicles, places, ...carrier } = mockCarrierUpdate;
    const updatedCarrier = await updateCarrier(carrierId, carrier, dispatchers, dispatcherVehicles, places);

    expect(updatedCarrier).toHaveProperty('carrier_id', carrierId);
    expect(updatedCarrier).toHaveProperty('company', mockCarrierUpdate.company);
    expect(updatedCarrier).toHaveProperty('email', mockCarrierUpdate.email);
    expect(updatedCarrier).toHaveProperty('dispatcher');
    expect(updatedCarrier).toHaveProperty('dispatchervehicle');
    expect(updatedCarrier).toHaveProperty('places');
    expect(updatedCarrier.dispatcher).toHaveLength(2);
    expect(updatedCarrier.dispatcher[0]).toHaveProperty('firstName', 'Tom');
    expect(updatedCarrier.dispatcher[1]).toHaveProperty('firstName', 'Johan');
    expect(updatedCarrier.places).toHaveLength(3);
    expect(updatedCarrier.places[0]).toHaveProperty('city', 'Praha /wo dispatcher');
    expect(updatedCarrier.places[0]).toHaveProperty('dispatcher_id', null);
    expect(updatedCarrier.places[1]).toHaveProperty('city', 'Praha1 updated');
    expect(updatedCarrier).toHaveProperty('dispatchervehicle');
    expect(updatedCarrier.dispatchervehicle).toHaveLength(3);
    expect(updatedCarrier.dispatchervehicle[0]).toHaveProperty('vehicleType_id', 1);
    expect(updatedCarrier.dispatchervehicle[1]).toHaveProperty('vehicleType_id', 1);
    expect(updatedCarrier.dispatchervehicle[1]).toHaveProperty('dispatchervehiclefeature');
    expect(updatedCarrier.dispatchervehicle[1].dispatchervehiclefeature).toHaveLength(2);
    expect(updatedCarrier.dispatchervehicle[1].dispatchervehiclefeature[0]).toHaveProperty('vehicleFeature_id', 1);
  });

  it('Should return carrier', async () => {
    const carrier = await getCarrier(carrierId);
    expect(carrier).toHaveProperty('carrier_id', carrierId);
    expect(carrier).toHaveProperty('company', 'updatedName');
    expect(carrier).toHaveProperty('email', 'updatedEmail');
    expect(carrier).toHaveProperty('dispatcher');
    expect(carrier).toHaveProperty('dispatchervehicle');
    expect(carrier).toHaveProperty('places');
    expect(carrier.dispatcher).toHaveLength(2);
    expect(carrier.dispatchervehicle).toHaveLength(3);
    expect(carrier.places).toHaveLength(3);
    expect(carrier.dispatcher[0]).toHaveProperty('firstName', 'Tom');
    expect(carrier.dispatcher[1]).toHaveProperty('firstName', 'Johan');
  });

  it('Should return carriers', async () => {
    const carriers = await getCarriers({ limit: '10' });

    expect(carriers).toHaveProperty('totalRows');
    expect(carriers).toHaveProperty('data');
    expect(carriers.data[0]).toHaveProperty('carrier_id', carrierId);
    expect(carriers.data[0]).toHaveProperty('company', 'updatedName');
    expect(carriers.data[0]).toHaveProperty('email', 'updatedEmail');
  });

  it('Should delete carrier', async () => {
    const deletedCarrier = await removeCarrier(carrierId);
    expect(deletedCarrier).toHaveProperty('carrier_id', carrierId);
  });
});
