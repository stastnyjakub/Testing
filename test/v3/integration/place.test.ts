import server from '../../../v3/app';
import request from 'supertest';
import { createMockUser } from '../utility/user';
import { createMockCarrier, deleteMockCarrier } from '../utility/carrier';
import { createMockDispatcher } from '../utility/dispatcher';
import prisma from '../../../v3/db/client';
import { PlaceUpdateBody } from '../../../v3/place/place.interface';

const endpoint = 'v3/dispatcher';
let userId: number,
  token: string,
  carrierId: number,
  dispatcherId: number,
  placeId1: number,
  placeId2: number,
  placesData: PlaceUpdateBody;

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
  placesData = {
    places: {
      toCreate: [
        {
          city: 'Praha1',
        },
        {
          city: 'Praha2',
        },
      ],
      toUpdate: [],
      toDelete: [],
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

describe(`/api/${endpoint}/${dispatcherId}/place`, () => {
  describe('PUT', () => {
    it('Should update places (create)', async () => {
      const response = await request(server)
        .put(`/api/${endpoint}/${dispatcherId}/place`)
        .send(placesData)
        .set('x-auth-token', token);

      placeId1 = response.body.place[0].place_id;
      placeId2 = response.body.place[1].place_id;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dispatcher_id', dispatcherId);
      expect(response.body).toHaveProperty('place');
      expect(response.body.place.length).toBe(2);
      expect(response.body.place[0]).toHaveProperty('city', 'Praha1');
      expect(response.body.place[1]).toHaveProperty('city', 'Praha2');
    });
    it('Should update places (create, update, delete)', async () => {
      const updateData = {
        places: {
          toCreate: [
            {
              city: 'Praha3',
            },
          ],
          toUpdate: [
            {
              place_id: placeId1,
              city: 'Praha - Updated',
            },
          ],
          toDelete: [{ place_id: placeId2 }],
        },
      };
      const response = await request(server)
        .put(`/api/${endpoint}/${dispatcherId}/place`)
        .send(updateData)
        .set('x-auth-token', token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dispatcher_id', dispatcherId);
      expect(response.body).toHaveProperty('place');
      expect(response.body.place.length).toBe(2);
      expect(response.body.place[0]).toHaveProperty('city', 'Praha3');
      expect(response.body.place[1]).toHaveProperty('city', 'Praha - Updated');
    });
  });
  describe('GET', () => {
    it('Should get places', async () => {
      const response = await request(server).get(`/api/${endpoint}/${dispatcherId}/place`).set('x-auth-token', token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dispatcher_id', dispatcherId);
      expect(response.body).toHaveProperty('place');
      expect(response.body.place.length).toBe(2);
      expect(response.body.place[0]).toHaveProperty('city', 'Praha3');
      expect(response.body.place[1]).toHaveProperty('city', 'Praha - Updated');
    });
  });
});
