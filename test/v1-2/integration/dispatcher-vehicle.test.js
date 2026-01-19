const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const { saveUser } = require('../../../v1-2/model/user-model');

const endpointName = 'dispatcher_vehicle';
let server,
  dispatcher,
  carrier,
  vehiclesPostData,
  token,
  vehiclesPutData,
  vehicles;

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

  carrier = await request(server)
    .post(`/api/carrier`)
    .send({
      ts_added: 1604317296594,
      addedBy: 'miroslav.sirina@koala42.com',
      company: 'kendama.cz',
      companyRegistrationNumber: 86916041,
      taxId: 'CZ801031411',
      place: {
        street: 'A. Randýskové 2410',
        city: 'Zlín',
        country: 'Česká republika',
        countryCode: 'CZ',
        postalCode: '76001',
        latitude: 49.2333333,
        longitude: 17.6666667,
      },
    })
    .set('x-auth-token', token);

  if (carrier.error) console.log(carrier.error);

  dispatcher = await request(server)
    .post(`/api/carrier/${carrier.body.carrier_id}/dispatcher`)
    .send([
      {
        firstName: 'Miroslav',
        lastName: 'Šiřina',
        email: 'mirek@kendama.cz',
        phone: '777932681',
        language_id: 41,
      },
    ])
    .set('x-auth-token', token);

  dispatcher.body.dispatcher_id = dispatcher.body[0].dispatcher_id;

  if (dispatcher.error) console.log(dispatcher.error);

  carrier = await request(server)
    .put(`/api/carrier/${carrier.body.carrier_id}`)
    .send({
      number: carrier.body.number,
      ts_added: 1604317296594,
      addedBy: 'miroslav.sirina@koala42.com',
      qid: carrier.body.number,
      company: 'kendama.cz',
      companyRegistrationNumber: 86916041,
      taxId: 'CZ801031411',
      place: {
        street: 'A. Randýskové 2410',
        city: 'Zlín',
        country: 'Česká republika',
        countryCode: 'CZ',
        postalCode: '76001',
        latitude: 49.2333333,
        longitude: 17.6666667,
      },
      carrier_id: carrier.body.carrier_id,
    })
    .set('x-auth-token', token);

  if (carrier.error) console.log(carrier.error);

  vehiclesPostData = {
    vehicles: [
      { vehicleType_id: 1, maxHeight: 10, maxLength: 15, maxWeight: 100 },
      { vehicleType_id: 4 },
      { vehicleType_id: 3, maxHeight: 12, maxLength: 20, maxWeight: 5000 },
    ],
    features: {
      newFeatures: [
        {
          vehicleFeature_id: 2,
          deleted: false,
          vehicleType_id: 1,
          dispatcher: {
            firstName: 'Miroslav',
            lastName: 'Šiřina',
            email: 'mirek@kendama.cz',
            phone: '777932681',
            language_id: 41,
          },
        },
        {
          vehicleFeature_id: 3,
          deleted: false,
          vehicleType_id: 1,
          dispatcher: {
            firstName: 'Miroslav',
            lastName: 'Šiřina',
            email: 'mirek@kendama.cz',
            phone: '777932681',
            language_id: 41,
          },
        },
        {
          vehicleFeature_id: 4,
          deleted: false,
          vehicleType_id: 4,
          dispatcher: {
            firstName: 'Miroslav',
            lastName: 'Šiřina',
            email: 'mirek@kendama.cz',
            phone: '777932681',
            language_id: 41,
          },
        },
        {
          vehicleFeature_id: 12,
          deleted: false,
          vehicleType_id: 4,
          dispatcher: {
            firstName: 'Miroslav',
            lastName: 'Šiřina',
            email: 'mirek@kendama.cz',
            phone: '777932681',
            language_id: 41,
          },
        },
        { vehicleFeature_id: 2, deleted: false, vehicleType_id: 3 },
        { vehicleFeature_id: 3, deleted: false, vehicleType_id: 3 },
      ],
      existingFeatures: [],
    },
    all: [
      {
        dispatcher: {
          firstName: 'Miroslav',
          lastName: 'Šiřina',
          email: 'mirek@kendama.cz',
          phone: '777932681',
          language_id: 41,
        },
        vehicleType_id: 1,
        vehicleFeature_ids: [{ feature_id: 2 }, { feature_id: 3 }],
        maxHeight: 10,
        maxLength: 15,
        maxWeight: 100,
        carrier_id: carrier.body.carrier_id,
        dispatcher_id: dispatcher.body.dispatcher_id,
      },
      {
        dispatcher: {
          firstName: 'Miroslav',
          lastName: 'Šiřina',
          email: 'mirek@kendama.cz',
          phone: '777932681',
          language_id: 41,
        },
        vehicleType_id: 4,
        vehicleFeature_ids: [{ feature_id: 4 }, { feature_id: 12 }],
        carrier_id: carrier.body.carrier_id,
        dispatcher_id: dispatcher.body.dispatcher_id,
      },
      {
        vehicleType_id: 3,
        vehicleFeature_ids: [{ feature_id: 2 }, { feature_id: 3 }],
        maxHeight: 12,
        maxLength: 20,
        maxWeight: 5000,
        carrier_id: carrier.body.carrier_id,
      },
    ],
  };

  vehicles = await request(server)
    .post(`/api/dispatcher_vehicle/vehicles`)
    .send(vehiclesPostData)
    .set('x-auth-token', token);
  if (vehicles.error) console.log(vehicles.error);

  vehiclesPutData = {
    vehicles: [
      {
        vehicleType_id: 1,
        maxHeight: 11,
        maxLength: 13,
        maxWeight: 90,
        dispatcherVehicle_id: null,
      },
    ],
    features: {
      newFeatures: [
        {
          vehicleFeature_id: 5,
          deleted: false,
          vehicleType_id: 1,
          dispatcher: {
            firstName: 'Miroslav',
            lastName: 'Šiřina',
            email: 'mirek@kendama.cz',
            phone: '777932681',
            language_id: 41,
          },
        },
        {
          vehicleFeature_id: 4,
          deleted: false,
          vehicleType_id: 1,
          dispatcher: {
            firstName: 'Miroslav',
            lastName: 'Šiřina',
            email: 'mirek@kendama.cz',
            phone: '777932681',
            language_id: 41,
          },
          dispatcherVehicle_id: vehicles.body[0].dispatcherVehicle_id,
        },
      ],
      existingFeatures: [],
    },
    all: [
      {
        dispatcher: {
          firstName: 'Miroslav',
          lastName: 'Šiřina',
          email: 'mirek@kendama.cz',
          phone: '777932681',
          language_id: 41,
        },
        vehicleType_id: 1,
        vehicleFeature_ids: [{ feature_id: 5 }],
        maxHeight: 10,
        maxLength: 15,
        maxWeight: 100,
        carrier_id: carrier.body.carrier_id,
        dispatcher_id: dispatcher.body.dispatcher_id,
        dispatcherVehicle_id: vehicles.body[0].dispatcherVehicle_id,
      },
    ],
  };
});

