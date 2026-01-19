const server = require('../../../v1-2/app');
const pool = require('../../../v1-2/startup/db');
const request = require('supertest');
const {
  saveCustomerContact,
  deleteCustomerContact,
} = require('../../../v1-2/model/customer-contact-model');

const createMockCustomerContact = async (data) => {
  customer = await request(server)
    .post(`/api/customer`)
    .send(data)
    .set('x-auth-token', token);

  if (customer.error) console.log(customer.error);

  return customer.body;
};

const deleteMockCustomer = async (customer) => {
  const { customer_id } = customer;
  query = `DELETE FROM "customer" WHERE "customer_id" = '${customer_id}'`;
  try {
    res = await pool.query(query);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

const createMockCustomerConstact = async (customerId, data) => {
  try {
    customerContact = await saveCustomerContact(data, customer_id);
    return customerContact;
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

const deleteMockCustomerConstact = async (cc) => {
  try {
    await deleteCustomerContact(cc.id);
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

module.exports = {
  createMockCustomer,
  deleteMockCustomer,
  createMockCustomerConstact,
  deleteMockCustomerConstact,
};
