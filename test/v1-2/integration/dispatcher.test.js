const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'dispatcher';
let carrierId, server, dispatcherId, token, dispatcherPublicToken, userId;

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

  let query = `INSERT INTO "carrier" ("addedBy", "city", "company", "companyRegistrationNumber", "country", "countryCode", "editedBy", "note", "email", "firstName", "lastName", "phone", "place", "postalCode", "qid", "number", "street", "taxId", "ts_edited", "ts_added") values ('miroslav.sirina@koala42.com', 'Pardubice', 'Václav Matys', '15615910', 'Česká republika', 'CZ', 'aneta.malerova@qapline.com', '*', 'info@autodopravamatys.cz', 'Václav', 'Matys', NULL, '{"city": "Pardubice", "street": "Prodloužená 217", "country": "Česká republika", "latitude": 49.31056910487806, "longitude": 13.46829268292683, "postalCode": "530 09", "countryCode": "CZ"}', '53009', '1', '1', 'Prodloužená 217', 'CZ5806200004', NULL, NULL) RETURNING carrier_id`;
  try {
    res = await pool.query(query);
    carrierId = res.rows[0].carrier_id;
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }

  query = `INSERT INTO "dispatcher" ("email", "carrier_id","firstName") values ('miroslav.sirina@koala42.com', '${carrierId}', 'Mirek') RETURNING dispatcher_id, token as dispatcher_public_token`;
  try {
    res = await pool.query(query);
    dispatcherId = res.rows[0].dispatcher_id;
    dispatcherPublicToken = res.rows[0].dispatcher_public_token;
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
});

afterAll(async () => {
  let query = `DELETE FROM "dispatcher" WHERE (("carrier_id" = '${carrierId}'))`;

  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }

  query = `DELETE FROM "carrier" WHERE (("addedBy" = 'miroslav.sirina@koala42.com')) `;

  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }

  query = `DELETE FROM "users" WHERE "user_id" = '${userId}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
});

describe(`/api/${endpointName}`, () => {
  describe('Private routes', () => {
    describe(`GET /api/${endpointName}/:id`, () => {
      it('should return dispatcher detail with relations', async () => {
        let res = await request(server)
          .get(`/api/dispatcher/${dispatcherId}?relations=true`)
          .set('x-auth-token', token);

        if (res.error) console.log(res.error);

        expect(res.body[0]).toHaveProperty('place');
        expect(res.status).toBe(200);
      });

      it('should return dispatcher detail without relations', async () => {
        let res = await request(server)
          .get(`/api/dispatcher/${dispatcherId}`)
          .set('x-auth-token', token);

        if (res.error) console.log(res.error);

        expect(res.body[0]).not.toHaveProperty('place');
        expect(res.status).toBe(200);
      });

      it('should return error', async () => {
        let res = await request(server)
          .get(`/api/dispatcher/public/15648964165464564654897`)
          .set('x-auth-token', token);

        expect(res.status).toBe(400);
      });
    });
  });

  describe('Public routes', () => {
    describe(`GET /api/${endpointName}/public/:id`, () => {
      it('should return dispatcher detail', async () => {
        let res = await request(server).get(
          `/api/dispatcher/public/${dispatcherPublicToken}`,
        );

        if (res.error) console.log(res.error);
        expect(res.body[0]).toHaveProperty('dispatcher_id', dispatcherId);
        expect(res.status).toBe(200);
      });

      it('should return error', async () => {
        let res = await request(server).get(
          `/api/dispatcher/public/asdasd-asdasdasd-asdasd`,
        );

        expect(res.status).toBe(400);
      });
    });
  });

  describe('REMOVE /:id', () => {
    it('should delete dispatcher and return it', async () => {
      let res = await request(server)
        .delete(`/api/dispatcher/${dispatcherId}`)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('dispatcher_id');

      res = await request(server)
        .delete(`/api/dispatcher/${dispatcherId}`)
        .set('x-auth-token', token);

      expect(res.status).toBe(404);
    });
  });
});
