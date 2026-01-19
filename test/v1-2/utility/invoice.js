const pool = require('../../../v1-2/startup/db');

const createMockInvoice = async (invoiceData) => {
  let counter = 1;
  const query = {
    text: `INSERT INTO invoice (${Object.keys(invoiceData)
      .map((k) => `"${k}"`)
      .join(',')}) values (${Object.values(invoiceData)
      .map((v) => `$${counter++}`)
      .join(',')}) RETURNING *`,
    values: Object.values(invoiceData),
  };
  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const deleteMockInvoice = async (invoiceData) => {
  const { invoice_id } = invoiceData;
  let query = {
    text: 'DELETE FROM invoice WHERE invoice_id = $1 RETURNING *',
    values: [invoice_id],
  };
  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const getInvoice = async (invoiceId) => {
  let query = {
    text: 'SELECT invoice.*, "complete_commission"."orderNumber", "complete_commission"."orderDate" from "complete_commission" NATURAL JOIN  "invoice" where invoice_id=$1',
    values: [invoiceId],
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

module.exports = { getInvoice, createMockInvoice, deleteMockInvoice };
