const request = require('supertest');
const pool = require('../../../v1-2/startup/db');
const server = require('../../../v1-2/app');
const {
  createMockUser,
  loginMockUser,
  deleteMockUser,
} = require('../utility/user');
const {
  createMockCustomer,
  deleteMockCustomer,
} = require('../utility/customer');
const { createMockCarrier, deleteMockCarrier } = require('../utility/carrier');
const {
  createMockDispatcher,
  deleteMockDispatcher,
} = require('../utility/dispatcher');
const {
  createMockCommission,
  deleteMockCommission,
} = require('../utility/commission');

let carrier,
  dispatcher,
  vehiclesPostData,
  place,
  customer,
  commission,
  commissionLoading,
  commissionDischarge;

// Hq in Zlín, loading in Holešov
let postData = {
  locations: {
    loading: {
      lat: 49.3370379,
      lon: 17.5437659,
      radius: 50,
    },
    discharge: {
      lat: 47.02087618,
      lon: 7.49988556,
      radius: 50,
    },
  },
  searchType: 'hq', // value nebo undefinied
  directions: true, // true false
  vehicleType: [1, 4, 5, 6, 4, 7], // array
  vehicleFeaturesMustHaveOne: [2], // array
  vehicleFeaturesMustHaveAll: [2, 3], // array
  minLength: '14', // undefinied nebo value
  minHeight: '9.9', // undefinied nebo value
  minWeight: '99.9', // undefinied nebo value
};

beforeAll(async () => {
  try {
  } catch (error) {}
  user = await createMockUser();
  userId = user.user_id;
  token = await loginMockUser();

  customer = await createMockCustomer({
    number: 0,
    ts_added: 1604481541011,
    addedBy: 'miroslav.sirina@koala42.com',
    company: 'Mockary',
    note: 'This is note',
    place: {
      city: 'East Perth',
      country: 'Austrálie',
      countryCode: 'AU',
      postalCode: '6004',
      latitude: -31.942624655341636,
      longitude: 115.87913984975154,
    },
  });

  carrier = await createMockCarrier({
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
  });

  dispatcher = await createMockDispatcher(carrier, [
    {
      firstName: 'Miroslav',
      lastName: 'Šiřina',
      email: 'mirek@kendama.cz',
      phone: '777932681',
      language_id: 41,
    },
  ]);

  dispatcher.dispatcher_id = dispatcher[0].dispatcher_id;

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
        carrier_id: carrier.carrier_id,
        dispatcher_id: dispatcher.dispatcher_id,
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
        carrier_id: carrier.carrier_id,
        dispatcher_id: dispatcher.dispatcher_id,
      },
      {
        vehicleType_id: 3,
        vehicleFeature_ids: [{ feature_id: 2 }, { feature_id: 3 }],
        maxHeight: 12,
        maxLength: 20,
        maxWeight: 5000,
        carrier_id: carrier.carrier_id,
      },
    ],
  };

  res = await request(server)
    .post(`/api/dispatcher_vehicle/vehicles`)
    .send(vehiclesPostData)
    .set('x-auth-token', token);

  if (res.error) console.log(res.error);

  place = await request(server)
    .post(`/api/carrier/${carrier.carrier_id}/place`)
    .send([
      {
        city: 'Zlín',
        country: 'Česká republika',
        countryCode: 'CZ',
        postalCode: '76001',
        latitude: 49.2333333,
        longitude: 17.6666667,
        dispatcher_id: dispatcher.dispatcher_id,
      },
      {
        city: 'Ica',
        country: 'Peru',
        countryCode: 'PE',
        postalCode: '11001',
        latitude: -14.067768,
        longitude: -75.728611,
        directions: [0],
        dispatcher_id: dispatcher.dispatcher_id,
      },
      {
        city: 'Catahuasi',
        country: 'Peru',
        countryCode: 'PE',
        postalCode: '15760',
        latitude: -12.7988889,
        longitude: -75.8919444,
        directions: [0, 1],
        dispatcher_id: dispatcher.dispatcher_id,
      },
      {
        city: 'Moravská Ostrava',
        country: 'Česká republika',
        countryCode: 'CZ',
        postalCode: '702 00',
        latitude: 49.8333333,
        longitude: 18.2833333,
        dispatcher_id: dispatcher.dispatcher_id,
      },
      {
        city: 'Baku',
        postalCode: '752019',
        latitude: 20.81272265,
        longitude: 85.439916,
        dispatcher_id: dispatcher.dispatcher_id,
      },
    ])
    .set('x-auth-token', token);

  if (place.error) console.log(place.error);

  loading = await request(server)
    .post(`/api/customer/${customer.customer_id}/loading`)
    .send([
      {
        company: 'Ica',
        firstName: 'Name',
        lastName: 'Surname',
        city: 'Ica',
        country: 'Peru',
        countryCode: 'PE',
        postalCode: '11001',
        latitude: -14.067768,
        longitude: -75.728611,
      },
    ])
    .set('x-auth-token', token);

  if (loading.error) console.log(loading.error);

  discharge = await request(server)
    .post(`/api/customer/${customer.customer_id}/discharge`)
    .send([
      {
        company: 'Moravská ostrava',
        firstName: 'Name',
        lastName: 'Surname',
        phone: '',
        city: 'Moravská Ostrava',
        country: 'Česká republika',
        countryCode: 'CZ',
        postalCode: '702 00',
        latitude: 49.8333333,
        longitude: 18.2833333,
      },
    ])
    .set('x-auth-token', token);

  if (discharge.error) console.log(discharge.error);

  commission = await createMockCommission(customer, carrier, dispatcher, {
    qid: 'PECZ-4513-20',
    state: 1,
    relation: 'PECZ',
    customerContact_id: null,
    tsAdded: 1604483386562,
    addedBy: 'miroslav.sirina@koala42.com',
    tsEdited: 1604483386562,
    editedBy: 'miroslav.sirina@koala42.com',
    tsEnteredCarrier: 1604483365414,
    enteredCarrierByNumber: 13,
    enteredCarrierBy: 'Miroslav Šiřina',
    week: 45,
    year: 2020,
    carrierOrderSent: true,
    loadingConfirmationSent: true,
    dischargeConfirmationSent: true,
    orderConfirmationSent: true,
    carriersTable: [],
    loadingRadius: 50,
    dischargeRadius: 50,
    vat: 1,
    currencyCarrier: 'CZK',
    priceCustomer: 1000,
    currencyCustomer: 'CZK',
    notification: false,
  });

  commissionLoading = await request(server)
    .post(`/api/commission/${commission.commission_id}/commission_loading`)
    .send([
      {
        number: 1,
        year: 2020,
        loading_id: loading.body[0].loading_id,
        date: 1604444400000,
        dateTo: 1604444400000,
        time: '6:30-14:30',
        refNumber: '123',
      },
    ])
    .set('x-auth-token', token);

  if (commissionLoading.error) console.log(commissionLoading.error);

  commissionDischarge = await request(server)
    .post(`/api/commission/${commission.commission_id}/commission_discharge`)
    .send([
      {
        number: 1,
        year: 2020,
        discharge_id: discharge.body[0].discharge_id,
        date: 1604444400000,
        dateTo: 1604444400000,
        time: '6:30-14:30',
      },
    ])
    .set('x-auth-token', token);

  if (commissionDischarge.error) console.log(commissionDischarge.error);
}, 30000);

