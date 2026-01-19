import server from '../../../v3/app';
import request from 'supertest';
import { createMockUser } from '../utility/user';
import { createMockCarrier, deleteMockCarrier } from '../utility/carrier';
import { createMockDispatcher } from '../utility/dispatcher';
import prisma from '../../../v3/db/client';

const endpoint = 'v3/dispatcher';
let userId: number,
  token: string,
  carrierId: number,
  dispatcherId: number,
  vehicleId1: number,
  vehicleId2: number,
  vehicleFeatureId1: number,
  vehicleFeatureId2: number,
  vehiclesData: any;

beforeAll(async () => {
  //create user
  const userData = {
    number: 0,
    email: 'miroslav.sirina@koala42.com',
    password: 'lezlevel',
    emailPassword: 'asdad',
    jobTitle: 'developer',
    mobilePhone: '777932681',
    name: 'Miroslav',
    surname: 'Šiřina',
    username: 'miroslav.sirina',
  };
  const user = await createMockUser(userData);
  userId = user.user_id;

  //login and assign token
  const response = await request(server).post('/api/v3/login').send({
    email: userData.email,
    password: 'lezlevel',
  });
  token = response.body.authToken;

  //create mock carrier & dispatcher
  try {
    const carrier = await createMockCarrier();
    carrierId = carrier.carrier_id;
    const dispatcher = await createMockDispatcher(carrierId);
    dispatcherId = dispatcher.dispatcher_id;
  } catch (e: any) {
    console.warn(e.message);
  }
  vehiclesData = {
    dispatcherVehicles: {
      toCreate: [
        {
          vehicleType_id: 1,
          maxHeight: 1,
          maxLength: 1,
          maxWeight: 1,
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
        {
          vehicleType_id: 2,
          maxHeight: 2,
          maxLength: 2,
          maxWeight: 2,
          dispatcherVehicleFeatures: {
            toCreate: [
              {
                vehicleFeature_id: 2,
              },
            ],
          },
        },
      ],
    },
  };
});

afterAll(async () => {
  try {
    await deleteMockCarrier(carrierId);
    await prisma.users.delete({
      where: { user_id: userId },
    });
  } catch (e: any) {
    console.warn(e.message);
  }
});

describe(`/api/${endpoint}/${dispatcherId}/vehicle`, () => {
  describe('PUT', () => {
    it('Should update vehicles (create)', async () => {
      const response = await request(server)
        .put(`/api/${endpoint}/${dispatcherId}/vehicle`)
        .send(vehiclesData)
        .set('x-auth-token', token);

      vehicleId1 = response.body.dispatchervehicle[0].dispatcherVehicle_id;
      vehicleId2 = response.body.dispatchervehicle[1].dispatcherVehicle_id;
      vehicleFeatureId1 = response.body.dispatchervehicle[0].dispatchervehiclefeature[0].dispatcherVehicleFeature_id;
      vehicleFeatureId2 = response.body.dispatchervehicle[0].dispatchervehiclefeature[1].dispatcherVehicleFeature_id;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dispatcher_id', dispatcherId);
      expect(response.body).toHaveProperty('dispatchervehicle');
      expect(response.body.dispatchervehicle.length).toBe(2);
      expect(response.body.dispatchervehicle[0]).toHaveProperty('vehicleType_id', 1);
      expect(response.body.dispatchervehicle[1]).toHaveProperty('vehicleType_id', 2);
      expect(response.body.dispatchervehicle[0]).toHaveProperty('dispatchervehiclefeature');
      expect(response.body.dispatchervehicle[0].dispatchervehiclefeature.length).toBe(2);
    });

    it('Should update vehicles (create, update, delete)', async () => {
      const updateData = {
        dispatcherVehicles: {
          toCreate: [
            {
              vehicleType_id: 4,
              maxHeight: 4,
            },
          ],
          toUpdate: [
            {
              dispatcherVehicle_id: vehicleId1,
              dispatcherVehicleFeatures: {
                toCreate: [{ vehicleFeature_id: 15 }],
                toUpdate: [
                  {
                    dispatcherVehicleFeature_id: vehicleFeatureId1,
                    vehicleFeature_id: 16,
                  },
                ],
                toDelete: [{ dispatcherVehicleFeature_id: vehicleFeatureId2 }],
              },
            },
          ],
          toDelete: [{ dispatcherVehicle_id: vehicleId2 }],
        },
      };
      const response = await request(server)
        .put(`/api/${endpoint}/${dispatcherId}/vehicle`)
        .send(updateData)
        .set('x-auth-token', token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dispatcher_id', dispatcherId);
      expect(response.body).toHaveProperty('dispatchervehicle');
      expect(response.body.dispatchervehicle.length).toBe(2);
      expect(response.body.dispatchervehicle[0]).toHaveProperty('dispatchervehiclefeature');
      expect(response.body.dispatchervehicle[0].dispatchervehiclefeature.length).toBe(2);
      expect(response.body.dispatchervehicle[0].dispatchervehiclefeature[0]).toHaveProperty('vehicleFeature_id', 15);
      expect(response.body.dispatchervehicle[0].dispatchervehiclefeature[1]).toHaveProperty('vehicleFeature_id', 16);
    });
  });
});
