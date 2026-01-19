import server from '../../../v3/app';
import request from 'supertest';
import { createMockUser } from '../utility/user';
import prisma from '../../../v3/db/client';

const endpoint = 'v3/vehicle_type';
let userId: number, token: string;

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
  describe('GET', () => {
    it('should return 200 and array of vehicle types', async () => {
      const response = await request(server).get(`/api/${endpoint}`).set('x-auth-token', token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4);
    });
  });
  describe('GET /:id', () => {
    it('should return 200 and vehicle type', async () => {
      const response = await request(server).get(`/api/${endpoint}/1`).set('x-auth-token', token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should return 400 when id is not a number', async () => {
      const response = await request(server).get(`/api/${endpoint}/a`).set('x-auth-token', token);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Id číslo mezi 0-4');
    });

    it('should return 400 when id is out of range', async () => {
      const response = await request(server).get(`/api/${endpoint}/5`).set('x-auth-token', token);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Id číslo mezi 0-4');
    });
  });
});
