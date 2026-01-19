const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'commission_discharge';
let server;
let commissiondischargeId;
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

describe('/api/commissiondischarge', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `INSERT INTO "commissiondischarge" ("commission_id", "date", "dateTo", "deleted", "note", "number", "discharge_id", "refNumber", "time", "year")
      VALUES (NULL, '121654674', '213213321', '0', 'asdasd asd asd adas dasd ', '1234', NULL, '1234564', NULL, NULL) RETURNING "commissionDischarge_id"`;

      try {
        res = await pool.query(query);
        commissiondischargeId = res.rows[0].commissionDischarge_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `DELETE FROM "commissiondischarge" WHERE (("date" = '121654674'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        throw new Error('Error executing query', query, error.stack);
      }
    });
    describe('REMOVE /:id', () => {
      it('should delete the commissiondischarge and return it', async () => {
        let res = await request(server)
          .delete(`/api/commission_discharge/${commissiondischargeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('commissionDischarge_id');

        res = await request(server)
          .delete(`/api/commission_discharge/${commissiondischargeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });
  });
});
