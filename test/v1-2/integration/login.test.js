const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const bcrypt = require('bcryptjs');

let endpointName = 'login';
let userId;
let Id;

beforeAll(async () => {
  server = require('../../../v1-2/app');
});

afterAll(async () => {});

describe(`/api/${endpointName}`, () => {
  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const jobTitle = 'tester';
    const pwd = await bcrypt.hash(`1324${jobTitle}`, salt);

    query = `INSERT INTO users ("number","email","username","password","jobTitle","mobilePhone","name","surname") values ('1','test@test.cz','testing.account','${pwd}','${jobTitle}','123456789','Mirek','Tester') RETURNING user_id`;

    try {
      res = await pool.query(query);
      userId = res.rows[0].user_id;
    } catch (error) {
      console.warn('Error executing query', query, error.stack);
    }
  });

  afterEach(async () => {
    query = `DELETE FROM "users" WHERE (("email" = 'test@test.cz'))`;

    try {
      res = await pool.query(query);
    } catch (error) {
      throw new Error('Error executing query', query, error.stack);
    }
  });

  describe('POST /', () => {
    it('should LOGIN and return token', async () => {
      userData = {
        email: 'test@test.cz',
        password: '1324tester',
      };

      let res = await request(server)
        .post(`/api/${endpointName}/`)
        .send(userData);

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty('authToken');
      expect(res.body).not.toHaveProperty('password');

      userData.password = 'pepa';
      res = await request(server).post(`/api/${endpointName}/`).send(userData);
      expect(res.status).toBe(401);
    });
  });
});
