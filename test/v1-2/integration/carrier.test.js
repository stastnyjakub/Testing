const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'carrier';
let server;
let carrierId;
let dispatcherId;
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
  query = `DELETE FROM "users" WHERE "user_id" = '${userId}';
  TRUNCATE "carrier" CASCADE; SELECT setval('carrier_carrier_id_seq', 1, true);`;
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
        for await (let num of new Array(50).fill(0)) {
          res = await pool.query(query);
        }

        //res = await pool.query(query);
        carrierId = res.rows[0].carrier_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "dispatcher" ("email", "carrier_id","firstName") values ('miroslav.sirina@koala42.com', '${carrierId}', 'Mirek') RETURNING dispatcher_id`;
      try {
        res = await pool.query(query);
        dispatcherId = res.rows[0].dispatcher_id;
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

      query = `DELETE FROM "dispatcher" WHERE (("carrier_id" = '${carrierId}'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `TRUNCATE "carrier" CASCADE; SELECT setval('carrier_carrier_id_seq', 1, true);`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    describe('GET /', () => {
      it('should return all Carriers', async () => {
        let res = await request(server)
          .get(
            '/api/carrier?ordering=desc&limit=20&after=50&order_by=carrier_id',
          )
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('carrier_id');
        expect(parseInt(res.body.next_cursor)).toBeGreaterThanOrEqual(0);
        expect(res.body.data.length).toBe(20);

        res = await request(server)
          .get('/api/carrier')
          .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('carrier_id');
      });

      it('Carriers filter', async () => {
        let res = await request(server)
          .get('/api/carrier?street=prodlou')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('street', 'Prodloužená 217');
      });
    });

    describe('GET /:id', () => {
      it('should return one Carrier', async () => {
        let res = await request(server)
          .get(`/api/carrier/${carrierId}`)
          .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'addedBy',
          'miroslav.sirina@koala42.com',
        );

        //not found
        res = await request(server)
          .get('/api/carrier/notindb')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('GET /:id/dispatcher', () => {
      it("should return one Carrier's dispatchers", async () => {
        let res = await request(server)
          .get(`/api/carrier/${carrierId}/dispatcher`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('firstName', 'Mirek');
        expect(res.body[0]).toHaveProperty('token');
      });
    });

    describe('GET /:id/place', () => {
      it("should return one Carrier's places", async () => {
        let res = await request(server)
          .get(`/api/carrier/${carrierId}/place`)
          .set('x-auth-token', token);

        //console.warn(res.error);
        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('city', 'Lučenec');
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
          postalCode: `'; DROP TABLE customer;`,
          qid: '0005',
          street: 'Na Drahách 315',
          taxId: 'CZ440101526',
        };

        let res = await request(server)
          .post('/api/carrier')
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('carrier_id');

        //res = await request(server).post('/api/carrier').send(postObject);
        //expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/dispatcher', () => {
      it("should post carier's dispatchers and return success", async () => {
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
          .post(`/api/carrier/${carrierId}/dispatcher`)
          .send(postObject)
          .set('x-auth-token', token);

        //console.warn(res.body);
        expect(res.body[0].firstName).toBe(postObject[0].firstName);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/carrier/100000000000/dispatcher')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('PUT /:id/dispatcher', () => {
      it("should update carier's dispatchers and return success", async () => {
        const postObject = [
          {
            dispatcher_id: dispatcherId,
            email: 'info@autodoprava-horak.eu',
            firstName: 'Martin',
            lastName: 'Hořák hooko',
            phone: '604 238 973',
          },
        ];

        let res = await request(server)
          .put(`/api/carrier/${carrierId}/dispatcher`)
          .send(postObject)
          .set('x-auth-token', token);

        if (res.error) console.log(res.error);

        expect(res.status).toBe(200);
        expect(res.body[0].firstName).toBe(postObject[0].firstName);
      });
    });

    describe('POST /:id/place', () => {
      it("should post carier's places and return them", async () => {
        const postObject = [
          {
            city: 'Las Vegas',
          },
          {
            city: 'Santa Barbara',
          },
        ];

        let res = await request(server)
          .post(`/api/carrier/${carrierId}/place`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0]).not.toHaveProperty('carrier_id', null);
        expect(res.body[0].city).toBe(postObject[0].city);

        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/carrier/100000000000/place')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('PUT /:id/place', () => {
      it("should update carier's places and return them", async () => {
        const postObject = [
          {
            place_id: placeId,
            city: 'Krnom',
          },
        ];

        let res = await request(server)
          .put(`/api/carrier/${carrierId}/place`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('carrier_id');
        expect(res.body[0].city).toBe(postObject[0].city);
      });
    });

    describe('PUT /:id', () => {
      it('should update carrier and return it', async () => {
        let res = await request(server)
          .put(`/api/carrier/${carrierId}`)
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
          .put(`/api/carrier/invalidpostid`)
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
      it('should delete the carrier and return it', async () => {
        let res = await request(server)
          .delete(`/api/carrier/${carrierId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('carrier_id');

        res = await request(server)
          .delete(`/api/carrier/${carrierId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });

    describe('GET /fulltext_search', () => {
      it('should search parameter and return result', async () => {
        let res = await request(server)
          .get(`/api/carrier/fulltext_search?parameter=clav`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('carrier_id');
      });

      it('should search parameter (integer) and return result', async () => {
        let res = await request(server)
          .get(`/api/carrier/fulltext_search?parameter=217`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('carrier_id');
      });
    });
  });
});
