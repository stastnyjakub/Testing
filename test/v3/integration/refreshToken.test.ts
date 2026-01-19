import server from '../../../v3/app';
import request from 'supertest';
import { createMockUser } from '../utility/user';
import prisma from '../../../v3/db/client';

const endpoint = 'v3/refresh';
let userId: number, token: string, refreshToken: string;
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
  refreshToken = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
});

afterAll(async () => {
  try {
    await prisma.users.delete({
      where: {
        user_id: userId,
      },
    });
  } catch (e) {
    console.warn('Error', e.message);
  }
});

describe(`/api/${endpoint}`, () => {
  describe('POST /', () => {
    it('should return new authToken', async () => {
      const response = await request(server)
        .post(`/api/${endpoint}`)
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authToken');
      expect(response.body.authToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });
  });
});
