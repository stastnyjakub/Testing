const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'request';
let server;
let requestId;
let request_loadingId;
let request_dischargeId;
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

afterAll(async () => {});

afterAll(async () => {
  query = `DELETE FROM "request" WHERE (("addedBy" = 'miroslav.sirina@koala42.com'))`;

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

  //dereg user
});

describe('/api/request', () => {
  describe(`/api/${endpointName}`, () => {
    // customer id
    // discharge id
    // loading id

    beforeEach(async () => {
      await pool.query(`INSERT INTO "customer" ("customer_id", "company") values (1, 'Test company');
    INSERT INTO "loading" ("loading_id", "customer_id", "email", "firstName", "lastName", "phone") values ('1', '1', 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček', '603 574 374');
    INSERT INTO "discharge" ("discharge_id", "customer_id", "email", "firstName", "lastName", "phone") values ('1','1', 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček', '603 574 374')`);

      let query = `INSERT INTO "request" ("addedBy", "editedBy", "emailSent", "customer_id", "carriers", "discharge", "discharge_id", "dischargeDateFrom", "dischargeRadius", "dispatchers", "editeBy", "loading", "loading_id", "loadingDateFrom", "loadingDateTo", "loadingRadius", "number", "qid", "relation", "tsAdded", "tsEdited", "week", "year")
      values ('miroslav.sirina@koala42.com', 'molcikf@gmail.com', NULL, '1', '{}', '{"city": "Lipník nad Bečvou", "note": "do 15.30 hod, možnost domluvy", "street": "Loučská 1546", "company": "Vacula s.r.o.", "country": "Česká republika", "customer": "-KtFin1eEsUxH5kBYz8G", "scrollTo": false, "postalCode": "751 31", "countryCode": "CZ"}', '1', NULL, '50', '{}', NULL, '{"city": "Lipník nad Bečvou", "note": "do 15.30 hod, možnost domluvy", "street": "Loučská 1546", "company": "Vacula s.r.o.", "country": "Česká republika", "customer": "-KtFin1eEsUxH5kBYz8G", "scrollTo": false, "postalCode": "751 31", "countryCode": "CZ"}', '1', NULL, NULL, '50', '1', 'CZCZ-110001-19', 'CZCZ', '1552385083930', '1552385083930', '11', '2019')
      RETURNING "request_id"`;

      try {
        res = await pool.query(query);
        requestId = res.rows[0].request_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "requestloading" ("city", "country", "countryCode", "latitude", "longitude", "postalCode", "request_id", "deleted")
      values ('Morava', NULL, NULL, NULL, NULL, NULL, ${requestId}, false) RETURNING "requestLoading_id"`;

      try {
        res = await pool.query(query);
        request_loadingId = res.rows[0].requestLoading_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "requestdischarge" ("city", "country", "countryCode", "latitude", "longitude", "postalCode", "request_id", "deleted")
      values ('Morava', NULL, NULL, NULL, NULL, NULL, ${requestId}, false) RETURNING "requestDischarge_id"`;

      try {
        res = await pool.query(query);
        request_dischargeId = res.rows[0].requestDischarge_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `DELETE FROM "requestloading" WHERE (("requestLoading_id" = '${request_loadingId}'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `DELETE FROM "requestdischarge" WHERE (("requestDischarge_id" = '${request_dischargeId}'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `TRUNCATE "customer" CASCADE; SELECT setval('customer_customer_id_seq', 1, true);
      TRUNCATE "loading" CASCADE;
      TRUNCATE "discharge" CASCADE;
      TRUNCATE "request" CASCADE;`;
      await pool.query(query);
    });

    describe('GET /', () => {
      it('should return all requests', async () => {
        let res = await request(server)
          .get('/api/request?ordering=desc&limit=20&after=50&order_by=week')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('request_id');

        res = await request(server)
          .get('/api/request')
          .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('request_id');
      });

      it('requests filter', async () => {
        let res = await request(server)
          .get('/api/request?addedBy=sirina')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('request_id');
      });
    });

    describe('GET /:id', () => {
      it('should return one request', async () => {
        let res = await request(server)
          .get(`/api/request/${requestId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'addedBy',
          'miroslav.sirina@koala42.com',
        );

        //not found
        res = await request(server)
          .get('/api/request/notindb')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('GET /:id/request_loading', () => {
      it("should return one request's request loadings", async () => {
        let res = await request(server)
          .get(`/api/request/${requestId}/request_loading`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('request_id', requestId);
      });
    });

    describe('GET /:id/request_discharge', () => {
      it("should return one request's request discharges", async () => {
        let res = await request(server)
          .get(`/api/request/${requestId}/request_discharge`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('request_id', requestId);
      });
    });

    describe('POST /', () => {
      it('should POST and return posted variables', async () => {
        const postObject = {
          addedBy: 'miroslav.sirina@koala42.com',
          dispatchers: [5, 34, 90, 107, 137, 187, 151],
        };

        let res = await request(server)
          .post('/api/request')
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('request_id');

        //res = await request(server).post('/api/request').send(postObject);
        //expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/request_loading', () => {
      it("should post request's request loadings and return them", async () => {
        const postObject = [
          {
            city: '123',
          },
          {
            city: '123456',
          },
        ];

        let res = await request(server)
          .post(`/api/request/${requestId}/request_loading`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].city).toBe(postObject[0].city);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/request/100000000000/request_loading')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/request_discharge', () => {
      it("should post request's request discharges and return them", async () => {
        const postObject = [
          {
            city: '123',
          },
          {
            city: '123456',
          },
        ];

        let res = await request(server)
          .post(`/api/request/${requestId}/request_loading`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].city).toBe(postObject[0].city);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/request/100000000000/request_discharge')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('PUT /:id/request_loading', () => {
      it("should update request's request loadings and return success", async () => {
        const postObject = [
          {
            requestLoading_id: request_loadingId,
            city: '99',
          },
        ];

        let res = await request(server)
          .put(`/api/request/${requestId}/request_loading`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].city).toBe(postObject[0].city);
      });
    });

    describe('PUT /:id/request_discharge', () => {
      it("should update request's request discharges and return success", async () => {
        const postObject = [
          {
            requestDischarge_id: request_dischargeId,
            city: '1299',
          },
        ];

        let res = await request(server)
          .put(`/api/request/${requestId}/request_discharge`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].date).toBe(postObject[0].date);
      });
    });

    describe('PUT /:id', () => {
      it('should update request and return it', async () => {
        let res = await request(server)
          .put(`/api/request/${requestId}`)
          .send({
            addedBy: 'miroslav.sirina@koala42.com',
            editedBy: 'miroslav.sirina@koala42.com',
          })
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.addedBy).toBe('miroslav.sirina@koala42.com');

        res = await request(server)
          .put(`/api/request/invalidpostid`)
          .send({
            id: 'helpingout',
            en: 'I need help',
            cz: 'Potřebuju pomoc',
          })
          .set('x-auth-token', token);

        expect(res.status).toBe(400);
      });
    });

    describe('REMOVE /:id', () => {
      it('should delete the request and return it', async () => {
        let res = await request(server)
          .delete(`/api/request/${requestId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('request_id');

        res = await request(server)
          .delete(`/api/request/${requestId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });

    describe('GET /fulltext_search', () => {
      it('should search parameter and return result', async () => {
        let res = await request(server)
          .get(`/api/request/fulltext_search?parameter=x`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('request_id');
      });

      it('should search parameter (integer) and return result', async () => {
        let res = await request(server)
          .get(`/api/request/fulltext_search?parameter=15`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('request_id');
      });

      it('should search parameter and return result', async () => {
        let res = await request(server)
          .get(`/api/request/fulltext_search?parameter=koala&year=2017`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('request_id', requestId);
      });
    });
  });
});
