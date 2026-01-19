import server from '../../../v3/app';
import request from 'supertest';
import prisma from '../../../v3/db/client';
import { createMockUser } from '../utility/user';
import moment from 'moment';

const endpoint = 'v3/carrier';
let userId: number, token: string, carrierId: number, carrierData, ts_edited: string, carrierNumber: number;

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

  carrierData = {
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
              {
                vehicleType_id: 1,
                maxHeight: 2,
                maxLength: 2,
                maxWeight: 3,
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
              {
                city: 'Praha2',
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
  };
});

afterAll(async () => {
  try {
    await prisma.users.delete({
      where: {
        user_id: userId,
      },
    });
  } catch (e: any) {
    console.warn(e.message);
  }
});

describe(`/api/${endpoint}`, () => {
  describe('POST', () => {
    it('should return 200 and created carrier', async () => {
      const response = await request(server).post(`/api/${endpoint}`).send(carrierData).set('x-auth-token', `${token}`);

      carrierId = response.body.carrier_id;
      carrierNumber = response.body.number;
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('carrier_id', carrierId);
      expect(response.body).toHaveProperty('company', carrierData.company);
      expect(response.body).toHaveProperty('email', carrierData.email);
      expect(response.body).toHaveProperty('dispatcher');
      expect(response.body.dispatcher).toHaveLength(2);
      expect(response.body).toHaveProperty('dispatchervehicle');
      expect(response.body.dispatchervehicle).toHaveLength(2);
      expect(response.body).toHaveProperty('places');
      expect(response.body.places).toHaveLength(2);
    });
  });
  describe('PUT', () => {
    it('should return 200 and updated carrier', async () => {
      const updatedCarrierData = {
        company: 'updated',
        email: 'updated',
      };
      const response = await request(server)
        .put(`/api/${endpoint}/${carrierId}`)
        .send(updatedCarrierData)
        .set('x-auth-token', `${token}`);

      ts_edited = moment.unix(Math.floor(Number(response.body.ts_edited / 1000))).format('DD.MM.YYYY');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('carrier_id', carrierId);
      expect(response.body).toHaveProperty('company', updatedCarrierData.company);
      expect(response.body).toHaveProperty('email', updatedCarrierData.email);
      expect(response.body).toHaveProperty('dispatcher');
      expect(response.body.dispatcher).toHaveLength(2);
      expect(response.body).toHaveProperty('dispatchervehicle');
      expect(response.body.dispatchervehicle).toHaveLength(2);
      expect(response.body).toHaveProperty('places');
      expect(response.body.places).toHaveLength(2);
    });
  });
  describe('GET', () => {
    it('should return 200 and all carriers', async () => {
      const response = await request(server).get(`/api/${endpoint}`).set('x-auth-token', `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRows', 1);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('carrier_id', carrierId);
      expect(response.body.data[0]).toHaveProperty('company');
      expect(response.body.data[0]).toHaveProperty('email');
    });
  });
  describe('GET /:id', () => {
    it('should return 200 and carrier with id', async () => {
      const response = await request(server).get(`/api/${endpoint}/${carrierId}`).set('x-auth-token', `${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('carrier_id', carrierId);
      expect(response.body).toHaveProperty('company');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('dispatcher');
      expect(response.body.dispatcher).toHaveLength(2);
      expect(response.body).toHaveProperty('dispatchervehicle');
      expect(response.body.dispatchervehicle).toHaveLength(2);
      expect(response.body).toHaveProperty('places');
      expect(response.body.places).toHaveLength(2);
    });
  });
  describe('GET /csv', () => {
    it('should return 200 and csv file', async () => {
      const mockResponse =
        `"číslo","firma","ulice","psč","země","poslední změna","poznámka"\n` +
        `${carrierNumber},"updated",,,,"${ts_edited}",`;
      const response = await request(server).get(`/api/${endpoint}/csv`).set('x-auth-token', token);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.text).toBe(mockResponse);
    });
  });
  describe('DELETE', () => {
    it('should return 200 and deleted carrier', async () => {
      const response = await request(server).delete(`/api/${endpoint}/${carrierId}`).set('x-auth-token', `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('carrier_id');
      expect(response.body.carrier_id).toBe(carrierId);
    });
  });
});
