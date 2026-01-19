const server = require('../../../v1-2/app');
const pool = require('../../../v1-2/startup/db');
const request = require('supertest');

const createMockCommission = async (customer, carrier, dispatcher, data) => {
  const { customer_id } = customer;
  const { carrier_id } = carrier;
  const { dispatcher_id } = dispatcher;

  commission = await request(server)
    .post(`/api/commission`)
    .send({ ...data, customer_id, carrier_id, dispatcher_id })
    .set('x-auth-token', token);

  if (commission.error) console.log(commission.error);

  return commission.body;
};

const updateMockCommission = async (id, data) => {
  commission = await request(server)
    .put(`/api/commission/${id}`)
    .send({ ...data })
    .set('x-auth-token', token);

  if (commission.error) console.log(commission.error);

  return commission.body;
};

const deleteMockCommission = async (commission) => {
  const { commission_id } = commission;
  query = `DELETE FROM "commission" WHERE "commission_id" = '${commission_id}'`;
  try {
    res = await pool.query(query);

    await pool.query(
      `TRUNCATE "rate" CASCADE; SELECT setval('rate_rate_id_seq', 1, true);`,
    );
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

module.exports = {
  createMockCommission,
  deleteMockCommission,
  updateMockCommission,
};
