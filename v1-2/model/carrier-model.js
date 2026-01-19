const Joi = require("@hapi/joi");
const pool = require("../startup/db");

//validation
const validate = carrier => {
  const schema = Joi.object({
    carrier_id: Joi.number()
      .min(1)
      .max(2147483647),
    addedBy: Joi.string()
      .allow(null, "")
      .email()
      .optional(),
    city: Joi.string().allow(null, ""),
    company: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné vyplnit název firmy.`
      }),
    companyRegistrationNumber: Joi.number().allow(null),
    country: Joi.string().allow(null, ""),
    countryCode: Joi.string()
      .allow(null, "")
      .min(2)
      .max(2),
    editedBy: Joi.string().allow(null, ""),
    note: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    firstName: Joi.string().allow(null, ""),
    lastName: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    place: Joi.object(),
    postalCode: Joi.string().allow(null, ""),
    qid: Joi.number().allow(null),
    number: Joi.number().allow(null),
    street: Joi.string().allow(null, ""),
    taxId: Joi.string().allow(null, ""),
    ts_edited: Joi.number(),
    ts_added: Joi.number(),
    deleted: Joi.boolean()
  });
  return schema.validate(carrier);
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
    after: Joi.number(),
    number: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number()),
    company: Joi.string().allow(null, ""),
    street: Joi.string().allow(null, ""),
    postalCode: Joi.alternatives().try(
      Joi.string().allow(null, ""),
      Joi.number()
    ),
    country: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    note: Joi.string().allow(null, "")
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
    "number",
    "company",
    "street",
    "postalCode",
    "country",
    "phone",
    "email",
    "note"
  ];
  let filterRules = "",
    values = [];
  let counter = 1;

  for (const [key, value] of Object.entries(filter)) {
    if (filterObjects.includes(key)) {
      if (isNaN(value) == true) {
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
// https://qapline.herokuapp.com/api/carrier?ordering=desc&limit=2&after=47&order_by=city
const cursor = reqQuery => {
  reqQuery.ordering = reqQuery.ordering || "desc";
  reqQuery.limit = reqQuery.limit || "all";
  reqQuery.order_by = reqQuery.order_by || "carrier_id";
  reqQuery.mark = reqQuery.ordering === "desc" ? "<=" : ">=";
  const operator = reqQuery.mark == "<=" ? "max" : "min";
  reqQuery.after =
    reqQuery.after !== undefined
      ? `'${reqQuery.after}'`
      : `(SELECT ${operator}(${reqQuery.order_by}) FROM "carrier" where deleted = false)`;

  return reqQuery;
};

/**
 * Returns all carriers
 * @param {integer} id Carrier id, '' for all carriers
 * @param {object} pagination from pagination function
 * @returns carriers object or error
 */
const get = async (id = false, reqQuery = false) => {
  if (id == "all") {
    const pagination = cursor(reqQuery);
    const filtering = filter(reqQuery);

    let selectQuery = `SELECT * from "carrier" where deleted = false ${
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
      text: `SELECT cwlId."carrier_id", cwlId."addedBy", cwlId."city", cwlId."company", cwlId."companyRegistrationNumber", cwlId."country", cwlId."countryCode", cwlId."editedBy", cwlId."note", cwlId."email", cwlId."firstName", cwlId."lastName", cwlId."phone",
      cwlId."place", cwlId."postalCode", cwlId."qid", cwlId."number", cwlId."street", cwlId."taxId", cwlId."ts_edited", cwlId."ts_added", cwlId."deleted", array_agg(language."languageCode") as "languageCode" FROM 
      (SELECT carrierWithStateId.*, languagestate."language_id"  FROM 
      (SELECT carrier.*, state."state_id" FROM carrier LEFT OUTER JOIN state ON carrier.place->>'countryCode' = state."countryCode" WHERE carrier.carrier_id = $1) as carrierWithStateId
      LEFT OUTER JOIN languagestate ON carrierWithStateId."state_id" = languagestate."state_id") as cwlId LEFT OUTER JOIN language ON cwlId."language_id" = language."language_id" GROUP BY cwlId."carrier_id", cwlId."addedBy", cwlId."city", cwlId."company", cwlId."companyRegistrationNumber", cwlId."country", cwlId."countryCode", cwlId."editedBy", cwlId."note", cwlId."email", cwlId."firstName", cwlId."lastName", cwlId."phone",
      cwlId."place", cwlId."postalCode", cwlId."qid", cwlId."number", cwlId."street", cwlId."taxId", cwlId."ts_edited", cwlId."ts_added", cwlId."deleted"`,
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
 * Save carrier
 * @param {objec} data Carrier data object
 * @returns carrier object or error
 */
const save = async data => {
  data.place = JSON.stringify(data.place);
  delete data.number;

  let counter = 1;
  const query = {
    text: `INSERT INTO carrier (${Object.keys(data)
      .map(d => `"${d}"`)
      .join(",")},"number") values (${Object.values(data)
      .map(d => `$${counter++}`)
      .join(
        ","
      )},(SELECT max(number)+1 from carrier where deleted='false')) RETURNING *`,
    values: Object.values(data)
  };

  try {
    let pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const update = async (id, data) => {
  let query = {
    text: `SELECT carrier_id from carrier where carrier_id = $1`,
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: "Requested carrier was not found"
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  data.place = JSON.stringify(data.place);

  let counter = 1;
  let updateQuery = "update carrier set";
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    ""
  )} where "carrier_id" = '${id}' RETURNING *`;

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
 * Removes carrier
 * @param {integer} id id of carrier to be removed
 * @returns carrier object of removed carrier
 */
const remove = async id => {
  let query = {
    text: 'SELECT carrier_id,deleted from "carrier" where carrier_id=$1',
    values: [id]
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0) {
      return {
        error_code: 404,
        error_message: "Requested carrier was not found"
      };
    } else if (pgres.rows[0]["deleted"]) {
      return {
        error_code: 404,
        error_message: "Requested carrier was already deleted"
      };
    }
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  query = {
    text: 'UPDATE carrier set "deleted" = true where carrier_id=$1 RETURNING *',
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
  let selectQuery = `SELECT * from "carrier" where deleted = false and "addedBy" like $1 or company like $1 or country like $1 or "countryCode" ilike $1 or CAST(qid AS TEXT) like $1 
  or CAST(number AS TEXT) like $1 or "postalCode" like $1 or street like $1 or "taxId" like $1 order by carrier_id DESC`;

  try {
    let query = {
      text: selectQuery,
      values: [`%${param}%`]
    };

    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.carrierFilter = filter;
exports.validateCarrier = validate;
exports.validateParams = validateParams;
exports.getCarrier = get;
exports.saveCarrier = save;
exports.updateCarrier = update;
exports.deleteCarrier = remove;
exports.carrierFultextSearch = fultextSearch;
