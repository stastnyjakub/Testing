const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = commissiondischarge => {
  const schema = Joi.object({
    commissionDischarge_id: Joi.number()
      .min(1)
      .max(2147483647),

    commission_id: Joi.number()
      .min(1)
      .max(2147483647),
    customer_id: Joi.number()
      .min(1)
      .max(2147483647),
    city: Joi.string().allow(null, ""),
    company: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    countryCode: Joi.string().allow(null, ""),
    date: Joi.number().allow(null),
    dateTo: Joi.number().allow(null),
    deleted: Joi.boolean(),
    email: Joi.string().allow(null, ""),
    firstName: Joi.string().allow(null, ""),
    lastName: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    note: Joi.string().allow(null, ""),
    neutralization: Joi.boolean(),
    number: Joi.number().allow(null),
    postalCode: Joi.string().allow(null, ""),
    street: Joi.string().allow(null, ""),
    scrollTo: Joi.boolean(),
    discharge_id: Joi.number().allow(null),
    refNumber: Joi.alternatives().try(
      Joi.string().allow(null, ""),
      Joi.number().allow(null)
    ),
    time: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number()),
    year: Joi.number().allow(null)
  });
  return schema.validate(commissiondischarge);
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
    after: Joi.number()
  });
  return schema.validate(params);
};

// version 2
// https://qapline.herokuapp.com/api/carrier?ordering=desc&limit=2&after=47&order_by=city
const cursor = reqQuery => {
  reqQuery.ordering = reqQuery.ordering || "desc";
  reqQuery.limit = reqQuery.limit || "all";
  reqQuery.order_by = reqQuery.order_by || "commissionDischarge_id";
  reqQuery.mark = reqQuery.ordering === "desc" ? "<=" : ">=";
  const operator = reqQuery.mark == "<=" ? "max" : "min";
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}("${reqQuery.order_by}") FROM "commissiondischarge" where deleted = false)`;

  return reqQuery;
};

/**
 * Returns all commissiondischarges
 * @param {integer} id commissiondischarge id, all for all commissiondischarges
 * @param {object} pagination from pagination function
 * @param {integer} customer_id ID of customer default false
 * @returns commissiondischarges object or error
 */
const get = async (id = false, reqQuery = false, commission_id = false) => {
  if (id == "all" || commission_id) {
    const pagination = cursor(reqQuery);

    let query = `SELECT * from "commissiondischarge" where deleted = false ${
      commission_id ? `and "commission_id" = '${parseInt(commission_id)}' ` : ""
    } and "${pagination.order_by}" ${pagination.mark} ${
      pagination.after
    } ORDER BY "${pagination.order_by}" ${pagination.ordering} limit ${
      pagination.limit == "all" ? "all" : parseInt(pagination.limit) + 1
    }`;

    try {
      pgres = await pool.query(query);

      const nextCursor =
        pgres.rows.length - 1 == pagination.limit
          ? pgres.rows[pagination.limit][pagination.order_by]
          : "";
      const responseRows =
        pgres.rows.length - 1 == pagination.limit
          ? pgres.rows.slice(0, -1)
          : pgres.rows;
      response = {
        data: responseRows,
        next_cursor: nextCursor
      };

      return response;
    } catch (error) {
      return { error_code: 500, error_message: error.stack };
    }
  } else {
    let query = {
      text:
        'SELECT * from "commissiondischarge" where "commissionDischarge_id"=$1',
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
 * Save commissiondischarge
 * @param {object} data commissiondischarge data object
 * @param {integer} customer_id can be false, customer id data
 * @returns commissiondischarge object or error
 */
const save = async (data, commission_id = false) => {
  if (commission_id) data.commission_id = commission_id;

  let counter = 1;
  const query = {
    text: `INSERT INTO commissiondischarge (${Object.keys(data)
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
  if (!id) id = data.commissionDischarge_id;

  let query = {
    text: `SELECT "commissionDischarge_id" from commissiondischarge where "commissionDischarge_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested commissiondischarge was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update commissiondischarge set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "commissionDischarge_id" = '${id}' RETURNING *`;

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
 * Removes commissiondischarge
 * @param {integer} id id of commissiondischarge to be removed
 * @returns commissiondischarge object of removed commissiondischarge
 */
const remove = async id => {
  let query = {
    text:
      'SELECT "commissionDischarge_id",deleted from "commissiondischarge" where "commissionDischarge_id"=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested commissiondischarge was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested commissiondischarge was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE commissiondischarge set "deleted" = true where "commissionDischarge_id"=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateCommissionDischarge = validate;
exports.validateParams = validateParams;
exports.getCommissionDischarge = get;
exports.saveCommissionDischarge = save;
exports.updateCommissionDischarge = update;
exports.deleteCommissionDischarge = remove;
