const server = require('../../../v1-2/app');
const pool = require('../../../v1-2/startup/db');
const request = require('supertest');

const createMockCarrier = async (data) => {
  carrier = await request(server)
    .post(`/api/carrier`)
    .send(data)
    .set('x-auth-token', token);

  if (carrier.error) console.log(carrier.error);

  return carrier.body;
};

const updateMockCarrier = async (carrier, data) => {
  carrier = await request(server)
    .put(`/api/carrier/${carrier.carrier_id}`)
    .send(data)
    .set('x-auth-token', token);

  if (carrier.error) console.log(carrier.error);

  return carrier.body;
};

const deleteMockCarrier = async (carrier) => {
  const { carrier_id } = carrier;
  query = `DELETE FROM "carrier" WHERE "carrier_id" = '${carrier_id}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

module.exports = { createMockCarrier, deleteMockCarrier };
