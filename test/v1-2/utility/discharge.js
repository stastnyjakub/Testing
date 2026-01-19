const pool = require('../../../v1-2/startup/db');

let config = {
  commission_id: 1,
  date: Date.now(),
  dateTo: Date.now(),
  deleted: 0,
  note: 'mock data',
  number: 0,
  refNumber: 123456,
};

const createMockCommissionDischarge = async (data) => {
  let query = `INSERT INTO "commissiondischarge" ("commission_id", "date", "dateTo", "deleted", "note", "number", "discharge_id", "refNumber", "time", "year")
VALUES ('${data.commission_id || config.commission_id}', '${
    data.date || config.date
  }', '${data.dateTo || config.dateTo}', '${
    data.deleted || config.deleted
  }', '${data.note || config.note}', '${
    data.number || config.number
  }', NULL, '${
    data.refNumber || config.refNumber
  }', NULL, NULL) RETURNING "commissionDischarge_id"`;

  try {
    res = await pool.query(query);
    return res.rows[0];
  } catch (error) {
    console.warn('Error executing query', query, error.stack);
  }
};

const deleteMockCommissionDischarge = async (discharge) => {
  query = `DELETE FROM "commissiondischarge" WHERE "commissionDischarge_id" = ${discharge.commissionDischarge_id}`;

  try {
    res = await pool.query(query);
  } catch (error) {
    throw new Error('Error executing query', query, error.stack);
  }
};

module.exports = {
  createMockCommissionDischarge,
  deleteMockCommissionDischarge,
};
