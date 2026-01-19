const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = commissionloading => {
  const schema = Joi.object({
    commissionLoading_id: Joi.number()
      .min(1)
      .max(2147483647),
    commission_id: Joi.number()
      .min(1)
      .max(2147483647),
    date: Joi.number().allow(null),
    dateTo: Joi.number().allow(null),
    deleted: Joi.boolean(),
    note: Joi.string().allow(null, ""),
    number: Joi.number().allow(null),
    loading_id: Joi.number()
      .min(1)
      .max(2147483647),
    refNumber: Joi.alternatives().try(
      Joi.string().allow(null, ""),
      Joi.number().allow(null)
    ),
    time: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number()),
    year: Joi.number().allow(null)
  });
  return schema.validate(commissionloading);
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
  reqQuery.order_by = reqQuery.order_by || "commissionLoading_id";
  reqQuery.mark = reqQuery.ordering === "desc" ? "<=" : ">=";
  const operator = reqQuery.mark == "<=" ? "max" : "min";
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}("${reqQuery.order_by}") FROM "commissionloading" where deleted = false)`;

  return reqQuery;
};

/**
 * Returns all commissionloadings
 * @param {integer} id commissionloading id, all for all commissionloadings
 * @param {object} pagination from pagination function
 * @param {integer} customer_id ID of customer default false
 * @returns commissionloadings object or error
 */
const get = async (id = false, reqQuery = false, commission_id = false) => {
  if (id == "all" || commission_id) {
    const pagination = cursor(reqQuery);

    let query = `SELECT * from "commissionloading" where deleted = false ${
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
      text: 'SELECT * from "commissionloading" where "commissionLoading_id"=$1',
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
 * Save commissionloading
 * @param {object} data commissionloading data object
 * @param {integer} customer_id can be false, customer id data
 * @returns commissionloading object or error
 */
const save = async (data, commission_id = false) => {
  if (commission_id) data.commission_id = commission_id;

  let counter = 1;
  const query = {
    text: `INSERT INTO commissionloading (${Object.keys(data)
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
  if (!id) id = data.commissionLoading_id;

  let query = {
    text: `SELECT "commissionLoading_id" from commissionloading where "commissionLoading_id" = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested commissionloading was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update commissionloading set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "commissionLoading_id" = '${id}' RETURNING *`;

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
 * Removes commissionloading
 * @param {integer} id id of commissionloading to be removed
 * @returns commissionloading object of removed commissionloading
 */
const remove = async id => {
  let query = {
    text:
      'SELECT "commissionLoading_id",deleted from "commissionloading" where "commissionLoading_id"=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested commissionloading was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested commissionloading was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE commissionloading set "deleted" = true where "commissionLoading_id"=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateCommissionLoading = validate;
exports.validateParams = validateParams;
exports.getCommissionLoading = get;
exports.saveCommissionLoading = save;
exports.updateCommissionLoading = update;
exports.deleteCommissionLoading = remove;
