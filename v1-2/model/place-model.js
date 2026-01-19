const pool = require("../startup/db");
const Joi = require("@hapi/joi");

//validation
const validate = place => {
  const schema = Joi.object({
    place_id: Joi.number()
      .min(1)
      .max(2147483647),
    carrier_id: Joi.number()
      .min(1)
      .max(2147483647),
    city: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    countryCode: Joi.string().allow(null, ""),
    directions: Joi.array(),
    dispatcher_id: Joi.number()
      .min(1)
      .max(2147483647),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null),
    note: Joi.string().allow(null, ""),
    postalCode: Joi.string().allow(null, ""),
    deleted: Joi.boolean()
  });
  return schema.validate(place);
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

const pagination = reqQuery => {
  reqQuery.ordering = reqQuery.ordering || "desc";
  reqQuery.limit = reqQuery.limit || "all";
  reqQuery.after_id =
    reqQuery.after_id || '(SELECT max(place_id) FROM "place")';
  reqQuery.mark = reqQuery.ordering === "desc" ? "<" : ">";

  return reqQuery;
};

/**
 * Get all places from carrier
 * @param {integer} carrier_id ID carriera
 * @returns {array} array of all carriers
 */

const get = async carrier_id => {
  const query = {
    text: 'SELECT * from "place"  where deleted = false and carrier_id=$1',
    values: [carrier_id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Save places data
 * @param {integer} carrier_id id of carrier
 * @param {object} data object with place data
 */

const save = async (carrier_id = "", data) => {
  if (carrier_id !== "") data.carrier_id = carrier_id;

  counter = 1;
  const query = {
    text: `INSERT INTO place (${Object.keys(data)
      .map(d => `"${d}"`)
      .join(",")}) values (${Object.values(data)
      .map(d => `$${counter++}`)
      .join(",")}) RETURNING *`,
    values: Object.values(data)
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const update = async (id = "", data) => {
  if (id == "") id = data.place_id;
  let query = {
    text: `SELECT place from place where place_id = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested dispatcher was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  data.directions =
    typeof data.directions === "undefined" ? `{}` : `{${data.directions}}`;

  let counter = 1;
  let updateQuery = "update place set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "place_id" = '${id}' RETURNING *`;

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
 * Removes place
 * @param {integer} id id of place to be removed
 * @returns place object of removed place
 */
const remove = async id => {
  let query = {
    text: 'SELECT place_id,deleted from "place" where place_id=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested place was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested place was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text: 'UPDATE place set "deleted" = true where place_id=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.deletePlace = remove;
exports.savePlace = save;
exports.getPlace = get;
exports.updatePlace = update;
exports.validatePlace = validate;
exports.validateParams = validateParams;
exports.placePagination = pagination;
