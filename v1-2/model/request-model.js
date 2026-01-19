const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = request => {
  const schema = Joi.object({
    addedBy: Joi.string().allow(null, ""),
    request_id: Joi.number()
      .min(1)
      .max(2147483647),
    carriers: Joi.array(),
    discharge: Joi.object(),
    discharge_id: Joi.number()
      .min(1)
      .max(2147483647),
    dischargeDateFrom: Joi.number().allow(null),
    dischargeRadius: Joi.number().allow(null),
    dispatchers: Joi.array(),
    editedBy: Joi.string().allow(null, ""),
    loading: Joi.object(),
    loading_id: Joi.number()
      .min(1)
      .max(2147483647),
    loadingDateFrom: Joi.number().allow(null),
    loadingDateTo: Joi.number().allow(null),
    loadingRadius: Joi.number().allow(null),
    number: Joi.number().allow(null),
    qid: Joi.string().allow(null, ""),
    relation: Joi.string().allow(null, ""),
    tsAdded: Joi.string().allow(null, ""),
    tsEdited: Joi.number().allow(null),
    week: Joi.number().allow(null),
    year: Joi.number().allow(null),
    deleted: Joi.boolean()
  });
  return schema.validate(request);
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
    parameter: Joi.alternatives().try(
      Joi.string().allow(null, ""),
      Joi.number()
    ),
    limit: Joi.number(),
    after: Joi.number(),
    addedBy: Joi.string().allow(null, ""),
    editedBy: Joi.string().allow(null, ""),
    carriers: Joi.array(),
    discharge: Joi.object(),
    dispatchers: Joi.array(),
    loading: Joi.object(),
    loadingDateFrom: Joi.number(),
    loadingDateTo: Joi.number(),
    loadingRadius: Joi.number(),
    number: Joi.number(),
    qid: Joi.string().allow(null, ""),
    relation: Joi.string().allow(null, ""),
    week: Joi.number(),
    year: Joi.number()
  });
  return schema.validate(params);
};

/**
 * Returns filter for sql request, case insensitive
 * accepts number, company, street, postalcode, country, phone, email, note
 * @param {object} filter req.query
 * @returns array [sqlquery,values]
 */
const filter = filter => {
  let filterObjects = [
    "addedBy",
    "editedBy",
    "carriers",
    "discharge",
    "dispatchers",
    "editeBy",
    "loading",
    "loadingDateFrom",
    "loadingDateTo",
    "loadingRadius",
    "number",
    "qid",
    "relation",
    "week",
    "year"
  ];

  let filterRules = "",
    values = [];
  let counter = 1;

  for (const [key, value] of Object.entries(filter)) {
    if (filterObjects.includes(key)) {
      if (key == "carriers" || key == "dispatchers") {
        filterRules += ` and array_to_string(${key},',') ILIKE $${counter++}`;
        values.push(`%${value}%`);
      } else if (isNaN(value) == true) {
        filterRules += ` and "${key}" ILIKE $${counter++}`;
        values.push(`%${value}%`);
      } else {
        filterRules += ` and "${key}" = $${counter++}`;
        values.push(value);
      }
    }
  }
  return [filterRules, values];
};

// version 2
// https://qapline.herokuapp.com/api/request?ordering=desc&limit=2&after=47&order_by=city
const cursor = reqQuery => {
  reqQuery.ordering = reqQuery.ordering || "desc";
  reqQuery.limit = reqQuery.limit || "all";
  reqQuery.order_by = reqQuery.order_by || "request_id";
  reqQuery.mark = reqQuery.ordering === "desc" ? "<=" : ">=";
  const operator = reqQuery.mark == "<=" ? "max" : "min";
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}(${reqQuery.order_by}) FROM "request" where deleted = false)`;

  return reqQuery;
};

/**
 * Returns all requests
 * @param {integer} id request id, all for all requests
 * @param {object} reqQuery for pagination and cursor
 * @returns requests object or error
 */
const get = async (id = false, reqQuery = false) => {
  if (id == "all") {
    const pagination = cursor(reqQuery);
    const filtering = filter(reqQuery);

    let selectQuery = `SELECT * from "request" where deleted = false ${
      filtering[0]
    } and "${pagination.order_by}" ${pagination.mark} ${
      pagination.after
    } ORDER BY ${pagination.order_by} ${pagination.ordering} limit ${
      pagination.limit == "all" ? "all" : parseInt(pagination.limit) + 1
    }`;

    try {
      let query = {
        text: selectQuery,
        values: filtering[1]
      };

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
      text: 'SELECT * from "request" where request_id=$1',
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
 * Save request
 * @param {object} data request data object
 * @param {integer} customer_id can be false, customer id data
 * @returns request object or error
 */
const save = async (data, customer_id = false) => {
  if (customer_id) data.customer_id = customer_id;
  delete data.number;

  let counter = 1;
  const query = {
    text: `INSERT INTO request (${Object.keys(data)
      .map(d => `"${d}"`)
      .join(",")}, number) values (${Object.values(data)
      .map(d => `$${counter++}`)
      .join(
        ","
      )}, (SELECT max(number)+1 from request where deleted='false')) RETURNING *`,
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
  if (!id) id = data.request_id;

  let query = {
    text: `SELECT request_id from request where request_id = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested request was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = "update request set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "request_id" = '${id}' RETURNING *`;

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
 * Removes request
 * @param {integer} id id of request to be removed
 * @returns request object of removed request
 */
const remove = async id => {
  let query = {
    text: 'SELECT request_id,deleted from "request" where request_id=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested request was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested request was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text: 'UPDATE request set "deleted" = true where request_id=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const fultextSearch = async param => {
  let selectQuery = `SELECT * from "request" where deleted = false and year = $2 and "relation" ilike $1
  or CAST(week AS TEXT) ilike $1 
  or "addedBy" ilike $1	
  or "editedBy" ilike $1	
  or CAST("discharge" AS TEXT)  ilike $1
  or CAST("dischargeRadius" AS TEXT)  ilike $1
  or CAST("dispatchers" AS TEXT)  ilike $1
  or CAST("loading" AS TEXT)  ilike $1
  or CAST("qid" AS TEXT)  ilike $1
  or "relation" ilike $1
  or CAST("week" AS TEXT)  ilike $1	
  or CAST("year" AS TEXT)  ilike $1
order by request_id DESC`;

  try {
    let query = {
      text: selectQuery,
      values: [`%${param.parameter}%`, param.year]
    };

    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateRequest = validate;
exports.validateParams = validateParams;
exports.getRequest = get;
exports.saveRequest = save;
exports.updateRequest = update;
exports.deleteRequest = remove;
exports.requestFulltextSearch = fultextSearch;
