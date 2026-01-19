const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = customer_contact => {
  const schema = Joi.object({
    customerContact_id: Joi.number()
      .min(1)
      .max(2147483647),
    customer_id: Joi.number()
      .min(1)
      .max(2147483647),
    email: Joi.string().allow(null, ""),
    firstName: Joi.string().allow(null, ""),
    lastName: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    deleted: Joi.boolean()
  });
  return schema.validate(customer_contact);
};

const validateParams = params => {
  const schema = Joi.object({
    id: Joi.number()
      .min(1)
      .max(2147483647),
    ordering: Joi.string()
      .allow(null, "")
      .valid("asc", "desc", ""),
    order_by: Joi.alternatives().try(
      Joi.string().allow(null, ""),
      Joi.number()
    ),
    limit: Joi.number(),
    after_id: Joi.number()
  });
  return schema.validate(params);
};

/**
 * Returns all customerContacts
 * @param {integer} id customerContact id, '' for all customerContacts
 * @param {customer_id} customer_id cutomers id
 * @returns customerContacts object or error
 */
const get = async (id = false, customer_id = false) => {
  if (id == "all") {
    let query = `SELECT * from customercontact where deleted = false order by "customerContact_id" DESC`;
    try {
      pgres = await pool.query(query);
      return pgres.rows;
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  } else if (customer_id) {
    let query = {
      text: 'SELECT * from "customercontact" where "customer_id"=$1',
      values: [customer_id]
    };

    try {
      pgres = await pool.query(query);
      return pgres.rows;
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  } else {
    let query = {
      text: 'SELECT * from "customercontact" where "customerContact_id"=$1',
      values: [id]
    };

    try {
      pgres = await pool.query(query);
      return pgres.rows[0];
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  }
};

/**
 * Save customerContact
 * @param {objec} data customerContact data object
 * @returns customerContact object or error
 */
const save = async (data, customer_id = false) => {
  if (customer_id) data.customer_id = customer_id;

  let counter = 1;
  const query = {
    text: `INSERT INTO customercontact (${Object.keys(data)
      .map(d => `"${d}"`)
      .join(",")}) values (${Object.values(data)
      .map(d => `$${counter++}`)
      .join(",")}) RETURNING *`,
    values: Object.values(data)
  };

  try {
    let pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const update = async (id = false, data) => {
  if (!id) id = data.customerContact_id;

  let query = {
    text: `SELECT "customerContact_id" from customercontact where "customerContact_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested customerContact was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update customercontact set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "customerContact_id" = '${id}' RETURNING *`;

  query = {
    text: updateQuery,
    values: Object.values(data)
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Removes customerContact
 * @param {integer} id id of customerContact to be removed
 * @returns customerContact object of removed customerContact
 */
const remove = async id => {
  let query = {
    text:
      'SELECT "customerContact_id",deleted from "customercontact" where "customerContact_id"=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested customerContact was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested customerContact was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE customercontact set "deleted" = true where "customerContact_id"=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateCustomerContact = validate;
exports.validateParams = validateParams;
exports.getCustomerContact = get;
exports.saveCustomerContact = save;
exports.updateCustomerContact = update;
exports.deleteCustomerContact = remove;
