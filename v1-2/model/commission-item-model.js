const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = commissionitem => {
  const schema = Joi.object({
    commissionItem_id: Joi.number()
      .min(1)
      .max(2147483647),

    commission_id: Joi.number()
      .min(1)
      .max(2147483647),
    customer_id: Joi.number()
      .min(1)
      .max(2147483647),
    commissionDischarge_id: Joi.number()
      .min(1)
      .max(2147483647),
    commissionLoading_id: Joi.number()
      .min(1)
      .max(2147483647),
    deleted: Joi.boolean(),
    loadingMeters: Joi.number().allow(null),
    name: Joi.string().allow(null, ""),
    price: Joi.number().allow(null),
    package: Joi.string().allow(null, ""),
    packaging: Joi.string().allow(null, ""),
    quantity: Joi.number().allow(null),
    size: Joi.string().allow(null, ""),
    weight: Joi.number().allow(null),
    weightBrutto: Joi.number().allow(null),
    year: Joi.number().allow(null)
  });
  return schema.validate(commissionitem);
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
  reqQuery.ordering = reqQuery.ordering || "asc";
  reqQuery.limit = reqQuery.limit || "all";
  reqQuery.order_by = reqQuery.order_by || "commissionItem_id";
  reqQuery.mark = reqQuery.ordering === "desc" ? "<=" : ">=";
  const operator = reqQuery.mark == "<=" ? "max" : "min";
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}("${reqQuery.order_by}") FROM "commissionitem" where deleted = false)`;

  return reqQuery;
};

/**
 * Returns all commissionitems
 * @param {integer} id commissionitem id, all for all commissionitems
 * @param {object} pagination from pagination function
 * @param {integer} customer_id ID of customer default false
 * @returns commissionitems object or error
 */
const get = async (id = false, reqQuery = false, commission_id = false) => {
  if (id == "all" || commission_id) {
    const pagination = cursor(reqQuery);

    let query = `SELECT * from "commissionitem" where deleted = false ${
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
      text: 'SELECT * from "commissionitem" where "commissionItem_id"=$1',
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
 * Save commissionitem
 * @param {object} data commissionitem data object
 * @param {integer} customer_id can be false, customer id data
 * @returns commissionitem object or error
 */
const save = async (data, commission_id = false) => {
  if (commission_id) data.commission_id = commission_id;

  let counter = 1;
  const query = {
    text: `INSERT INTO commissionitem (${Object.keys(data)
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
  if (!id) id = data.commissionItem_id;

  let query = {
    text: `SELECT "commissionItem_id" from commissionitem where "commissionItem_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested commissionitem was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update commissionitem set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "commissionItem_id" = '${id}' RETURNING *`;

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
 * Removes commissionitem
 * @param {integer} id id of commissionitem to be removed
 * @returns commissionitem object of removed commissionitem
 */
const remove = async id => {
  let query = {
    text:
      'SELECT "commissionItem_id",deleted from "commissionitem" where "commissionItem_id"=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested commissionitem was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested commissionitem was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE commissionitem set "deleted" = true where "commissionItem_id"=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateCommissionItem = validate;
exports.validateParams = validateParams;
exports.getCommissionItem = get;
exports.saveCommissionItem = save;
exports.updateCommissionItem = update;
exports.deleteCommissionItem = remove;