afterAll(async () => {
  for await (const plc of place.body) {
    const query = `DELETE FROM "place" WHERE "place_id" = '${plc.place_id}'`;
    await pool.query(query);
  }

  let query = `SELECT "dispatcherVehicle_id" FROM "dispatchervehicle" WHERE "carrier_id" = '${carrier.carrier_id}'`;
  let { rows } = await pool.query(query);

  for await (const vehicle of rows) {
    const query = `DELETE FROM "dispatchervehiclefeature" WHERE "dispatcherVehicleFeature_id" = '${vehicle.dispatcherVehicle_id}'`;
    await pool.query(query);
  }

  await pool.query(`DELETE FROM "commissionloading" WHERE "commissionLoading_id" = '${commissionLoading.body[0].commissionLoading_id}';
  DELETE FROM "commissiondischarge" WHERE "commissionDischarge_id" = '${commissionDischarge.body[0].commissionDischarge_id}';
  DELETE FROM "commission" WHERE "commission_id" = '${commission.commission_id}'`);

  await pool.query(`DELETE FROM "loading" WHERE "loading_id" = '${loading.body[0].loading_id}';
  DELETE FROM "discharge" WHERE "discharge_id" = '${discharge.body[0].discharge_id}'`);

  await pool.query(
    `DELETE FROM "dispatchervehicle" WHERE "carrier_id" = '${carrier.carrier_id}';`,
  );

  await deleteMockCommission(commission);
  await deleteMockDispatcher(dispatcher);
  await deleteMockCarrier(carrier);
  await deleteMockCustomer(customer);
  await deleteMockUser(user);
}, 30000);

