const Joi = require("@hapi/joi");
const pool = require("../startup/db");

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

const getLanguageCodes = async (stateId = false) => {
  let query;

  if (!stateId) {
    query = {
      text: 'SELECT * FROM "language"'
    };
  } else {
    query = {
      text:
        "SELECT DISTINCT language.* FROM language NATURAL JOIN (SELECT * FROM state NATURAL JOIN languagestate WHERE state_id = $1) as a",
      values: [stateId]
    };
  }

  try {
    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const getEUcountries = async () => {
  try {
    pgres = await pool.query(
      `SELECT "countryCode" FROM state where "inEU" = '1'`
    );
    return pgres.rows.map(country => country.countryCode);
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

exports.validateParams = validateParams;
exports.getLanguageCodes = getLanguageCodes;
exports.getEUcountries = getEUcountries;
