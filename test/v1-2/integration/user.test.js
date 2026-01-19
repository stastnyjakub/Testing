const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'user';
let server;
let userId;
let token;

let adminUserId;

beforeAll(async () => {
  server = require('../../../v1-2/app');

  const userdata = {
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

  user = await saveUser(userdata);
  adminUserId = user.user_id;

  let res = await request(server).post(`/api/login/`).send({
    email: 'miroslav.sirina@koala42.com',
    password: 'lezlevel',
  });
  token = res.body.authToken;
});

afterAll(async () => {
  query = `DELETE FROM "users" WHERE "user_id" = '${adminUserId}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
});

describe('/api/user', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `INSERT INTO "users" ("number", "email", "name", "surname", "emailPassword", "password", "jobTitle","mobilePhone","username") values ('13', 'miroslav.sirina@koala42.com', 'Marek', 'Řebíček','1234', '1234', 'tester','1','tester.testet') RETURNING "user_id"`;

      try {
        res = await pool.query(query);
        userId = res.rows[0].user_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `DELETE FROM "users" WHERE (("email" = 'miroslav.sirina@koala42.com'))`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    describe('GET /', () => {
      it('should return all Users', async () => {
        let res = await request(server)
          .get('/api/user')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('user_id');
      });
    });

    describe('GET /:id', () => {
      it('should return one user', async () => {
        let res = await request(server)
          .get(`/api/user/${userId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('email', 'miroslav.sirina@koala42.com');

        //not found
        res = await request(server)
          .get('/api/user/notindb')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('GET /:id', () => {
      it('wrong JWT should not pass', async () => {
        let res = await request(server)
          .get(`/api/user/5`)
          .set(
            'x-auth-token',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJlbWFpbCI6ImppbmRyYS5tYWNoYW5AcWFwbGluZS5jb20iLCJtb2JpbGVQaG9uZSI6Iis0MjA3NzQwMDk5MzMiLCJuYW1lIjoiSmluZMWZaWNoIiwic3VybmFtZSI6Ik1hY2hhbiBqci4iLCJpYXQiOjE1OTg1MDI4NTUsImV4cCI6MTU5OTcxMjQ1NX0.VBTC8LfkDaeohNKFFVlySGbYD-91t8oNXnXaBHcsolc',
          );

        expect(res.body.message).toBe('Špatný autorizační token.');

        expect(res.status).toBe(401);

        res = await request(server).get(`/api/user/5`).set('x-auth-token', '');

        expect(res.body.message).toBe('Špatný autorizační token.');

        expect(res.status).toBe(401);
      });
    });

    describe('POST /', () => {
      it('should return unauthorized with message', async () => {
        let res = await request(server).post(`/api/login/`).send({
          email: 'miroslav.sirina@koala42.com',
          password: '',
        });

        expect(res.body.message).toBe('Špatné jméno nebo heslo.');

        expect(res.status).toBe(401);
      });
    });

    describe('PUT /:id/user', () => {
      it('should update user and return it', async () => {
        const postObject = {
          number: 123,
          email: 'miroslav.sirina@koala42.com',
          jobTitle: 'Zlín',
          mobilePhone: 'Lubomír Šilhavík',
          name: 'tester',
          surname: 'testova4',
          username: 'testova.cz',
          password: '123456',
        };

        let res = await request(server)
          .put(`/api/user/${userId}`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(postObject.email);

        let query = {
          text: 'SELECT password from "users" where user_id=$1',
          values: [res.body.user_id],
        };

        const pgres = await pool.query(query);
        expect(pgres.rows[0].password.length).toBeGreaterThanOrEqual(7);
      });
    });

    describe('REMOVE /:id', () => {
      it('should delete the user and return it', async () => {
        let res = await request(server)
          .delete(`/api/user/${userId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('user_id');

        res = await request(server)
          .delete(`/api/user/${userId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });
  });
});
