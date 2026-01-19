const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'customer';
let server;
let customerId;
let customerContactId;
let loadingId;
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

describe('/api/customer', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `INSERT INTO "customer" ("addedBy", "city", "company", "companyRegistrationNumber", "country", "countryCode", "editedBy", "note", "email", "firstName", "lastName", "phone", "place", "postalCode", "qid", "number", "street", "taxId", "ts_edited", "ts_added") values ('miroslav.sirina@koala42.com', 'Rožnov pod Radhoštěm', 'RETIGO s.r.o.', '60794062', 'Česká republika', 'CZ', 'molcikf@gmail.com', NULL, 'info@retigo.cz', NULL, NULL, '571 665 511', '{"city": "Rožnov pod Radhoštěm", "street": "Láň 2340", "country": "Česká republika", "postalCode": "756 64", "countryCode": "CZ"}', '756 64', '8', '8', 'Láň 2340', 'CZ60794062', NULL, NULL) RETURNING customer_id`;

      try {
        for await (let num of new Array(50).fill(0)) {
          res = await pool.query(query);
          customerId = res.rows[0].customer_id;
        }

        //customerId = res.rows[0].customer_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "customercontact" ("customer_id", "email", "firstName", "lastName", "phone") values (${customerId}, 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček', '603 574 374') RETURNING "customerContact_id"`;

      try {
        res = await pool.query(query);
        customerContactId = res.rows[0].customerContact_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "loading" ("customer_id", "email", "firstName", "lastName", "phone") values (${customerId}, 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček', '603 574 374') RETURNING "loading_id"`;

      try {
        res = await pool.query(query);
        loadingId = res.rows[0].loading_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "discharge" ("customer_id", "email", "firstName", "lastName", "phone") values (${customerId}, 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček', '603 574 374') RETURNING "discharge_id"`;

      try {
        res = await pool.query(query);
        dischargeId = res.rows[0].discharge_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      let query = `DELETE FROM "discharge" WHERE (("email" = 'miroslav.sirina@koala42.com'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `DELETE FROM "loading" WHERE (("email" = 'miroslav.sirina@koala42.com'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `DELETE FROM "customercontact" WHERE (("email" = 'miroslav.sirina@koala42.com'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `TRUNCATE "customer" CASCADE; SELECT setval('customer_customer_id_seq', 1, true)`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    describe('GET /', () => {
      it('should return all customers', async () => {
        let res = await request(server)
          .get(
            '/api/customer?ordering=desc&limit=20&after=50&order_by=customer_id',
          )
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('customer_id');
        expect(parseInt(res.body.next_cursor)).toBeGreaterThanOrEqual(0);
        expect(res.body.data.length).toBe(20);

        res = await request(server)
          .get('/api/customer')
          .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('customer_id');
      });

      it('Customers filter', async () => {
        let res = await request(server)
          .get('/api/customer?company=ret')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('company');
      });
    });

    describe('GET /:id', () => {
      it('should return one customer', async () => {
        let res = await request(server)
          .get(`/api/customer/${customerId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'addedBy',
          'miroslav.sirina@koala42.com',
        );

        //not found
        res = await request(server)
          .get('/api/customer/notindb')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('GET /:id/customercontact', () => {
      it("should return one customer's contacts", async () => {
        let res = await request(server)
          .get(`/api/customer/${customerId}/customer_contact`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('customer_id', customerId);
      });
    });

    describe('GET /:id/loading', () => {
      it("should return one customer's loading", async () => {
        let res = await request(server)
          //.get(`/api/customer/${customerId}/loading?ordering=desc&order_by=city`)
          .get(`/api/customer/${customerId}/loading`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('customer_id', customerId);
      });
    });

    describe('GET /:id/discharge', () => {
      it("should return one customer's discharge", async () => {
        let res = await request(server)
          //.get(`/api/customer/${customerId}/discharge?ordering=desc&order_by=city`)
          .get(`/api/customer/${customerId}/discharge`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('customer_id', customerId);
      });
    });

    describe('PUT /:id/customer_contact', () => {
      it("should update customer's contact and return it", async () => {
        const postObject = [
          {
            customerContact_id: customerContactId,
            email: 'info@autodoprava-horak.eu',
            firstName: 'Martin',
            lastName: 'Hořák hooko',
            phone: '604 238 973',
          },
        ];

        let res = await request(server)
          .put(`/api/customer/${customerId}/customer_contact`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].firstName).toBe(postObject[0].firstName);
      });
    });

    describe('PUT /:id/loading', () => {
      it("should update customer's loading and return it", async () => {
        const postObject = [
          {
            loading_id: loadingId,
            email: 'info@autodoprava-horak.eu',
            firstName: 'Martin',
            lastName: 'Hořák hooko',
            phone: '604 238 973',
          },
        ];

        let res = await request(server)
          .put(`/api/customer/${customerId}/loading`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].firstName).toBe(postObject[0].firstName);
      });
    });

    describe('PUT /:id/discharge', () => {
      it("should update customer's discharge and return it", async () => {
        const postObject = [
          {
            discharge_id: dischargeId,
            email: 'info@autodoprava-horak.eu',
            firstName: 'Martin',
            lastName: 'Hořák hooko',
            phone: '604 238 973',
          },
        ];

        let res = await request(server)
          .put(`/api/customer/${customerId}/discharge`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].firstName).toBe(postObject[0].firstName);
      });
    });

    describe('POST /', () => {
      it('should POST and return posted variables', async () => {
        const postObject = {
          addedBy: 'miroslav.sirina@koala42.com',
          city: 'Zlín',
          company: 'Lubomír Šilhavík',
          companyRegistrationNumber: 13659961,
          country: 'Česká da republika',
          countryCode: 'CZ',
          editedBy: 'molcikf@gmail.com',
          email: 'simev@email.cz',
          number: 5,
          postalCode: `'; DROP TABLE carrier;`,
          qid: '0005',
          street: 'Na Drahách 315',
          taxId: 'CZ440101526',
        };

        let res = await request(server)
          .post('/api/customer')
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('customer_id');

        //res = await request(server).post('/api/carrier').send(postObject);
        //expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/customer_contact', () => {
      it("should post customer's contacts and return them", async () => {
        const postObject = [
          {
            email: 'info@autodoprava-horak.eu',
            firstName: 'Martin ',
            lastName: 'Hořák',
            phone: '604 238 973',
          },
          {
            email: 'info@autodoprava-horak.eu',
            lastName: 'Prajka',
            phone: '739 654 616',
          },
        ];

        let res = await request(server)
          .post(`/api/customer/${customerId}/customer_contact`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].firstName).toBe(postObject[0].firstName);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/customer/100000000000/customer_contact')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/loading', () => {
      it("should post customer's loadings and return them", async () => {
        const postObject = [
          {
            email: 'info@autodoprava-horak.eu',
            firstName: 'Martin ',
            lastName: 'Hořák',
            phone: '604 238 973',
          },
          {
            email: 'info@autodoprava-horak.eu',
            lastName: 'Prajka',
            phone: '739 654 616',
          },
        ];

        let res = await request(server)
          .post(`/api/customer/${customerId}/loading`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].firstName).toBe(postObject[0].firstName);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/customer/100000000000/loading')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/discharge', () => {
      it("should post customer's discharges and return them", async () => {
        const postObject = [
          {
            email: 'info@autodoprava-horak.eu',
            firstName: 'Martin ',
            lastName: 'Hořák',
            phone: '604 238 973',
          },
          {
            email: 'info@autodoprava-horak.eu',
            lastName: 'Prajka',
            phone: '739 654 616',
          },
        ];

        let res = await request(server)
          .post(`/api/customer/${customerId}/discharge`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].firstName).toBe(postObject[0].firstName);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/customer/100000000000/discharge')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('PUT /:id', () => {
      it('should update customer and return it', async () => {
        let res = await request(server)
          .put(`/api/customer/${customerId}`)
          .send({
            addedBy: 'miroslav.sirina@koala42.com',
            city: 'Zlinecek',
            company: 'Koala',
            companyRegistrationNumber: '15651651',
            country: 'DE',
            countryCode: 'DE',
            postalCode: '76005',
            street: 'NAd ovcirnou',
            taxId: '156120322',
          })
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.city).toBe('Zlinecek');

        res = await request(server)
          .put(`/api/customer/invalidpostid`)
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
      it('should delete the customer and return it', async () => {
        let res = await request(server)
          .delete(`/api/customer/${customerId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('customer_id');

        res = await request(server)
          .delete(`/api/customer/${customerId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });

    describe('GET /fulltext_search', () => {
      it('should search parameter and return result', async () => {
        let res = await request(server)
          .get(`/api/customer/fulltext_search?parameter=re`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('customer_id');
      });

      it('should search parameter (integer) and return result', async () => {
        let res = await request(server)
          .get(`/api/customer/fulltext_search?parameter=2340`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('customer_id');
      });
    });
  });
});
