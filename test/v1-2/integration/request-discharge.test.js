const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'request_discharge';
let requestDischargeId;
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

  await pool.query(`TRUNCATE "requestdischarge" CASCADE;`);
});

describe('/api/carrier', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `INSERT INTO "requestdischarge" ("city") values ('miroslav.sirina@koala42.com') RETURNING "requestDischarge_id"`;
      try {
        res = await pool.query(query);
        requestDischargeId = res.rows[0].requestDischarge_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `DELETE FROM requestdischarge WHERE (("requestDischarge_id" = '${requestDischargeId}'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    describe('GET /', () => {
      it('should return all request discharges', async () => {
        let res = await request(server)
          .get('/api/request_discharge')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('requestDischarge_id');
      });
    });

    describe('GET /:id', () => {
      it('should return one request discharge', async () => {
        let res = await request(server)
          .get(`/api/request_discharge/${requestDischargeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('city', 'miroslav.sirina@koala42.com');

        //not found
        res = await request(server)
          .get('/api/request_discharge/notindb')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('POST /', () => {
      it('should POST and return posted variables', async () => {
        const postObject = {
          city: 'Morava',
        };

        let res = await request(server)
          .post('/api/request_discharge')
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('requestDischarge_id');
      });
    });

    describe('PUT /:id', () => {
      it('should update request discharge and return it', async () => {
        let res = await request(server)
          .put(`/api/request_discharge/${requestDischargeId}`)
          .send({
            city: 'miroslav.sirina@koala42.com',
            country: 'Modrava',
          })
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.country).toBe('Modrava');

        res = await request(server)
          .put(`/api/request_discharge/invalidpostid`)
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
      it('should delete requestDischarge and return it', async () => {
        let res = await request(server)
          .delete(`/api/request_discharge/${requestDischargeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('requestDischarge_id');

        res = await request(server)
          .delete(`/api/request_discharge/${requestDischargeId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });
  });
});
