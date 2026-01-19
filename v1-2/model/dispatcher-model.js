const pool = require("../startup/db");
const Joi = require("@hapi/joi");

//validation
const validate = dispatcher => {
  const schema = Joi.object({
    dispatcher_id: Joi.number()
      .min(1)
      .max(2147483647),
    carrier_id: Joi.number()
      .min(1)
      .max(2147483647),
    email: Joi.string().allow(null, ""),
    emailSent: Joi.number().allow(null),
    firstName: Joi.string().allow(null, ""),
    lastName: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    lastRequest_id: Joi.number()
      .min(1)
      .max(2147483647),
    lastRequestTimeSent: Joi.number().allow(null),
    selected: Joi.boolean(),
    deleted: Joi.boolean(),
    language_id: Joi.number()
      .min(1)
      .max(2147483647)
      .allow(null)
  });
  return schema.validate(dispatcher, { stripUnknown: true });
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
    reqQuery.after_id || '(SELECT max(dispatcher_id) FROM "dispatcher")';
  reqQuery.mark = reqQuery.ordering === "desc" ? "<" : ">";

  return reqQuery;
};

/**
 * Get all dispatcher from carrier
 * @param {object} dispatcher object
 * @returns {array} array of all dispatchers or one dispatcher
 */

const get = async dispatcher => {
  let query;
  const { carrier_id, dispatcher_id, relations } = dispatcher;

  let id = carrier_id || dispatcher_id;

  if (relations) {
    query = {
      text: `SELECT di.*, la."languageCode", to_json(ca.*) as carrier, array_to_json(array_agg(dv.*)) as vehicle, array_to_json(array_agg(pl.*)) as place, 
      array_to_json(array_agg(dvf.*)) as dispatchervehiclefeature
      from dispatcher as di
      left join carrier as ca on ca.carrier_id = di.carrier_id
      left join place as pl on pl.dispatcher_id = di.dispatcher_id
      left join language as la on di.language_id = la.language_id
      left join dispatchervehicle as dv on dv.dispatcher_id = di.dispatcher_id AND (dv.deleted is NULL or dv.deleted = false)
      left join dispatchervehiclefeature as dvf on dvf."dispatcherVehicle_id" = dv."dispatcherVehicle_id" AND (dvf.deleted is NULL or dvf.deleted = false)
      where ${carrier_id ? "di.carrier_id" : "di.dispatcher_id"}=$1  
      and di.deleted = false and (ca.deleted is NULL or ca.deleted = false) and (pl.deleted is NULL or pl.deleted = false) and (dvf.deleted is NULL or dvf.deleted = false)
      GROUP BY di.dispatcher_id, ca.carrier_id, la."languageCode"`,
      values: [id]
    };
  } else {
    query = {
      text: `SELECT * from "dispatcher" where deleted = false and ${
        carrier_id ? "carrier_id" : "dispatcher_id"
      }=$1`,
      values: [id]
    };
  }

  try {
    pgres = await pool.query(query);
    if (carrier_id) pgres.rows[0];
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Get all dispatcher from carrier with language (temporary)
 * @param {integer} dispatcher_id ID of dispatcher
 * @param {integer} carrier_id ID carriera
 * @returns {array} array of all dispathcer or one dispatcher
 */

const getWithLanguage = async (dispatcher_id, carrier_id = false) => {
  let id = carrier_id || dispatcher_id;

  const query = {
    text:
      `SELECT * FROM (SELECT * FROM dispatcher NATURAL LEFT OUTER JOIN language WHERE language_id IS NOT NULL UNION ` +
      `SELECT c."language_id", d.dispatcher_id, d.carrier_id, d.email, d."emailSent", d."firstName", ` +
      `d."lastName", d.phone, d."lastRequest_id", d."lastRequestTimeSent", d."selected",` +
      `d."deleted", c."languageCode" FROM ` +
      `(SELECT b.carrier_id, b.language_id, language."languageCode" FROM ` +
      `(SELECT * FROM (SELECT * FROM carrier LEFT OUTER JOIN state ON carrier.place->>'countryCode' = state."countryCode") as a LEFT OUTER JOIN languagestate ` +
      `ON a.state_id = languagestate.state_id) as b LEFT OUTER JOIN language ON b.language_id = language.language_id) as c ` +
      `LEFT OUTER JOIN (SELECT * FROM dispatcher NATURAL LEFT OUTER JOIN language WHERE language_id IS NULL) as d ON c.carrier_id = d.carrier_id) as x ` +
      `where deleted = false and ${
        carrier_id ? "carrier_id" : "dispatcher_id"
      }=$1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (carrier_id) pgres.rows[0];

    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

/**
 * Save dispatchers data
 * @param {integer} carrier_id id of carrier
 * @param {object} data object with dispatcher data
 */

const save = async (carrier_id = "", data) => {
  if (carrier_id !== "") data.carrier_id = carrier_id;

  counter = 1;
  const query = {
    text: `INSERT INTO dispatcher (${Object.keys(data)
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

/**
 * Updates dispatcher
 * @param {integer} id of dispater to update. If not set looking for id in data
 * @param {object} data of dispather object
 * @returns dispatcher object or { "error_code, "error_message"}
 */
const update = async (id = "", data) => {
  if (id == "") id = data.dispatcher_id;

  let query = {
    text: `SELECT dispatcher from dispatcher where dispatcher_id = $1`,
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

  let counter = 1;
  let updateQuery = "update dispatcher set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "dispatcher_id" = '${id}' RETURNING *`;

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
 * Removes dispatcher
 * @param {integer} id id of dispatcher to be removed
 * @returns dispatcher object of removed dispatcher
 */
const remove = async id => {
  let query = {
    text:
      'SELECT dispatcher_id,deleted from "dispatcher" where dispatcher_id=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested dispatcher was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested dispatcher was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text:
      'UPDATE dispatcher set "deleted" = true where dispatcher_id=$1 RETURNING *',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.deleteDispatcher = remove;
exports.saveDispatcher = save;
exports.getDispatcher = get;
exports.updateDispatcher = update;
exports.validateDispatcher = validate;
exports.validateParams = validateParams;
exports.dispatcherPagination = pagination;
exports.getDispatcherWithLanguage = getWithLanguage;