describe('/api/commission/dispatcher_search', () => {
  describe(`Carier has hq in loading or discharge location`, () => {
    it('Carrier that has the HQ near', async () => {
      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send({
          locations: {
            loading: { lat: '-14.06776800', lon: '-75.72861100', radius: 500 },
            discharge: { lat: '49.23333330', lon: '17.66666670', radius: 500 },
          },
          searchType: 'hq',
          directions: false,
          vehicleType: [],
          vehicleFeaturesMustHaveOne: [],
          vehicleFeaturesMustHaveAll: [],
        })
        .set('x-auth-token', token);

      if (res.error) console.log(res.error);

      expect(res.status).toBe(200);
    });

    it('Carrier that has the HQ near loading', async () => {
      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.locations.discharge = {
        lat: 0,
        lon: 0,
        radius: 50,
      };

      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty('languageCode');
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );
    });

    it('Carrier that has the HQ near discharge', async () => {
      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.locations.discharge = requestData.locations.loading;
      requestData.locations.discharge = {
        lat: 0,
        lon: 0,
        radius: 50,
      };

      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty('languageCode');
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );
    });

    it('Carrier with HQ near with the proper car type', async () => {
      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(postData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty('languageCode');
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );

      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.vehicleType = [36];

      res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('Carrier with HQ near with the proper car type and features', async () => {
      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(postData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty('languageCode');
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );

      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.vehicleFeaturesMustHaveOne = [];
      requestData.vehicleFeaturesMustHaveAll = [];

      res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );

      requestData = JSON.parse(JSON.stringify(postData));
      requestData.vehicleFeaturesMustHaveOne = [2];
      requestData.vehicleFeaturesMustHaveAll = [11];

      res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('Carrier with HQ near with the proper car type and features and minimums', async () => {
      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.minWeight = undefined;
      requestData.minHeight = undefined;
      requestData.minLength = undefined;

      res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);

      requestData = { ...postData };
      requestData.minWeight = 101;

      res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);

      requestData.minLength = '13';
      requestData.minHeight = '9.8';
      requestData.minWeight = '99.8';

      res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe(`Previous commission exist on same route`, () => {
    it('Dispatcher with commission in coordinants', async () => {
      // loading Zlín, discharge near Ica
      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.directions = false;
      requestData.searchType = 'commission';
      requestData.locations.discharge = {
        lat: -14.057768,
        lon: -75.718611,
        radius: 50,
      };

      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty('languageCode');
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );
    });

    it('Dispatcher witch commission in coordinants and proper directions', async () => {
      // loading Ica, discharge near Zlin (same as data in db)
      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.directions = true;
      requestData.searchType = 'commission';
      requestData.locations.discharge = requestData.locations.loading;
      requestData.locations.loading = {
        lat: -14.057768,
        lon: -75.718611,
        radius: 50,
      };

      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );
    });
  });

  describe(`Dispatcher that has made the same journey`, () => {
    it('Dispatcher with journey in coordinants', async () => {
      // loading Zlín, discharge near Ica
      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.directions = false;
      requestData.searchType = 'dispatcher';
      requestData.locations.discharge = {
        lat: -14.057768,
        lon: -75.718611,
        radius: 50,
      };

      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);
      //console.warn(res.body);
      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty('languageCode');
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );
    });

    it('Dispatcher witch journey in coordinants and proper directions', async () => {
      // loading Ica, discharge near Zlin (same as data in db)
      let requestData = JSON.parse(JSON.stringify(postData));
      requestData.directions = true;
      requestData.searchType = 'dispatcher';
      requestData.locations.discharge = requestData.locations.loading;
      requestData.locations.loading = {
        lat: -14.057768,
        lon: -75.718611,
        radius: 50,
      };

      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(postData)
        .set('x-auth-token', token);
      //console.warn(res.body);
      expect(res.body[0]).toHaveProperty('carrier_id', carrier.carrier_id);
      expect(res.body[0].dispatcher[0]).toHaveProperty('languageCode');
      expect(res.body[0].dispatcher[0]).toHaveProperty(
        'dispatcher_id',
        dispatcher.dispatcher_id,
      );
    });
  });

  describe(`Error reporting`, () => {
    it('Should return error', async () => {
      let requestData =
        '{"locations":{"loading":{"lat":"45.72757600","lon":"9.01983900","radius":50},"discharge":{"radius":50}},"directions": false}';

      let res = await request(server)
        .post(`/api/commission/dispatcher_search`)
        .send(requestData)
        .set('x-auth-token', token);

      expect(res.status).toBe(400);
    });
  });
});
