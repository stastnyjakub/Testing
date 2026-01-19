import { users } from '@prisma/client';
import { findUsers } from '../../../v3/user/user.service';
import { createMockUser, deleteMockUser } from '../utility/user';

let user: users;

beforeAll(async () => {
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
  try {
    user = await createMockUser(userData);
  } catch (e) {
    console.warn('Error', e.message);
  }
});

afterAll(async () => {
  try {
    await deleteMockUser(user.user_id);
  } catch (e) {
    console.warn('Error', e.message);
  }
});

describe('User service tests', () => {
  it('Should find users', async () => {
    const users = await findUsers();

    expect(users[0]).toHaveProperty('user_id');
    expect(users[0]).toHaveProperty('email');
  });
  it('Should find users - by email', async () => {
    const users = await findUsers({ column: 'email', value: user.email });

    expect(users).toHaveLength(1);
    expect(users[0]).toHaveProperty('user_id', user.user_id);
    expect(users[0]).toHaveProperty('email', user.email);
  });
});
