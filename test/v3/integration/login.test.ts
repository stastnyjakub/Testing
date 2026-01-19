import server from '../../../v3/app';
import request from 'supertest';
import { deleteMockUser } from '../utility/user';
import { createMockUser } from '../utility/user';

const endpoint = 'v3/login';
let userId: number;
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

beforeAll(async () => {
  const user = await createMockUser(userData);
  userId = user.user_id;
});

afterAll(async () => {
  await deleteMockUser(userId);
});

describe(`/api/${endpoint}`, () => {
  describe('POST /', () => {
    it('should return 200', async () => {
      const response = await request(server).post(`/api/${endpoint}`).send({
        email: userData.email,
        password: 'lezlevel',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authToken');
    });
  });
});
