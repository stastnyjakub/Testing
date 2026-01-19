const server = require('../../../v1-2/app');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');
const request = require('supertest');

const mockUser = {
  number: 0,
  email: 'miroslav.sirina@koala42.com',
  password: 'lezlevel',
  emailPassword: 'asdad',
  jobTitle: 'developer',
  mobilePhone: 777932681,
  name: 'Miroslav',
  surname: 'Šiřina',
  username: 'miroslav.sirina',
};

const createMockUser = async () => {
  return await saveUser({ ...mockUser });
};

const loginMockUser = async () => {
  const { email, password } = mockUser;
  let res = await request(server).post(`/api/login/`).send({
    email,
    password,
  });

  return res.body.authToken;
};

const deleteMockUser = async (user) => {
  const { user_id } = user;
  query = `DELETE FROM "users" WHERE "user_id" = '${user_id}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

module.exports = { createMockUser, loginMockUser, deleteMockUser };
