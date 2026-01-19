const pool = require('../../startup/db');
const { updator, exist } = require('./tools/database-manipulation');

const findOneCommission = async (id, params, relations) => {
  const doesExist = await exist(id, 'commission');
  if (!doesExist)
    return { error_code: 404, error_message: 'Zakázku se nepodařilo najít' };
  let query = {
    text: `SELECT ${params
      .map((param) => `"${param}"`)
      .join(',')} from "commission" where commission_id=$1`,
    values: [id],
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 404, error_message: error.stack };
  }
};

// tbd - přepsat na selector
const findOne = async (id, params, relations) => {
  const doesExist = await exist(id, 'invoice');
  if (!doesExist)
    return { error_code: 404, error_message: 'Zakázku se nepodařilo najít' };

  let query = {
    text: `SELECT ${params
      .map((param) => `"${param}"`)
      .join(',')} from "commission" where invoice_id=$1`,
    values: [id],
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 404, error_message: error.stack };
  }
};

const update = async (id, data, params, relations) => {
  const doesExist = await exist(id, 'commission');

  if (!doesExist)
    return { error_code: 404, error_message: 'Zakázku se nepodařilo najít' };

  data.exchangeRateCustomer =
    data.exchangeRateCustomer == '' ? 1 : data.exchangeRateCustomer;
  data.orderDate = data.orderDate == '' ? null : data.orderDate;

  const commission = await updator(id, 'commission', data, params);
  if (commission.error_message) {
    return { error_code: 404, error_message: commission.error_message };
  }

  return await findOneCommission(id, params, relations);
};

module.exports = { findOne, update, findOneCommission };
