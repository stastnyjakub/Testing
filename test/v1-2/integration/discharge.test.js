const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'discharge';
let server;
let dischargeId;
let token;

let userId;

beforeAll(async () => {
  server = require('../../../v1-2/app');

  const userData = {
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

  user = await saveUser(userData);
  userId = user.user_id;

  let res = await request(server).post(`/api/login/`).send({
    email: userData.email,
    password: 'lezlevel',
  });
  token = res.body.authToken;
});

afterAll(async () => {
  query = `DELETE FROM "users" WHERE "user_id" = '${userId}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
});

describe('/api/discharge', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      await pool.query(
        `INSERT INTO "customer" ("customer_id", "company") values (18, 'Test company');`,
      );

      let query = `INSERT INTO "discharge" ("customer_id", "email", "firstName", "lastName", "phone") values ('18', 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček', '603 574 374') RETURNING "discharge_id"`;

      try {
        res = await pool.query(query);
        dischargeId = res.rows[0].discharge_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `TRUNCATE "customer" CASCADE; SELECT setval('customer_customer_id_seq', 1, true);
      TRUNCATE "discharge" CASCADE;`;

      try {
        res = await pool.query(query);
      } catch (error) {
        throw new Error('Error executing query', query, error.stack);
      }
    });
    describe('REMOVE /:id', () => {
      it('should delete the discharge and return it', async () => {
        let res = await request(server)
          .delete(`/api/discharge/${dischargeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('discharge_id');

        res = await request(server)
          .delete(`/api/discharge/${dischargeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });
  });
});
