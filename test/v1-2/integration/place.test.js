const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'place';
let carrierId;
let server;
let placeId;
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

describe('/api/carrier', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `INSERT INTO "carrier" ("addedBy", "city", "company", "companyRegistrationNumber", "country", "countryCode", "editedBy", "note", "email", "firstName", "lastName", "phone", "place", "postalCode", "qid", "number", "street", "taxId", "ts_edited", "ts_added") values ('miroslav.sirina@koala42.com', 'Pardubice', 'Václav Matys', '15615910', 'Česká republika', 'CZ', 'aneta.malerova@qapline.com', '*', 'info@autodopravamatys.cz', 'Václav', 'Matys', NULL, '{"city": "Pardubice", "street": "Prodloužená 217", "country": "Česká republika", "latitude": 49.31056910487806, "longitude": 13.46829268292683, "postalCode": "530 09", "countryCode": "CZ"}', '53009', '1', '1', 'Prodloužená 217', 'CZ5806200004', NULL, NULL) RETURNING carrier_id`;
      try {
        res = await pool.query(query);
        carrierId = res.rows[0].carrier_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "place" ("city", "carrier_id") values ('Lučenec', '${carrierId}') RETURNING place_id`;
      try {
        res = await pool.query(query);
        placeId = res.rows[0].place_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `DELETE FROM "place" WHERE (("carrier_id" = '${carrierId}'))`;

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
    });

    describe('REMOVE /:id', () => {
      it('should delete place and return it', async () => {
        let res = await request(server)
          .delete(`/api/place/${placeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('place_id');

        res = await request(server)
          .delete(`/api/place/${carrierId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });
  });
});
