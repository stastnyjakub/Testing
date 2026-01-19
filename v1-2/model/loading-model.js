const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = loading => {
  const schema = Joi.object({
    loading_id: Joi.number()
      .min(1)
      .max(2147483647),
    city: Joi.string().allow(null, ""),
    company: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    countryCode: Joi.string()
      .allow(null, "")
      .min(2)
      .max(2),
    customer_id: Joi.number()
      .min(1)
      .max(2147483647),
    note: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    gps: Joi.string().allow(null, ""),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null),
    firstName: Joi.string().allow(null, ""),
    lastName: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    postalCode: Joi.string().allow(null, ""),
    street: Joi.string().allow(null, ""),
    scrollTo: Joi.boolean(),
    deleted: Joi.boolean()
  });
  return schema.validate(loading);
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
const pagination = reqQuery => {
  reqQuery.ordering = reqQuery.ordering || "desc";
  reqQuery.limit = reqQuery.limit || "all";
  reqQuery.order_by = reqQuery.order_by || "loading_id";
  reqQuery.mark = reqQuery.ordering === "desc" ? "<=" : ">=";
  const operator = reqQuery.mark == "<=" ? "max" : "min";
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}(${reqQuery.order_by}) FROM "loading" where deleted = false)`;

  return reqQuery;
};

/**
 * Returns all loadings
 * @param {integer} id loading id, all for all loadings
 * @param {object} pagination from pagination function
 * @param {integer} customer_id ID of customer default false
 * @returns loadings object or error
 */
const get = async (id = false, pagination = false, customer_id = false) => {
  if (id == "all" || customer_id) {
    let query = `SELECT * from "loading" where deleted = false ${
      customer_id ? `and "customer_id" = '${parseInt(customer_id)}' ` : ""
    } and "${pagination.order_by}" ${pagination.mark} ${
      pagination.after
    } ORDER BY ${pagination.order_by} ${pagination.ordering} limit ${
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
      text: 'SELECT * from "loading" where loading_id=$1',
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
 * Save loading
 * @param {object} data loading data object
 * @param {integer} customer_id can be false, customer id data
 * @returns loading object or error
 */
const save = async (data, customer_id = false) => {
  if (customer_id) data.customer_id = customer_id;

  let counter = 1;
  const query = {
    text: `INSERT INTO loading (${Object.keys(data)
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
  if (!id) id = data.loading_id;

  let query = {
    text: `SELECT loading_id from loading where loading_id = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested loading was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update loading set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "loading_id" = '${id}' RETURNING *`;

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
 * Removes loading
 * @param {integer} id id of loading to be removed
 * @returns loading object of removed loading
 */
const remove = async id => {
  let query = {
    text: 'SELECT loading_id,deleted from "loading" where loading_id=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested loading was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested loading was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text: 'UPDATE loading set "deleted" = true where loading_id=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateLoading = validate;
exports.validateParams = validateParams;
exports.loadingPagination = pagination;
exports.getLoading = get;
exports.saveLoading = save;
exports.updateLoading = update;
exports.deleteLoading = remove;
