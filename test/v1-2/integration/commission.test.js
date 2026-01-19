const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');
const { commissionGetNumber } = require('../../../v1-2/model/commission-model');

const endpointName = 'commission';
let server;
let commissionId;
let commission_loadingId;
let commission_dischargeId;
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
  query = `DELETE FROM "commission" WHERE (("addedBy" = 'miroslav.sirina@koala42.com'))`;

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

describe('/api/commission', () => {
  describe(`/api/${endpointName}`, () => {
    beforeEach(async () => {
      let query = `TRUNCATE "loading" CASCADE;
      INSERT INTO "carrier" ("carrier_id", "company") values (7, 'Test company');
      INSERT INTO "customer" ("customer_id", "company") values (18, 'Test company');
      INSERT INTO "customercontact" ("customerContact_id") values (40);
      INSERT INTO "dispatcher" ("dispatcher_id", "carrier_id") values (10,7);
      INSERT INTO "loading" ("loading_id", "city","customer_id") values (1, 'Refeld', 18);`;

      try {
        await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO commission ("addedBy","carrierOrderCreatedBy","carrierOrderSent","carrierRegistrationPlate","currencyCarrier","currencyCustomer","dischargeConfirmationSent","editedBy","enteredCarrierBy","enteredCarrierByNumber","loadingConfirmationSent","number","orderConfirmationSent","priceCarrier","priceCustomer","qid","relation","state","tsAdded","tsCarrierOrderCreatedBy","tsEdited","tsEnteredCarrier","week","year","carriersTable","dispatchersTable","customer_id","carrier_id","customerContact_id","dispatcher_id") values ('jindra.machan@qapline.koala','jindra.machan@qapline.com','true','Doplnit','CZK','CZK','true','jindra.machan@qapline.com','Jindřich Machan jr.','1','true','114','true','3000','3500','CZDE-4401141-2017','CZDE','1','1509094307576','1509094476905','1509095658462','1509094389494','44','2017','{}','{}',18,7,40,10) RETURNING "commission_id"`;

      try {
        for await (let num of new Array(50).fill(0)) {
          res = await pool.query(query);
        }
        commissionId = res.rows[0].commission_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "commissionloading" ("commission_id", "date", "dateTo", "deleted", "note", "number", "loading_id", "refNumber", "time", "year")
      VALUES (${commissionId}, '121654674', '213213321', '0', 'asdasd asd asd adas dasd ', '1234', 1, '1234564', '1', NULL) RETURNING "commissionLoading_id";`;

      try {
        res = await pool.query(query);
        commission_loadingId = res.rows[0].commissionLoading_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "commissiondischarge" ("commission_id", "date", "dateTo", "deleted", "note", "number", "refNumber", "time", "year")
      VALUES (${commissionId}, '121654674', '213213321', '0', 'asdasd asd asd adas dasd ', '1234', '1234564', NULL, NULL) RETURNING "commissionDischarge_id"`;

      try {
        res = await pool.query(query);
        commission_dischargeId = res.rows[0].commissionDischarge_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }

      query = `INSERT INTO "commissionitem" ("commission_id", "name", "price")
      VALUES (${commissionId}, 'Hrom do police', '213213321') RETURNING "commissionItem_id"`;

      try {
        res = await pool.query(query);
        commission_itemId = res.rows[0].commissionItem_id;
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    afterEach(async () => {
      query = `TRUNCATE "carrier" CASCADE; SELECT setval('carrier_carrier_id_seq', 1, true);
      TRUNCATE "customer" CASCADE;
      TRUNCATE "commissionloading" CASCADE;
      TRUNCATE "commissiondischarge" CASCADE;
      TRUNCATE "commissionitem" CASCADE;
      TRUNCATE "loading" CASCADE;
      TRUNCATE "commission" CASCADE;  SELECT setval('commission_commission_id_seq', 1, true);`;

      try {
        res = await pool.query(query);
      } catch (error) {
        console.warn('Error executing query', query, error.stack);
      }
    });

    describe('GET /', () => {
      it('should return all commissions', async () => {
        let res = await request(server)
          .get('/api/commission?ordering=desc&limit=20&after=50&order_by=week')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id');
        expect(res.body.data[0]).not.toHaveProperty('carType');
        expect(res.body.data[0]).not.toHaveProperty('loadingTypes');
        expect(res.body.data[0]).toHaveProperty('total_loading_meters');
        expect(res.body.data[0]).toHaveProperty('invNumber');
        expect(parseInt(res.body.next_cursor)).toBeGreaterThanOrEqual(0);
        expect(res.body.data.length).toBe(20);

        //console.log(res.body);

        res = await request(server)
          .get('/api/commission')
          .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id');
      });

      it('should return all commissions without filter', async () => {
        let res = await request(server)
          .get('/api/commission')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id');
        expect(res.body.data[0]).toHaveProperty('total_loading_meters');
        expect(res.body.data[0]).not.toHaveProperty('carType');
        expect(res.body.data[0]).not.toHaveProperty('loadingTypes');
        expect(res.body.data.length).toBeGreaterThanOrEqual(20);

        res = await request(server)
          .get('/api/commission')
          .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id');
      });

      it('commissions filter', async () => {
        let res = await request(server)
          .get('/api/commission?loading_city=refeld')
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id');
      });
    });

    describe('GET /:id', () => {
      it('should return one commission', async () => {
        let res = await request(server)
          .get(`/api/commission/${commissionId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'addedBy',
          'jindra.machan@qapline.koala',
        );

        expect(res.body).toHaveProperty('invNumber');

        //not found
        res = await request(server)
          .get('/api/commission/notindb')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('GET /', () => {
      it('it should return the right provision', async () => {
        // fisrt update with decimals
        // check if ok
        // populate with nulls
        // check if ok
        let query = `UPDATE commission SET "priceCarrier" = '2500',  "priceCustomer" = '0.1' where commission_id = '${commissionId}'`;

        try {
          await pool.query(query);
        } catch (error) {
          console.warn('Error executing query', query, error.stack);
        }

        let res = await request(server)
          .get(`/api/commission`)
          .set('x-auth-token', token);

        //console.log(res.body.data);
        let commission = res.body.data.filter(
          (data) => data.commission_id == commissionId,
        );
        expect(commission[0].provision).toBe('-2499.9');

        query = `UPDATE commission SET "priceCarrier" = NULL,  "priceCustomer" = NULL where commission_id = '${commissionId}'`;

        try {
          await pool.query(query);
        } catch (error) {
          console.warn('Error executing query', query, error.stack);
        }

        res = await request(server)
          .get(`/api/commission`)
          .set('x-auth-token', token);

        commission = res.body.data.filter(
          (data) => data.commission_id == commissionId,
        );
        expect(commission[0].provision).toBe(null);

        // query = `UPDATE commission SET "priceCarrier" = NULL,  "priceCustomer" = NULL where commission_id = ${commissionId}"`;
        // await pool.query(query);
      });
    });

    describe('GET /:id/commission_loading', () => {
      it("should return one commission's commission loadings", async () => {
        let res = await request(server)
          .get(`/api/commission/${commissionId}/commission_loading`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id', commissionId);
      });
    });

    describe('GET /:id/commission_discharge', () => {
      it("should return one commission's commission discharges", async () => {
        let res = await request(server)
          .get(`/api/commission/${commissionId}/commission_discharge`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id', commissionId);
      });
    });

    describe('GET /:id/commission_item', () => {
      it("should return one commission's commission items", async () => {
        let res = await request(server)
          .get(`/api/commission/${commissionId}/commission_item`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.data[0]).toHaveProperty('commission_id', commissionId);
      });
    });

    describe('POST /', () => {
      it('should POST and return posted variables', async () => {
        const postObject = {
          addedBy: 'miroslav.sirina@koala42.com',
          carriersTable: [5, 34, 90, 107, 137, 187, 151],
        };

        let res = await request(server)
          .post('/api/commission')
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('commission_id');

        //res = await request(server).post('/api/commission').send(postObject);
        //expect(res.status).toBe(400);
      });
    });

    describe('POST /', () => {
      it('should POST empty and return', async () => {
        const postObject = {};

        let res = await request(server)
          .post('/api/commission')
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('commission_id');

        //res = await request(server).post('/api/commission').send(postObject);
        //expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/commission_loading', () => {
      it("should post commission's commission loadings and return them", async () => {
        const postObject = [
          {
            date: '123',
          },
          {
            date: '123456',
          },
        ];

        let res = await request(server)
          .post(`/api/commission/${commissionId}/commission_loading`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].date).toBe(postObject[0].date);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/commission/100000000000/commission_loading')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/commission_discharge', () => {
      it("should post commission's commission discharges and return them", async () => {
        const postObject = [
          {
            date: '123',
          },
          {
            date: '123456',
          },
        ];

        let res = await request(server)
          .post(`/api/commission/${commissionId}/commission_discharge`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].date).toBe(postObject[0].date);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/commission/100000000000/commission_discharge')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('POST /:id/commission_item', () => {
      it("should post commission's commission items and return them", async () => {
        const postObject = [
          {
            name: '123',
          },
          {
            name: '123456',
          },
        ];

        let res = await request(server)
          .post(`/api/commission/${commissionId}/commission_item`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.body[0].name).toBe(postObject[0].name);
        expect(res.status).toBe(200);

        //not found
        res = await request(server)
          .get('/api/commission/100000000000/commission_item')
          .set('x-auth-token', token);
        expect(res.status).toBe(400);
      });
    });

    describe('PUT /:id/commission_loading', () => {
      it("should update commission's commission loadings and return success", async () => {
        const postObject = [
          {
            commissionLoading_id: commission_loadingId,
            date: '99',
          },
        ];

        let res = await request(server)
          .put(`/api/commission/${commissionId}/commission_loading`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].date).toBe(postObject[0].date);
      });
    });

    describe('PUT /:id/commission_discharge', () => {
      it("should update commission's commission discharges and return success", async () => {
        const postObject = [
          {
            commissionDischarge_id: commission_dischargeId,
            date: '99',
          },
        ];

        let res = await request(server)
          .put(`/api/commission/${commissionId}/commission_discharge`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].date).toBe(postObject[0].date);
      });
    });

    describe('PUT /:id/commission_item', () => {
      it("should update commission's commission items and return success", async () => {
        const postObject = [
          {
            commissionItem_id: commission_itemId,
            name: '99',
          },
        ];

        let res = await request(server)
          .put(`/api/commission/${commissionId}/commission_item`)
          .send(postObject)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0].name).toBe(postObject[0].name);
      });
    });

    describe('PUT /:id', () => {
      it('should update commission and return it', async () => {
        let res = await request(server)
          .put(`/api/commission/${commissionId}`)
          .send({
            addedBy: 'miroslav.sirina@koala42.com',
            customer_id: null,
            carrier_id: null,
            customerContact_id: null,
            dispatcher_id: null,
          })
          .set('x-auth-token', token);

        expect(res.body).not.toHaveProperty('carType');
        expect(res.body).not.toHaveProperty('loadingTypes');
        expect(res.status).toBe(200);

        res = await request(server)
          .put(`/api/commission/invalidpostid`)
          .send({
            id: 'helpingout',
            en: 'I need help',
            cz: 'Potřebuju pomoc',
          })
          .set('x-auth-token', token);

        expect(res.status).toBe(400);
      });
    });

    describe('PUT commission number', () => {
      it('should return new commission number', async () => {
        let res = await request(server)
          .put(`/api/commission/${commissionId}`)
          .send({
            addedBy: 'miroslav.sirina@koala42.com',
            customer_id: null,
            carrier_id: null,
            customerContact_id: null,
            dispatcher_id: null,
            number: null,
          })
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.number).toBe(null);
        expect(res.body.carrier_id).toBe(null);

        res = await request(server)
          .put(`/api/commission/${commissionId}`)
          .send({
            addedBy: 'miroslav.sirina@koala42.com',
            customer_id: null,
            carrier_id: 7,
            customerContact_id: null,
            dispatcher_id: null,
            number: null,
          })
          .set('x-auth-token', token);

        const commissionNumber = await commissionGetNumber();

        expect(res.status).toBe(200);
        expect(res.body.number).toBe(commissionNumber);
        expect(res.body.carrier_id).toBe(7);

        res = await request(server)
          .put(`/api/commission/${commissionId}`)
          .send({
            addedBy: 'miroslav.sirina@koala42.com',
            customer_id: null,
            carrier_id: null,
            customerContact_id: null,
            dispatcher_id: null,
          })
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.number).toBe(commissionNumber);
        expect(res.body.carrier_id).toBe(null);
      });
    });

    describe('REMOVE /:id', () => {
      it('should delete the commission and return it', async () => {
        let res = await request(server)
          .delete(`/api/commission/${commissionId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('commission_id');
        //expect(res.body.data.length).toBeGreaterThanOrEqual(100);

        res = await request(server)
          .delete(`/api/commission/${commissionId}`)
          .set('x-auth-token', token);

        expect(res.status).toBe(404);
      });
    });

    describe('GET /fulltext_search', () => {
      it('should search parameter and return result', async () => {
        let res = await request(server)
          .get(`/api/commission/fulltext_search?parameter=jindra`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('commission_id');
      });

      it('should search parameter (integer) and return result', async () => {
        let res = await request(server)
          .get(`/api/commission/fulltext_search?parameter=14&year=2016`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('commission_id');
      });

      it('should search parameter and return result', async () => {
        let res = await request(server)
          .get(`/api/commission/fulltext_search?parameter=koala&year=2017`)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body[0]).toHaveProperty('commission_id', commissionId);
      });
    });
  });
});
