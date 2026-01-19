const request = require('supertest');

const endpointName = 'dispatcher_vehicle_feature/feature';
let server;

beforeAll(async () => {
  server = require('../../../v1-2/app');
});

describe(`/api/${endpointName}`, () => {
  describe('GET', () => {
    it('should return all types of dispatcher vehicles features without auth', async () => {
      let res = await request(server).get(`/api/${endpointName}`);

      if (res.error) console.warn(res.error);

      expect(res.status).toBe(200);
    });
  });
});
