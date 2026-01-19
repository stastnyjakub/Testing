const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'customer_contact';
let server;
let customer_contactId;
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

describe('/api/customer_contact', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `INSERT INTO "customer" ("customer_id","addedBy", "city", "company", "companyRegistrationNumber", "country", "countryCode", "editedBy", "note", "email", "firstName", "lastName", "phone", "place", "postalCode", "qid", "number", "street", "taxId", "ts_edited", "ts_added") values (1,'miroslav.sirina@koala42.com', 'Rožnov pod Radhoštěm', 'RETIGO s.r.o.', '60794062', 'Česká republika', 'CZ', 'molcikf@gmail.com', NULL, 'info@retigo.cz', NULL, NULL, '571 665 511', '{"city": "Rožnov pod Radhoštěm", "street": "Láň 2340", "country": "Česká republika", "postalCode": "756 64", "countryCode": "CZ"}', '756 64', '8', '8', 'Láň 2340', 'CZ60794062', NULL, NULL);
      INSERT INTO "customercontact" ("customerContact_id", "customer_id", "email", "firstName", "lastName", "phone") values ('1','1', 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček', '603 574 374') RETURNING "customerContact_id"`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `DELETE FROM "customercontact" WHERE (("email" = 'miroslav.sirina@koala42.com')); DELETE FROM "customer" WHERE (("addedBy" = 'miroslav.sirina@koala42.com'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        throw new Error('Error executing query', query, error.stack);
      }
    });

    describe('REMOVE /:id', () => {
      it('should delete the customer_contact and return it', async () => {
        let res = await request(server)
          .delete(`/api/customer_contact/1`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('customerContact_id');

        res = await request(server)
          .delete(`/api/customer_contact/1`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });
  });
});