afterAll(async () => {
  let query = `SELECT "dispatcherVehicle_id" FROM "dispatchervehicle" WHERE "carrier_id" = '${carrier.body.carrier_id}'`;
  let { rows } = await pool.query(query);

  for await (const vehicle of rows) {
    const query = `DELETE FROM "dispatchervehiclefeature" WHERE "dispatcherVehicleFeature_id" = '${vehicle.dispatcherVehicle_id}'`;
    await pool.query(query);
  }
  await pool.query(`DELETE FROM "dispatchervehicle" WHERE "carrier_id" = '${carrier.body.carrier_id}';
  DELETE FROM "dispatcher" WHERE "dispatcher_id" = '${dispatcher.body.dispatcher_id}';
  DELETE FROM "carrier" WHERE "carrier_id" = '${carrier.body.carrier_id}';`);
});

describe(`/api/${endpointName}`, () => {
  describe('GET /', () => {
    it('should return all types of dispatcher vehicles without auth', async () => {
      let res = await request(server).get(`/api/dispatcher_vehicle/type`);

      if (res.error) console.warn(res.error);

      expect(res.status).toBe(200);
    });
  });
  describe('POST /', () => {
    describe('WITH AUTH', () => {
      it('should post dispatcher vehicle', async () => {
        res = await request(server)
          .post(`/api/dispatcher_vehicle/vehicles`)
          .send(vehiclesPostData)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        expect(res.body[0]).toHaveProperty('dispatcherVehicle_id');
        expect(res.body[0].vehicleFeatures.length).toBe(2);
        expect(res.body[1].vehicleFeatures.length).toBe(2);
        expect(res.body[2].vehicleFeatures.length).toBe(2);
      });
    });
    describe('WITHOUT AUTH (PUBLIC)', () => {
      it('should post dispatcher vehicle', async () => {
        // vehiclesPostData.all[2].dispatcher_id = null;
        // add dispatcher_id to vehiclesPostData.all[2]
        const copiedVehiclePostData = { ...vehiclesPostData };
        copiedVehiclePostData.all[2].dispatcher_id =
          dispatcher.body.dispatcher_id;

        // with token in path
        res = await request(server)
          .post(
            `/api/dispatcher_vehicle/vehicles/public/${dispatcher.body[0].token}`,
          )
          .send(copiedVehiclePostData);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        expect(res.body[2].maxWeight).toBe('5000');

        // with token in body
        copiedVehiclePostData.token = dispatcher.body[0].token;
        res = await request(server)
          .post(`/api/dispatcher_vehicle/vehicles/public`)
          .send(copiedVehiclePostData);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        expect(res.body[2].maxWeight).toBe('5000');
      });
    });
  });
  describe('PUT /', () => {
    describe('WITH AUTH', () => {
      it('should update dispatcher vehicle', async () => {
        res = await request(server)
          .put(`/api/dispatcher_vehicle/vehicles`)
          .send(vehiclesPutData)
          .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].dispatcherVehicle_id).toBe(
          vehicles.body[0].dispatcherVehicle_id,
        );
        expect(res.body[0].dispatcher_id).toBe(dispatcher.body.dispatcher_id);
        expect(res.body[0].vehicleFeatures.length).toBe(1);
        expect(res.body[0].vehicleFeatures[0].vehicleFeature_id).toBe(4);
      });
    });
    describe('WITHOUT AUTH (PUBLIC)', () => {
      it('should update dispatcher vehicle', async () => {
        const copiedVehiclePutData = { ...vehiclesPutData };

        // with token in path
        res = await request(server)
          .put(
            `/api/dispatcher_vehicle/vehicles/public/${dispatcher.body[0].token}`,
          )
          .send(copiedVehiclePutData);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].dispatcherVehicle_id).toBe(
          vehicles.body[0].dispatcherVehicle_id,
        );
        expect(res.body[0].dispatcher_id).toBe(dispatcher.body.dispatcher_id);
        expect(res.body[0].vehicleFeatures.length).toBe(1);
        expect(res.body[0].vehicleFeatures[0].vehicleFeature_id).toBe(4);

        // with token in body
        copiedVehiclePutData.token = dispatcher.body[0].token;
        res = await request(server)
          .put(`/api/dispatcher_vehicle/vehicles/public`)
          .send(copiedVehiclePutData);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].dispatcherVehicle_id).toBe(
          vehicles.body[0].dispatcherVehicle_id,
        );
        expect(res.body[0].dispatcher_id).toBe(dispatcher.body.dispatcher_id);
        expect(res.body[0].vehicleFeatures.length).toBe(1);
        expect(res.body[0].vehicleFeatures[0].vehicleFeature_id).toBe(4);
      });
    });
  });
});
