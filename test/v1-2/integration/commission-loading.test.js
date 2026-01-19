const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'commissionloading';
let server;
let commissionloadingId;
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

describe('/api/commissionloading', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `INSERT INTO "commissionloading" ("commission_id", "date", "dateTo", "deleted", "note", "number", "loading_id", "refNumber", "time", "year")
      VALUES (NULL, '121654674', '213213321', '0', 'asdasd asd asd adas dasd ', '1234', NULL, '1234564', NULL, NULL) RETURNING "commissionLoading_id"`;

      try {
        res = await pool.query(query);
        commissionloadingId = res.rows[0].commissionLoading_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `DELETE FROM "commissionloading" WHERE (("date" = '121654674'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        throw new Error('Error executing query', query, error.stack);
      }
    });
    describe('REMOVE /:id', () => {
      it('should delete the commissionloading and return it', async () => {
        let res = await request(server)
          .delete(`/api/commission_loading/${commissionloadingId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('commissionLoading_id');

        res = await request(server)
          .delete(`/api/commission_loading/${commissionloadingId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });
  });
});
