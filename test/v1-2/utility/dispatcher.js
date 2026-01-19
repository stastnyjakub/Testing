const server = require('../../../v1-2/app');
const pool = require('../../../v1-2/startup/db');
const request = require('supertest');

const createMockDispatcher = async (carrier, data) => {
  dispatcher = await request(server)
    .post(`/api/carrier/${carrier.carrier_id}/dispatcher`)
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

  if (dispatcher.error) console.log(dispatcher.error);

  return dispatcher.body;
};

const deleteMockDispatcher = async (dispatcher) => {
  const { dispatcher_id } = dispatcher;
  query = `DELETE FROM "dispatcher" WHERE "dispatcher_id" = '${dispatcher_id}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

module.exports = { createMockDispatcher, deleteMockDispatcher };
