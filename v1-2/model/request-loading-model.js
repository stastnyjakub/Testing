const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = requestloading => {
  const schema = Joi.object({
    requestLoading_id: Joi.number()
      .min(1)
      .max(2147483647),
    city: Joi.string().allow(null, ""),
    company: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    countryCode: Joi.string()
      .allow(null, "")
      .min(2)
      .max(2),
    request_id: Joi.number()
      .min(1)
      .max(2147483647),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null),
    postalCode: Joi.string().allow(null, ""),
    deleted: Joi.boolean()
  });
  return schema.validate(requestloading);
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
  reqQuery.order_by = reqQuery.order_by || "requestLoading_id";
  reqQuery.mark = reqQuery.ordering === "desc" ? "<=" : ">=";
  const operator = reqQuery.mark == "<=" ? "max" : "min";
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}("${reqQuery.order_by}") FROM "requestloading" where deleted = false)`;
  return reqQuery;
};

/**
 * Returns all requestloadings
 * @param {integer} id requestloading id, '' for all requestloadings
 * @param {object} pagination from pagination function
 * @returns requestloadings object or error
 */
const get = async (id = false, reqQuery = false, request_id = false) => {
  if (id == "all" || request_id) {
    const pagination = cursor(reqQuery);

    let query = `SELECT * from "requestloading" where deleted = false ${
      request_id ? `and "request_id" = '${parseInt(request_id)}' ` : ""
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
      text: 'SELECT * from "requestloading" where "requestLoading_id"=$1',
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
 * Save requestloading
 * @param {object} data requestloading data object
 * @param {integer} request_id can be false, request id data
 * @returns requestloading object or error
 */
const save = async (data, request_id = false) => {
  if (request_id) data.request_id = request_id;

  let counter = 1;
  const query = {
    text: `INSERT INTO requestloading (${Object.keys(data)
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
  if (!id) id = data.requestLoading_id;

  let query = {
    text: `SELECT "requestLoading_id" from requestloading where "requestLoading_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested requestloading was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update requestloading set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "requestLoading_id" = '${id}' RETURNING *`;

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
 * Removes requestloading
 * @param {integer} id id of requestloading to be removed
 * @returns requestloading object of removed requestloading
 */
const remove = async id => {
  let query = {
    text:
      'SELECT "requestLoading_id",deleted from "requestloading" where "requestLoading_id"=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested requestloading was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested requestloading was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE requestloading set "deleted" = true where "requestLoading_id"=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateRequestLoading = validate;
exports.validateParams = validateParams;
exports.getRequestLoading = get;
exports.saveRequestLoading = save;
exports.updateRequestLoading = update;
exports.deleteRequestLoading = remove;
